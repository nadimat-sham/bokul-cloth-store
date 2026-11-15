import { Router, raw } from "express";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool, transaction } from "../db.ts";
import { endSession, isAdmin, passwordMatches, requireAdmin, startSession } from "../auth.ts";
import { rateLimit } from "../rateLimit.ts";
import { HttpError } from "../errors.ts";
import { getOrderAdmin, listOrders, setOrderStatus } from "../orders.ts";
import { getProduct, listCategories, listProducts } from "../catalog.ts";
import { sendMail } from "../mailer.ts";
import { statusUpdateEmail } from "../emails.ts";
import { str } from "../validate.ts";
import type { OrderStatus } from "../../shared/types.ts";
import { publish, stream } from "../events.ts";

export const UPLOAD_DIR = join(import.meta.dirname, "..", "..", "uploads");
export const adminRouter = Router();

adminRouter.post("/login", rateLimit(10, 15 * 60_000, "Too many sign-in attempts — wait 15 minutes."), (req, res) => {
  if (!passwordMatches(str(req.body?.password, 200))) throw new HttpError(401, "Incorrect password.");
  startSession(res);
  res.json({ success: true });
});
adminRouter.post("/logout", (_req, res) => {
  endSession(res);
  res.json({ success: true });
});
adminRouter.get("/session", (req, res) => res.json({ signedIn: isAdmin(req) }));

adminRouter.use(requireAdmin);

adminRouter.get("/events", (req, res) => stream(req, res));

adminRouter.get("/stats", async (_req, res) => {
  const [[o]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) total, SUM(status='pending') pending, SUM(status IN ('confirmed','shipped')) open,
            COALESCE(SUM(CASE WHEN status <> 'cancelled' THEN total END),0) revenue FROM orders`,
  );
  const [[m]] = await pool.query<RowDataPacket[]>("SELECT SUM(handled = 0) unread FROM contact_messages");
  const [[s]] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) n FROM newsletter_subscribers");
  const [[l]] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) n FROM product_sizes ps JOIN products p ON p.id = ps.product_id WHERE p.active = 1 AND ps.stock <= 2",
  );
  res.json({
    orders: Number(o.total), pending: Number(o.pending ?? 0), open: Number(o.open ?? 0), revenue: Number(o.revenue),
    unreadMessages: Number(m.unread ?? 0), subscribers: Number(s.n), lowStock: Number(l.n),
  });
});

adminRouter.get("/orders", async (req, res) => res.json(await listOrders(str(req.query.status, 20))));

adminRouter.patch("/orders/:number", async (req, res) => {
  const status = str(req.body?.status, 20) as OrderStatus;
  const result = await setOrderStatus(req.params.number, status);
  res.json(result.order);
  if (!result.changed) return;
  const at = new Date().toISOString();
  publish({ type: "order.updated", orderNumber: result.order.orderNumber, status: result.order.status, at });
  // Cancelling (or re-opening) changes stock, so product lists refresh too
  for (const i of result.order.items) publish({ type: "product.updated", slug: i.productSlug, at });
  if (req.body?.notify !== false) void sendMail(statusUpdateEmail(result.order, result.token));
});

adminRouter.get("/orders/:number", async (req, res) => {
  const found = await getOrderAdmin(req.params.number);
  if (!found) throw new HttpError(404, "Order not found.");
  res.json(found.order);
});

adminRouter.get("/products", async (_req, res) => {
  const [list, categories] = await Promise.all([listProducts({ includeInactive: true, sort: "newest" }), listCategories()]);
  res.json({ products: list.products, categories });
});

interface ProductInput {
  name: string; slug: string; categoryId: number; summary: string; description: string; fabric: string; care: string;
  color: string; price: number; compareAtPrice: number | null; featured: boolean; active: boolean;
  sizes: { size: string; stock: number }[];
}

function readProduct(b: Record<string, unknown>): ProductInput {
  const name = str(b.name, 140);
  const slug = (str(b.slug, 120) || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const price = Math.round(Number(b.price));
  const compare = b.compareAtPrice ? Math.round(Number(b.compareAtPrice)) : null;
  const sizes = (Array.isArray(b.sizes) ? b.sizes : [])
    .map((s: Record<string, unknown>) => ({ size: str(s?.size, 20), stock: Math.max(0, Math.floor(Number(s?.stock) || 0)) }))
    .filter((s) => s.size);
  const fields: Record<string, string> = {};
  if (name.length < 3) fields.name = "Name is required.";
  if (!slug) fields.slug = "Slug is required.";
  if (!(price > 0)) fields.price = "Enter a price in taka.";
  if (compare !== null && !(compare > price)) fields.compareAtPrice = "Must be higher than the price, or blank.";
  if (!sizes.length) fields.sizes = "Add at least one size.";
  if (new Set(sizes.map((s) => s.size)).size !== sizes.length) fields.sizes = "Sizes must be unique.";
  if (str(b.summary, 255).length < 10) fields.summary = "Write a short summary.";
  if (str(b.description, 5000).length < 20) fields.description = "Write a description.";
  if (Object.keys(fields).length) throw new HttpError(400, "Please check the highlighted fields.", fields);
  return {
    name, slug, categoryId: Number(b.categoryId), summary: str(b.summary, 255), description: str(b.description, 5000),
    fabric: str(b.fabric, 120) || "—", care: str(b.care, 255) || "—", color: str(b.color, 60) || "—",
    price, compareAtPrice: compare, featured: !!b.featured, active: b.active !== false, sizes,
  };
}

async function saveSizes(conn: import("mysql2/promise").PoolConnection, productId: number, sizes: ProductInput["sizes"]) {
  await conn.query("DELETE FROM product_sizes WHERE product_id = ?", [productId]);
  for (const [i, s] of sizes.entries()) {
    await conn.query("INSERT INTO product_sizes (product_id, size, stock, sort_order) VALUES (?, ?, ?, ?)", [productId, s.size, s.stock, i + 1]);
  }
}

const dupSlug = (err: unknown) => {
  if ((err as { code?: string }).code === "ER_DUP_ENTRY") throw new HttpError(409, "Another product already uses that slug.", { slug: "Already in use." });
  if ((err as { code?: string }).code === "ER_NO_REFERENCED_ROW_2") throw new HttpError(400, "Choose a category.", { categoryId: "Choose a category." });
  throw err;
};

adminRouter.post("/products", async (req, res) => {
  const p = readProduct(req.body ?? {});
  const id = await transaction(async (conn) => {
    const [r] = await conn.query<ResultSetHeader>(
      `INSERT INTO products (slug, name, category_id, summary, description, fabric, care, color, price, compare_at_price, image, featured, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.slug, p.name, p.categoryId, p.summary, p.description, p.fabric, p.care, p.color, p.price, p.compareAtPrice, "/brand/product-placeholder.svg", p.featured, p.active],
    );
    await saveSizes(conn, r.insertId, p.sizes);
    return r.insertId;
  }).catch(dupSlug);
  const [[row]] = await pool.query<RowDataPacket[]>("SELECT slug FROM products WHERE id = ?", [id]);
  res.status(201).json(await getProduct(row.slug, true));
  publish({ type: "product.updated", slug: row.slug, at: new Date().toISOString() });
});

adminRouter.put("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const p = readProduct(req.body ?? {});
  await transaction(async (conn) => {
    const [r] = await conn.query<ResultSetHeader>(
      `UPDATE products SET slug=?, name=?, category_id=?, summary=?, description=?, fabric=?, care=?, color=?, price=?, compare_at_price=?, featured=?, active=? WHERE id=?`,
      [p.slug, p.name, p.categoryId, p.summary, p.description, p.fabric, p.care, p.color, p.price, p.compareAtPrice, p.featured, p.active, id],
    );
    if (!r.affectedRows) throw new HttpError(404, "Product not found.");
    await saveSizes(conn, id, p.sizes);
  }).catch(dupSlug);
  res.json(await getProduct(p.slug, true));
  publish({ type: "product.updated", slug: p.slug, at: new Date().toISOString() });
});

const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

adminRouter.post("/products/:id/image", raw({ type: Object.keys(IMAGE_TYPES), limit: "6mb" }), async (req, res) => {
  const ext = IMAGE_TYPES[req.headers["content-type"] ?? ""];
  if (!ext || !Buffer.isBuffer(req.body) || req.body.length < 100) throw new HttpError(400, "Upload a JPEG, PNG, WebP or AVIF image (max 6 MB).");
  const [[row]] = await pool.query<RowDataPacket[]>("SELECT slug FROM products WHERE id = ?", [req.params.id]);
  if (!row) throw new HttpError(404, "Product not found.");
  mkdirSync(join(UPLOAD_DIR, "products"), { recursive: true });
  const file = `${row.slug}-${Date.now()}.${ext}`;
  writeFileSync(join(UPLOAD_DIR, "products", file), req.body);
  await pool.query("UPDATE products SET image = ? WHERE id = ?", [`/uploads/products/${file}`, req.params.id]);
  res.json(await getProduct(row.slug, true));
  publish({ type: "product.updated", slug: row.slug, at: new Date().toISOString() });
});

adminRouter.get("/messages", async (_req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM contact_messages ORDER BY handled, created_at DESC LIMIT 300");
  res.json(rows.map((r) => ({ ...r, handled: !!r.handled })));
});

adminRouter.patch("/messages/:id", async (req, res) => {
  await pool.query("UPDATE contact_messages SET handled = ? WHERE id = ?", [req.body?.handled ? 1 : 0, req.params.id]);
  res.json({ success: true });
  publish({ type: "message.updated", id: Number(req.params.id), at: new Date().toISOString() });
});

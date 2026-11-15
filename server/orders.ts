// Checkout, order lookup and status changes.
import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool, transaction } from "./db.ts";
import { HttpError } from "./errors.ts";
import { checkEmail, normalizePhone, str } from "./validate.ts";
import { MAX_QTY_PER_LINE, shippingFee } from "../shared/store.ts";
import type { CartLine, DeliveryZone, Order, OrderStatus } from "../shared/types.ts";

const ZONES: DeliveryZone[] = ["inside_dhaka", "outside_dhaka"];
export const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function mapOrder(r: RowDataPacket, items: RowDataPacket[]): Order {
  return {
    orderNumber: r.order_number,
    customerName: r.customer_name,
    email: r.email,
    phone: r.phone,
    address: r.address,
    city: r.city,
    deliveryZone: r.delivery_zone,
    notes: r.notes,
    subtotal: r.subtotal,
    shippingFee: r.shipping_fee,
    total: r.total,
    paymentMethod: "cod",
    status: r.status,
    createdAt: String(r.created_at).replace(" ", "T") + "Z",
    items: items.map((i) => ({
      productSlug: i.product_slug,
      productName: i.product_name,
      image: i.image,
      size: i.size,
      unitPrice: i.unit_price,
      quantity: i.quantity,
      lineTotal: i.line_total,
    })),
  };
}

async function loadOrder(where: string, arg: unknown, conn: PoolConnection | typeof pool = pool) {
  const [rows] = await conn.query<RowDataPacket[]>(`SELECT * FROM orders WHERE ${where} LIMIT 1`, [arg]);
  if (!rows[0]) return null;
  const [items] = await conn.query<RowDataPacket[]>("SELECT * FROM order_items WHERE order_id = ? ORDER BY id", [rows[0].id]);
  return { order: mapOrder(rows[0], items), token: rows[0].access_token as string, id: rows[0].id as number };
}

export async function getOrderForCustomer(orderNumber: string, token: string): Promise<Order | null> {
  const found = await loadOrder("order_number = ?", orderNumber);
  if (!found || token.length !== 32) return null;
  const ok = timingSafeEqual(Buffer.from(found.token), Buffer.from(token));
  return ok ? found.order : null;
}

export async function getOrderAdmin(orderNumber: string) {
  return loadOrder("order_number = ?", orderNumber);
}

export async function listOrders(status?: string): Promise<Order[]> {
  const filter = status && STATUSES.includes(status as OrderStatus) ? status : null;
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM orders ${filter ? "WHERE status = ?" : ""} ORDER BY created_at DESC, id DESC LIMIT 300`,
    filter ? [filter] : [],
  );
  if (!rows.length) return [];
  const [items] = await pool.query<RowDataPacket[]>("SELECT * FROM order_items WHERE order_id IN (?) ORDER BY id", [rows.map((r) => r.id)]);
  return rows.map((r) => mapOrder(r, items.filter((i) => i.order_id === r.id)));
}

interface ValidCheckout {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  deliveryZone: DeliveryZone;
  notes: string | null;
  items: CartLine[];
}

export async function validateCheckout(body: Record<string, unknown>): Promise<ValidCheckout> {
  const fields: Record<string, string> = {};
  const customerName = str(body.customerName, 120);
  const email = str(body.email, 254).toLowerCase();
  const phoneRaw = str(body.phone, 30);
  const address = str(body.address, 500);
  const city = str(body.city, 80);
  const deliveryZone = body.deliveryZone as DeliveryZone;
  const notes = str(body.notes, 500) || null;

  if (customerName.length < 2) fields.customerName = "Please enter your full name.";
  const phone = normalizePhone(phoneRaw);
  if (!phone) fields.phone = "Enter a Bangladeshi mobile number, e.g. 01712 345678.";
  if (address.length < 8) fields.address = "Please enter your full delivery address (house, road, area).";
  if (city.length < 2) fields.city = "Please enter your city or district.";
  if (!ZONES.includes(deliveryZone)) fields.deliveryZone = "Choose a delivery area.";

  const raw = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  const merged = new Map<string, CartLine>();
  for (const it of raw as Record<string, unknown>[]) {
    const slug = str(it?.slug, 120);
    const size = str(it?.size, 20);
    const qty = Math.floor(Number(it?.quantity));
    if (!slug || !size || !(qty >= 1)) continue;
    const key = `${slug}::${size}`;
    const prev = merged.get(key);
    merged.set(key, { slug, size, quantity: Math.min(MAX_QTY_PER_LINE, (prev?.quantity ?? 0) + qty) });
  }
  if (!merged.size) throw new HttpError(400, "Your bag is empty.");

  try {
    await checkEmail(email);
  } catch (err) {
    if (err instanceof HttpError) Object.assign(fields, err.fields);
    else throw err;
  }
  if (Object.keys(fields).length) throw new HttpError(400, "Please check the highlighted fields.", fields);
  return { customerName, email, phone: phone!, address, city, deliveryZone, notes, items: [...merged.values()] };
}

function newOrderNumber(): string {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `BK${ymd}-${randomInt(1000, 10000)}`;
}

export async function placeOrder(input: ValidCheckout): Promise<{ order: Order; token: string }> {
  const token = randomBytes(16).toString("hex");
  return transaction(async (conn) => {
    const lines: { productId: number; slug: string; name: string; image: string; size: string; price: number; qty: number }[] = [];
    const problems: string[] = [];
    for (const item of input.items) {
      const [rows] = await conn.query<RowDataPacket[]>(
        `SELECT p.id, p.slug, p.name, p.image, p.price, p.active, s.stock
         FROM products p JOIN product_sizes s ON s.product_id = p.id
         WHERE p.slug = ? AND s.size = ? FOR UPDATE`,
        [item.slug, item.size],
      );
      const row = rows[0];
      if (!row || !row.active) {
        problems.push(`An item in your bag (${item.slug}, size ${item.size}) is no longer available.`);
      } else if (row.stock < item.quantity) {
        problems.push(row.stock > 0 ? `Only ${row.stock} left of ${row.name} in size ${item.size}.` : `${row.name} in size ${item.size} just sold out.`);
      } else {
        lines.push({ productId: row.id, slug: row.slug, name: row.name, image: row.image, size: item.size, price: row.price, qty: item.quantity });
      }
    }
    if (problems.length) throw new HttpError(409, problems.join(" "));

    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const fee = shippingFee(input.deliveryZone, subtotal);
    let orderId = 0;
    let orderNumber = "";
    for (let attempt = 0; attempt < 5 && !orderId; attempt++) {
      orderNumber = newOrderNumber();
      try {
        const [res] = await conn.query<ResultSetHeader>(
          `INSERT INTO orders (order_number, access_token, customer_name, email, phone, address, city, delivery_zone, notes, subtotal, shipping_fee, total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderNumber, token, input.customerName, input.email, input.phone, input.address, input.city, input.deliveryZone, input.notes, subtotal, fee, subtotal + fee],
        );
        orderId = res.insertId;
      } catch (err) {
        if ((err as { code?: string }).code !== "ER_DUP_ENTRY") throw err;
      }
    }
    if (!orderId) throw new Error("Could not allocate an order number");

    for (const l of lines) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_slug, image, size, unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, l.productId, l.name, l.slug, l.image, l.size, l.price, l.qty, l.price * l.qty],
      );
      await conn.query("UPDATE product_sizes SET stock = stock - ? WHERE product_id = ? AND size = ?", [l.qty, l.productId, l.size]);
    }
    const found = await loadOrder("id = ?", orderId, conn);
    return { order: found!.order, token };
  });
}

/** Changes an order's status; cancelling puts the items back in stock (and un-cancelling takes them out again). */
export async function setOrderStatus(orderNumber: string, status: OrderStatus) {
  if (!STATUSES.includes(status)) throw new HttpError(400, "Unknown status.");
  return transaction(async (conn) => {
    const [rows] = await conn.query<RowDataPacket[]>("SELECT id, status FROM orders WHERE order_number = ? FOR UPDATE", [orderNumber]);
    const row = rows[0];
    if (!row) throw new HttpError(404, "Order not found.");
    if (row.status === status) return { changed: false, ...(await loadOrder("id = ?", row.id, conn))! };
    const [items] = await conn.query<RowDataPacket[]>("SELECT product_id, size, quantity FROM order_items WHERE order_id = ?", [row.id]);
    if (status === "cancelled" || row.status === "cancelled") {
      const sign = status === "cancelled" ? 1 : -1;
      for (const i of items) {
        if (!i.product_id) continue;
        if (sign < 0) {
          const [s] = await conn.query<RowDataPacket[]>("SELECT stock FROM product_sizes WHERE product_id = ? AND size = ? FOR UPDATE", [i.product_id, i.size]);
          if (!s[0] || s[0].stock < i.quantity) throw new HttpError(409, "Not enough stock left to re-open this order.");
        }
        await conn.query("UPDATE product_sizes SET stock = stock + ? WHERE product_id = ? AND size = ?", [sign * i.quantity, i.product_id, i.size]);
      }
    }
    await conn.query("UPDATE orders SET status = ? WHERE id = ?", [status, row.id]);
    return { changed: true, ...(await loadOrder("id = ?", row.id, conn))! };
  });
}

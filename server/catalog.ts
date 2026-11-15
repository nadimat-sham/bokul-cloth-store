// Product and category queries, mapped to the shared API types.
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "./db.ts";
import type { Category, Product, ProductListResponse } from "../shared/types.ts";

export type ProductSort = "featured" | "newest" | "price-asc" | "price-desc";

export interface ProductQuery {
  category?: string;
  q?: string;
  size?: string;
  maxPrice?: number;
  sort?: ProductSort;
  featured?: boolean;
  limit?: number;
  includeInactive?: boolean;
}

const SELECT = `SELECT p.*, c.slug AS category_slug, c.name AS category_name
  FROM products p JOIN categories c ON c.id = p.category_id`;

const ORDER: Record<ProductSort, string> = {
  featured: "p.featured DESC, p.created_at DESC, p.id DESC",
  newest: "p.created_at DESC, p.id DESC",
  "price-asc": "p.price ASC, p.id ASC",
  "price-desc": "p.price DESC, p.id ASC",
};

async function mapProducts(rows: RowDataPacket[]): Promise<Product[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id as number);
  const [sizes] = await pool.query<RowDataPacket[]>(
    "SELECT product_id, size, stock FROM product_sizes WHERE product_id IN (?) ORDER BY sort_order, size",
    [ids],
  );
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    categorySlug: r.category_slug,
    categoryName: r.category_name,
    summary: r.summary,
    description: r.description,
    fabric: r.fabric,
    care: r.care,
    color: r.color,
    price: r.price,
    compareAtPrice: r.compare_at_price,
    image: r.image,
    featured: !!r.featured,
    active: !!r.active,
    sizes: sizes.filter((s) => s.product_id === r.id).map((s) => ({ size: s.size, stock: s.stock })),
    updatedAt: String(r.updated_at).replace(" ", "T") + "Z",
  }));
}

export async function listProducts(q: ProductQuery = {}): Promise<ProductListResponse> {
  const where: string[] = [];
  const args: unknown[] = [];
  if (!q.includeInactive) where.push("p.active = 1");
  if (q.category) {
    where.push("c.slug = ?");
    args.push(q.category);
  }
  if (q.featured) where.push("p.featured = 1");
  if (q.maxPrice && q.maxPrice > 0) {
    where.push("p.price <= ?");
    args.push(q.maxPrice);
  }
  if (q.size) {
    where.push("EXISTS (SELECT 1 FROM product_sizes s WHERE s.product_id = p.id AND s.size = ? AND s.stock > 0)");
    args.push(q.size);
  }
  if (q.q) {
    const like = `%${q.q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
    where.push("(p.name LIKE ? OR p.summary LIKE ? OR p.fabric LIKE ? OR p.color LIKE ? OR c.name LIKE ?)");
    args.push(like, like, like, like, like);
  }
  const sql = `${SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY ${ORDER[q.sort ?? "featured"] ?? ORDER.featured}`;
  const [rows] = await pool.query<RowDataPacket[]>(sql, args);
  const limited = q.limit ? rows.slice(0, q.limit) : rows;
  return { products: await mapProducts(limited), total: rows.length };
}

export async function getProduct(slug: string, includeInactive = false): Promise<Product | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT} WHERE p.slug = ? ${includeInactive ? "" : "AND p.active = 1"} LIMIT 1`,
    [slug],
  );
  const [product] = await mapProducts(rows);
  return product ?? null;
}

export async function relatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT} WHERE p.active = 1 AND p.id <> ? ORDER BY (c.slug = ?) DESC, p.featured DESC, p.id DESC LIMIT ?`,
    [product.id, product.categorySlug, limit],
  );
  return mapProducts(rows);
}

export async function listCategories(): Promise<Category[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.active = 1) AS product_count
     FROM categories c ORDER BY c.sort_order, c.name`,
  );
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    headline: r.headline,
    description: r.description,
    productCount: Number(r.product_count),
  }));
}

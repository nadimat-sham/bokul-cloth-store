// Public read endpoints. The same resolver serves /api requests and the data
// the server prefetches for server-side rendering, so both always agree.
import { getProduct, listCategories, listProducts, relatedProducts, type ProductSort } from "./catalog.ts";
import { getOrderForCustomer } from "./orders.ts";

export interface ApiResult {
  status: number;
  body: unknown;
}

const SORTS: ProductSort[] = ["featured", "newest", "price-asc", "price-desc"];
const notFound = (message = "Not found"): ApiResult => ({ status: 404, body: { success: false, message } });

export async function resolveGet(path: string): Promise<ApiResult> {
  const url = new URL(path, "http://local");
  const p = url.pathname.replace(/\/+$/, "");
  const q = url.searchParams;

  if (p === "/api/categories") return { status: 200, body: await listCategories() };

  if (p === "/api/products") {
    const sort = q.get("sort") as ProductSort;
    return {
      status: 200,
      body: await listProducts({
        category: q.get("category") || undefined,
        q: q.get("q")?.slice(0, 80) || undefined,
        size: q.get("size")?.slice(0, 20) || undefined,
        maxPrice: Number(q.get("maxPrice")) || undefined,
        sort: SORTS.includes(sort) ? sort : "featured",
        featured: q.get("featured") === "1",
        limit: Math.min(Number(q.get("limit")) || 0, 60) || undefined,
      }),
    };
  }

  let m = /^\/api\/products\/([a-z0-9-]{1,120})$/.exec(p);
  if (m) {
    const product = await getProduct(m[1]);
    if (!product) return notFound("Product not found");
    return { status: 200, body: { product, related: await relatedProducts(product, 3) } };
  }

  m = /^\/api\/orders\/([A-Z0-9-]{1,20})$/.exec(p);
  if (m) {
    const order = await getOrderForCustomer(m[1], q.get("token") ?? "");
    return order ? { status: 200, body: order } : notFound("Order not found");
  }

  return notFound();
}

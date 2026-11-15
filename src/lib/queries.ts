// Canonical API keys, so the server-rendered data and browser lookups match exactly.
export const CATEGORIES_KEY = "/api/categories";
export const FEATURED_KEY = "/api/products?featured=1&limit=6";
export const ALL_PRODUCTS_KEY = "/api/products";

export interface ShopParams {
  category?: string;
  q?: string;
  size?: string;
  maxPrice?: string;
  sort?: string;
}

export function shopParams(search: string | URLSearchParams, category?: string): ShopParams {
  const s = typeof search === "string" ? new URLSearchParams(search) : search;
  const clean = (v: string | null) => (v ?? "").trim().slice(0, 80) || undefined;
  return { category, q: clean(s.get("q")), size: clean(s.get("size")), maxPrice: clean(s.get("maxPrice")), sort: clean(s.get("sort")) };
}

export function productsKey(p: ShopParams): string {
  const qs = new URLSearchParams();
  for (const k of ["category", "q", "size", "maxPrice", "sort"] as const) if (p[k]) qs.set(k, p[k]!);
  const s = qs.toString();
  return s ? `${ALL_PRODUCTS_KEY}?${s}` : ALL_PRODUCTS_KEY;
}

export const productKey = (slug: string) => `/api/products/${slug}`;
export const orderKey = (num: string, token: string) => `/api/orders/${encodeURIComponent(num)}?token=${encodeURIComponent(token)}`;

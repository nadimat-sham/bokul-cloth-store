// Types shared by the React app and the Express API.

export interface Category {
  id: number;
  slug: string;
  name: string;
  headline: string;
  description: string;
  productCount: number;
}

export interface ProductSize {
  size: string;
  stock: number;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  summary: string;
  description: string;
  fabric: string;
  care: string;
  color: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  featured: boolean;
  active: boolean;
  sizes: ProductSize[];
  updatedAt: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

export interface CartLine {
  slug: string;
  size: string;
  quantity: number;
}

export type DeliveryZone = "inside_dhaka" | "outside_dhaka";
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface CheckoutRequest {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  deliveryZone: DeliveryZone;
  notes?: string;
  items: CartLine[];
}

export interface OrderItem {
  productSlug: string;
  productName: string;
  image: string;
  size: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  deliveryZone: DeliveryZone;
  notes: string | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: "cod";
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

export interface CheckoutResponse {
  orderNumber: string;
  token: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  /** Honeypot — must stay empty. */
  website?: string;
}

/** Public, non-secret settings the server passes to the app. */
export interface SiteConfig {
  url: string;
  email: string;
  phone: string;
  address: string;
  ga4Id: string;
}

export interface ApiError {
  success: false;
  message: string;
  fields?: Record<string, string>;
}

/** Events pushed live to the admin dashboard and order pages (Server-Sent Events). */
export type LiveEvent =
  | { type: "order.created"; orderNumber: string; customerName: string; total: number; itemCount: number; at: string }
  | { type: "order.updated"; orderNumber: string; status: OrderStatus; at: string }
  | { type: "message.created"; id: number; name: string; subject: string; at: string }
  | { type: "message.updated"; id: number; at: string }
  | { type: "subscriber.created"; at: string }
  | { type: "product.updated"; slug: string; at: string };

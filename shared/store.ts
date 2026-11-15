// Store-wide constants shared by the app, the API and the emails.
// Change policies here and they update everywhere (pages, FAQ, checkout, emails).
import type { DeliveryZone, OrderStatus } from "./types.ts";

export const STORE = {
  name: "Bokul Cloth Store",
  shortName: "Bokul",
  tagline: "Everyday & festive clothing, delivered across Bangladesh",
  description:
    "Bokul Cloth Store is an online clothing shop in Bangladesh selling cotton sarees, three-pieces, kurtis, panjabis, shirts and kids' wear, with cash on delivery nationwide.",
  country: "Bangladesh",
  countryCode: "BD",
  currency: "BDT",
  locale: "en-BD",
} as const;

export const SHIPPING: Record<DeliveryZone, { label: string; fee: number; days: string }> = {
  inside_dhaka: { label: "Inside Dhaka city", fee: 70, days: "1–2 working days" },
  outside_dhaka: { label: "Outside Dhaka", fee: 130, days: "3–5 working days" },
};

/** Orders at or above this subtotal ship free. */
export const FREE_SHIPPING_FROM = 3000;
export const EXCHANGE_DAYS = 7;
export const MAX_QTY_PER_LINE = 10;

export function shippingFee(zone: DeliveryZone, subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING[zone].fee;
}

export function formatMoney(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")}`;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Order received",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function discountPercent(price: number, compareAt: number | null): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

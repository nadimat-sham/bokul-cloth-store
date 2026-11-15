// Branded HTML + plain-text emails.
import type { ContactRequest, Order, OrderStatus } from "../shared/types.ts";
import { ADDRESS_TEXT, SHIPPING, STATUS_LABEL, STORE, formatMoney, EXCHANGE_DAYS } from "../shared/store.ts";
import { config } from "./config.ts";
import type { MailMessage } from "./mailer.ts";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f6f1e7;font-family:Arial,Helvetica,sans-serif;color:#1b2532">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e7;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e4dac6">
<tr><td style="background:#13202d;padding:22px 28px;text-align:center">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#f6f1e7;letter-spacing:.5px">Bokul</div>
<div style="font-size:10px;letter-spacing:4px;color:#c9a25a;text-transform:uppercase;margin-top:4px">Cloth Store</div>
<div style="font-size:14px;color:#c9a25a;margin-top:6px">${STORE.bengaliName}</div>
</td></tr>
<tr><td style="padding:30px 28px 8px"><h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:24px;margin:0 0 14px;color:#13202d">${esc(title)}</h1>${body}</td></tr>
<tr><td style="padding:22px 28px 28px;border-top:1px solid #efe7d6;font-size:12px;color:#6b7280;line-height:1.6">
${esc(STORE.name)} · <a href="${config.siteUrl}" style="color:#8a6a2e">${config.siteUrl.replace(/^https?:\/\//, "")}</a>
${config.storeEmail ? ` · <a href="mailto:${esc(config.storeEmail)}" style="color:#8a6a2e">${esc(config.storeEmail)}</a>` : ""}
${config.storePhone ? ` · ${esc(config.storePhone)}` : ""}
<br>${esc(ADDRESS_TEXT)}
</td></tr></table></td></tr></table></body></html>`;
}

const p = (html: string) => `<p style="font-size:14px;line-height:1.7;margin:0 0 14px">${html}</p>`;
const button = (href: string, label: string) =>
  `<p style="margin:22px 0"><a href="${href}" style="background:#a98444;color:#13202d;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;padding:14px 24px;display:inline-block">${esc(label)}</a></p>`;

function orderTable(order: Order): string {
  const rows = order.items
    .map(
      (i) => `<tr><td style="padding:10px 0;border-bottom:1px solid #efe7d6;font-size:14px">${esc(i.productName)}<br><span style="color:#6b7280;font-size:12px">Size ${esc(i.size)} × ${i.quantity}</span></td>
<td style="padding:10px 0;border-bottom:1px solid #efe7d6;font-size:14px;text-align:right;white-space:nowrap">${formatMoney(i.lineTotal)}</td></tr>`,
    )
    .join("");
  const line = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:6px 0;font-size:14px;${bold ? "font-weight:bold" : "color:#4b5563"}">${label}</td><td style="padding:6px 0;font-size:14px;text-align:right;${bold ? "font-weight:bold" : ""}">${value}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 18px">${rows}
${line("Subtotal", formatMoney(order.subtotal))}
${line(`Delivery (${esc(SHIPPING[order.deliveryZone].label)})`, order.shippingFee ? formatMoney(order.shippingFee) : "Free")}
${line("Total — cash on delivery", formatMoney(order.total), true)}</table>`;
}

function addressBlock(order: Order): string {
  return p(`<strong>Deliver to</strong><br>${esc(order.customerName)}<br>${esc(order.address)}, ${esc(order.city)}<br>${esc(order.phone)}`);
}

function orderText(order: Order): string {
  return [
    ...order.items.map((i) => `- ${i.productName} (size ${i.size}) x${i.quantity}: ${formatMoney(i.lineTotal)}`),
    `Subtotal: ${formatMoney(order.subtotal)}`,
    `Delivery: ${order.shippingFee ? formatMoney(order.shippingFee) : "Free"}`,
    `Total (cash on delivery): ${formatMoney(order.total)}`,
    "",
    `Deliver to: ${order.customerName}, ${order.address}, ${order.city}, ${order.phone}`,
  ].join("\n");
}

export const orderUrl = (order: Order, token: string) =>
  `${config.siteUrl}/order/${encodeURIComponent(order.orderNumber)}?token=${token}`;

export function orderConfirmationEmail(order: Order, token: string): MailMessage {
  const url = orderUrl(order, token);
  return {
    to: order.email,
    subject: `Order ${order.orderNumber} received — ${STORE.name}`,
    html: layout(
      `Thank you, ${order.customerName.split(" ")[0]}!`,
      p(`We've received your order <strong>${esc(order.orderNumber)}</strong>. Our team will call you on <strong>${esc(order.phone)}</strong> to confirm it before dispatch.`) +
        orderTable(order) +
        addressBlock(order) +
        p(`Expected delivery: ${esc(SHIPPING[order.deliveryZone].days)} after confirmation. Pay in cash when your parcel arrives. Unworn items can be exchanged within ${EXCHANGE_DAYS} days.`) +
        p("ধন্যবাদ, আবার আসবেন!") +
        button(url, "View your order"),
    ),
    text: `Thank you for your order ${order.orderNumber} at ${STORE.name}.\n\n${orderText(order)}\n\nWe will call you to confirm before dispatch. Track your order: ${url}`,
  };
}

export function newOrderAlertEmail(order: Order): MailMessage {
  return {
    to: config.storeEmail,
    replyTo: order.email,
    subject: `New order ${order.orderNumber} — ${formatMoney(order.total)}`,
    html: layout(
      `New order ${order.orderNumber}`,
      p(`${esc(order.customerName)} · <a href="mailto:${esc(order.email)}">${esc(order.email)}</a> · ${esc(order.phone)}`) +
        orderTable(order) +
        addressBlock(order) +
        (order.notes ? p(`<strong>Customer note:</strong> ${esc(order.notes)}`) : "") +
        button(`${config.siteUrl}/admin`, "Open admin"),
    ),
    text: `New order ${order.orderNumber} from ${order.customerName} (${order.email}, ${order.phone}).\n\n${orderText(order)}\n\nNote: ${order.notes ?? "-"}`,
  };
}

const STATUS_COPY: Record<OrderStatus, string> = {
  pending: "Your order is waiting for confirmation.",
  confirmed: "Good news — your order is confirmed and being packed.",
  shipped: "Your parcel is on its way. Please keep your phone nearby so the courier can reach you.",
  delivered: "Your order has been delivered. We hope you love it!",
  cancelled: "Your order has been cancelled. If this is unexpected, just reply to this email.",
};

export function statusUpdateEmail(order: Order, token: string): MailMessage {
  return {
    to: order.email,
    subject: `Order ${order.orderNumber}: ${STATUS_LABEL[order.status]} — ${STORE.name}`,
    html: layout(
      `Order ${order.orderNumber}: ${STATUS_LABEL[order.status]}`,
      p(esc(STATUS_COPY[order.status])) + orderTable(order) + button(orderUrl(order, token), "View your order"),
    ),
    text: `${STATUS_COPY[order.status]}\n\n${orderText(order)}\n\n${orderUrl(order, token)}`,
  };
}

export function contactAlertEmail(c: ContactRequest): MailMessage {
  return {
    to: config.storeEmail,
    replyTo: c.email,
    subject: `Website message: ${c.subject}`,
    html: layout(
      c.subject,
      p(`From <strong>${esc(c.name)}</strong> · <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>${c.phone ? ` · ${esc(c.phone)}` : ""}`) +
        `<div style="font-size:14px;line-height:1.7;white-space:pre-wrap;background:#faf6ee;padding:14px;border-left:3px solid #c9a25a">${esc(c.message)}</div>` +
        p("<br>Reply to this email to answer the customer directly."),
    ),
    text: `From ${c.name} <${c.email}> ${c.phone ?? ""}\n\n${c.message}`,
  };
}

export function contactReceiptEmail(c: ContactRequest): MailMessage {
  return {
    to: c.email,
    subject: `We received your message — ${STORE.name}`,
    html: layout(
      `Thanks for writing to us, ${c.name.split(" ")[0]}`,
      p("We've received your message and will reply within one working day.") +
        `<div style="font-size:13px;line-height:1.7;color:#4b5563;white-space:pre-wrap;background:#faf6ee;padding:14px">${esc(c.message)}</div>` +
        button(`${config.siteUrl}/shop`, "Keep browsing"),
    ),
    text: `Thanks for writing to ${STORE.name}. We will reply within one working day.\n\nYour message:\n${c.message}`,
  };
}

export function newsletterWelcomeEmail(email: string): MailMessage {
  return {
    to: email,
    subject: `Welcome to ${STORE.name}`,
    html: layout(
      "You're on the list",
      p("Thanks for subscribing. We'll write when new collections arrive and before festive sales — never more than a couple of times a month. Reply to any of our emails if you would like to unsubscribe.") +
        button(`${config.siteUrl}/shop`, "Shop the collection"),
    ),
    text: `Thanks for subscribing to ${STORE.name}. Shop: ${config.siteUrl}/shop`,
  };
}

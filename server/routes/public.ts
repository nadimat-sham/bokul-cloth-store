import { Router } from "express";
import type { ResultSetHeader } from "mysql2/promise";
import { pool } from "../db.ts";
import { resolveGet } from "../api.ts";
import { placeOrder, validateCheckout } from "../orders.ts";
import { sendMail } from "../mailer.ts";
import { contactAlertEmail, contactReceiptEmail, newOrderAlertEmail, newsletterWelcomeEmail, orderConfirmationEmail } from "../emails.ts";
import { rateLimit } from "../rateLimit.ts";
import { checkEmail, str } from "../validate.ts";
import { HttpError } from "../errors.ts";
import { config } from "../config.ts";
import type { ContactRequest } from "../../shared/types.ts";
import { publish, stream } from "../events.ts";
import { getOrderForCustomer } from "../orders.ts";

export const publicRouter = Router();

publicRouter.post("/orders", rateLimit(8, 15 * 60_000, "Too many orders from this connection — please call or email us."), async (req, res) => {
  const input = await validateCheckout(req.body ?? {});
  const { order, token } = await placeOrder(input);
  res.status(201).json({ orderNumber: order.orderNumber, token });
  const at = new Date().toISOString();
  publish({ type: "order.created", orderNumber: order.orderNumber, customerName: order.customerName, total: order.total, itemCount: order.items.reduce((n, i) => n + i.quantity, 0), at });
  for (const slug of new Set(order.items.map((i) => i.productSlug))) publish({ type: "product.updated", slug, at });
  // Emails go out after the response so a slow mail server never delays checkout.
  void sendMail(orderConfirmationEmail(order, token));
  if (config.storeEmail) void sendMail(newOrderAlertEmail(order));
});

publicRouter.post("/contact", rateLimit(5, 15 * 60_000), async (req, res) => {
  const b = req.body ?? {};
  if (str(b.website, 200)) return res.status(201).json({ success: true }); // honeypot: pretend success
  const c: ContactRequest = {
    name: str(b.name, 120),
    email: str(b.email, 254).toLowerCase(),
    phone: str(b.phone, 30) || undefined,
    subject: str(b.subject, 160) || "General question",
    message: str(b.message, 5000),
  };
  const fields: Record<string, string> = {};
  if (c.name.length < 2) fields.name = "Please enter your name.";
  if (c.message.length < 10) fields.message = "Please write a little more (at least 10 characters).";
  try {
    await checkEmail(c.email);
  } catch (err) {
    if (err instanceof HttpError) Object.assign(fields, err.fields);
  }
  if (Object.keys(fields).length) throw new HttpError(400, "Please check the highlighted fields.", fields);
  const [ins] = await pool.query<ResultSetHeader>(
    "INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)",
    [c.name, c.email, c.phone ?? null, c.subject, c.message],
  );
  res.status(201).json({ success: true });
  publish({ type: "message.created", id: ins.insertId, name: c.name, subject: c.subject, at: new Date().toISOString() });
  if (config.storeEmail) void sendMail(contactAlertEmail(c));
  void sendMail(contactReceiptEmail(c));
});

publicRouter.post("/newsletter", rateLimit(5, 15 * 60_000), async (req, res) => {
  const email = str(req.body?.email, 254).toLowerCase();
  await checkEmail(email);
  const [r] = await pool.query<ResultSetHeader>("INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)", [email]);
  res.status(201).json({ success: true, alreadySubscribed: r.affectedRows === 0 });
  if (r.affectedRows) {
    void sendMail(newsletterWelcomeEmail(email));
    publish({ type: "subscriber.created", at: new Date().toISOString() });
  }
});

publicRouter.get("/health", async (_req, res) => {
  const [rows] = await pool.query("SELECT 1 AS ok");
  res.json({ status: "ok", db: Array.isArray(rows) && rows.length === 1 });
});

// Live status for the customer's order page (same private token as the order link)
publicRouter.get("/orders/:number/events", async (req, res) => {
  const order = await getOrderForCustomer(req.params.number, str(req.query.token, 64));
  if (!order) throw new HttpError(404, "Order not found");
  stream(req, res, (e) => e.type === "order.updated" && e.orderNumber === order.orderNumber);
});

publicRouter.get("/*splat", async (req, res) => {
  const result = await resolveGet(req.originalUrl);
  res.setHeader("Cache-Control", "no-store");
  res.status(result.status).json(result.body);
});

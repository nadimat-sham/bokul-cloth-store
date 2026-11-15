// Outgoing mail through the Google account configured in .env (same setup as
// ~/dev/simple-mailing-server: smtp.gmail.com + a Google App Password).
import nodemailer from "nodemailer";
import { config } from "./config.ts";

const enabled = Boolean(config.smtp.user && config.smtp.password);

const transporter = enabled
  ? nodemailer.createTransport({
      pool: true,
      maxConnections: 1,
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.password },
    })
  : null;

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

/** Sends a message; never throws — a failed email must not fail an order. */
export async function sendMail(msg: MailMessage): Promise<boolean> {
  if (!transporter) {
    console.warn(`[mail] skipped (SMTP not configured): ${msg.subject} → ${msg.to}`);
    return false;
  }
  try {
    await transporter.sendMail({ from: config.smtp.from || config.smtp.user, ...msg });
    console.log(`[mail] sent: ${msg.subject} → ${msg.to}`);
    return true;
  } catch (err) {
    console.error(`[mail] failed: ${msg.subject} → ${msg.to}`, err);
    return false;
  }
}

export async function verifyMailer(): Promise<boolean> {
  if (!transporter) return false;
  try {
    await transporter.verify();
    return true;
  } catch (err) {
    console.error("[mail] SMTP login failed:", (err as Error).message);
    return false;
  }
}

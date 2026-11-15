// Reads server settings from the environment (.env is loaded by `node --env-file`).
import type { SiteConfig } from "../shared/types.ts";
import { ADDRESS_TEXT, PHONE } from "../shared/store.ts";

function env(name: string, fallback = ""): string {
  return (process.env[name] ?? fallback).trim();
}

export const config = {
  isProd: process.env.NODE_ENV === "production",
  port: Number(env("PORT", "3010")) || 3010,
  host: env("HOST", "0.0.0.0"),
  siteUrl: env("SITE_URL", "http://localhost:3010").replace(/\/+$/, ""),
  db: {
    host: env("DB_HOST", "127.0.0.1"),
    port: Number(env("DB_PORT", "3306")),
    user: env("DB_USER"),
    password: env("DB_PASSWORD"),
    database: env("DB_NAME", "bokul_store"),
  },
  sessionSecret: env("SESSION_SECRET"),
  adminPassword: env("ADMIN_PASSWORD"),
  smtp: {
    host: env("SMTP_HOST", "smtp.gmail.com"),
    port: Number(env("SMTP_PORT", "465")) || 465,
    secure: env("SMTP_SECURE", "true") !== "false",
    user: env("SMTP_USER"),
    password: env("SMTP_PASSWORD"),
    from: env("SMTP_FROM").replace(/^"|"$/g, ""),
  },
  storeEmail: env("STORE_EMAIL") || env("SMTP_USER"),
  storePhone: PHONE.display,
  ga4Id: env("GA4_MEASUREMENT_ID"),
  googleVerification: env("GOOGLE_SITE_VERIFICATION"),
  bingVerification: env("BING_SITE_VERIFICATION"),
  trustProxy: env("TRUST_PROXY"),
};

export const site: SiteConfig = {
  url: config.siteUrl,
  email: config.storeEmail,
  phone: config.storePhone,
  address: ADDRESS_TEXT,
  ga4Id: /^G-[A-Z0-9]+$/.test(config.ga4Id) ? config.ga4Id : "",
};

export function assertConfigured(): void {
  const missing: string[] = [];
  if (!config.db.user) missing.push("DB_USER");
  if (config.sessionSecret.length < 32) missing.push("SESSION_SECRET (32+ characters)");
  if (config.adminPassword.length < 8) missing.push("ADMIN_PASSWORD (8+ characters)");
  if (missing.length) {
    throw new Error(`Missing configuration in .env: ${missing.join(", ")}`);
  }
  if (!config.smtp.user || !config.smtp.password) {
    console.warn("[mail] SMTP_USER / SMTP_PASSWORD not set — emails will be skipped.");
  }
}

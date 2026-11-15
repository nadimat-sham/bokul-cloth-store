// Bokul Cloth Store — Express API + server-side rendered React app.
import express, { type NextFunction, type Request, type Response } from "express";
import compression from "compression";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { ViteDevServer } from "vite";
import { assertConfigured, config, site } from "./config.ts";
import { HttpError } from "./errors.ts";
import { publicRouter } from "./routes/public.ts";
import { adminRouter, UPLOAD_DIR } from "./routes/admin.ts";
import { seoRouter } from "./seo.ts";
import { resolveGet, type ApiResult } from "./api.ts";
import { verifyMailer } from "./mailer.ts";

assertConfigured();
const ROOT = join(import.meta.dirname, "..");

interface SsrModule {
  dataKeys(pathname: string, search: string): string[];
  render(url: string, data: Record<string, ApiResult>, siteConfig: typeof site): { html: string; head: string; status: number };
}

const app = express();
app.disable("x-powered-by");
if (config.trustProxy) app.set("trust proxy", config.trustProxy);
// Live event streams must not be buffered by compression
app.use(compression({ filter: (req, res) => !req.path.endsWith("/events") && compression.filter(req, res) }));
app.use(express.json({ limit: "100kb" }));

app.use((req, res, next) => {
  res.locals.nonce = randomBytes(16).toString("base64");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (config.isProd) {
    const ga = "https://www.googletagmanager.com https://*.google-analytics.com";
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        `script-src 'self' 'nonce-${res.locals.nonce}' https://www.googletagmanager.com`,
        `connect-src 'self' ${ga}`,
        `img-src 'self' data: ${ga}`,
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self' data:",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ].join("; "),
    );
  }
  // Canonical URL shapes: no trailing slash, no /index.html
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    if (req.path === "/index.html" || req.path === "/home") return res.redirect(301, "/" + (req.url.split("?")[1] ? `?${req.url.split("?")[1]}` : ""));
    // The home-page finder form submits ?category= when JavaScript is off
    if (req.path === "/shop" && typeof req.query.category === "string" && /^[a-z0-9-]+$/.test(req.query.category)) {
      const qs = new URLSearchParams(req.url.split("?")[1] ?? "");
      qs.delete("category");
      for (const k of [...qs.keys()]) if (!qs.get(k)) qs.delete(k);
      const rest = qs.toString();
      return res.redirect(302, `/shop/${req.query.category}${rest ? `?${rest}` : ""}`);
    }
    if (req.path.length > 1 && req.path.endsWith("/")) {
      const q = req.url.slice(req.path.length);
      return res.redirect(301, req.path.replace(/\/+$/, "") + q);
    }
  }
  next();
});

app.use("/api/admin", adminRouter);
app.use("/api", publicRouter);
app.use(seoRouter);
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d", fallthrough: false }));

// API errors → JSON
app.use("/api", (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) return res.status(err.status).json({ success: false, message: err.message, fields: err.fields });
  if ((err as { type?: string }).type === "entity.parse.failed") return res.status(400).json({ success: false, message: "Invalid request." });
  if ((err as { type?: string }).type === "entity.too.large") return res.status(413).json({ success: false, message: "That file is too large." });
  console.error(err);
  res.status(500).json({ success: false, message: "Something went wrong on our side. Please try again." });
});

let vite: ViteDevServer | undefined;
let prodTemplate = "";
let prodModule: SsrModule | undefined;

if (!config.isProd) {
  const { createServer } = await import("vite");
  vite = await createServer({ root: ROOT, server: { middlewareMode: true }, appType: "custom" });
  app.use(vite.middlewares);
} else {
  const client = join(ROOT, "dist", "client");
  prodTemplate = readFileSync(join(client, "index.html"), "utf8");
  prodModule = (await import(pathToFileURL(join(ROOT, "dist", "server", "entry-server.js")).href)) as SsrModule;
  app.use("/assets", express.static(join(client, "assets"), { immutable: true, maxAge: "1y", index: false }));
  app.use(express.static(client, { index: false, maxAge: "1d" }));
}

const safeJson = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");

function analyticsTags(nonce: string): string {
  const tags: string[] = [];
  if (config.googleVerification) tags.push(`<meta name="google-site-verification" content="${config.googleVerification.replace(/"/g, "")}">`);
  if (config.bingVerification) tags.push(`<meta name="msvalidate.01" content="${config.bingVerification.replace(/"/g, "")}">`);
  if (site.ga4Id) {
    tags.push(
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${site.ga4Id}" nonce="${nonce}"></script>`,
      `<script nonce="${nonce}">window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${site.ga4Id}');</script>`,
    );
  }
  return tags.join("\n");
}

app.get("/{*splat}", async (req, res, next) => {
  try {
    const url = req.originalUrl;
    let template: string;
    let mod: SsrModule;
    if (vite) {
      template = await vite.transformIndexHtml(url, readFileSync(join(ROOT, "index.html"), "utf8"));
      mod = (await vite.ssrLoadModule("/src/entry-server.tsx")) as SsrModule;
    } else {
      template = prodTemplate;
      mod = prodModule!;
    }
    const parsed = new URL(url, "http://local");
    const data: Record<string, ApiResult> = {};
    await Promise.all(mod.dataKeys(parsed.pathname, parsed.search).map(async (key) => (data[key] = await resolveGet(key))));
    const out = mod.render(url, data, site);
    const nonce = res.locals.nonce as string;
    const html = template
      .replace("<!--app-head-->", `${out.head}\n${analyticsTags(nonce)}`)
      .replace("<!--app-html-->", out.html)
      .replace(
        "<!--app-data-->",
        `<script id="__DATA__" type="application/json">${safeJson({ data, site })}</script>`,
      );
    res.status(out.status).setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.end(html);
  } catch (err) {
    vite?.ssrFixStacktrace(err as Error);
    next(err);
  }
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).type("text/plain").send("Something went wrong. Please refresh the page.");
});

app.listen(config.port, config.host, () => {
  console.log(`Bokul Cloth Store running at http://localhost:${config.port} (${config.isProd ? "production" : "development"})`);
  void verifyMailer().then((ok) => console.log(ok ? "[mail] SMTP ready" : "[mail] SMTP not ready — emails will be skipped or fail"));
});

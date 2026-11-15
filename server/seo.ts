// sitemap.xml, robots.txt and llms.txt, generated from live catalogue data.
import { Router } from "express";
import { listCategories, listProducts } from "./catalog.ts";
import { config } from "./config.ts";
import { STATIC_PAGES } from "../shared/pages.ts";
import { ADDRESS_TEXT, STORE, SHIPPING, FREE_SHIPPING_FROM, EXCHANGE_DAYS, formatMoney } from "../shared/store.ts";

export const seoRouter = Router();
const xml = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

seoRouter.get("/sitemap.xml", async (_req, res) => {
  const [cats, list] = await Promise.all([listCategories(), listProducts()]);
  const base = config.siteUrl;
  const urls: string[] = STATIC_PAGES.map(
    (p) => `<url><loc>${base}${p.path === "/" ? "/" : p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority.toFixed(1)}</priority></url>`,
  );
  for (const c of cats) {
    if (c.productCount) urls.push(`<url><loc>${base}/shop/${c.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
  }
  for (const p of list.products) {
    urls.push(
      `<url><loc>${base}/product/${p.slug}</loc><lastmod>${p.updatedAt.slice(0, 10)}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority>` +
        `<image:image><image:loc>${xml(base + p.image)}</image:loc><image:title>${xml(p.name)}</image:title></image:image></url>`,
    );
  }
  res.type("application/xml").setHeader("Cache-Control", "public, max-age=3600");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>\n`);
});

seoRouter.get("/robots.txt", (_req, res) => {
  res.type("text/plain").setHeader("Cache-Control", "public, max-age=3600");
  res.send(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /admin",
      "Disallow: /cart",
      "Disallow: /checkout",
      "Disallow: /order/",
      "Disallow: /api/",
      "Disallow: /shop?*q=",
      "",
      `Sitemap: ${config.siteUrl}/sitemap.xml`,
      "",
    ].join("\n"),
  );
});

seoRouter.get("/llms.txt", async (_req, res) => {
  const [cats, list] = await Promise.all([listCategories(), listProducts()]);
  const base = config.siteUrl;
  const lines = [
    `# ${STORE.name}`,
    "",
    `> ${STORE.description}`,
    "",
    "## Key facts",
    `- Shop address: ${ADDRESS_TEXT}, ${STORE.country}`,
    `- Ships to: all of ${STORE.country}`,
    `- Payment: cash on delivery`,
    ...Object.values(SHIPPING).map((z) => `- Delivery ${z.label.toLowerCase()}: ${formatMoney(z.fee)}, ${z.days}`),
    `- Free delivery on orders from ${formatMoney(FREE_SHIPPING_FROM)}`,
    `- Exchanges: unworn items within ${EXCHANGE_DAYS} days of delivery`,
    config.storeEmail ? `- Email: ${config.storeEmail}` : "",
    config.storePhone ? `- Phone: ${config.storePhone}` : "",
    "",
    "## Categories",
    ...cats.map((c) => `- [${c.name}](${base}/shop/${c.slug}): ${c.description}`),
    "",
    "## Products",
    ...list.products.map((p) => `- [${p.name}](${base}/product/${p.slug}) — ${formatMoney(p.price)}; ${p.fabric}; sizes ${p.sizes.map((s) => s.size).join(", ")}`),
    "",
    "## Pages",
    ...STATIC_PAGES.map((p) => `- [${p.label}](${base}${p.path})`),
    "",
  ];
  res.type("text/plain").setHeader("Cache-Control", "public, max-age=3600");
  res.send(lines.filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n"));
});

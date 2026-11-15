# Bokul Cloth Store

An online clothing shop for Bangladesh: React + TypeScript storefront with
server-side rendering, an Express API, a MySQL database and order/contact
emails sent through Gmail (same SMTP setup as `~/dev/simple-mailing-server`).

## Stack

| Layer | What |
| --- | --- |
| Frontend | React 19, React Router 7, TypeScript, Vite 8, hand-written CSS (`src/styles/`) |
| Rendering | Every page is server-rendered by Express (`server/index.ts` → `src/entry-server.tsx`) so crawlers get full HTML, then hydrated in the browser |
| Backend | Express 5 on Node 22.18+ (runs `.ts` directly via Node's type stripping) |
| Database | MySQL 8, database `bokul_store`, app user `bokul_app` (data-only privileges) |
| Email | Nodemailer → `smtp.gmail.com` with a Google App Password |

## Run it

```bash
npm install
npm run dev        # http://localhost:3010 — Vite + API, server restarts on server/ changes
npm run build      # client bundle → dist/client, SSR bundle → dist/server
npm start          # production server on PORT (default 3010)
npm run typecheck  # TypeScript, all of src/ server/ shared/ scripts/
```

All settings are in `.env` (mode 600, never committed; template in `.env.example`).

## Pages

`/` home · `/shop` and `/shop/{women,men,kids,accessories}` · `/product/:slug` ·
`/cart` · `/checkout` · `/order/:number?token=…` (private order status) · `/about` ·
`/contact` · `/faq` · `/delivery-returns` · `/size-guide` · `/terms` · `/privacy` ·
`/admin` · custom 404. Generated: `/sitemap.xml`, `/robots.txt`, `/llms.txt`.

## How ordering works

1. The bag lives in the shopper's browser (localStorage).
2. Checkout posts to `POST /api/orders`; the server re-prices every item from the
   database, locks the stock rows, rejects anything sold out, saves the order and
   decrements stock in one transaction.
3. Payment is **cash on delivery** only (no online payment system).
4. Emails: confirmation to the customer (with a private order-status link) and an
   alert to `STORE_EMAIL`. Status changes made in `/admin` email the customer;
   cancelling returns the items to stock.

## Admin (`/admin`)

Sign in with `ADMIN_PASSWORD` from `.env`. Orders (filter, details, status
changes), products (add/edit, price, sizes & stock, show/hide, feature on home,
photo upload to `uploads/products/`), and contact-form messages.

### Live updates & notifications

The admin dashboard keeps a Server-Sent Events connection open (`/api/admin/events`,
green **Live** dot in the top bar). New orders and messages appear immediately with
an on-page alert, a chime (toggle **Sound on/off**), an optional desktop
notification (click **Enable desktop alerts** once and allow it) and a `(n)`
counter in the tab title while the tab is in the background. Stats, stock and
status changes from other admin tabs refresh live too. Customers' order-status
pages (`/order/…`) update themselves when you change the status. Behind nginx,
the stream needs `proxy_buffering off;` (the server also sends `X-Accel-Buffering: no`).

## Editing content

- Store policies (delivery fees, free-delivery threshold, return days, currency):
  `shared/store.ts` — the pages, FAQ, checkout, emails and structured data all read them.
- FAQ: `src/content/faq.ts`. Size charts: `src/pages/SizeGuide.tsx`.
- Terms / Privacy: `src/pages/Terms.tsx`, `src/pages/Privacy.tsx`.
- Public phone/address: `STORE_PHONE` / `STORE_ADDRESS` in `.env` (shown only when set).

## Images

Product, category and banner images are generated SVG illustrations
(`npm run assets`, source `scripts/generate-images.ts`). Replace them with real
photos from the admin product editor (4:5 portrait works best). Social-share PNGs
and icons are rendered with `bash scripts/render-raster.sh` (needs Chrome).

## Database

Schema changes only through `db/migrations/` (run as a MySQL admin):

```bash
sudo mysql bokul_store < db/migrations/001_schema.sql
sudo mysql bokul_store < db/migrations/002_seed.sql   # starter catalogue, once
```

## Going live

1. Point a domain at the server and put it behind HTTPS (e.g. nginx or Caddy as a
   reverse proxy to port 3010). Set `SITE_URL=https://your-domain` and
   `TRUST_PROXY=127.0.0.1`, then `npm run build && npm start` (use systemd or pm2 to keep it running).
2. Google Search Console / Bing Webmaster Tools: add the site, paste the verification
   codes into `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION`, restart, verify,
   then submit `https://your-domain/sitemap.xml`.
3. Google Analytics 4: put your `G-XXXXXXX` ID in `GA4_MEASUREMENT_ID` (the CSP already allows it).
4. Validate structured data with Google's Rich Results Test once the site is public.

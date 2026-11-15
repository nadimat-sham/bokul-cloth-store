// Per-page metadata. During server rendering <Seo> records the page's tags so
// they are in the HTML crawlers receive; in the browser it keeps <head> in sync
// on client-side navigation.
import { createContext, useContext, useEffect } from "react";
import type { Product, SiteConfig } from "../../shared/types.ts";
import { ADDRESS, MAPS_URL, PHONE, STORE, EXCHANGE_DAYS } from "../../shared/store.ts";
import { useSite } from "./site.tsx";

export interface HeadState {
  title: string;
  description: string;
  path: string;
  noindex: boolean;
  image: string;
  imageAlt: string;
  type: "website" | "product" | "article";
  jsonLd: object[];
  status: number;
}

export const emptyHead = (): HeadState => ({
  title: STORE.name,
  description: STORE.description,
  path: "/",
  noindex: false,
  image: "/og-image.png",
  imageAlt: STORE.name,
  type: "website",
  jsonLd: [],
  status: 200,
});

export const HeadContext = createContext<HeadState | null>(null);

export interface SeoProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  image?: string;
  imageAlt?: string;
  type?: HeadState["type"];
  jsonLd?: object[];
  status?: number;
}

const abs = (site: SiteConfig, p: string) => (/^https?:\/\//.test(p) ? p : `${site.url}${p}`);

export function Seo(props: SeoProps) {
  const head = useContext(HeadContext);
  const site = useSite();
  const fullTitle = props.path === "/" ? props.title : `${props.title} | ${STORE.name}`;
  const state: HeadState = {
    ...emptyHead(),
    ...props,
    title: fullTitle,
    noindex: props.noindex ?? false,
    image: props.image ?? "/og-image.png",
    imageAlt: props.imageAlt ?? STORE.name,
    type: props.type ?? "website",
    jsonLd: props.jsonLd ?? [],
    status: props.status ?? 200,
  };
  if (head) Object.assign(head, state); // server render: record for <head>

  const tagsKey = JSON.stringify(state);
  useEffect(() => {
    applyHead(state, site);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsKey]);
  return null;
}

interface Tag {
  tag: "title" | "meta" | "link" | "script";
  attrs: Record<string, string>;
  text?: string;
}

export function headTags(h: HeadState, site: SiteConfig): Tag[] {
  const url = abs(site, h.path);
  const image = abs(site, h.image);
  const tags: Tag[] = [
    { tag: "title", attrs: {}, text: h.title },
    { tag: "meta", attrs: { name: "description", content: h.description } },
    { tag: "meta", attrs: { name: "robots", content: h.noindex ? "noindex, follow" : "index, follow, max-image-preview:large" } },
    { tag: "meta", attrs: { property: "og:site_name", content: STORE.name } },
    { tag: "meta", attrs: { property: "og:locale", content: "en_US" } },
    { tag: "meta", attrs: { property: "og:type", content: h.type === "product" ? "product" : h.type } },
    { tag: "meta", attrs: { property: "og:title", content: h.title } },
    { tag: "meta", attrs: { property: "og:description", content: h.description } },
    { tag: "meta", attrs: { property: "og:url", content: url } },
    { tag: "meta", attrs: { property: "og:image", content: image } },
    { tag: "meta", attrs: { property: "og:image:alt", content: h.imageAlt } },
    { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" } },
    { tag: "meta", attrs: { name: "twitter:title", content: h.title } },
    { tag: "meta", attrs: { name: "twitter:description", content: h.description } },
    { tag: "meta", attrs: { name: "twitter:image", content: image } },
  ];
  if (!h.noindex) tags.push({ tag: "link", attrs: { rel: "canonical", href: url } });
  for (const ld of h.jsonLd) tags.push({ tag: "script", attrs: { type: "application/ld+json" }, text: JSON.stringify(ld).replace(/</g, "\\u003c") });
  return tags;
}

const escAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const escText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function renderHead(h: HeadState, site: SiteConfig): string {
  return headTags(h, site)
    .map(({ tag, attrs, text }) => {
      const a = Object.entries({ ...attrs, "data-seo": "" })
        .map(([k, v]) => (v === "" ? ` ${k}` : ` ${k}="${escAttr(v)}"`))
        .join("");
      if (tag === "title") return `<title${a}>${escText(text ?? "")}</title>`;
      if (tag === "script") return `<script${a}>${text}</script>`;
      return `<${tag}${a}>`;
    })
    .join("\n");
}

function applyHead(h: HeadState, site: SiteConfig) {
  document.head.querySelectorAll("[data-seo]").forEach((el) => el.remove());
  const frag = document.createDocumentFragment();
  for (const { tag, attrs, text } of headTags(h, site)) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.setAttribute("data-seo", "");
    if (text !== undefined) el.textContent = tag === "script" ? text.replace(/\\u003c/g, "<") : text;
    frag.appendChild(el);
  }
  document.head.appendChild(frag);
  document.title = h.title;
}

// ---------- Structured data builders (only facts shown on the page) ----------

export function storeLd(site: SiteConfig): object {
  return {
    "@context": "https://schema.org",
    "@type": ["ClothingStore", "OnlineStore"],
    "@id": `${site.url}/#store`,
    name: STORE.name,
    alternateName: [STORE.bengaliName, STORE.shortName, STORE.monogram],
    founder: { "@type": "Person", name: STORE.proprietor, image: `${site.url}/images/owner/motiur-rahman.webp` },
    url: `${site.url}/`,
    logo: `${site.url}/icon-512.png`,
    image: `${site.url}/og-image.png`,
    description: STORE.description,
    ...(site.email ? { email: site.email } : {}),
    telephone: PHONE.international,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.street,
      addressLocality: ADDRESS.locality,
      addressRegion: ADDRESS.region,
      addressCountry: ADDRESS.countryCode,
    },
    hasMap: MAPS_URL,
    areaServed: { "@type": "Country", name: STORE.country },
    currenciesAccepted: STORE.currency,
    paymentAccepted: "Cash on delivery",
    hasMerchantReturnPolicy: returnPolicyLd(),
  };
}

export function returnPolicyLd(): object {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: STORE.countryCode,
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: EXCHANGE_DAYS,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnShippingFees",
  };
}

export function websiteLd(site: SiteConfig): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: STORE.name,
    url: `${site.url}/`,
    publisher: { "@id": `${site.url}/#store` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${site.url}/shop?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(site: SiteConfig, items: { name: string; path: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${site.url}${it.path}` })),
  };
}

export const ogPng = (p: Product) => (p.image.startsWith("/images/products/") ? p.image.replace("/images/products/", "/images/og/").replace(/\.svg$/, ".png") : p.image);

export function productLd(site: SiteConfig, p: Product): object {
  const inStock = p.sizes.some((s) => s.stock > 0);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${site.url}/product/${p.slug}#product`,
    name: p.name,
    description: p.description,
    image: [abs(site, ogPng(p)), abs(site, p.image)],
    sku: p.slug,
    brand: { "@type": "Brand", name: STORE.name },
    category: p.categoryName,
    color: p.color,
    material: p.fabric,
    offers: {
      "@type": "Offer",
      url: `${site.url}/product/${p.slug}`,
      priceCurrency: STORE.currency,
      price: p.price,
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@id": `${site.url}/#store` },
      hasMerchantReturnPolicy: returnPolicyLd(),
    },
  };
}

export function faqLd(items: { q: string; a: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

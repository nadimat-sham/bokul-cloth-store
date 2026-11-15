// Indexable static pages — used for the sitemap, llms.txt and navigation.
export interface PageEntry {
  path: string;
  label: string;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
}

export const STATIC_PAGES: PageEntry[] = [
  { path: "/", label: "Home", priority: 1, changefreq: "daily" },
  { path: "/shop", label: "Shop all", priority: 0.9, changefreq: "daily" },
  { path: "/about", label: "About us", priority: 0.6, changefreq: "monthly" },
  { path: "/delivery-returns", label: "Delivery & returns", priority: 0.6, changefreq: "monthly" },
  { path: "/size-guide", label: "Size guide", priority: 0.5, changefreq: "monthly" },
  { path: "/faq", label: "FAQ", priority: 0.6, changefreq: "monthly" },
  { path: "/contact", label: "Contact", priority: 0.6, changefreq: "monthly" },
  { path: "/terms", label: "Terms & conditions", priority: 0.3, changefreq: "yearly" },
  { path: "/privacy", label: "Privacy policy", priority: 0.3, changefreq: "yearly" },
];

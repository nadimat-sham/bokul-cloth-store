import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import type { SiteConfig } from "../shared/types.ts";
import { Root } from "./Root.tsx";
import { emptyHead, renderHead } from "./lib/seo.tsx";
import type { CacheEntry } from "./lib/data.tsx";

export { dataKeys } from "./routes.tsx";

export function render(url: string, data: Record<string, CacheEntry>, site: SiteConfig) {
  const head = emptyHead();
  const html = renderToString(<Root data={data} site={site} head={head} router={(app) => <StaticRouter location={url}>{app}</StaticRouter>} />);
  return { html, head: renderHead(head, site), status: head.status };
}

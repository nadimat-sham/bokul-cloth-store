import type { ReactNode } from "react";
import type { SiteConfig } from "../shared/types.ts";
import { DataProvider, type CacheEntry } from "./lib/data.tsx";
import { SiteContext } from "./lib/site.tsx";
import { CartProvider } from "./lib/cart.tsx";
import { HeadContext, type HeadState } from "./lib/seo.tsx";
import { App } from "./App.tsx";
import "./styles/index.css";

export function Root({ data, site, head, router }: { data: Record<string, CacheEntry>; site: SiteConfig; head: HeadState | null; router: (app: ReactNode) => ReactNode }) {
  return (
    <HeadContext.Provider value={head}>
      <SiteContext.Provider value={site}>
        <DataProvider initial={data}>
          <CartProvider>{router(<App />)}</CartProvider>
        </DataProvider>
      </SiteContext.Provider>
    </HeadContext.Provider>
  );
}

import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Root } from "./Root.tsx";
import type { CacheEntry } from "./lib/data.tsx";
import type { SiteConfig } from "../shared/types.ts";

const payload = JSON.parse(document.getElementById("__DATA__")?.textContent ?? "{}") as {
  data?: Record<string, CacheEntry>;
  site?: SiteConfig;
};

hydrateRoot(
  document.getElementById("root")!,
  <StrictMode>
    <Root
      data={payload.data ?? {}}
      site={payload.site ?? { url: location.origin, email: "", phone: "", address: "", ga4Id: "" }}
      head={null}
      router={(app) => <BrowserRouter>{app}</BrowserRouter>}
    />
  </StrictMode>,
);

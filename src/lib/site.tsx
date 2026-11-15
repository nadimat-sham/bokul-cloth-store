import { createContext, useContext } from "react";
import type { SiteConfig } from "../../shared/types.ts";

export const SiteContext = createContext<SiteConfig>({ url: "", email: "", phone: "", address: "", ga4Id: "" });
export const useSite = () => useContext(SiteContext);

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

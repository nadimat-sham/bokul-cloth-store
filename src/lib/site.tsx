import { createContext, useContext } from "react";
import type { SiteConfig } from "../../shared/types.ts";

export const SiteContext = createContext<SiteConfig>({ url: "", email: "", phone: "", address: "", ga4Id: "" });
export const useSite = () => useContext(SiteContext);

/** tel: link; Bangladeshi local numbers (01XXXXXXXXX) are dialled as +8801XXXXXXXXX. */
export const telHref = (phone: string) => {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${/^01\d{9}$/.test(digits) ? `+88${digits}` : digits}`;
};

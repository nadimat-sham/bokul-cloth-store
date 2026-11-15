import { Resolver } from "node:dns/promises";
import { HttpError } from "./errors.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;
const resolver = new Resolver({ timeout: 3000, tries: 1 });

export function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Bangladeshi mobile numbers: 01XXXXXXXXX, optionally prefixed by +88 / 88. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-().]/g, "");
  const m = /^(?:\+?88)?(01[3-9]\d{8})$/.exec(digits);
  return m ? m[1] : null;
}

/** Checks the address shape and that its domain accepts mail (catches typos like gmial.com).
 *  DNS outages never block the visitor. */
export async function checkEmail(email: string, field = "email"): Promise<void> {
  if (email.length > 254 || !EMAIL.test(email)) {
    throw new HttpError(400, "Please enter a valid email address.", { [field]: "Please enter a valid email address." });
  }
  const domain = email.slice(email.lastIndexOf("@") + 1).toLowerCase();
  try {
    const mx = await resolver.resolveMx(domain);
    if (!mx.some((r) => r.exchange && r.exchange !== ".")) throw Object.assign(new Error(), { code: "ENODATA" });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      const msg = `"${domain}" can't receive email — please check the address for typos.`;
      throw new HttpError(400, msg, { [field]: msg });
    }
  }
}

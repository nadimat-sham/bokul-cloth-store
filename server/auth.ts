// Single-password admin sign-in with an HMAC-signed, HttpOnly session cookie.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.ts";

const COOKIE = "bokul_admin";
const TTL_MS = 12 * 60 * 60 * 1000;

const sign = (payload: string) => createHmac("sha256", config.sessionSecret).update(payload).digest("base64url");
const sha = (s: string) => createHash("sha256").update(s).digest();

export function passwordMatches(input: string): boolean {
  return timingSafeEqual(sha(input), sha(config.adminPassword));
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie ?? "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

export function isAdmin(req: Request): boolean {
  const value = readCookie(req, COOKIE);
  if (!value) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = Buffer.from(sign(exp));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function startSession(res: Response): void {
  const exp = String(Date.now() + TTL_MS);
  res.cookie(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: config.siteUrl.startsWith("https://"),
    maxAge: TTL_MS,
    path: "/",
  });
}

export function endSession(res: Response): void {
  res.clearCookie(COOKIE, { path: "/" });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (isAdmin(req)) return next();
  res.status(401).json({ success: false, message: "Please sign in." });
}

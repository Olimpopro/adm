/**
 * Minimal admin auth — single shared password in env var, signed cookie.
 * Good enough for an internal panel. Replace with proper auth in production.
 */
import { cookies } from "next/headers";
import crypto from "node:crypto";

const COOKIE = "av_admin";
const SECRET = process.env.ADMIN_SECRET || "acquaville-dev-secret-change-me";

export function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function makeToken(): string {
  const stamp = Date.now().toString(36);
  return `${stamp}.${sign(stamp)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [stamp, sig] = token.split(".");
  if (!stamp || !sig) return false;
  return sign(stamp) === sig;
}

export async function isLoggedIn(): Promise<boolean> {
  const c = await cookies();
  return verifyToken(c.get(COOKIE)?.value);
}

export const COOKIE_NAME = COOKIE;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "acqua2025";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "jpp_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sign(payload: string, password: string) {
  return createHmac("sha256", password).update(payload).digest("hex");
}

export function adminPassword() {
  return process.env.PELLETS_ADMIN_PASSWORD ?? null;
}

export function createSession(password: string) {
  const expiresAt = String(Date.now() + MAX_AGE_SECONDS * 1000);
  return {
    value: `${expiresAt}.${sign(expiresAt, password)}`,
    maxAge: MAX_AGE_SECONDS,
  };
}

export function verifySession(value: string | undefined, password: string) {
  if (!value) return false;
  const [expiresAt, signature] = value.split(".");
  if (!expiresAt || !signature) return false;
  if (!/^[0-9]+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < Date.now()) return false;

  const expected = sign(expiresAt, password);
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function matchesPassword(candidate: string, password: string) {
  const a = Buffer.from(sign(candidate, password));
  const b = Buffer.from(sign(password, password));
  return timingSafeEqual(a, b);
}

export async function isAuthenticated() {
  const password = adminPassword();
  if (!password) return false;
  const store = await cookies();
  return verifySession(store.get(ADMIN_COOKIE)?.value, password);
}

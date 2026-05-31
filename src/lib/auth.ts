import { cookies } from "next/headers";
import { getEnv } from "./cf";

/**
 * Minimal stateless session auth for the admin panel.
 *
 * A signed cookie holds `expiry.signature`, where the signature is an
 * HMAC-SHA256 of the expiry timestamp keyed with SESSION_SECRET. No database
 * row is needed — if the signature verifies and the expiry is in the future,
 * the request is authenticated. Uses Web Crypto so it runs identically under
 * `next dev` (Node) and the Cloudflare Workers runtime.
 */

const COOKIE = "st_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds
const enc = new TextEncoder();

function bytesToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return bytesToHex(sig);
}

/** Constant-time-ish string compare. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Check a submitted password against ADMIN_PASSWORD. */
export async function verifyPassword(password: string): Promise<boolean> {
  const env = await getEnv();
  const expected = env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  return safeEqual(password, expected);
}

/** Create the signed session cookie (call from a Server Action / Route Handler). */
export async function createSession(): Promise<void> {
  const env = await getEnv();
  const expiry = String(Date.now() + MAX_AGE * 1000);
  const sig = await sign(expiry, env.SESSION_SECRET);
  const token = `${expiry}.${sig}`;

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** Clear the session cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** Returns true if the current request carries a valid, unexpired session. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return false;

  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const expiry = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expiryMs = Number(expiry);
  if (!Number.isFinite(expiryMs) || expiryMs < Date.now()) return false;

  const env = await getEnv();
  const expected = await sign(expiry, env.SESSION_SECRET);
  return safeEqual(sig, expected);
}

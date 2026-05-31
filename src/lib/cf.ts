import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Access the Cloudflare environment (D1 `DB`, R2 `MEDIA`, secrets…).
 *
 * Using the async form so it works in every context (request-time server
 * components, route handlers, server actions, and build-time helpers).
 * Locally this is backed by Wrangler/Miniflare via
 * `initOpenNextCloudflareForDev()` in next.config.ts — no Cloudflare account
 * needed.
 */
export async function getEnv(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env;
}

export async function getDB(): Promise<D1Database> {
  return (await getEnv()).DB;
}

import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";

/**
 * Media storage abstraction.
 *
 * Locally (running `next dev` under Node) we persist uploaded photos to
 * `public/vehicles/<slug>/...` so they're served as static files — matching the
 * seeded data. When moving to Cloudflare, swap the two functions below to write
 * to the R2 `MEDIA` bucket instead; `r2_key` values stay identical so nothing
 * else changes.
 */

const PUBLIC_DIR = path.join(process.cwd(), "public");

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export function extForType(type: string): string | null {
  return EXT[type] ?? null;
}

/**
 * Store a file under the given r2_key (e.g. "vehicles/<slug>/3.jpg").
 * Returns the same key for storage in the DB.
 */
export async function putMedia(r2Key: string, data: ArrayBuffer): Promise<string> {
  const dest = path.join(PUBLIC_DIR, r2Key);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(data));
  return r2Key;
}

/** Best-effort delete; never throws if the file is already gone. */
export async function deleteMedia(r2Key: string): Promise<void> {
  try {
    await unlink(path.join(PUBLIC_DIR, r2Key));
  } catch {
    /* ignore missing file */
  }
}

/* Display + formatting helpers */

/**
 * Resolve a stored image key (e.g. "vehicles/<slug>/0.jpg") to a URL.
 * Locally the photos are served statically from /public, so the key maps
 * straight onto a path. When this moves to R2/Cloudflare, swap this single
 * function to return `/api/media/${key}`.
 */
export function imageUrl(key: string | null | undefined): string {
  if (!key) return "/placeholder-vehicle.svg";
  const clean = key.replace(/^\/+/, "");
  return "/" + clean;
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null || price <= 0) return "POA";
  return "£" + price.toLocaleString("en-GB");
}

export function formatMileage(mileage: number | null | undefined): string | null {
  if (mileage == null || mileage <= 0) return null;
  return mileage.toLocaleString("en-GB") + " miles";
}

const KEEP_UPPER = new Set([
  "4WD", "4X4", "2WD", "AWD", "RWD", "FWD", "TD", "TDI", "TDCI", "VVT", "HDI",
  "DID", "CRD", "GT", "SE", "LE", "XL", "XLT", "SR", "SRS", "LX", "EX", "GLS",
  "GLX", "VX", "LWB", "SWB", "DCB", "ABS", "AC", "BHP", "MOT", "MPV", "SUV",
  "UK", "USA", "V6", "V8", "TSI", "GTI", "JL", "TJ", "YJ", "JK", "DSG", "CDI",
  "BMW", "VW", "GLE", "GLC", "BLUEHDI", "ECO", "S",
]);

/** Tidy an imported ALL-CAPS dealer title into readable Title Case. */
export function smartTitle(raw: string): string {
  if (!raw) return "";
  // Strip a leading numeric stock reference like "20087 " or "10987-"
  let s = raw.replace(/^\s*#?\d{3,}\s*[-–]?\s*/, "").trim();
  s = s.replace(/\s+/g, " ");

  const hasLower = /[a-z]/.test(s);
  if (hasLower) return s; // already mixed case — leave as-is

  return s
    .split(" ")
    .map((word) => {
      const bare = word.replace(/[^A-Za-z0-9+]/g, "");
      if (!bare) return word;
      if (/\d/.test(word)) return word; // keep things like 2.5, 1.3, V6 raw
      if (KEEP_UPPER.has(bare.toUpperCase())) return word.toUpperCase();
      if (bare.length <= 2) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/** Short spec line, e.g. "2016 · Diesel · Automatic · 84,000 miles". */
export function specLine(v: {
  year?: number | null;
  fuel?: string | null;
  transmission?: string | null;
  mileage?: number | null;
  body?: string | null;
}): string {
  const parts: string[] = [];
  if (v.year) parts.push(String(v.year));
  if (v.body) parts.push(v.body);
  if (v.fuel) parts.push(v.fuel);
  if (v.transmission) parts.push(v.transmission);
  const m = formatMileage(v.mileage);
  if (m) parts.push(m);
  return parts.join("  ·  ");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/["'’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

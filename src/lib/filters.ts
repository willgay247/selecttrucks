import type { VehicleFilters, VehicleStatus } from "./types";

type SP = Record<string, string | string[] | undefined>;

function str(sp: SP, key: string): string | undefined {
  const v = sp[key];
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() ? s.trim() : undefined;
}

function num(sp: SP, key: string): number | undefined {
  const s = str(sp, key);
  if (!s) return undefined;
  const n = Number(s.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

const SORTS = new Set(["newest", "price-asc", "price-desc", "year-desc", "mileage-asc"]);

export function parseFilters(sp: SP): VehicleFilters {
  const statusRaw = str(sp, "status");
  const status =
    statusRaw === "sold" || statusRaw === "available" || statusRaw === "all" || statusRaw === "reserved"
      ? (statusRaw as VehicleStatus | "all")
      : undefined;
  const sortRaw = str(sp, "sort");

  return {
    q: str(sp, "q"),
    make: str(sp, "make"),
    body: str(sp, "body"),
    fuel: str(sp, "fuel"),
    transmission: str(sp, "transmission"),
    status,
    minPrice: num(sp, "minPrice"),
    maxPrice: num(sp, "maxPrice"),
    minYear: num(sp, "minYear"),
    maxYear: num(sp, "maxYear"),
    sort: sortRaw && SORTS.has(sortRaw) ? (sortRaw as VehicleFilters["sort"]) : "newest",
    page: num(sp, "page") ?? 1,
  };
}

/** Human-readable active filter chips (label + the query key to remove). */
export function activeChips(f: VehicleFilters): { key: string; label: string }[] {
  const chips: { key: string; label: string }[] = [];
  if (f.q) chips.push({ key: "q", label: `“${f.q}”` });
  if (f.make) chips.push({ key: "make", label: f.make });
  if (f.body) chips.push({ key: "body", label: f.body });
  if (f.fuel) chips.push({ key: "fuel", label: f.fuel });
  if (f.transmission) chips.push({ key: "transmission", label: f.transmission });
  if (f.minPrice) chips.push({ key: "minPrice", label: `≥ £${f.minPrice.toLocaleString()}` });
  if (f.maxPrice) chips.push({ key: "maxPrice", label: `≤ £${f.maxPrice.toLocaleString()}` });
  if (f.minYear) chips.push({ key: "minYear", label: `${f.minYear}+` });
  if (f.maxYear) chips.push({ key: "maxYear", label: `≤ ${f.maxYear}` });
  return chips;
}

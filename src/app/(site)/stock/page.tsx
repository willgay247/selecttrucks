import Link from "next/link";
import type { Metadata } from "next";
import { queryVehicles, getFacets } from "@/lib/db";
import { parseFilters, activeChips } from "@/lib/filters";
import { VehicleCard } from "@/components/vehicle-card";
import { StockFilters, SortSelect } from "@/components/stock-filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Used Pick-Ups, 4x4s & Trucks for Sale",
  description:
    "Browse our current stock of quality used pick-ups, 4x4s, vans and trucks in Camberley, Surrey. Filter by make, body type, price and year.",
  alternates: { canonical: "/stock" },
};

type SP = Record<string, string | string[] | undefined>;

function buildQuery(sp: SP, omit: string): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === omit || k === "page" || v == null) continue;
    next.set(k, Array.isArray(v) ? v[0]! : v);
  }
  const s = next.toString();
  return s ? `/stock?${s}` : "/stock";
}

function pageUrl(sp: SP, page: number): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page" || v == null) continue;
    next.set(k, Array.isArray(v) ? v[0]! : v);
  }
  next.set("page", String(page));
  return `/stock?${next.toString()}`;
}

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [{ vehicles, total, page, pageCount }, facets] = await Promise.all([
    queryVehicles(filters),
    getFacets(),
  ]);
  const chips = activeChips(filters);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <header className="mb-8">
        <p className="eyebrow text-accent">
          {filters.status === "sold" ? "Sold archive" : "Our stock"}
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-extrabold text-body">
          {filters.q ? `Results for “${filters.q}”` : "Used pick-ups, 4x4s & trucks"}
        </h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside>
          <StockFilters facets={facets} current={filters} />
        </aside>

        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <p className="text-sm text-muted">
              <span className="font-semibold text-body">{total}</span>{" "}
              {total === 1 ? "vehicle" : "vehicles"}
              {pageCount > 1 && <> · page {page} of {pageCount}</>}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Sort</span>
              <SortSelect current={filters.sort} />
            </div>
          </div>

          {/* Active chips */}
          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {chips.map((c) => (
                <Link
                  key={c.key}
                  href={buildQuery(sp, c.key)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent hover:bg-accent hover:text-white transition-colors"
                >
                  {c.label}
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </Link>
              ))}
              <Link href="/stock" className="inline-flex items-center px-2 py-1 text-xs font-semibold text-muted hover:text-body">
                Clear all
              </Link>
            </div>
          )}

          {/* Results */}
          {vehicles.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} priority={i < 6} />
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-xl border border-dashed border-line bg-card p-12 text-center">
              <p className="font-display text-lg font-bold text-body">No matching vehicles</p>
              <p className="mt-2 text-muted">Try widening your filters or clearing your search.</p>
              <Link href="/stock" className="mt-4 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-bright">
                Reset filters
              </Link>
            </div>
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link href={pageUrl(sp, page - 1)} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-body hover:bg-card">
                  ← Prev
                </Link>
              )}
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageUrl(sp, p)}
                  className={`min-w-10 rounded-lg px-3.5 py-2 text-center text-sm font-semibold transition-colors ${
                    p === page ? "bg-accent text-white" : "border border-line text-body hover:bg-card"
                  }`}
                >
                  {p}
                </Link>
              ))}
              {page < pageCount && (
                <Link href={pageUrl(sp, page + 1)} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-body hover:bg-card">
                  Next →
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

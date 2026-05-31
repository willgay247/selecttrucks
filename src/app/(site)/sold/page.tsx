import Link from "next/link";
import type { Metadata } from "next";
import { queryVehicles, getFacets } from "@/lib/db";
import { parseFilters } from "@/lib/filters";
import { VehicleCard } from "@/components/vehicle-card";
import { SortSelect } from "@/components/stock-filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sold Archive — Vehicles We've Sold",
  description:
    "A public record of pick-ups, 4x4s and trucks sold by Select Trucks. Real vehicles, real customers — the honest proof of a dealer you can trust.",
  alternates: { canonical: "/sold" },
};

type SP = Record<string, string | string[] | undefined>;

function pageUrl(sp: SP, page: number): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page" || v == null) continue;
    next.set(k, Array.isArray(v) ? v[0]! : v);
  }
  next.set("page", String(page));
  return `/sold?${next.toString()}`;
}

export default async function SoldPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const filters = { ...parseFilters(sp), status: "sold" as const };
  const [{ vehicles, total, page, pageCount }, facets] = await Promise.all([
    queryVehicles(filters),
    getFacets(),
  ]);

  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <p className="eyebrow text-accent-bright">Brand validation</p>
          <h1 className="mt-3 font-display text-3xl md:text-5xl font-extrabold">Sold archive</h1>
          <p className="mt-4 max-w-2xl text-muted-dark">
            We keep a public record of every vehicle we sell — {facets.counts.sold}+
            and counting. It&apos;s real proof of the quality and value we offer, and
            the trust our customers place in us.
          </p>
          <Link href="/stock" className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-bright">
            See what&apos;s available now →
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <p className="text-sm text-muted">
            <span className="font-semibold text-body">{total}</span> sold vehicles
            {pageCount > 1 && <> · page {page} of {pageCount}</>}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Sort</span>
            <SortSelect current={filters.sort} />
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((v, i) => (
            <VehicleCard key={v.id} vehicle={v} priority={i < 8} />
          ))}
        </div>

        {pageCount > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link href={pageUrl(sp, page - 1)} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-body hover:bg-card">← Prev</Link>
            )}
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={pageUrl(sp, p)} className={`min-w-10 rounded-lg px-3.5 py-2 text-center text-sm font-semibold ${p === page ? "bg-accent text-white" : "border border-line text-body hover:bg-card"}`}>{p}</Link>
            ))}
            {page < pageCount && (
              <Link href={pageUrl(sp, page + 1)} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-body hover:bg-card">Next →</Link>
            )}
          </nav>
        )}
      </div>
    </>
  );
}

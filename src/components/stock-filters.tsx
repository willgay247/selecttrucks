"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import type { Facets, VehicleFilters } from "@/lib/types";

const SORTS: { value: NonNullable<VehicleFilters["sort"]>; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "year-desc", label: "Year: newest" },
  { value: "mileage-asc", label: "Mileage: lowest" },
];

export function StockFilters({
  facets,
  current,
}: {
  facets: Facets;
  current: VehicleFilters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [openMobile, setOpenMobile] = useState(false);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value && value.length) next.set(key, value);
      else next.delete(key);
      next.delete("page"); // reset pagination on any filter change
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  const select = (
    key: keyof VehicleFilters,
    label: string,
    options: { value: string; count?: number }[],
    value?: string
  ) => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => setParam(key as string, e.target.value || null)}
        className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-body outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      >
        <option value="">Any {label.toLowerCase()}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.value}{o.count != null ? ` (${o.count})` : ""}
          </option>
        ))}
      </select>
    </label>
  );

  const body = (
    <div className="space-y-4">
      {select("make", "Make", facets.makes, current.make)}
      {select("body", "Body type", facets.bodies, current.body)}
      {select("fuel", "Fuel", facets.fuels, current.fuel)}
      {select("transmission", "Gearbox", facets.transmissions, current.transmission)}

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Availability</span>
        <select
          value={current.status ?? "available"}
          onChange={(e) => setParam("status", e.target.value)}
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-body outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="available">Available ({facets.counts.available})</option>
          <option value="sold">Sold ({facets.counts.sold})</option>
          <option value="all">All ({facets.counts.all})</option>
        </select>
      </label>

      <div>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Price (£)</span>
        <div className="flex items-center gap-2">
          <input
            type="number" inputMode="numeric" placeholder="Min" defaultValue={current.minPrice ?? ""}
            onBlur={(e) => setParam("minPrice", e.target.value || null)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
          <span className="text-muted">–</span>
          <input
            type="number" inputMode="numeric" placeholder="Max" defaultValue={current.maxPrice ?? ""}
            onBlur={(e) => setParam("maxPrice", e.target.value || null)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Year</span>
        <div className="flex items-center gap-2">
          <input
            type="number" inputMode="numeric" placeholder={String(facets.yearRange.min)} defaultValue={current.minYear ?? ""}
            onBlur={(e) => setParam("minYear", e.target.value || null)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
          <span className="text-muted">–</span>
          <input
            type="number" inputMode="numeric" placeholder={String(facets.yearRange.max)} defaultValue={current.maxYear ?? ""}
            onBlur={(e) => setParam("maxYear", e.target.value || null)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      <button
        onClick={() => router.push(pathname, { scroll: false })}
        className="w-full rounded-lg border border-line py-2.5 text-sm font-semibold text-muted hover:bg-paper hover:text-body transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setOpenMobile((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
          Filters
        </button>
      </div>
      {openMobile && <div className="lg:hidden mb-6 rounded-xl border border-line bg-card p-5">{body}</div>}

      {/* Desktop sidebar */}
      <div className="hidden lg:block rounded-xl border border-line bg-card p-5 sticky top-20">
        <h2 className="font-display font-bold text-body mb-4">Refine</h2>
        {body}
      </div>
    </>
  );
}

export function SortSelect({ current }: { current?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <select
      value={current ?? "newest"}
      onChange={(e) => {
        const next = new URLSearchParams(params.toString());
        next.set("sort", e.target.value);
        next.delete("page");
        router.push(`${pathname}?${next.toString()}`, { scroll: false });
      }}
      className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-body outline-none focus:border-accent"
    >
      {SORTS.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}

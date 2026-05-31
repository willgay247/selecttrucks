import Link from "next/link";
import type { VehicleWithImages } from "@/lib/types";
import { formatPrice, smartTitle, specLine } from "@/lib/format";
import { VehicleCardGallery } from "./vehicle-card-gallery";

export function VehicleCard({
  vehicle,
  priority = false,
}: {
  vehicle: VehicleWithImages;
  priority?: boolean;
}) {
  const sold = vehicle.status === "sold";
  const reserved = vehicle.status === "reserved";
  const title = smartTitle(vehicle.title);

  return (
    <Link
      href={`/stock/${vehicle.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-card shadow-[var(--shadow-card)] ring-1 ring-line/60 transition-shadow hover:shadow-[var(--shadow-pop)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-soft">
        <VehicleCardGallery
          images={vehicle.images}
          alt={title}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {sold && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-ink/45">
            <span className="rotate-[-6deg] rounded-md bg-sold px-4 py-1.5 font-display text-lg font-extrabold uppercase tracking-wider text-white shadow-lg">
              Sold
            </span>
          </div>
        )}
        {reserved && (
          <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Reserved
          </span>
        )}
        {!sold && !reserved && vehicle.featured > 0 && (
          <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[15px] font-bold leading-snug text-body line-clamp-2">
          {title}
        </h3>
        <p className="mt-1.5 text-xs text-muted line-clamp-1">{specLine(vehicle)}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className={`font-display text-xl font-extrabold ${sold ? "text-muted" : "text-body"}`}>
            {formatPrice(vehicle.price)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
            View
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

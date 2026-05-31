import Link from "next/link";
import { requireAuth } from "@/lib/admin-actions";
import { listEnquiries } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Enquiries" };

function formatDate(iso: string): string {
  const d = new Date(iso.replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default async function EnquiriesPage() {
  await requireAuth();
  const enquiries = await listEnquiries();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-body">Enquiries</h1>
      <p className="mt-1 text-sm text-muted">{enquiries.length} total · newest first</p>

      {enquiries.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-line bg-card p-8 text-center text-muted">
          No enquiries yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {enquiries.map((e) => (
            <div key={e.id} className="rounded-2xl border border-line bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display font-bold text-body">{e.name}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    <a href={`mailto:${e.email}`} className="text-accent hover:underline">{e.email}</a>
                    {e.phone && <> · <a href={`tel:${e.phone}`} className="text-accent hover:underline">{e.phone}</a></>}
                  </p>
                </div>
                <span className="text-xs text-muted">{formatDate(e.created_at)}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-body/90">{e.message}</p>
              {e.vehicle_slug && (
                <Link href={`/stock/${e.vehicle_slug}`} target="_blank" className="mt-3 inline-block text-xs font-semibold text-accent hover:underline">
                  Re: {e.vehicle_slug} ↗
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

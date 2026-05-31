import Link from "next/link";
import Image from "next/image";
import { requireAuth, setStatusAction, deleteVehicleAction } from "@/lib/admin-actions";
import { adminListVehicles, countEnquiries } from "@/lib/db";
import { imageUrl, formatPrice, smartTitle } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  available: "bg-available/10 text-available",
  sold: "bg-sold/10 text-sold",
  reserved: "bg-amber-500/10 text-amber-600",
};

export default async function AdminDashboard() {
  await requireAuth();
  const [vehicles, enquiryCount] = await Promise.all([adminListVehicles(), countEnquiries()]);

  const available = vehicles.filter((v) => v.status === "available").length;
  const sold = vehicles.filter((v) => v.status === "sold").length;
  const reserved = vehicles.filter((v) => v.status === "reserved").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-body">Stock</h1>
          <p className="mt-1 text-sm text-muted">
            {vehicles.length} vehicles · {available} available · {reserved} reserved · {sold} sold ·{" "}
            <Link href="/admin/enquiries" className="font-semibold text-accent">{enquiryCount} enquiries</Link>
          </p>
        </div>
        <Link href="/admin/vehicles/new" className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-bright">
          + Add vehicle
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-card shadow-[var(--shadow-card)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Vehicle</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {vehicles.map((v) => {
              const cover = v.images[0];
              return (
                <tr key={v.id} className="hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-ink-soft">
                        {cover ? (
                          <Image src={imageUrl(cover.r2_key)} alt="" fill sizes="64px" className="object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/vehicles/${v.id}`} className="font-semibold text-body hover:text-accent line-clamp-1">
                          {smartTitle(v.title)}
                        </Link>
                        <p className="text-xs text-muted">{v.year ?? "—"} · {v.images.length} photo{v.images.length === 1 ? "" : "s"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-body">{formatPrice(v.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-1 text-xs font-bold uppercase ${STATUS_STYLE[v.status]}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <form action={setStatusAction}>
                        <input type="hidden" name="id" value={v.id} />
                        <input type="hidden" name="status" value={v.status === "sold" ? "available" : "sold"} />
                        <button className="rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-body hover:bg-paper">
                          {v.status === "sold" ? "Mark available" : "Mark sold"}
                        </button>
                      </form>
                      <Link href={`/admin/vehicles/${v.id}`} className="rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-body hover:bg-paper">
                        Edit
                      </Link>
                      <form action={deleteVehicleAction}>
                        <input type="hidden" name="id" value={v.id} />
                        <button className="rounded-md border border-sold/30 px-2.5 py-1.5 text-xs font-semibold text-sold hover:bg-sold/5">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

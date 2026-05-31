import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/admin-actions";
import { getVehicleById } from "@/lib/db";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { smartTitle } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit vehicle" };

export default async function EditVehiclePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const { saved } = await searchParams;
  const vehicle = await getVehicleById(Number(id));
  if (!vehicle) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin" className="text-sm text-muted hover:text-accent">← Back to stock</Link>
        <Link href={`/stock/${vehicle.slug}`} target="_blank" className="text-sm font-semibold text-accent hover:text-accent-bright">
          View live ↗
        </Link>
      </div>
      <h1 className="mt-2 font-display text-2xl font-extrabold text-body">{smartTitle(vehicle.title)}</h1>

      {saved && (
        <p className="mt-4 rounded-lg border border-available/30 bg-available/5 px-4 py-2.5 text-sm font-medium text-available">
          Changes saved.
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-line bg-card p-6 shadow-[var(--shadow-card)]">
        <VehicleForm vehicle={vehicle} />
      </div>
    </div>
  );
}

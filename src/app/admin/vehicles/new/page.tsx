import Link from "next/link";
import { requireAuth } from "@/lib/admin-actions";
import { VehicleForm } from "@/components/admin/vehicle-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Add vehicle" };

export default async function NewVehiclePage() {
  await requireAuth();
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="text-sm text-muted hover:text-accent">← Back to stock</Link>
      <h1 className="mt-2 font-display text-2xl font-extrabold text-body">Add vehicle</h1>
      <div className="mt-6 rounded-2xl border border-line bg-card p-6 shadow-[var(--shadow-card)]">
        <VehicleForm />
      </div>
    </div>
  );
}

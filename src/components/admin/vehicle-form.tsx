"use client";

import { useActionState } from "react";
import Image from "next/image";
import type { VehicleWithImages } from "@/lib/types";
import {
  createVehicleAction,
  updateVehicleAction,
  deleteImageAction,
} from "@/lib/admin-actions";
import { imageUrl } from "@/lib/format";

const FIELD =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";
const LABEL = "block text-xs font-semibold uppercase tracking-wide text-muted mb-1";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={LABEL} htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={FIELD}
      />
    </div>
  );
}

export function VehicleForm({ vehicle }: { vehicle?: VehicleWithImages }) {
  const isEdit = !!vehicle;
  const action = isEdit ? updateVehicleAction : createVehicleAction;
  const [, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-8">
      {isEdit && <input type="hidden" name="id" value={vehicle.id} />}

      {/* Existing photos */}
      {isEdit && vehicle.images.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-body">Photos</h2>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {vehicle.images.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-ink-soft">
                <Image src={imageUrl(img.r2_key)} alt="" fill sizes="120px" className="object-cover" />
                <button
                  type="submit"
                  formAction={deleteImageAction}
                  name="image_id"
                  value={img.id}
                  formNoValidate
                  className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100 hover:bg-sold"
                  aria-label="Delete photo"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
          {/* image deletes need the vehicle id alongside image_id */}
          <input type="hidden" name="vehicle_id" value={vehicle.id} />
        </section>
      )}

      {/* Upload */}
      <section>
        <h2 className="font-display font-bold text-body">{isEdit ? "Add more photos" : "Photos"}</h2>
        <input type="file" name="photos" accept="image/*" multiple className="mt-3 block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent-bright" />
        <p className="mt-1 text-xs text-muted">JPG, PNG or WebP. The first photo becomes the cover.</p>
      </section>

      {/* Core details */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Title" name="title" defaultValue={vehicle?.title} placeholder="e.g. Toyota Hilux Invincible 2.8 D-4D" />
        </div>
        <Field label="Make" name="make" defaultValue={vehicle?.make} />
        <Field label="Model" name="model" defaultValue={vehicle?.model} />
        <Field label="Year" name="year" type="number" defaultValue={vehicle?.year} />
        <Field label="Price (£, blank = POA)" name="price" type="number" defaultValue={vehicle?.price} />
        <Field label="Mileage" name="mileage" type="number" defaultValue={vehicle?.mileage} />
        <Field label="Fuel" name="fuel" defaultValue={vehicle?.fuel} />
        <Field label="Transmission" name="transmission" defaultValue={vehicle?.transmission} />
        <Field label="Body" name="body" defaultValue={vehicle?.body} />
        <Field label="Colour" name="colour" defaultValue={vehicle?.colour} />
        <Field label="Engine" name="engine" defaultValue={vehicle?.engine} />
        <Field label="Doors" name="doors" type="number" defaultValue={vehicle?.doors} />
        <Field label="Drivetrain" name="drivetrain" defaultValue={vehicle?.drivetrain} />
        <Field label="VAT status" name="vat_status" defaultValue={vehicle?.vat_status} placeholder="e.g. Plus VAT" />
        <Field label="Slug (optional)" name="slug" defaultValue={vehicle?.slug} placeholder="auto-generated from title" />
      </section>

      <section>
        <label className={LABEL} htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={6} defaultValue={vehicle?.description ?? ""} className={FIELD} />
      </section>

      <section className="flex flex-wrap items-center gap-6">
        <div>
          <label className={LABEL} htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={vehicle?.status ?? "available"} className={FIELD}>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm font-medium text-body">
          <input type="checkbox" name="featured" defaultChecked={vehicle?.featured === 1} className="h-4 w-4 rounded border-line text-accent focus:ring-accent" />
          Feature on homepage
        </label>
      </section>

      <div className="flex items-center gap-3 border-t border-line pt-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-white hover:bg-accent-bright disabled:opacity-60"
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create vehicle"}
        </button>
      </div>
    </form>
  );
}

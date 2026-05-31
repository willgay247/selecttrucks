"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  verifyPassword,
  createSession,
  destroySession,
  isAuthenticated,
} from "./auth";
import {
  insertVehicle,
  updateVehicle,
  deleteVehicle,
  setVehicleStatus,
  slugExists,
  addVehicleImage,
  deleteVehicleImage,
  getVehicleById,
  type VehicleInput,
} from "./db";
import { putMedia, deleteMedia, extForType } from "./media";
import { slugify } from "./format";
import type { VehicleStatus } from "./types";

/** Throw-redirect to login if the request isn't authenticated. Call in admin pages. */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

export interface LoginState {
  error?: string;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = (formData.get("password") as string) ?? "";
  if (!(await verifyPassword(password))) {
    return { error: "Incorrect password." };
  }
  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/* ----------------------------- vehicle CRUD ------------------------------ */

function str(fd: FormData, key: string): string | null {
  const v = (fd.get(key) as string | null)?.trim();
  return v ? v : null;
}
function num(fd: FormData, key: string): number | null {
  const v = (fd.get(key) as string | null)?.trim();
  if (!v) return null;
  const n = Number(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function readVehicleInput(fd: FormData, fallbackSlugSource: string): VehicleInput {
  const title = str(fd, "title") ?? "Untitled vehicle";
  const slug = slugify(str(fd, "slug") ?? fallbackSlugSource ?? title);
  const status = ((fd.get("status") as string) ?? "available") as VehicleStatus;
  return {
    slug,
    title,
    make: str(fd, "make"),
    model: str(fd, "model"),
    year: num(fd, "year"),
    price: num(fd, "price"),
    mileage: num(fd, "mileage"),
    fuel: str(fd, "fuel"),
    transmission: str(fd, "transmission"),
    body: str(fd, "body"),
    colour: str(fd, "colour"),
    engine: str(fd, "engine"),
    doors: num(fd, "doors"),
    drivetrain: str(fd, "drivetrain"),
    vat_status: str(fd, "vat_status"),
    description: str(fd, "description"),
    status: ["available", "sold", "reserved"].includes(status) ? status : "available",
    featured: fd.get("featured") ? 1 : 0,
  };
}

async function storeUploads(slug: string, vehicleId: number, files: File[]): Promise<void> {
  for (const file of files) {
    if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) continue;
    const ext = extForType(file.type);
    if (!ext) continue;
    const key = `vehicles/${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    await putMedia(key, await file.arrayBuffer());
    await addVehicleImage(vehicleId, key, null);
  }
}

export async function createVehicleAction(_prev: unknown, formData: FormData) {
  await requireAuth();
  const input = readVehicleInput(formData, "");

  let slug = input.slug;
  let i = 2;
  while (await slugExists(slug)) slug = `${input.slug}-${i++}`;
  input.slug = slug;

  const id = await insertVehicle(input);

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File);
  await storeUploads(slug, id, files);

  revalidatePath("/admin");
  revalidatePath("/stock");
  redirect(`/admin/vehicles/${id}`);
}

export async function updateVehicleAction(_prev: unknown, formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) redirect("/admin");

  const input = readVehicleInput(formData, "");
  if (await slugExists(input.slug, id)) {
    input.slug = `${input.slug}-${id}`;
  }
  await updateVehicle(id, input);

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File);
  await storeUploads(input.slug, id, files);

  revalidatePath("/admin");
  revalidatePath(`/admin/vehicles/${id}`);
  revalidatePath("/stock");
  revalidatePath(`/stock/${input.slug}`);
  redirect(`/admin/vehicles/${id}?saved=1`);
}

export async function deleteVehicleAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) redirect("/admin");
  const keys = await deleteVehicle(id);
  for (const k of keys) await deleteMedia(k);
  revalidatePath("/admin");
  revalidatePath("/stock");
  redirect("/admin");
}

export async function setStatusAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = Number(formData.get("id"));
  const status = (formData.get("status") as string) as VehicleStatus;
  if (!Number.isFinite(id) || !["available", "sold", "reserved"].includes(status)) {
    redirect("/admin");
  }
  await setVehicleStatus(id, status);
  revalidatePath("/admin");
  revalidatePath("/stock");
  revalidatePath("/sold");
  const v = await getVehicleById(id);
  if (v) revalidatePath(`/stock/${v.slug}`);
  redirect("/admin");
}

export async function deleteImageAction(formData: FormData): Promise<void> {
  await requireAuth();
  const imageId = Number(formData.get("image_id"));
  const vehicleId = Number(formData.get("vehicle_id"));
  if (!Number.isFinite(imageId)) redirect("/admin");
  const key = await deleteVehicleImage(imageId);
  if (key) await deleteMedia(key);
  revalidatePath(`/admin/vehicles/${vehicleId}`);
  revalidatePath("/stock");
  redirect(`/admin/vehicles/${vehicleId}`);
}

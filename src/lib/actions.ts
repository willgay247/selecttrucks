"use server";

import { createEnquiry } from "./db";

export interface EnquiryState {
  ok: boolean;
  error?: string;
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function submitEnquiry(
  _prev: EnquiryState,
  formData: FormData
): Promise<EnquiryState> {
  // Honeypot — bots fill hidden fields.
  if ((formData.get("company") as string)?.trim()) {
    return { ok: true };
  }

  const name = (formData.get("name") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim() ?? "";
  const phone = (formData.get("phone") as string)?.trim() ?? "";
  const message = (formData.get("message") as string)?.trim() ?? "";
  const vehicleSlug = (formData.get("vehicle_slug") as string)?.trim() || null;
  const vehicleIdRaw = (formData.get("vehicle_id") as string)?.trim();
  const vehicleId = vehicleIdRaw ? Number(vehicleIdRaw) : null;

  if (name.length < 2) return { ok: false, error: "Please enter your name." };
  if (!isEmail(email)) return { ok: false, error: "Please enter a valid email address." };
  if (message.length < 5) return { ok: false, error: "Please add a short message." };

  try {
    await createEnquiry({
      vehicle_id: Number.isFinite(vehicleId as number) ? vehicleId : null,
      vehicle_slug: vehicleSlug,
      name,
      email,
      phone: phone || null,
      message,
    });
    return { ok: true };
  } catch (e) {
    console.error("enquiry failed", e);
    return { ok: false, error: "Something went wrong. Please call or WhatsApp us instead." };
  }
}

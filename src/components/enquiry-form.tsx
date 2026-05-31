"use client";

import { useActionState } from "react";
import { submitEnquiry, type EnquiryState } from "@/lib/actions";

const initial: EnquiryState = { ok: false };

export function EnquiryForm({
  vehicleId,
  vehicleSlug,
  vehicleTitle,
  compact = false,
}: {
  vehicleId?: number;
  vehicleSlug?: string;
  vehicleTitle?: string;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initial);

  if (state.ok) {
    return (
      <div className="rounded-xl border border-available/30 bg-available/5 p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-available/15 text-available">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h3 className="mt-3 font-display text-lg font-bold text-body">Thanks — message sent!</h3>
        <p className="mt-1 text-sm text-muted">We&apos;ll be in touch shortly. For anything urgent, just call or WhatsApp us.</p>
      </div>
    );
  }

  const defaultMsg = vehicleTitle
    ? `Hi, I'm interested in the ${vehicleTitle}. Is it still available?`
    : "";

  return (
    <form action={formAction} className="space-y-3">
      {vehicleId != null && <input type="hidden" name="vehicle_id" value={vehicleId} />}
      {vehicleSlug && <input type="hidden" name="vehicle_slug" value={vehicleSlug} />}
      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className={compact ? "" : "grid gap-3 sm:grid-cols-2"}>
        <input
          name="name" required placeholder="Your name"
          className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <input
          name="phone" type="tel" placeholder="Phone (optional)"
          className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
      <input
        name="email" type="email" required placeholder="Email address"
        className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      <textarea
        name="message" required rows={compact ? 3 : 4} defaultValue={defaultMsg} placeholder="Your message"
        className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />

      {state.error && (
        <p className="text-sm font-medium text-sold">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-bright disabled:opacity-60 transition-colors"
      >
        {pending ? "Sending…" : "Send enquiry"}
      </button>
      <p className="text-center text-xs text-muted">
        We&apos;ll only use your details to reply to this enquiry.
      </p>
    </form>
  );
}

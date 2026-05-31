import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";
import { site, telLink, whatsappLink, mailtoLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us — Select Trucks, Camberley",
  description:
    "Get in touch with Select Trucks in Camberley, Surrey. Call, WhatsApp or email us about any vehicle, or send an enquiry and we'll get straight back to you.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: site.name,
    description: site.description,
    telephone: site.phoneE164,
    email: site.email,
    url: `${site.url}/contact`,
    areaServed: site.address.areaServed,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    openingHours: site.hours.map((h) => `${h.days}: ${h.time}`),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <p className="eyebrow text-accent-bright">Get in touch</p>
          <h1 className="mt-3 font-display text-3xl md:text-5xl font-extrabold">Contact us</h1>
          <p className="mt-4 max-w-2xl text-muted-dark">
            Questions about a vehicle, or after something we don&apos;t have in
            yet? Call, message or drop us a line — we&apos;re a small team and
            we&apos;ll get straight back to you.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          {/* Contact methods */}
          <div className="space-y-4">
            <a href={telLink()} className="flex items-center gap-4 rounded-2xl border border-line bg-card p-5 shadow-[var(--shadow-card)] hover:border-accent transition-colors">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-muted">Call us</span>
                <span className="block font-display text-lg font-bold text-body">{site.phoneDisplay}</span>
              </span>
            </a>

            <a href={whatsappLink(`Hi ${site.name}, I have a question.`)} target="_blank" rel="noopener" className="flex items-center gap-4 rounded-2xl border border-line bg-card p-5 shadow-[var(--shadow-card)] hover:border-accent transition-colors">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1faf54]/10 text-[#1faf54]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.16c-.24.68-1.42 1.3-1.95 1.34-.5.05-1.13.07-1.83-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-2.99s.74-2.12 1.01-2.41c.26-.29.57-.36.76-.36l.55.01c.18.01.41-.07.64.49.24.57.81 1.98.88 2.12.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.37-.42.49-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.69-.81.87-1.08.18-.28.36-.23.61-.14.25.09 1.6.76 1.87.9.28.14.46.21.53.32.07.12.07.66-.17 1.34z" /></svg>
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-muted">WhatsApp</span>
                <span className="block font-display text-lg font-bold text-body">Message us</span>
              </span>
            </a>

            <a href={mailtoLink("Website enquiry")} className="flex items-center gap-4 rounded-2xl border border-line bg-card p-5 shadow-[var(--shadow-card)] hover:border-accent transition-colors">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-muted">Email</span>
                <span className="block font-display text-lg font-bold text-body">{site.email}</span>
              </span>
            </a>

            <div className="rounded-2xl border border-line bg-card p-5 shadow-[var(--shadow-card)]">
              <h2 className="font-display font-bold text-body">Opening hours</h2>
              <dl className="mt-3 space-y-2 text-sm">
                {site.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-4">
                    <dt className="text-muted">{h.days}</dt>
                    <dd className="font-semibold text-body">{h.time}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm text-muted">
                Based in {site.address.locality}, {site.address.region}. Serving{" "}
                {site.address.areaServed}. Viewings by appointment recommended.
              </p>
            </div>
          </div>

          {/* Enquiry form */}
          <div className="rounded-2xl border border-line bg-card p-6 md:p-8 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-xl font-extrabold text-body">Send us a message</h2>
            <p className="mt-1 mb-5 text-sm text-muted">
              Fill in the form and we&apos;ll be in touch as soon as we can.
            </p>
            <EnquiryForm />
          </div>
        </div>
      </div>
    </>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { site, telLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Useful Information — Buying a Used Pick-Up or 4x4",
  description:
    "Helpful guidance on buying a used pick-up, 4x4 or truck — VAT, finance, part-exchange, delivery and what to check. Practical answers from Select Trucks, Camberley.",
  alternates: { canonical: "/useful-information" },
};

const faqs = [
  {
    q: "What does \"plus VAT\" mean on a price?",
    a: "Many commercial pick-ups and vans are sold plus VAT, meaning VAT is added on top of the displayed price. If you're VAT-registered you can usually reclaim it. Where a vehicle is \"no VAT\" or \"VAT qualifying\" we'll make that clear on the listing — and we're always happy to explain what it means for you.",
  },
  {
    q: "Can I part-exchange my current vehicle?",
    a: "Yes. We take part-exchanges on most vehicles. Send us the registration, mileage and a few photos and we'll give you a fair, no-obligation figure. It's the easiest way to put your existing vehicle towards your next one.",
  },
  {
    q: "Do you offer finance?",
    a: "We can point you towards finance options to spread the cost. Get in touch with the vehicle you're interested in and we'll talk you through what's available and what's realistic for your situation.",
  },
  {
    q: "Can you deliver, or do I have to collect?",
    a: "We're based in Camberley, Surrey, and you're welcome to come and view. We can also arrange delivery further afield — just ask and we'll sort out a cost for your postcode.",
  },
  {
    q: "What should I check when buying a used pick-up?",
    a: "Service history, tyre and brake condition, signs of hard work or off-road damage underneath, and that the load bed and towing gear are sound. Every vehicle we sell is hand-picked and prepared, and we're happy to go through its history and condition with you in detail.",
  },
  {
    q: "Are your vehicles HPI checked?",
    a: "We stand behind what we sell. Ask us about any vehicle's history and we'll be straight with you — our public sold archive is part of how we keep ourselves honest.",
  },
];

export default function UsefulInformationPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <p className="eyebrow text-accent-bright">Useful information</p>
          <h1 className="mt-3 font-display text-3xl md:text-5xl font-extrabold">
            Buying a used truck, the straightforward way
          </h1>
          <p className="mt-4 max-w-2xl text-muted-dark">
            VAT, finance, part-exchange, delivery and what to look for. The
            common questions, answered plainly. Anything else, just ask.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-line bg-card p-5 shadow-[var(--shadow-card)] open:border-accent/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-bold text-body">
                {f.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform group-open:rotate-45">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-paper p-6 text-center md:p-8">
          <h2 className="font-display text-xl font-extrabold text-body">
            Still got a question?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            We&apos;re a small team and happy to talk things through — no pressure,
            no jargon.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a href={telLink()} className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-bright">
              Call {site.phoneDisplay}
            </a>
            <Link href="/contact" className="rounded-lg border border-line px-5 py-3 text-sm font-semibold text-body hover:bg-card">
              Send an enquiry
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

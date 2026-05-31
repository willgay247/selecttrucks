import Link from "next/link";
import type { Metadata } from "next";
import { getFacets } from "@/lib/db";
import { site, telLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us — Family-Run Truck & 4x4 Dealer",
  description:
    "Select Trucks is a family-run specialist in quality used pick-ups, 4x4s and trucks in Camberley, Surrey. Honest advice, hand-picked stock and a track record you can check.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "Hand-picked stock",
    body: "Every vehicle is chosen for condition and value. We buy the trucks we'd be happy to drive ourselves — no auction-grade fillers.",
  },
  {
    title: "Honest, no-pressure advice",
    body: "We'd rather point you at the right vehicle than push the dearest one. If it's not right for you, we'll tell you.",
  },
  {
    title: "A track record you can check",
    body: "We keep a public archive of everything we've sold. Real vehicles, real customers — the proof is there to see.",
  },
  {
    title: "Specialists, not generalists",
    body: "Pick-ups, 4x4s and working trucks are what we know. That focus means sharper buying and better-prepared vehicles.",
  },
];

export default async function AboutPage() {
  const facets = await getFacets();

  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <p className="eyebrow text-accent-bright">About Select Trucks</p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl md:text-5xl font-extrabold leading-tight">
            A family-run truck specialist you can actually trust
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-dark">
            We&apos;re a small, family-run dealer in {site.address.locality},{" "}
            {site.address.region}, specialising in quality used pick-ups, 4x4s
            and trucks. Over {facets.counts.sold}+ vehicles sold and counting —
            and every one of them is on public record.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/stock" className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-bright">
              Browse current stock
            </Link>
            <a href={telLink()} className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
              Call {site.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-body">
              How we do things
            </h2>
            <p className="mt-4 leading-relaxed text-body/90">
              Buying a used truck shouldn&apos;t be a gamble. We started Select
              Trucks because we were tired of the games — the hidden faults, the
              pressure, the prices that didn&apos;t add up. So we built the
              dealer we&apos;d want to buy from ourselves.
            </p>
            <p className="mt-4 leading-relaxed text-body/90">
              That means hand-picking every vehicle, preparing it properly, and
              being straight with you about what you&apos;re getting. If you want
              to see the kind of work we move, our{" "}
              <Link href="/sold" className="font-semibold text-accent hover:text-accent-bright">
                sold archive
              </Link>{" "}
              is open for anyone to browse.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-line bg-card p-5 shadow-[var(--shadow-card)]">
                <h3 className="font-display font-bold text-body">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-body">
            Looking for something specific?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Tell us what you&apos;re after and we&apos;ll keep an eye out — we
            source vehicles for customers all the time.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-bright">
              Get in touch
            </Link>
            <Link href="/stock" className="rounded-lg border border-line px-5 py-3 text-sm font-semibold text-body hover:bg-card">
              See the stock
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

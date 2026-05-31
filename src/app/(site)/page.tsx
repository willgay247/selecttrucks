import Link from "next/link";
import Image from "next/image";
import { getFeatured, getRecentlySold, getFacets } from "@/lib/db";
import { VehicleCard } from "@/components/vehicle-card";
import { imageUrl } from "@/lib/format";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, sold, facets] = await Promise.all([
    getFeatured(6),
    getRecentlySold(4),
    getFacets(),
  ]);

  const heroImg = featured[0]?.images[0];

  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        {heroImg && (
          <Image
            src={imageUrl(heroImg.r2_key)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 hero-grid" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl animate-fade-up">
            <p className="eyebrow text-accent-bright">
              {site.address.locality}, {site.address.region} · {site.established}
            </p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05]">
              Quality used pick-ups, 4x4s &amp; trucks
            </h1>
            <p className="mt-5 text-lg text-muted-dark max-w-xl">
              Hand-picked stock, honest advice and a track record you can actually
              check — browse our current vehicles and {facets.counts.sold}+ recently
              sold.
            </p>

            <form action="/stock" className="mt-8 flex max-w-lg overflow-hidden rounded-xl bg-white p-1.5 shadow-xl">
              <input
                name="q"
                type="search"
                placeholder="Search make, model… e.g. Jeep Wrangler"
                className="flex-1 bg-transparent px-4 text-body placeholder:text-muted outline-none"
              />
              <button className="rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-bright transition-colors">
                Search
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/stock" className="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20 transition-colors">
                Browse all stock
              </Link>
              <Link href="/sold" className="rounded-lg px-5 py-2.5 text-sm font-semibold text-muted-dark hover:text-white transition-colors">
                See what we&apos;ve sold →
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <Stat value={`${facets.counts.available}`} label="In stock now" />
              <Stat value={`${facets.counts.sold}+`} label="Recently sold" />
              <Stat value={`${facets.makes.length}`} label="Marques" />
            </dl>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- USP STRIP */}
      <section className="border-b border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-6 py-8 sm:grid-cols-3">
          <Usp title="Family-run & honest" text="A genuine family business — straight talk, no pushy sales." />
          <Usp title="Hand-picked stock" text="Every pick-up & 4x4 chosen for condition and value." />
          <Usp title="Proven track record" text={`${facets.counts.sold}+ vehicles sold and on record — full transparency.`} />
        </div>
      </section>

      {/* --------------------------------------------------------- FEATURED */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <SectionHead
          eyebrow="In stock now"
          title="Latest available vehicles"
          href="/stock"
          linkText="View all stock"
        />
        {featured.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((v, i) => (
              <VehicleCard key={v.id} vehicle={v} priority={i < 3} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-muted">No vehicles in stock right now — please check back soon.</p>
        )}
      </section>

      {/* ------------------------------------------------------- BROWSE BY TYPE */}
      <section className="bg-card border-y border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <SectionHead eyebrow="Browse" title="Find your type of vehicle" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CategoryTile href="/stock?body=Pickup" title="Pick-ups" count={facets.bodies.find((b) => b.value === "Pickup")?.count} />
            <CategoryTile href="/stock?body=SUV+%2F+4x4" title="4x4s & SUVs" count={facets.bodies.find((b) => b.value === "SUV / 4x4")?.count} />
            <CategoryTile href="/stock?make=Jeep" title="Jeep Wranglers" count={facets.makes.find((m) => m.value === "Jeep")?.count} />
            <CategoryTile href="/stock?body=Van" title="Vans" count={facets.bodies.find((b) => b.value === "Van")?.count} />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- SOLD / TRUST */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <SectionHead
          eyebrow="Brand validation"
          title="Recently sold — real cars, real customers"
          href="/sold"
          linkText="View sold archive"
        />
        <p className="mt-3 max-w-2xl text-muted">
          We keep a public record of everything we sell. It&apos;s the honest proof
          of a dealer you can trust.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sold.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- CTA */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold">
            Looking for something specific?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-dark">
            Tell us what you&apos;re after and we&apos;ll keep an eye out. Call,
            WhatsApp or drop us a message — we&apos;re happy to help.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="rounded-lg bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-bright transition-colors">
              Get in touch
            </Link>
            <Link href="/stock" className="rounded-lg bg-white/10 px-6 py-3 font-semibold text-white ring-1 ring-white/20 hover:bg-white/20 transition-colors">
              Browse stock
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-3xl font-extrabold text-white">{value}</dt>
      <dd className="mt-1 text-xs text-muted-dark">{label}</dd>
    </div>
  );
}

function Usp({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <div>
        <h3 className="font-display font-bold text-body">{title}</h3>
        <p className="text-sm text-muted">{text}</p>
      </div>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  href,
  linkText,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow text-accent">{eyebrow}</p>
        <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-body">{title}</h2>
      </div>
      {href && linkText && (
        <Link href={href} className="hidden sm:inline-flex shrink-0 text-sm font-semibold text-accent hover:text-accent-dark">
          {linkText} →
        </Link>
      )}
    </div>
  );
}

function CategoryTile({ href, title, count }: { href: string; title: string; count?: number }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl bg-paper p-5 ring-1 ring-line hover:ring-accent hover:bg-accent-soft transition-all"
    >
      <div>
        <h3 className="font-display font-bold text-body">{title}</h3>
        {count != null && <p className="text-sm text-muted">{count} available</p>}
      </div>
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  );
}

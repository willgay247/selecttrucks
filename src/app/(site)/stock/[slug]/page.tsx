import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVehicleBySlug, getRelated } from "@/lib/db";
import { VehicleGallery } from "@/components/vehicle-gallery";
import { EnquiryForm } from "@/components/enquiry-form";
import { VehicleCard } from "@/components/vehicle-card";
import { imageUrl, formatPrice, formatMileage, smartTitle } from "@/lib/format";
import { site, telLink, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVehicleBySlug(slug);
  if (!v) return { title: "Vehicle not found" };
  const title = smartTitle(v.title);
  const desc =
    v.description?.slice(0, 155) ??
    `${title} for sale at ${site.name}, ${site.address.locality}, ${site.address.region}.`;
  const cover = v.images[0];
  return {
    title: `${title} — ${formatPrice(v.price)}`,
    description: desc,
    alternates: { canonical: `/stock/${v.slug}` },
    openGraph: {
      title,
      description: desc,
      images: cover ? [imageUrl(cover.r2_key)] : [],
      type: "website",
    },
  };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const v = await getVehicleBySlug(slug);
  if (!v) notFound();

  const title = smartTitle(v.title);
  const sold = v.status === "sold";
  const related = await getRelated(v, 4);
  const mileage = formatMileage(v.mileage);

  const specs: { label: string; value: string | null }[] = [
    { label: "Year", value: v.year ? String(v.year) : null },
    { label: "Make", value: v.make },
    { label: "Model", value: v.model ? smartTitle(v.model) : null },
    { label: "Mileage", value: mileage },
    { label: "Fuel", value: v.fuel },
    { label: "Gearbox", value: v.transmission },
    { label: "Body", value: v.body },
    { label: "Colour", value: v.colour },
    { label: "Engine", value: v.engine },
    { label: "Doors", value: v.doors ? String(v.doors) : null },
    { label: "Drivetrain", value: v.drivetrain },
    { label: "VAT", value: v.vat_status },
  ].filter((s) => s.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: title,
    description: v.description ?? title,
    brand: v.make ? { "@type": "Brand", name: v.make } : undefined,
    model: v.model ?? undefined,
    vehicleModelDate: v.year ?? undefined,
    mileageFromOdometer: v.mileage
      ? { "@type": "QuantitativeValue", value: v.mileage, unitCode: "SMI" }
      : undefined,
    fuelType: v.fuel ?? undefined,
    vehicleTransmission: v.transmission ?? undefined,
    bodyType: v.body ?? undefined,
    color: v.colour ?? undefined,
    image: v.images.map((i) => new URL(imageUrl(i.r2_key), site.url).toString()),
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: v.price && v.price > 0 ? v.price : undefined,
      availability: sold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      seller: { "@type": "AutoDealer", name: site.name },
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="mb-5 text-sm text-muted">
        <Link href="/" className="hover:text-accent">Home</Link>
        <span className="px-1.5">/</span>
        <Link href="/stock" className="hover:text-accent">Stock</Link>
        <span className="px-1.5">/</span>
        <span className="text-body">{title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* LEFT: gallery + details */}
        <div>
          <VehicleGallery images={v.images} title={title} sold={sold} />

          <div className="mt-8">
            <h2 className="font-display text-xl font-extrabold text-body">Vehicle details</h2>
            <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
              {specs.map((s) => (
                <div key={s.label} className="bg-card p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{s.label}</dt>
                  <dd className="mt-1 font-display font-bold text-body">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {v.description && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-extrabold text-body">Description</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-body/90">{v.description}</p>
            </div>
          )}
        </div>

        {/* RIGHT: sticky purchase panel */}
        <aside>
          <div className="sticky top-20 space-y-4">
            <div className="rounded-2xl border border-line bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2">
                {sold ? (
                  <span className="rounded-md bg-sold/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-sold">Sold</span>
                ) : (
                  <span className="rounded-md bg-available/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-available">Available</span>
                )}
                {v.year && <span className="text-sm text-muted">{v.year}</span>}
              </div>
              <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight text-body">{title}</h1>
              <p className="mt-3 font-display text-4xl font-extrabold text-body">{formatPrice(v.price)}</p>
              {mileage && <p className="mt-1 text-sm text-muted">{mileage}</p>}

              {!sold && (
                <div className="mt-5 grid gap-2">
                  <a href={telLink()} className="flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-bright transition-colors">
                    Call {site.phoneDisplay}
                  </a>
                  <a
                    href={whatsappLink(`Hi ${site.name}, I'm interested in the ${title} (${formatPrice(v.price)}). Is it still available?`)}
                    target="_blank" rel="noopener"
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#1faf54] px-5 py-3 font-semibold text-white hover:brightness-110 transition"
                  >
                    WhatsApp us
                  </a>
                </div>
              )}
              {sold && (
                <p className="mt-5 rounded-lg bg-paper p-3 text-sm text-muted">
                  This vehicle has been sold. Looking for something similar?{" "}
                  <Link href="/stock" className="font-semibold text-accent">Browse current stock</Link> or get in touch.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="font-display text-lg font-bold text-body">
                {sold ? "Enquire about similar" : "Enquire about this vehicle"}
              </h2>
              <p className="mt-1 mb-4 text-sm text-muted">
                Send us a message and we&apos;ll get straight back to you.
              </p>
              <EnquiryForm vehicleId={v.id} vehicleSlug={v.slug} vehicleTitle={title} compact />
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-extrabold text-body">You might also like</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <VehicleCard key={r.id} vehicle={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import Link from "next/link";
import { site, telLink, mailtoLink, whatsappLink } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-muted-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-white font-display font-extrabold text-lg">
                S
              </span>
              <span className="font-display text-white font-extrabold text-lg">
                Select<span className="text-accent-bright">Trucks</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              {site.legalName} — a family-run specialist in quality used pick-ups,
              4x4s, vans and trucks. Based in {site.address.locality},{" "}
              {site.address.region}.
            </p>
          </div>

          <div>
            <h3 className="font-display text-white text-sm font-semibold mb-4">Browse</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/stock" className="hover:text-white">All stock</Link></li>
              <li><Link href="/stock?body=Pickup" className="hover:text-white">Pick-ups</Link></li>
              <li><Link href="/stock?body=SUV+%2F+4x4" className="hover:text-white">4x4s &amp; SUVs</Link></li>
              <li><Link href="/stock?make=Jeep" className="hover:text-white">Jeep Wranglers</Link></li>
              <li><Link href="/sold" className="hover:text-white">Sold archive</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-white text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-white">About us</Link></li>
              <li><Link href="/useful-information" className="hover:text-white">Useful information</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact &amp; viewings</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-white text-sm font-semibold mb-4">Get in touch</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href={telLink()} className="hover:text-white">{site.phoneDisplay}</a></li>
              <li><a href={mailtoLink()} className="hover:text-white">{site.email}</a></li>
              <li><a href={whatsappLink()} className="hover:text-white" target="_blank" rel="noopener">WhatsApp us</a></li>
            </ul>
            <div className="mt-4 text-sm">
              {site.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4 max-w-[16rem]">
                  <span>{h.days}</span>
                  <span className="text-white/80">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-ink-line flex flex-col sm:flex-row justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</p>
          <p>{site.address.areaServed}</p>
        </div>
      </div>
    </footer>
  );
}

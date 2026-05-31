/**
 * Central business / brand configuration.
 * Everything that might change (phone, email, hours, copy) lives here so the
 * site can be updated in one place.
 */

export const site = {
  name: "Select Trucks",
  legalName: "Select Trucks",
  tagline: "Used pick-ups, 4x4s & trucks — Camberley, Surrey",
  description:
    "Family-run specialist dealer of quality used pick-ups, 4x4s, vans and trucks in Camberley, Surrey. Honest advice, hand-picked stock and a track record you can check.",
  // Used for absolute URLs in metadata / sitemap. Override per environment.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000",

  phoneDisplay: "07865 081249",
  phoneE164: "+447865081249",
  whatsappE164: "447865081249",
  email: "sales@selecttrucks.co.uk",

  address: {
    locality: "Camberley",
    region: "Surrey",
    country: "GB",
    areaServed: "Surrey, Berkshire & Hampshire borders",
  },

  // Editable opening hours — confirm/adjust as needed.
  hours: [
    { days: "Monday – Friday", time: "9:00am – 6:00pm" },
    { days: "Saturday", time: "9:00am – 5:00pm" },
    { days: "Sunday", time: "By appointment" },
  ],

  social: {
    // add when available
  },

  established: "a family-run business",
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsappE164}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function telLink() {
  return `tel:${site.phoneE164}`;
}

export function mailtoLink(subject?: string) {
  const base = `mailto:${site.email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}

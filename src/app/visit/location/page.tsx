import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/client";
import { locationPageQuery, siteSettingsQuery } from "@/sanity/queries";
import type { LocationPageDoc, SiteSettings } from "@/types/sanity";

export const metadata: Metadata = {
  title: "Location & Time",
  description:
    "RCC is at 3871 Kirby Whitten Parkway, Bartlett, TN. Sundays at 10:15 AM. Family Ministry for infants through 8th grade.",
};

const FALLBACK: LocationPageDoc = {
  hero: {
    eyebrow: "Visit",
    headline: "Location & Time",
    intro:
      "We meet in suburban Bartlett, at the corner of Kirby-Whitten Pkwy and St. Elmo Rd.",
  },
  serviceNote: "Coffee starts at 10:00 · Service runs 65–70 minutes",
  familyMinistryNote:
    "Family Ministry environments open at 10:15 for infants through 8th grade.",
  directionsLabel: "Get directions",
  appleMapsLabel: "Open in Apple Maps",
  communities: {
    eyebrow: "We serve",
    headline: "Memphis and the suburbs we call home.",
    list: ["Bartlett", "Lakeland", "Arlington", "Millington", "Cordova"],
    footer:
      "Whether you're coming from across the street or across the river, there's a seat saved for you.",
  },
  cta: {
    headline: "First time visiting?",
    body: "Here's exactly what your first Sunday will look like, from the parking lot to your seat.",
    primaryCta: { label: "What to expect", href: "/visit/what-to-expect" },
  },
};

async function safeFetch<T>(query: string): Promise<T | null> {
  try {
    return await client.fetch<T>(query);
  } catch {
    return null;
  }
}

export default async function LocationPage() {
  const [doc, settings] = await Promise.all([
    safeFetch<LocationPageDoc | null>(locationPageQuery),
    safeFetch<SiteSettings | null>(siteSettingsQuery),
  ]);

  // Merge fallback + sanity (shallow per top-level key)
  const data: LocationPageDoc = {
    hero: { ...FALLBACK.hero, ...doc?.hero },
    serviceNote: doc?.serviceNote ?? FALLBACK.serviceNote,
    familyMinistryNote:
      doc?.familyMinistryNote ?? FALLBACK.familyMinistryNote,
    directionsLabel: doc?.directionsLabel ?? FALLBACK.directionsLabel,
    appleMapsLabel: doc?.appleMapsLabel ?? FALLBACK.appleMapsLabel,
    communities: { ...FALLBACK.communities, ...doc?.communities },
    cta: { ...FALLBACK.cta, ...doc?.cta },
  };

  // Pull live address + service time from Site Settings (single source of truth)
  const serviceTime = settings?.serviceTime ?? "Sundays at 10:15 AM";
  // Format: "Sundays at 10:15 AM" → "Sundays" / "10:15 AM"
  const [serviceDay, serviceClock] = (() => {
    const m = serviceTime.match(/^(.*?)\s+at\s+(.*)$/i);
    if (m) return [m[1].trim(), m[2].trim()];
    return ["Sundays", serviceTime];
  })();
  const addr = settings?.address ?? {
    line1: "3871 Kirby Whitten Parkway",
    city: "Bartlett",
    state: "TN",
    zip: "38135",
  };
  const fullAddress = [
    addr.line1,
    addr.line2,
    [addr.city, addr.state].filter(Boolean).join(", "),
    addr.zip,
  ]
    .filter(Boolean)
    .join(", ");
  const addressLines = [
    addr.line1,
    [addr.city, addr.state].filter(Boolean).join(", ") +
      (addr.zip ? ` ${addr.zip}` : ""),
  ];

  const ADDRESS_QUERY = encodeURIComponent(fullAddress);
  const MAP_EMBED = `https://maps.google.com/maps?q=${ADDRESS_QUERY}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${ADDRESS_QUERY}`;
  const APPLE_MAPS_URL = `http://maps.apple.com/?daddr=${ADDRESS_QUERY}`;

  return (
    <div>
      <section className="bg-brand-600 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          {data.hero?.eyebrow && (
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-100">
              {data.hero.eyebrow}
            </p>
          )}
          <h1 className="mt-3 font-display text-5xl uppercase leading-tight tracking-wide md:text-6xl">
            {data.hero?.headline}
          </h1>
          {data.hero?.intro && (
            <p className="mt-4 max-w-2xl text-lg leading-7 text-brand-50/95">
              {data.hero.intro}
            </p>
          )}
        </div>
      </section>

      <section className="bg-cream-50 py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
                Service time
              </p>
              <p className="mt-3 font-display text-6xl uppercase leading-none tracking-wide text-ink-800 md:text-7xl">
                {serviceDay}
              </p>
              <p className="mt-2 font-display text-5xl uppercase leading-none tracking-wide text-brand-500 md:text-6xl">
                {serviceClock}
              </p>
              {data.serviceNote && (
                <p className="mt-4 text-base text-ink-600">{data.serviceNote}</p>
              )}
              {data.familyMinistryNote && (
                <p className="mt-2 text-base text-ink-600">
                  {data.familyMinistryNote}
                </p>
              )}
            </div>

            <div>
              <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
                Address
              </p>
              <address className="mt-3 not-italic">
                {addressLines.map((line) => (
                  <p
                    key={line}
                    className="font-display text-3xl uppercase leading-tight tracking-wide text-ink-800 md:text-4xl"
                  >
                    {line}
                  </p>
                ))}
              </address>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
                >
                  {data.directionsLabel}
                </a>
                <a
                  href={APPLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-brand-600 transition hover:bg-brand-50"
                >
                  {data.appleMapsLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <iframe
          src={MAP_EMBED}
          title={`Map to ${fullAddress}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[420px] w-full border-0 md:h-[520px]"
          allowFullScreen
        />
      </section>

      {data.communities?.list && data.communities.list.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            {data.communities.eyebrow && (
              <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
                {data.communities.eyebrow}
              </p>
            )}
            <h2 className="mt-2 font-display text-3xl uppercase tracking-wide text-ink-800 md:text-4xl">
              {data.communities.headline}
            </h2>
            <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3">
              {data.communities.list.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-cream-200 bg-cream-50 px-5 py-2 font-display text-sm uppercase tracking-widest text-ink-700"
                >
                  {c}
                </li>
              ))}
            </ul>
            {data.communities.footer && (
              <p className="mx-auto mt-6 max-w-xl text-ink-600">
                {data.communities.footer}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="bg-cream-100 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          {data.cta?.headline && (
            <h2 className="font-display text-4xl uppercase tracking-wide text-ink-800 md:text-5xl">
              {data.cta.headline}
            </h2>
          )}
          {data.cta?.body && (
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-ink-600">
              {data.cta.body}
            </p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {data.cta?.primaryCta?.label && data.cta.primaryCta.href && (
              <Link
                href={data.cta.primaryCta.href}
                className="rounded-full bg-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
              >
                {data.cta.primaryCta.label}
              </Link>
            )}
            {data.cta?.secondaryCta?.label && data.cta.secondaryCta.href && (
              <Link
                href={data.cta.secondaryCta.href}
                className="rounded-full border border-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-brand-600 transition hover:bg-brand-50"
              >
                {data.cta.secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

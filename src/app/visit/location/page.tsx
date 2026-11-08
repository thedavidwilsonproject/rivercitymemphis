import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { locationPageQuery, siteSettingsQuery } from "@/sanity/queries";
import { JsonLd } from "@/components/json-ld";
import { ORG, SITE_URL } from "@/lib/site";
import type { LocationPageDoc, SiteSettings } from "@/types/sanity";
import {
  Button,
  Container,
  CtaBand,
  Eyebrow,
  Headline,
  PhotoHero,
  Section,
} from "@/components/v2/ui";

/** Existing building photo, reused as the hero image for this page. */
const HERO_IMAGE = {
  src: "/brand/pages/who-we-are/exterior.jpg",
  alt: "Family walking up to the RCC building",
};

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

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${SITE_URL}/visit/location#place`,
    name: ORG.name,
    url: `${SITE_URL}/visit/location`,
    hasMap: `https://www.google.com/maps?q=${ADDRESS_QUERY}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: addr.line1,
      addressLocality: addr.city,
      addressRegion: addr.state,
      postalCode: addr.zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: ORG.geo.latitude,
      longitude: ORG.geo.longitude,
    },
    containedInPlace: { "@id": `${SITE_URL}#church` },
  };

  return (
    <div>
      <JsonLd data={placeJsonLd} />
      <PhotoHero
        image={HERO_IMAGE.src}
        alt={HERO_IMAGE.alt}
        eyebrow={data.hero?.eyebrow}
        headline={data.hero?.headline ?? "Location & Time"}
        accent="Time"
        intro={data.hero?.intro}
        short
      >
        <Button tone="dark" href={DIRECTIONS_URL}>
          {data.directionsLabel}
        </Button>
      </PhotoHero>

      {/* SERVICE TIME + ADDRESS */}
      <Section tone="white">
        <Container>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-ink-900/15 bg-ink-900/15 lg:grid-cols-2">
            <div className="bg-paper p-8 md:p-14">
              <Eyebrow>Service time</Eyebrow>
              <p className="mt-6 text-6xl font-bold leading-[0.95] tracking-tight text-ink-900 md:text-8xl">
                {serviceDay}
              </p>
              <p className="font-serif text-6xl italic leading-none text-brand-600 md:text-8xl">
                {serviceClock}
              </p>
              <div className="mt-8 space-y-2 text-lg text-ink-600">
                {data.serviceNote && <p>{data.serviceNote}</p>}
                {data.familyMinistryNote && <p>{data.familyMinistryNote}</p>}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-10 bg-paper p-8 md:p-14">
              <div>
                <Eyebrow>Address</Eyebrow>
                <address className="mt-6 not-italic">
                  {addressLines.map((line) => (
                    <p
                      key={line}
                      className="text-4xl font-bold leading-tight tracking-tight text-ink-900 md:text-5xl"
                    >
                      {line}
                    </p>
                  ))}
                </address>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button href={DIRECTIONS_URL}>{data.directionsLabel}</Button>
                <Button href={APPLE_MAPS_URL} variant="outline">
                  {data.appleMapsLabel}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-ink-900/15">
            <iframe
              src={MAP_EMBED}
              title={`Map to ${fullAddress}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-[420px] w-full border-0 md:h-[560px]"
              allowFullScreen
            />
          </div>
        </Container>
      </Section>

      {/* COMMUNITIES */}
      {data.communities?.list && data.communities.list.length > 0 && (
        <Section tone="dark">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
              <div>
                {data.communities.eyebrow && (
                  <Eyebrow tone="dark">{data.communities.eyebrow}</Eyebrow>
                )}
                {data.communities.headline && (
                  <Headline
                    text={data.communities.headline}
                    accent="call home."
                    tone="dark"
                    className="mt-4"
                  />
                )}
                {data.communities.footer && (
                  <p className="mt-8 max-w-md text-lg leading-8 text-white/70">
                    {data.communities.footer}
                  </p>
                )}
              </div>
              <ul className="divide-y divide-white/15 border-y border-white/15">
                {data.communities.list.map((c) => (
                  <li
                    key={c}
                    className="py-4 font-serif text-5xl italic leading-tight text-white md:text-6xl"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </Section>
      )}

      {data.cta?.headline && (
        <CtaBand headline={data.cta.headline} body={data.cta.body}>
          {data.cta?.primaryCta?.label && data.cta.primaryCta.href && (
            <Button tone="dark" href={data.cta.primaryCta.href}>
              {data.cta.primaryCta.label}
            </Button>
          )}
          {data.cta?.secondaryCta?.label && data.cta.secondaryCta.href && (
            <Button tone="dark" variant="outline" href={data.cta.secondaryCta.href}>
              {data.cta.secondaryCta.label}
            </Button>
          )}
        </CtaBand>
      )}
    </div>
  );
}

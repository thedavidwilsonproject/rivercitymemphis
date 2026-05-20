import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/client";
import { homePageQuery, sermonSeriesIndexQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { KidsAndStudents } from "@/components/kids-and-students";
import { JsonLd } from "@/components/json-ld";
import type { HomePageDoc, SermonSeriesSummary } from "@/types/sanity";
import { ORG, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "River City Church — Bartlett, TN · Sundays at 10:15 AM",
  description:
    "A non-denominational church in Bartlett, TN. Join us Sundays at 10:15 AM at 3871 Kirby Whitten Pkwy. Family Ministry for infants through 8th grade. Lead Pastor Jonathan Dunn.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "River City Church — Bartlett, TN",
    description:
      "A non-denominational church in Bartlett, TN. Sundays at 10:15 AM. Family Ministry for infants through 8th grade.",
    siteName: "River City Church",
  },
  twitter: {
    card: "summary_large_image",
    title: "River City Church — Bartlett, TN",
    description:
      "A non-denominational church in Bartlett, TN. Sundays at 10:15 AM.",
  },
};

async function safeFetch<T>(query: string): Promise<T | null> {
  try {
    return await client.fetch<T>(query);
  } catch {
    return null;
  }
}

const FALLBACK_HERO = {
  eyebrow: "Bartlett, TN",
  headline: "Refocus your life, home, and church back to God.",
  subhead:
    "A relaxed, friendly community where people accept you for who you are. Join us Sundays at 10:15 AM.",
  primaryCta: { label: "Plan Your Visit", href: "/visit/what-to-expect" },
  secondaryCta: { label: "Watch Online", href: "/watch" },
};

const FALLBACK_SERIES_SECTION = {
  title: "Current Series",
  viewAllLabel: "View All →",
  viewAllHref: "/watch",
  count: 3,
};

export default async function Home() {
  const [home, series] = await Promise.all([
    safeFetch<HomePageDoc | null>(homePageQuery),
    safeFetch<SermonSeriesSummary[]>(sermonSeriesIndexQuery),
  ]);

  const hero = { ...FALLBACK_HERO, ...(home?.hero ?? {}) };
  const ss = { ...FALLBACK_SERIES_SECTION, ...(home?.currentSeriesSection ?? {}) };
  const ks = home?.kidsAndStudentsSection ?? {};

  const posterSrc = hero.posterImage?.asset
    ? urlFor(hero.posterImage).width(1920).url()
    : "/brand/hero-poster.webp";

  // Hero video: use the Sanity-uploaded video if present, otherwise the
  // bundled brand video at /public/brand/hero.mp4.
  const videoSrc = hero.videoUrl || "/brand/hero.mp4";
  const videoType = hero.videoMimeType || "video/mp4";

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: ORG.name,
    publisher: { "@id": `${SITE_URL}#church` },
    inLanguage: "en-US",
  };

  const sundayServiceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${SITE_URL}#sunday-service`,
    name: "Sunday Worship Service",
    description:
      "Weekly Sunday worship service at River City Church — about 65–70 minutes of worship, teaching, and community. Coffee starts 15 minutes prior. Family Ministry open for infants through 8th grade.",
    eventSchedule: {
      "@type": "Schedule",
      repeatFrequency: "P1W",
      byDay: "https://schema.org/Sunday",
      startTime: "10:15",
      endTime: "11:30",
      scheduleTimezone: "America/Chicago",
    },
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      "@id": `${SITE_URL}/visit/location#place`,
      name: ORG.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: ORG.address.street,
        addressLocality: ORG.address.locality,
        addressRegion: ORG.address.region,
        postalCode: ORG.address.postalCode,
        addressCountry: ORG.address.country,
      },
    },
    organizer: { "@id": `${SITE_URL}#church` },
    isAccessibleForFree: true,
    inLanguage: "en-US",
  };

  return (
    <>
      <JsonLd data={[websiteJsonLd, sundayServiceJsonLd]} />
      <section className="relative isolate overflow-hidden bg-ink-900 text-white">
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={videoSrc} type={videoType} />
        </video>
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-900/70 via-ink-900/55 to-ink-900/80"
          aria-hidden="true"
        />
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-32 md:py-48">
          {hero.eyebrow && (
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-300">
              {hero.eyebrow}
            </p>
          )}
          <h1 className="max-w-3xl font-display text-5xl uppercase leading-tight tracking-wide md:text-7xl">
            {hero.headline}
          </h1>
          {hero.subhead && (
            <p className="max-w-2xl text-lg leading-8 text-cream-50/90">
              {hero.subhead}
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            {hero.primaryCta?.label && hero.primaryCta?.href && (
              <Link
                href={hero.primaryCta.href}
                className="rounded-full bg-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
              >
                {hero.primaryCta.label}
              </Link>
            )}
            {hero.secondaryCta?.label && hero.secondaryCta?.href && (
              <Link
                href={hero.secondaryCta.href}
                className="rounded-full border border-white/40 bg-white/5 px-6 py-3 font-display text-sm uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/15"
              >
                {hero.secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <header className="flex items-end justify-between gap-6 pb-8">
          <h2 className="font-display text-4xl uppercase tracking-wide text-ink-800">
            {ss.title}
          </h2>
          {ss.viewAllHref && (
            <Link
              href={ss.viewAllHref}
              className="font-display text-sm uppercase tracking-widest text-brand-600 hover:text-brand-700"
            >
              {ss.viewAllLabel}
            </Link>
          )}
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          {(series ?? []).slice(0, ss.count ?? 3).map((s) => (
            <Link
              key={s.slug}
              href={`/watch/${s.slug}`}
              className="group overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="w-full bg-cream-100">
                {s.coverImage?.asset && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={urlFor(s.coverImage).width(800).fit("max").url()}
                    alt={s.coverImage.alt ?? s.title}
                    className="block w-full h-auto transition group-hover:scale-[1.02]"
                  />
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl uppercase tracking-wide text-ink-800">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-ink-500">
                  {formatRange(s.startDate, s.endDate)}
                </p>
              </div>
            </Link>
          ))}
          {(!series || series.length === 0) && (
            <p className="col-span-3 rounded-xl border border-dashed border-ink-300 p-8 text-center text-sm text-ink-500">
              Sermon series will appear here after Sanity is connected and
              content is migrated.
            </p>
          )}
        </div>
      </section>

      <KidsAndStudents
        title={ks.title}
        intro={ks.intro}
        ministries={ks.ministries}
      />
    </>
  );
}

function formatRange(start?: string, end?: string) {
  const fmt = (d?: string) =>
    d
      ? new Date(d).toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "";
  const s = fmt(start);
  const e = fmt(end);
  if (s && e && s !== e) return `${s} – ${e}`;
  return s || e;
}

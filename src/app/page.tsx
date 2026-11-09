import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/client";
import { homePageQuery, sermonSeriesIndexQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { KidsAndStudents } from "@/components/kids-and-students";
import { JsonLd } from "@/components/json-ld";
import type { HomePageDoc, SermonSeriesSummary } from "@/types/sanity";
import { ORG, SITE_URL } from "@/lib/site";
import { getYouTubeFeed, seriesSiblings, YT_LIVE_URL } from "@/lib/youtube";
import { VideoCard } from "@/components/v2/video";
import { UpcomingEvents } from "@/components/v2/pco-blocks";

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
  const [home, series, feed] = await Promise.all([
    safeFetch<HomePageDoc | null>(homePageQuery),
    safeFetch<SermonSeriesSummary[]>(sermonSeriesIndexQuery),
    getYouTubeFeed(),
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

  const headline = hero.headline ?? FALLBACK_HERO.headline;
  const [headLead, headAccent] = splitAccent(headline);
  const featured = (series ?? []).slice(0, ss.count ?? 3);
  // Live YouTube feed wins over the (manually curated) Sanity series.
  const latest = feed.messages[0];
  const latestSeries = latest ? seriesSiblings(feed, latest) : [];
  const sideVideos = latest
    ? (latestSeries.length > 1 ? latestSeries.slice().reverse() : feed.messages)
        .filter((v) => v.id !== latest.id)
        .slice(0, 2)
    : [];
  const bandTitle = latest?.series ?? (latest ? "Latest message" : ss.title ?? "Current Series");

  return (
    <>
      <JsonLd data={[websiteJsonLd, sundayServiceJsonLd]} />

      {/* ── HERO — full-bleed video, editorial headline ───────────────── */}
      <section className="relative isolate -mt-20 flex min-h-[100svh] flex-col overflow-hidden bg-river-950 text-white">
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
          className="absolute inset-0 -z-10 bg-gradient-to-t from-river-950 via-river-950/85 to-river-950/75 md:via-river-950/70 md:to-river-950/55"
          aria-hidden="true"
        />

        <div className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col justify-end px-5 pb-10 pt-40 md:px-10 md:pb-14">
          {hero.eyebrow && (
            <p className="rise text-xs font-semibold uppercase tracking-[0.25em] text-brand-300">
              {hero.eyebrow}
            </p>
          )}
          <h1 className="rise rise-2 mt-5 max-w-6xl text-[3.2rem] font-bold leading-[0.92] tracking-tight sm:text-6xl md:text-7xl xl:text-[8.5rem]">
            {headLead}
            <em className="text-brand-300">{headAccent}</em>
          </h1>

          <div className="rise rise-3 mt-12 grid gap-8 border-t border-white/20 pt-8 md:grid-cols-[1fr_auto] md:items-end">
            {hero.subhead && (
              <p className="max-w-xl text-lg leading-8 text-white/80">
                {hero.subhead}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {hero.primaryCta?.label && hero.primaryCta?.href && (
                <Link
                  href={hero.primaryCta.href}
                  className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink-900 transition hover:bg-brand-100"
                >
                  {hero.primaryCta.label}
                </Link>
              )}
              {hero.secondaryCta?.label && hero.secondaryCta?.href && (
                <Link
                  href={hero.secondaryCta.href}
                  className="rounded-full border border-white/35 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  {hero.secondaryCta.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SUNDAY GATHERINGS — photo mosaic + service facts ──────────── */}
      <section className="mx-auto max-w-[90rem] px-5 py-24 md:px-10 md:py-36">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
          <div className="grid aspect-[5/4] grid-cols-2 grid-rows-2 gap-3 md:gap-4">
            {/* eslint-disable @next/next/no-img-element */}
            <img
              src="/brand/pages/who-we-are/worship.jpg"
              alt="Worship at River City Church on a Sunday morning"
              className="row-span-2 h-full w-full rounded-2xl object-cover"
            />
            <img
              src="/brand/pages/what-to-expect/welcomed.jpg"
              alt="A host team volunteer greeting guests at the front door"
              className="h-full w-full rounded-2xl object-cover"
            />
            <img
              src="/brand/pages/what-to-expect/kids.jpg"
              alt="RCC Family Ministry room"
              className="h-full w-full rounded-2xl object-cover"
            />
            {/* eslint-enable @next/next/no-img-element */}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-800">
              Every Sunday
            </p>
            <h2 className="mt-4 text-6xl font-bold leading-[0.95] tracking-tight text-ink-900 md:text-7xl">
              Sunday <em className="text-brand-600">Gatherings</em>
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-ink-600">
              Live band, contemporary music, then a clear teaching from
              Scripture that connects to everyday life. The full service runs
              65–70 minutes — we start and end on time.
            </p>

            <dl className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { k: "Time", v: "10:15 AM", n: "Coffee from 10:00" },
                { k: "Place", v: "Bartlett", n: "3871 Kirby Whitten Pkwy" },
                { k: "Kids", v: "Infants–8th", n: "Family Ministry" },
              ].map((f) => (
                <div
                  key={f.k}
                  className="rounded-2xl border border-ink-900/15 p-5 transition hover:border-brand-500"
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
                    {f.k}
                  </dt>
                  <dd className="mt-3 text-2xl font-bold tracking-tight text-ink-900">
                    {f.v}
                  </dd>
                  <dd className="mt-1 text-sm text-ink-500">{f.n}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/visit/what-to-expect"
                className="rounded-full bg-ink-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                What to Expect
              </Link>
              <Link
                href="/visit/location"
                className="inline-block py-2 text-sm font-semibold text-ink-900 underline decoration-brand-500 decoration-2 underline-offset-[6px] hover:text-brand-800"
              >
                Get directions →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATEMENT ─────────────────────────────────────────────────── */}
      <section className="border-y border-ink-900/10 bg-white/50">
        <div className="mx-auto max-w-[90rem] px-5 py-24 md:px-10 md:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-800">
            Our culture
          </p>
          <p className="mt-6 max-w-6xl text-4xl font-semibold leading-[1.1] tracking-tight text-ink-900 md:text-6xl">
            <em className="text-brand-600">Come as you are.</em> You don&apos;t
            need to know anyone, dress a certain way, or have answers ready{" "}
            <span className="text-ink-500">— just come.</span>
          </p>
          <Link
            href="/visit/who-we-are"
            className="py-2 mt-10 inline-block text-sm font-semibold text-ink-900 underline decoration-brand-500 decoration-2 underline-offset-[6px] hover:text-brand-800"
          >
            Get to know us →
          </Link>
        </div>
      </section>

      {/* ── NEXT STEPS — rounded photo cards ──────────────────────────── */}
      <section className="mx-auto max-w-[90rem] px-5 py-24 md:px-10 md:py-32">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="text-6xl font-bold leading-[0.95] tracking-tight text-ink-900 md:text-7xl">
            Take your <em className="text-brand-600">next step.</em>
          </h2>
          <p className="max-w-md text-ink-600">
            We&apos;re always looking for ways to help people plug in to what
            God is doing in our city, nation, and world.
          </p>
        </div>
        <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-4">
          {NEXT_STEPS.map((c) => (
            <Link key={c.href} href={c.href} className="group block">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-cream-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image}
                  alt={c.alt}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-800">
                {c.eyebrow}
              </p>
              <h3 className="mt-2 text-3xl font-bold tracking-tight text-ink-900">
                {c.title}
              </h3>
              <p className="mt-3 leading-7 text-ink-600">{c.blurb}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-ink-900 transition group-hover:translate-x-1 group-hover:text-brand-800">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <UpcomingEvents />

      {/* ── CURRENT SERIES — dark editorial band ──────────────────────── */}
      <section className="bg-river-950 text-white">
        <div className="mx-auto max-w-[90rem] px-5 py-24 md:px-10 md:py-32">
          <header className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">
                {latest?.series ? "Current series" : "Watch & listen"}
              </p>
              <h2 className="mt-4 text-6xl font-bold leading-[0.95] tracking-tight md:text-7xl">
                {splitAccent(bandTitle)[0]}
                <em className="text-brand-300">{splitAccent(bandTitle)[1]}</em>
              </h2>
            </div>
            {ss.viewAllHref && (
              <Link
                href={ss.viewAllHref}
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                All messages →
              </Link>
            )}
          </header>

          {latest ? (
            <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-8">
              <VideoCard v={latest} size="lg" withSeries={false} />
              <div className="flex flex-col gap-10">
                {sideVideos.map((v) => (
                  <VideoCard key={v.id} v={v} size="sm" withSeries={!latest.series} />
                ))}
                <a
                  href={YT_LIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-auto flex items-center justify-between gap-4 rounded-2xl border border-white/15 px-6 py-5 transition hover:bg-white/5"
                >
                  <span>
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                      <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                      Live Sundays
                    </span>
                    <span className="mt-1 block text-lg font-bold">Stream the 10:15 AM service</span>
                  </span>
                  <span className="text-white/60 transition group-hover:translate-x-1 group-hover:text-white">↗</span>
                </a>
              </div>
            </div>
          ) : featured.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              {featured.map((s, i) => (
                <Link
                  key={s.slug}
                  href={`/watch/${s.slug}`}
                  className={`group block ${i === 0 ? "lg:row-span-2" : ""}`}
                >
                  <div className="overflow-hidden rounded-2xl bg-river-800">
                    {s.coverImage?.asset && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={urlFor(s.coverImage).width(i === 0 ? 1400 : 800).fit("max").url()}
                        alt={s.coverImage.alt ?? s.title}
                        className="block h-auto w-full transition duration-700 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="mt-5 flex flex-col gap-1.5">
                    <h3
                      className={`font-bold tracking-tight ${i === 0 ? "text-3xl md:text-4xl" : "text-2xl"}`}
                    >
                      {s.title}
                    </h3>
                    <p className="text-sm text-white/50">
                      {formatRange(s.startDate, s.endDate)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/20 p-10 text-center text-white/60">
              Sermon series will appear here once Sanity content is available.
            </p>
          )}
        </div>
      </section>

      <KidsAndStudents
        title={ks.title}
        intro={ks.intro}
        ministries={ks.ministries}
      />

      {/* ── GROUPS — full-bleed photo CTA ─────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/pages/groups/community.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-river-950/90 via-river-950/60 to-river-950/20"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-[90rem] px-5 py-32 text-white md:px-10 md:py-44">
          <h2 className="max-w-3xl text-6xl font-bold leading-[0.95] tracking-tight md:text-8xl">
            Real growth happens in <em className="text-brand-300">circles.</em>
          </h2>
          <p className="mt-8 max-w-xl text-lg leading-8 text-white/80">
            Groups are how we get to know each other, learn alongside each
            other, and experience the kind of community we were made for.
          </p>
          <Link
            href="/groups"
            className="mt-10 inline-block rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink-900 transition hover:bg-brand-100"
          >
            Find a group
          </Link>
        </div>
      </section>
    </>
  );
}

const NEXT_STEPS = [
  {
    eyebrow: "New here?",
    title: "Next",
    blurb:
      "A 15-minute session with our lead pastor Jonathan Dunn — why we exist, how to get connected, and answers to your questions.",
    href: "/connect/next",
    image: "/brand/pages/connect/next.jpg",
    alt: "Jonathan Dunn teaching at RCC on a Sunday morning",
  },
  {
    eyebrow: "For your whole family",
    title: "Family Ministries",
    blurb:
      "Safe, fun, age-appropriate environments where your kids will love to grow.",
    href: "/connect/families",
    image: "/brand/pages/connect/families.jpg",
    alt: "A small group leader teaching kids at RCC",
  },
  {
    eyebrow: "Serve with us",
    title: "Volunteer",
    blurb:
      "Every Sunday at RCC happens because volunteers show up early and stay late. Host team, kids, production, parking — it all takes hands.",
    href: "/connect/volunteer",
    image: "/brand/pages/volunteer/host.jpg",
    alt: "An RCC host team volunteer giving a thumbs up at the front entrance",
  },
  {
    eyebrow: "Love your city",
    title: "Be Rich",
    blurb:
      "Serving our neighbors, supporting non-profits, and showing the love of Jesus in tangible ways.",
    href: "/connect/be-rich",
    image: "/brand/pages/connect/be-rich.jpg",
    alt: "RCC hosting Easter Fest — a free community event in Bartlett",
  },
];

/** Split a headline so the trailing phrase can be set in the italic serif. */
function splitAccent(text: string): [string, string] {
  const t = text.trim();
  const m = t.match(/^(.*?\s)(back to (?:God|Him)\.?)$/i);
  if (m) return [m[1], m[2]];
  const words = t.split(/\s+/);
  if (words.length < 2) return ["", t];
  const last = words.pop()!;
  return [words.join(" ") + " ", last];
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

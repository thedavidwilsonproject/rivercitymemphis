import Link from "next/link";
import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { recentSermonSeriesQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { SermonSeriesSummary } from "@/types/sanity";
import { PageHero } from "@/components/page-hero";
import { Button, Container, CtaBand, Eyebrow, Headline, Section, SectionHeader } from "@/components/v2/ui";
import { LiteYouTube } from "@/components/v2/lite-youtube";
import { VideoCard, YouTubeLink, videoMeta } from "@/components/v2/video";
import {
  getYouTubeFeed,
  seriesSiblings,
  ytWatchUrl,
  YT_CHANNEL_URL,
  YT_LIVE_URL,
  YT_SUBSCRIBE_URL,
} from "@/lib/youtube";

export const metadata: Metadata = {
  title: "Watch",
  description:
    "Watch the latest message from River City Church in Bartlett, TN — new every Sunday, live at 10:15 AM.",
};

// YouTube feed is cached for an hour; re-render on the same cadence.
export const revalidate = 3600;

function formatRange(start?: string, end?: string) {
  const fmt = (d?: string) =>
    d
      ? new Date(d).toLocaleString("en-US", { month: "long", year: "numeric" })
      : "";
  const s = fmt(start);
  const e = fmt(end);
  if (s && e && s !== e) return `${s} – ${e}`;
  return s || e;
}

function twelveMonthsAgoIso(): string {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

/** Series card — cover keeps its natural aspect (series art has text). */
function SeriesCard({
  s,
  featured = false,
}: {
  s: SermonSeriesSummary;
  featured?: boolean;
}) {
  return (
    <Link href={`/watch/${s.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-river-800">
        {s.coverImage?.asset ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={urlFor(s.coverImage).width(featured ? 1400 : 800).fit("max").url()}
            alt={s.coverImage.alt ?? s.title}
            className="block h-auto w-full transition duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center font-serif text-6xl italic text-white/20">
            {s.title?.[0] ?? "?"}
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-col gap-1.5">
        <h3
          className={`font-bold tracking-tight transition group-hover:text-brand-300 ${
            featured ? "text-3xl md:text-4xl" : "text-2xl"
          }`}
        >
          {s.title}
        </h3>
        <p className="text-sm text-white/50">
          {formatRange(s.startDate, s.endDate)}
          {s.sermonCount
            ? ` · ${s.sermonCount} part${s.sermonCount === 1 ? "" : "s"}`
            : ""}
        </p>
      </div>
    </Link>
  );
}

export default async function WatchPage() {
  const cutoff = twelveMonthsAgoIso();
  const [feed, series] = await Promise.all([
    getYouTubeFeed(),
    client
      .fetch<SermonSeriesSummary[]>(recentSermonSeriesQuery, { cutoff })
      .then((r) => r ?? [])
      .catch(() => [] as SermonSeriesSummary[]),
  ]);

  const [latest, ...olderMessages] = feed.messages;
  const latestStream = feed.streams[0];
  const current = latest ? seriesSiblings(feed, latest) : [];
  const currentIds = new Set(current.map((v) => v.id));
  const recent = olderMessages.filter((v) => !currentIds.has(v.id)).slice(0, 9);
  const hasFeed = Boolean(latest);

  return (
    <div>
      <PageHero
        variant="dark"
        eyebrow="Teaching"
        headline="Watch"
        intro="A new message every Sunday — watch the latest here, join the full service live at 10:15 AM, or catch up on a series."
      />

      {hasFeed && (
        <>
          {/* ── LATEST MESSAGE ─────────────────────────────────────── */}
          <Section tone="dark" className="pt-8! md:pt-12!">
            <Container>
              <div className="grid items-center gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-14">
                <LiteYouTube id={latest.id} title={latest.rawTitle} thumbnail={latest.thumbnail} />
                <div>
                  <Eyebrow tone="dark">Latest message</Eyebrow>
                  {latest.series && (
                    <p className="mt-5 font-serif text-2xl italic text-white/60">
                      {latest.series}
                      {latest.part ? ` — ${latest.part}` : ""}
                    </p>
                  )}
                  <h2 className="mt-2 text-4xl font-bold leading-[1.02] tracking-tight md:text-5xl">
                    {latest.title}
                  </h2>
                  <p className="mt-4 text-sm text-white/50">
                    {videoMeta(latest, { withSeries: false, withPart: !latest.series })}
                    {latest.duration ? ` · ${latest.duration}` : ""}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button href={`/watch/video/${latest.id}`} tone="dark">
                      Open message
                    </Button>
                    <YouTubeLink href={ytWatchUrl(latest.id)}>Watch on YouTube</YouTubeLink>
                  </div>
                </div>
              </div>
            </Container>
          </Section>

          {/* ── LIVE ───────────────────────────────────────────────── */}
          <section className="bg-river-950 pb-20 text-white md:pb-28">
            <Container>
              <div className="grid gap-10 overflow-hidden rounded-3xl bg-river-900 p-8 md:p-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-14">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">
                    <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60 motion-reduce:animate-none" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                    </span>
                    Live on YouTube
                  </p>
                  <Headline
                    tone="dark"
                    size="md"
                    text="Every Sunday at 10:15."
                    accent="10:15."
                    className="mt-4"
                  />
                  <p className="mt-5 max-w-md text-white/70">
                    Can&rsquo;t make it to Bartlett? Worship with us from wherever you are —
                    the full service streams live, then stays up all week.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button href={YT_LIVE_URL} tone="dark" newTab>
                      Watch live
                    </Button>
                    <YouTubeLink href={YT_SUBSCRIBE_URL}>Subscribe</YouTubeLink>
                  </div>
                </div>
                {latestStream && (
                  <div>
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                      Last Sunday&rsquo;s full service
                    </p>
                    <VideoCard v={latestStream} size="sm" />
                  </div>
                )}
              </div>
            </Container>
          </section>

          {/* ── CURRENT SERIES ─────────────────────────────────────── */}
          {current.length > 1 && latest.series && (
            <Section tone="dark" className="border-t border-white/10">
              <Container>
                <SectionHeader
                  tone="dark"
                  eyebrow="Current series"
                  headline={latest.series}
                  intro={`${current.length} messages so far. Start from the beginning or jump in anywhere.`}
                />
                <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {current.map((v) => (
                    <VideoCard key={v.id} v={v} withSeries={false} />
                  ))}
                </div>
              </Container>
            </Section>
          )}

          {/* ── RECENT MESSAGES ────────────────────────────────────── */}
          {recent.length > 0 && (
            <Section tone="dark" className="border-t border-white/10">
              <Container>
                <SectionHeader
                  tone="dark"
                  eyebrow="Recent messages"
                  headline="Catch up."
                  action={<YouTubeLink href={`${YT_CHANNEL_URL}/videos`}>All videos on YouTube</YouTubeLink>}
                />
                <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {recent.map((v) => (
                    <VideoCard key={v.id} v={v} />
                  ))}
                </div>
              </Container>
            </Section>
          )}
        </>
      )}

      {/* ── SERIES LIBRARY (Sanity) ──────────────────────────────── */}
      <Section tone="dark" className={hasFeed ? "border-t border-white/10" : "pt-8! md:pt-12!"}>
        <Container>
          <header className="mb-12 flex items-baseline justify-between border-b border-white/15 pb-5">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Series <em className="text-brand-300">library</em>
            </h2>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
              Last 12 months
            </span>
          </header>

          {series.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/20 p-10 text-center text-white/60">
              No recent series in Sanity yet.
            </p>
          ) : (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {series.map((s, i) => (
                <SeriesCard key={s.slug} s={s} featured={!hasFeed && i === 0} />
              ))}
            </div>
          )}
        </Container>
      </Section>

      <CtaBand
        headline="Looking for something older?"
        accent="older?"
        body="Browse 15+ years of teaching, organized by year."
      >
        <Button href="/watch/archive" tone="dark">
          Open full archive →
        </Button>
      </CtaBand>
    </div>
  );
}

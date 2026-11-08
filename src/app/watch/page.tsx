import Link from "next/link";
import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { recentSermonSeriesQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { SermonSeriesSummary } from "@/types/sanity";
import { PageHero } from "@/components/page-hero";
import { Button, Container, CtaBand, Section } from "@/components/v2/ui";

export const metadata: Metadata = {
  title: "Watch",
  description:
    "Recent sermon series at River City Church — Bartlett, TN.",
};

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
  let series: SermonSeriesSummary[] = [];
  try {
    series = (await client.fetch<SermonSeriesSummary[]>(
      recentSermonSeriesQuery,
      { cutoff },
    )) ?? [];
  } catch {
    /* empty state */
  }

  const [latest, ...rest] = series;

  return (
    <div>
      <PageHero
        variant="dark"
        eyebrow="Teaching"
        headline="Watch"
        intro="Recent sermon series — pick one to watch on YouTube, share with a friend, or revisit a past message."
      />

      <Section tone="dark" className="pt-8! md:pt-12!">
        <Container>
          <header className="mb-12 flex items-baseline justify-between border-b border-white/15 pb-5">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              <em className="text-brand-300">Recent</em>
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
            <>
              {latest && (
                <div className="mb-16 max-w-5xl">
                  <SeriesCard s={latest} featured />
                </div>
              )}
              {rest.length > 0 && (
                <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((s) => (
                    <SeriesCard key={s.slug} s={s} />
                  ))}
                </div>
              )}
            </>
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

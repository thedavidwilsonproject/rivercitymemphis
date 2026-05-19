import Link from "next/link";
import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { recentSermonSeriesQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { SermonSeriesSummary } from "@/types/sanity";

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

  return (
    <div>
      <section className="bg-brand-600 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-100">
            Teaching
          </p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-tight tracking-wide md:text-7xl">
            Watch
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-brand-50/95">
            Recent sermon series — pick one to watch on YouTube, share with a
            friend, or revisit a past message.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-8 flex items-baseline justify-between border-b border-cream-200 pb-4">
          <h2 className="font-display text-3xl uppercase tracking-wide text-ink-800">
            Recent
          </h2>
          <span className="font-display text-sm uppercase tracking-widest text-ink-500">
            Last 12 months
          </span>
        </header>

        {series.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-300 p-10 text-center text-ink-500">
            No recent series in Sanity yet.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {series.map((s) => (
              <Link
                key={s.slug}
                href={`/watch/${s.slug}`}
                className="group overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm transition hover:shadow-md hover:border-brand-300"
              >
                <div className="w-full bg-cream-100">
                  {s.coverImage?.asset ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={urlFor(s.coverImage).width(800).fit("max").url()}
                      alt={s.coverImage.alt ?? s.title}
                      className="block w-full h-auto transition group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center font-display text-3xl uppercase tracking-wide text-cream-200">
                      {s.title?.[0] ?? "?"}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-xl uppercase tracking-wide text-ink-800 group-hover:text-brand-600">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-xs text-ink-500">
                    {formatRange(s.startDate, s.endDate)}
                    {s.sermonCount
                      ? ` · ${s.sermonCount} part${s.sermonCount === 1 ? "" : "s"}`
                      : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 rounded-2xl border border-cream-200 bg-cream-100 p-8 md:p-10 text-center">
          <h3 className="font-display text-3xl uppercase tracking-wide text-ink-800">
            Looking for something older?
          </h3>
          <p className="mt-2 text-ink-600">
            Browse 15+ years of teaching, organized by year.
          </p>
          <Link
            href="/watch/archive"
            className="mt-5 inline-block rounded-full bg-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
          >
            Open full archive →
          </Link>
        </div>
      </div>
    </div>
  );
}

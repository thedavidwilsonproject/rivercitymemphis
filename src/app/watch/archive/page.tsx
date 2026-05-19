import Link from "next/link";
import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { sermonArchiveYearsQuery } from "@/sanity/queries";

export const metadata: Metadata = {
  title: "Sermon Archive",
  description:
    "Browse the full sermon archive at River City Church — every series, every year.",
};

type YearRow = { year: string };

export default async function ArchiveIndexPage() {
  let years: YearRow[] = [];
  try {
    years = (await client.fetch<YearRow[]>(sermonArchiveYearsQuery)) ?? [];
  } catch {
    /* empty */
  }

  // Group by year and count.
  const byYear = new Map<string, number>();
  for (const y of years) {
    if (!y.year) continue;
    byYear.set(y.year, (byYear.get(y.year) ?? 0) + 1);
  }
  const sorted = [...byYear.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
  const totalSeries = years.length;
  const range =
    sorted.length > 0 ? `${sorted[sorted.length - 1][0]}–${sorted[0][0]}` : "";

  return (
    <div>
      <section className="bg-ink-900 text-white">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-300">
            Watch
          </p>
          <h1 className="mt-2 font-display text-5xl uppercase tracking-wide md:text-6xl">
            Sermon Archive
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-cream-50/90">
            {totalSeries > 0
              ? `${totalSeries} series across ${sorted.length} years (${range}).`
              : "Browse the full sermon archive."}
          </p>
          <Link
            href="/watch"
            className="mt-6 inline-block font-display text-sm uppercase tracking-widest text-brand-300 hover:text-brand-200"
          >
            ← Recent series
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-16">
        {sorted.length === 0 && (
          <p className="rounded-xl border border-dashed border-ink-300 p-10 text-center text-ink-500">
            Archive is empty. Run the full migration to populate.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sorted.map(([year, count]) => (
            <Link
              key={year}
              href={`/watch/archive/${year}`}
              className="group rounded-2xl border border-cream-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-sm"
            >
              <div className="font-display text-5xl tracking-wide text-ink-800 group-hover:text-brand-600">
                {year}
              </div>
              <div className="mt-2 font-display text-sm uppercase tracking-widest text-ink-500">
                {count} series
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

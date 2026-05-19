import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import {
  sermonArchiveYearsQuery,
  sermonSeriesByYearQuery,
} from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { SermonSeriesSummary } from "@/types/sanity";

type Params = { year: string };

export async function generateStaticParams() {
  try {
    const rows = await client.fetch<{ year: string }[]>(sermonArchiveYearsQuery);
    const seen = new Set<string>();
    return (rows ?? [])
      .map((r) => r.year)
      .filter((y) => y && !seen.has(y) && (seen.add(y), true))
      .map((year) => ({ year }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year} Sermon Archive`,
    description: `Every sermon series River City Church taught in ${year}.`,
  };
}

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

export default async function ArchiveYearPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { year } = await params;
  if (!/^\d{4}$/.test(year)) notFound();

  let series: SermonSeriesSummary[] = [];
  try {
    series = (await client.fetch<SermonSeriesSummary[]>(
      sermonSeriesByYearQuery,
      { year },
    )) ?? [];
  } catch {
    /* empty */
  }
  if (series.length === 0) notFound();

  const totalSermons = series.reduce(
    (n, s) => n + (s.sermonCount ?? 0),
    0,
  );

  return (
    <div>
      <section className="bg-ink-900 text-white">
        <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">
          <Link
            href="/watch/archive"
            className="font-display text-sm uppercase tracking-widest text-brand-300 hover:text-brand-200"
          >
            ← All years
          </Link>
          <h1 className="mt-3 font-display text-6xl uppercase tracking-wide md:text-7xl">
            {year}
          </h1>
          <p className="mt-2 text-cream-50/80">
            {series.length} series · {totalSermons} sermon{totalSermons === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
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
      </div>
    </div>
  );
}

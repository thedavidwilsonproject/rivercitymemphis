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
import { Button, Container, CtaBand, Section } from "@/components/v2/ui";

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
      <section className="bg-river-950 text-white">
        <Container className="pb-12 pt-20 md:pb-16 md:pt-28">
          <Link
            href="/watch/archive"
            className="text-sm font-semibold text-brand-300 transition hover:text-brand-200"
          >
            ← All years
          </Link>
          <h1 className="rise mt-6 font-serif text-[7rem] italic leading-[0.85] text-white md:text-[12rem]">
            {year}
          </h1>
          <p className="rise rise-2 mt-8 border-t border-white/15 pt-6 text-lg text-white/70">
            {series.length} series · {totalSermons} sermon{totalSermons === 1 ? "" : "s"}
          </p>
        </Container>
      </section>

      <Section tone="dark" className="pt-4! md:pt-8!">
        <Container>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {series.map((s) => (
              <Link key={s.slug} href={`/watch/${s.slug}`} className="group block">
                <div className="overflow-hidden rounded-2xl bg-river-800">
                  {s.coverImage?.asset ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={urlFor(s.coverImage).width(800).fit("max").url()}
                      alt={s.coverImage.alt ?? s.title}
                      className="block h-auto w-full transition duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center font-serif text-6xl italic text-white/20">
                      {s.title?.[0] ?? "?"}
                    </div>
                  )}
                </div>
                <h3 className="mt-5 text-2xl font-bold tracking-tight transition group-hover:text-brand-300">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-white/50">
                  {formatRange(s.startDate, s.endDate)}
                  {s.sermonCount
                    ? ` · ${s.sermonCount} part${s.sermonCount === 1 ? "" : "s"}`
                    : ""}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand headline="Sermon Archive" accent="Archive">
        <Button href="/watch/archive" tone="dark">
          ← All years
        </Button>
        <Button href="/watch" tone="dark" variant="outline">
          ← Recent series
        </Button>
      </CtaBand>
    </div>
  );
}

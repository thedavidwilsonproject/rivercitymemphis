import Link from "next/link";
import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { sermonArchiveYearsQuery } from "@/sanity/queries";
import { PageHero } from "@/components/page-hero";
import { Button, Container, CtaBand, Section } from "@/components/v2/ui";

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
      <PageHero
        variant="dark"
        eyebrow="Watch"
        headline="Sermon Archive"
        backlink={{ label: "Recent series", href: "/watch" }}
        intro={
          totalSeries > 0
            ? `${totalSeries} series across ${sorted.length} years (${range}).`
            : "Browse the full sermon archive."
        }
      />

      <Section tone="dark" className="pt-8! md:pt-12!">
        <Container>
          {sorted.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/20 p-10 text-center text-white/60">
              Archive is empty. Run the full migration to populate.
            </p>
          )}

          <ul className="border-t border-white/15">
            {sorted.map(([year, count]) => (
              <li key={year} className="border-b border-white/15">
                <Link
                  href={`/watch/archive/${year}`}
                  className="group flex items-baseline justify-between gap-6 py-6 md:py-8"
                >
                  <span className="text-6xl font-bold tracking-tight transition group-hover:translate-x-2 group-hover:text-brand-300 md:text-8xl">
                    {year}
                  </span>
                  <span className="flex items-baseline gap-4 text-white/55 transition group-hover:text-white">
                    <span className="font-serif text-2xl italic md:text-3xl">
                      {count} series
                    </span>
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBand
        headline="Recent series"
        body="Recent sermon series — pick one to watch on YouTube, share with a friend, or revisit a past message."
      >
        <Button href="/watch" tone="dark">
          Watch
        </Button>
      </CtaBand>
    </div>
  );
}

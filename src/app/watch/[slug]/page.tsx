import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/client";
import {
  sermonSeriesBySlugQuery,
  sermonSeriesIndexQuery,
} from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL } from "@/lib/site";
import type { SermonSeries, Sermon, SermonSeriesSummary } from "@/types/sanity";
import { Button, Container, CtaBand, Eyebrow, Headline, Section } from "@/components/v2/ui";

function sermonEmbedUrl(s: Sermon): string | undefined {
  if (!s.videoPlatform || !s.videoId) return undefined;
  return s.videoPlatform === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${s.videoId}`
    : `https://player.vimeo.com/video/${s.videoId}`;
}

function sermonContentUrl(s: Sermon): string | undefined {
  if (!s.videoPlatform || !s.videoId) return undefined;
  return s.videoPlatform === "youtube"
    ? `https://www.youtube.com/watch?v=${s.videoId}`
    : `https://vimeo.com/${s.videoId}`;
}

type Params = { slug: string };

export async function generateStaticParams() {
  try {
    const all = await client.fetch<SermonSeriesSummary[]>(sermonSeriesIndexQuery);
    return (all ?? []).map((s) => ({ slug: s.slug! }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const s = await client.fetch<SermonSeries | null>(sermonSeriesBySlugQuery, { slug });
    if (!s) return {};
    return {
      title: `${s.title} — Watch`,
      description: typeof s.description === "string" ? s.description : undefined,
      openGraph: s.coverImage?.asset
        ? { images: [urlFor(s.coverImage).width(1200).height(630).url()] }
        : undefined,
    };
  } catch {
    return {};
  }
}

function VideoEmbed({ sermon }: { sermon: Sermon }) {
  const { videoPlatform, videoId } = sermon;
  if (!videoPlatform || !videoId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-white/20 text-sm text-white/50">
        No video available
      </div>
    );
  }
  const src =
    videoPlatform === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : `https://player.vimeo.com/video/${videoId}`;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/40">
      <iframe
        src={src}
        title={sermon.title ?? "Sermon video"}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
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

function formatSermonDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  let series: SermonSeries | null = null;
  try {
    series = await client.fetch<SermonSeries | null>(sermonSeriesBySlugQuery, { slug });
  } catch {
    series = null;
  }
  if (!series) notFound();

  const sermons = series.sermons ?? [];

  const seriesUrl = `${SITE_URL}/watch/${slug}`;
  const thumb = series.coverImage?.asset
    ? urlFor(series.coverImage).width(1280).height(720).fit("crop").url()
    : undefined;

  const videoList = sermons
    .map((s, i) => {
      const embed = sermonEmbedUrl(s);
      const content = sermonContentUrl(s);
      if (!embed) return null;
      return {
        "@type": "ListItem",
        position: (s.order ?? i) + 1,
        item: {
          "@type": "VideoObject",
          name: s.title || `${series.title} — Part ${(s.order ?? i) + 1}`,
          description:
            s.summary ||
            (s.scripture
              ? `${series.title} — ${s.scripture}`
              : `Sermon from the ${series.title} series at River City Church.`),
          uploadDate: s.date,
          embedUrl: embed,
          contentUrl: content,
          thumbnailUrl: thumb,
          publisher: { "@id": `${SITE_URL}#church` },
          isPartOf: { "@id": `${seriesUrl}#series` },
        },
      };
    })
    .filter(Boolean);

  const seriesJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWorkSeries",
      "@id": `${seriesUrl}#series`,
      name: series.title,
      url: seriesUrl,
      image: thumb,
      startDate: series.startDate,
      endDate: series.endDate,
      publisher: { "@id": `${SITE_URL}#church` },
      numberOfEpisodes: sermons.length,
    },
    ...(videoList.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${seriesUrl}#sermons`,
            itemListElement: videoList,
          },
        ]
      : []),
  ];

  return (
    <div>
      <JsonLd data={seriesJsonLd} />
      <section className="bg-river-950 text-white">
        <Container className="pb-16 pt-16 md:pb-24 md:pt-24">
          <Link
            href="/watch"
            className="text-sm font-semibold text-brand-300 transition hover:text-brand-200"
          >
            ← Back to archive
          </Link>
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_1fr] lg:gap-20">
            {series.coverImage?.asset && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urlFor(series.coverImage).width(1200).fit("max").url()}
                alt={series.coverImage.alt ?? series.title}
                className="rise block h-auto w-full rounded-2xl shadow-2xl shadow-black/50"
              />
            )}
            <div className="rise rise-2">
              <Eyebrow tone="dark">
                {formatRange(series.startDate, series.endDate)}
              </Eyebrow>
              <Headline
                as="h1"
                tone="dark"
                size="lg"
                text={series.title}
                className="mt-5"
              />
              {series.description !== undefined &&
                series.description !== null &&
                Array.isArray(series.description) &&
                series.description.length > 0 && (
                  <div className="mt-8 max-w-xl space-y-4 border-t border-white/15 pt-8 text-lg leading-8 text-white/75">
                    <PortableText
                      value={
                        series.description as Parameters<
                          typeof PortableText
                        >[0]["value"]
                      }
                    />
                  </div>
                )}
            </div>
          </div>
        </Container>
      </section>

      <Section tone="dark" className="border-t border-white/10 bg-river-900!">
        <Container narrow>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {sermons.length}{" "}
            <em className="text-brand-300">
              sermon{sermons.length === 1 ? "" : "s"}
            </em>
          </h2>

          <div className="mt-14 space-y-20">
            {sermons.map((sermon, i) => (
              <article
                key={`${sermon.order ?? i}-${sermon.title}`}
                className="grid gap-6 border-t border-white/15 pt-10 md:grid-cols-[7rem_1fr] md:gap-10"
              >
                <p className="font-serif text-6xl italic leading-none text-brand-300 md:text-7xl">
                  {String(sermon.order ?? i + 1).padStart(2, "0")}
                </p>
                <div>
                  <header className="mb-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                      Part {sermon.order ?? i + 1}
                      {sermon.date ? ` · ${formatSermonDate(sermon.date)}` : ""}
                    </p>
                    <h3 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                      {sermon.title}
                    </h3>
                    {(sermon.speaker?.name || sermon.speakerName) && (
                      <p className="mt-2 text-white/70">
                        {sermon.speaker?.name ?? sermon.speakerName}
                        {sermon.speaker?.role && (
                          <span className="text-white/40"> · {sermon.speaker.role}</span>
                        )}
                      </p>
                    )}
                    {sermon.scripture && (
                      <p className="mt-1 font-serif text-xl italic text-brand-300">
                        {sermon.scripture}
                      </p>
                    )}
                  </header>

                  <VideoEmbed sermon={sermon} />

                  {sermon.summary && (
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                      {sermon.summary}
                    </p>
                  )}

                  {sermon.audioUrl && (
                    <a
                      href={sermon.audioUrl}
                      className="mt-5 inline-block text-sm font-semibold text-white underline decoration-brand-300 decoration-2 underline-offset-[6px] hover:text-brand-200"
                    >
                      Download audio →
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
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
        <Button href="/watch" tone="dark" variant="outline">
          ← Back to archive
        </Button>
      </CtaBand>
    </div>
  );
}

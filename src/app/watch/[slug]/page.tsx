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
      <div className="aspect-video w-full rounded-lg bg-cream-100 flex items-center justify-center text-sm text-ink-500">
        No video available
      </div>
    );
  }
  const src =
    videoPlatform === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : `https://player.vimeo.com/video/${videoId}`;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
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
      <section className="relative bg-ink-900 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-[420px_1fr] md:py-24">
          {series.coverImage?.asset && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={urlFor(series.coverImage).width(840).fit("max").url()}
              alt={series.coverImage.alt ?? series.title}
              className="block w-full h-auto rounded-xl shadow-2xl"
            />
          )}
          <div>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-300">
              {formatRange(series.startDate, series.endDate)}
            </p>
            <h1 className="mt-2 font-display text-5xl uppercase leading-tight tracking-wide md:text-6xl">
              {series.title}
            </h1>
            {series.description !== undefined &&
              series.description !== null &&
              Array.isArray(series.description) &&
              series.description.length > 0 && (
                <div className="mt-4 max-w-2xl text-lg leading-7 text-cream-50/90">
                  <PortableText
                    value={
                      series.description as Parameters<
                        typeof PortableText
                      >[0]["value"]
                    }
                  />
                </div>
              )}
            <Link
              href="/watch"
              className="mt-6 inline-block font-display text-sm uppercase tracking-widest text-brand-300 hover:text-brand-200"
            >
              ← Back to archive
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="font-display text-3xl uppercase tracking-wide text-ink-800">
          {sermons.length} sermon{sermons.length === 1 ? "" : "s"}
        </h2>

        <div className="mt-8 space-y-12">
          {sermons.map((sermon, i) => (
            <article
              key={`${sermon.order ?? i}-${sermon.title}`}
              className="border-b border-cream-200 pb-12 last:border-b-0"
            >
              <header className="mb-4">
                <p className="font-display text-xs uppercase tracking-widest text-brand-600">
                  Part {sermon.order ?? i + 1}
                  {sermon.date ? ` · ${formatSermonDate(sermon.date)}` : ""}
                </p>
                <h3 className="mt-1 font-display text-3xl uppercase tracking-wide text-ink-800">
                  {sermon.title}
                </h3>
                {(sermon.speaker?.name || sermon.speakerName) && (
                  <p className="mt-1 text-sm text-ink-500">
                    {sermon.speaker?.name ?? sermon.speakerName}
                    {sermon.speaker?.role && (
                      <span className="text-ink-300"> · {sermon.speaker.role}</span>
                    )}
                  </p>
                )}
                {sermon.scripture && (
                  <p className="mt-1 font-display text-sm uppercase tracking-widest text-ink-500">
                    {sermon.scripture}
                  </p>
                )}
              </header>

              <VideoEmbed sermon={sermon} />

              {sermon.summary && (
                <p className="mt-4 text-ink-700 leading-7">{sermon.summary}</p>
              )}

              {sermon.audioUrl && (
                <a
                  href={sermon.audioUrl}
                  className="mt-3 inline-block font-display text-xs uppercase tracking-widest text-brand-600 hover:text-brand-700"
                >
                  Download audio →
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

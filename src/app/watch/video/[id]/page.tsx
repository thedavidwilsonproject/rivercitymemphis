import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL } from "@/lib/site";
import { LiteYouTube } from "@/components/v2/lite-youtube";
import { VideoCard, YouTubeLink, videoMeta } from "@/components/v2/video";
import { Button, Container, CtaBand, Section, SectionHeader } from "@/components/v2/ui";
import {
  getVideo,
  getYouTubeFeed,
  seriesSiblings,
  ytEmbedUrl,
  ytWatchUrl,
  YT_SUBSCRIBE_URL,
} from "@/lib/youtube";

export const revalidate = 3600;

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const v = await getVideo(id);
  if (!v) return { title: "Watch" };
  const title = v.series ? `${v.title} — ${v.series}` : v.title;
  return {
    title,
    description: `Watch “${v.rawTitle}” from River City Church in Bartlett, TN.`,
    openGraph: { images: [v.thumbnail], type: "video.other" },
  };
}

export default async function VideoPage({ params }: Params) {
  const { id } = await params;
  const [v, feed] = await Promise.all([getVideo(id), getYouTubeFeed()]);
  if (!v) notFound();

  const siblings = seriesSiblings(feed, v);
  const pool = v.kind === "stream" ? feed.streams : feed.messages;
  const more = (siblings.length > 1 ? siblings : pool.slice(0, 7)).filter((x) => x.id !== v.id).slice(0, 6);

  return (
    <div className="bg-river-950 text-white">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: v.rawTitle,
          thumbnailUrl: v.thumbnail,
          embedUrl: ytEmbedUrl(v.id),
          contentUrl: ytWatchUrl(v.id),
          ...(v.publishedAt ? { uploadDate: v.publishedAt } : {}),
          publisher: { "@type": "Organization", name: "River City Church", url: SITE_URL },
        }}
      />

      <Container className="pb-16 pt-10 md:pb-24 md:pt-14">
        <Link
          href="/watch"
          className="-my-2 inline-block py-2 text-sm font-semibold text-brand-300 transition hover:opacity-80"
        >
          ← All messages
        </Link>

        <div className="mt-8">
          <LiteYouTube id={v.id} title={v.rawTitle} thumbnail={v.thumbnail} autoload />
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-4xl">
            {v.series && (
              <p className="font-serif text-2xl italic text-white/60">
                {v.series}
                {v.part && !v.title.includes(v.part) ? ` — ${v.part}` : ""}
              </p>
            )}
            <h1 className="mt-2 text-4xl font-bold leading-[1.02] tracking-tight md:text-6xl">
              {v.title}
            </h1>
            <p className="mt-4 text-sm text-white/50">
              {v.kind === "stream" ? "Full service · " : ""}
              {videoMeta(v, { withSeries: false, withPart: !v.series })}
              {v.duration ? ` · ${v.duration}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <YouTubeLink href={ytWatchUrl(v.id)}>Open on YouTube</YouTubeLink>
            <YouTubeLink href={YT_SUBSCRIBE_URL}>Subscribe</YouTubeLink>
          </div>
        </div>
      </Container>

      {more.length > 0 && (
        <Section tone="dark" className="border-t border-white/10">
          <Container>
            <SectionHeader
              tone="dark"
              eyebrow={siblings.length > 1 ? "In this series" : "Keep watching"}
              headline={siblings.length > 1 && v.series ? v.series : "More messages."}
            />
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((x) => (
                <VideoCard key={x.id} v={x} withSeries={siblings.length <= 1} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CtaBand
        headline="Come be in the room."
        accent="room."
        body="Sundays at 10:15 AM in Bartlett. Coffee's on 15 minutes before."
      >
        <Button href="/visit/what-to-expect" tone="dark">
          Plan a Visit
        </Button>
      </CtaBand>
    </div>
  );
}

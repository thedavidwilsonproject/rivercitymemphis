/**
 * YouTube feed for the River City 901 channel (@RiverCity901).
 *
 * Two sources, tried in order:
 *   1. YouTube Data API v3 — used when YOUTUBE_API_KEY is set. Stable,
 *      exact publish dates, and the recommended setup for production.
 *   2. The public channel pages (/videos and /streams) — parsed from the
 *      `ytInitialData` blob YouTube embeds in the HTML. No key needed,
 *      but it's an unofficial format YouTube can change at any time.
 *
 * Results are cached for an hour. Every caller must handle an empty
 * result (pages fall back to the Sanity sermon series).
 */
import { unstable_cache } from "next/cache";

export const YT_CHANNEL_ID = "UCgAqlqa0eczLhe_PE38MsTg";
export const YT_HANDLE = "@RiverCity901";
export const YT_CHANNEL_URL = `https://www.youtube.com/${YT_HANDLE}`;
export const YT_LIVE_URL = `${YT_CHANNEL_URL}/live`;
export const YT_SUBSCRIBE_URL = `${YT_CHANNEL_URL}?sub_confirmation=1`;
/** Uploads playlist id = channel id with the UC prefix swapped for UU. */
const UPLOADS_PLAYLIST = "UU" + YT_CHANNEL_ID.slice(2);

const REVALIDATE_SECONDS = 3600;

export type YtVideo = {
  id: string;
  /** Raw title as published on YouTube. */
  rawTitle: string;
  /** Message title with series / speaker stripped, e.g. "Ready to Serve". */
  title: string;
  /** Series name parsed from "Series, Part 3: Title", if present. */
  series?: string;
  /** "Part 3", "Part Two", "Week 4"… */
  part?: string;
  speaker?: string;
  /** ISO date — only available from the Data API. */
  publishedAt?: string;
  /** Human label, e.g. "6 days ago". */
  publishedLabel?: string;
  /** "25:21" */
  duration?: string;
  thumbnail: string;
  /** Edited sermon upload vs. full-service livestream. */
  kind: "message" | "stream";
};

export type YtFeed = {
  messages: YtVideo[];
  streams: YtVideo[];
  source: "api" | "channel-page" | "none";
};

export const ytWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const ytEmbedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
export const ytThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hq720.jpg`;
export const isYtId = (id: string) => /^[A-Za-z0-9_-]{11}$/.test(id);

// -----------------------------------------------------------------------------
// Title parsing
// -----------------------------------------------------------------------------

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();

/**
 * Pull series / part / speaker out of RCC's title conventions:
 *   "Rhythms of Grace, Part 3: Ready to Serve"
 *   "Rhythms of Grace: Part 4"            (livestream)
 *   "It's Worth It, Week 4"               (livestream)
 *   "Remember | Jonathan Dunn"
 *   "Thanks, Mom by Eddie Davis"
 */
export function parseTitle(raw: string): Pick<YtVideo, "title" | "series" | "part" | "speaker"> {
  let t = decode(raw);
  let speaker: string | undefined;

  const pipe = t.match(/^(.*?)\s*\|\s*(.+)$/);
  if (pipe) {
    t = pipe[1];
    speaker = pipe[2];
  } else {
    const by = t.match(/^(.*\S)\s+by\s+([A-Z][\w.'-]+(?:\s+[A-Z][\w.'-]+){0,2})$/);
    if (by) {
      t = by[1];
      speaker = by[2];
    }
  }

  const part = "(?:Part|Week)\\s+[\\w-]+";
  // "Series, Part 3: Title"
  let m = t.match(new RegExp(`^(.+?)[,:]?\\s+(${part})\\s*:\\s*(.+)$`, "i"));
  if (m) return { series: m[1].trim(), part: m[2].trim(), title: m[3].trim(), speaker };
  // "Series: Part 4" / "Series, Week 4" / "Series Part 2"
  m = t.match(new RegExp(`^(.+?)[,:]?\\s+(${part})$`, "i"));
  if (m) return { series: m[1].trim(), part: m[2].trim(), title: `${m[1].trim()}, ${m[2].trim()}`, speaker };

  return { title: t, speaker };
}

function build(
  id: string,
  rawTitle: string,
  kind: YtVideo["kind"],
  extra: Partial<YtVideo> = {},
): YtVideo {
  return {
    id,
    rawTitle: decode(rawTitle),
    ...parseTitle(rawTitle),
    thumbnail: ytThumb(id),
    kind,
    ...extra,
  };
}

/** "6d ago" → "6 days ago", "Streamed 9h ago" → "9 hours ago". */
function expandRelative(label?: string): string | undefined {
  if (!label) return undefined;
  const m = label.replace(/^Streamed\s+/i, "").match(/^(\d+)\s*(mo|y|w|d|h|m|s)\w*\s+ago$/i);
  if (!m) return label.replace(/^Streamed\s+/i, "");
  const n = Number(m[1]);
  const unit = {
    mo: "month",
    y: "year",
    w: "week",
    d: "day",
    h: "hour",
    m: "minute",
    s: "second",
  }[m[2].toLowerCase() as "mo"]!;
  return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
}

export function formatPublished(v: YtVideo): string | undefined {
  if (v.publishedAt) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/Chicago",
    }).format(new Date(v.publishedAt));
  }
  return v.publishedLabel;
}

// -----------------------------------------------------------------------------
// Source 1: Data API
// -----------------------------------------------------------------------------

function isoDuration(iso?: string): string | undefined {
  const m = iso?.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return undefined;
  const [h, mi, s] = [Number(m[1] ?? 0), Number(m[2] ?? 0), Number(m[3] ?? 0)];
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(mi)}:${pad(s)}` : `${mi}:${pad(s)}`;
}

async function fromApi(key: string): Promise<YtFeed> {
  const list = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${UPLOADS_PLAYLIST}&key=${key}`,
    { cache: "no-store" },
  ).then((r) => {
    if (!r.ok) throw new Error(`YouTube API ${r.status}`);
    return r.json();
  });
  type Item = { snippet: { title: string; publishedAt: string; resourceId: { videoId: string } } };
  const items = (list.items ?? []) as Item[];
  const ids = items.map((i) => i.snippet.resourceId.videoId);

  const details = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,liveStreamingDetails,status&id=${ids.join(",")}&key=${key}`,
    { cache: "no-store" },
  ).then((r) => (r.ok ? r.json() : { items: [] }));
  type Detail = {
    id: string;
    contentDetails?: { duration?: string };
    liveStreamingDetails?: { actualStartTime?: string };
    status?: { privacyStatus?: string };
  };
  const byId = new Map<string, Detail>(
    ((details.items ?? []) as Detail[]).map((d) => [d.id, d]),
  );

  const messages: YtVideo[] = [];
  const streams: YtVideo[] = [];
  for (const i of items) {
    const id = i.snippet.resourceId.videoId;
    const d = byId.get(id);
    if (d?.status?.privacyStatus && d.status.privacyStatus !== "public") continue;
    const isStream = Boolean(d?.liveStreamingDetails);
    const v = build(id, i.snippet.title, isStream ? "stream" : "message", {
      publishedAt: d?.liveStreamingDetails?.actualStartTime ?? i.snippet.publishedAt,
      duration: isoDuration(d?.contentDetails?.duration),
    });
    (isStream ? streams : messages).push(v);
  }
  return { messages, streams, source: "api" };
}

// -----------------------------------------------------------------------------
// Source 2: public channel pages
// -----------------------------------------------------------------------------

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

function collect(node: Json, out: Record<string, unknown>[]): void {
  if (Array.isArray(node)) {
    for (const n of node) collect(n as Json, out);
  } else if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    if (o.lockupViewModel) out.push(o.lockupViewModel as Record<string, unknown>);
    else if (o.videoRenderer) out.push({ __legacy: o.videoRenderer });
    for (const v of Object.values(o)) collect(v as Json, out);
  }
}

// Narrow, defensive accessor for deeply nested optional JSON.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dig = (o: any, ...path: (string | number)[]): any =>
  path.reduce((acc, k) => (acc == null ? acc : acc[k]), o);

async function fromChannelTab(tab: "videos" | "streams"): Promise<YtVideo[]> {
  const res = await fetch(`${YT_CHANNEL_URL}/${tab}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      // Skip the EU consent interstitial if a request lands there.
      Cookie: "CONSENT=YES+1; SOCS=CAI",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`YouTube ${tab} page ${res.status}`);
  const html = await res.text();
  const m = html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/);
  if (!m) throw new Error(`YouTube ${tab} page: no ytInitialData`);

  const nodes: Record<string, unknown>[] = [];
  collect(JSON.parse(m[1]) as Json, nodes);

  const kind = tab === "streams" ? "stream" : "message";
  const seen = new Set<string>();
  const out: YtVideo[] = [];
  for (const n of nodes) {
    let id: string | undefined;
    let title: string | undefined;
    let when: string | undefined;
    let duration: string | undefined;
    if (n.__legacy) {
      const v = n.__legacy;
      id = dig(v, "videoId");
      title = dig(v, "title", "runs", 0, "text");
      when = dig(v, "publishedTimeText", "simpleText");
      duration = dig(v, "lengthText", "simpleText");
    } else {
      if (dig(n, "contentType") && dig(n, "contentType") !== "LOCKUP_CONTENT_TYPE_VIDEO") continue;
      id = dig(n, "contentId");
      const md = dig(n, "metadata", "lockupMetadataViewModel");
      title = dig(md, "title", "content");
      const parts: string[] = (
        (dig(md, "metadata", "contentMetadataViewModel", "metadataRows") ?? []) as unknown[]
      )
        .flatMap((r) => (dig(r, "metadataParts") ?? []) as unknown[])
        .map((p) => dig(p, "text", "content"))
        .filter((s): s is string => typeof s === "string");
      when = parts.find((p) => /ago$/i.test(p));
      const overlays = (dig(n, "contentImage", "thumbnailViewModel", "overlays") ?? []) as unknown[];
      for (const o of overlays) {
        const badges = (dig(o, "thumbnailBottomOverlayViewModel", "badges") ?? []) as unknown[];
        const text = badges.map((b) => dig(b, "thumbnailBadgeViewModel", "text")).find(Boolean);
        if (typeof text === "string" && /^\d+(:\d{2})+$/.test(text)) duration = text;
      }
    }
    if (!id || !title || !isYtId(id) || seen.has(id)) continue;
    // Skip upcoming / currently-live placeholders with no "ago" label.
    if (kind === "stream" && !when) continue;
    seen.add(id);
    out.push(build(id, title, kind, { publishedLabel: expandRelative(when), duration }));
  }
  return out;
}

async function fromChannelPages(): Promise<YtFeed> {
  const [messages, streams] = await Promise.all([
    fromChannelTab("videos"),
    fromChannelTab("streams").catch(() => [] as YtVideo[]),
  ]);
  return { messages, streams, source: "channel-page" };
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

const loadFeed = unstable_cache(
  async (): Promise<YtFeed> => {
    const key = process.env.YOUTUBE_API_KEY;
    if (key) {
      try {
        return await fromApi(key);
      } catch (e) {
        console.error("YouTube API failed, falling back to channel page:", e);
      }
    }
    try {
      return await fromChannelPages();
    } catch (e) {
      console.error("YouTube channel page failed:", e);
      return { messages: [], streams: [], source: "none" };
    }
  },
  ["rcc-youtube-feed-v2"],
  { revalidate: REVALIDATE_SECONDS, tags: ["youtube"] },
);

export async function getYouTubeFeed(): Promise<YtFeed> {
  try {
    return await loadFeed();
  } catch {
    return { messages: [], streams: [], source: "none" };
  }
}

/** All messages in the same series as `v`, oldest part first. */
export function seriesSiblings(feed: YtFeed, v: YtVideo): YtVideo[] {
  if (!v.series) return [];
  const key = v.series.toLowerCase();
  const pool = v.kind === "stream" ? feed.streams : feed.messages;
  return pool.filter((x) => x.series?.toLowerCase() === key).reverse();
}

/**
 * Look up a single video. Prefers the cached feed; otherwise verifies via
 * oEmbed that the id belongs to the RCC channel (so /watch/video/<anything>
 * can't render someone else's video on the church site).
 */
export async function getVideo(id: string): Promise<YtVideo | null> {
  if (!isYtId(id)) return null;
  const feed = await getYouTubeFeed();
  const hit = [...feed.messages, ...feed.streams].find((v) => v.id === id);
  if (hit) return hit;
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(ytWatchUrl(id))}`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!res.ok) return null;
    const o = (await res.json()) as { title?: string; author_url?: string };
    if (!o.title || !o.author_url?.toLowerCase().endsWith(YT_HANDLE.toLowerCase())) return null;
    return build(id, o.title, "message");
  } catch {
    return null;
  }
}

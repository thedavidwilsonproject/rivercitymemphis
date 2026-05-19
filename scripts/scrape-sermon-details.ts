/**
 * Enrich migration-data/sermon-series.json with sermon-level detail.
 *
 * For each scraped series, fetches the /watch/<slug> detail page and extracts:
 *   - series description (HTML/text)
 *   - sermons[]: title, date, speaker, video platform + id + URL, thumbnail
 *
 * Strategy:
 *   The series detail page lists every part of the series in <ul.node-series-list>.
 *   The thumbnail URL contains the platform + video ID:
 *     /video_embed_field_thumbnails/youtube/<id>.jpg
 *     /video_embed_field_thumbnails/vimeo/<id>.jpg
 *   So we don't need to fetch each individual sermon page.
 *
 * Run: npm run scrape:sermons
 *
 * Idempotent — overwrites migration-data/sermon-series.json with enriched data.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import * as cheerio from "cheerio";

const SITE = "https://rivercitymemphis.org";
const OUT = "migration-data";
const IMG_DIR = join(OUT, "images");
const DELAY_MS = 150; // be polite

type ImgRef = { url: string; localPath: string; alt?: string };

type Sermon = {
  order?: number;
  title: string;
  detailHref: string;
  date?: string;          // YYYY-MM-DD when parseable
  dateText?: string;      // original e.g. "May 10th, 2026"
  speaker?: string;
  summary?: string;
  videoPlatform?: "youtube" | "vimeo";
  videoId?: string;
  videoUrl?: string;
  audioUrl?: string;
  thumbnail?: ImgRef | null;
};

type Series = {
  title: string;
  slug: string;
  href: string;
  dateText?: string;
  coverImage?: ImgRef | null;
  // newly added below
  description?: string;       // plain text
  descriptionHtml?: string;
  sermons?: Sermon[];
};

const imageRegistry = new Map<string, string>();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(path: string): Promise<cheerio.CheerioAPI | null> {
  const url = path.startsWith("http") ? path : `${SITE}${path}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (rivercity-sermon-scrape)" },
    redirect: "follow",
  });
  if (!res.ok) {
    console.warn(`  ✗ ${res.status} ${url}`);
    return null;
  }
  return cheerio.load(await res.text());
}

async function downloadImage(rawUrl: string, alt?: string): Promise<ImgRef | null> {
  if (!rawUrl) return null;
  const url = rawUrl.startsWith("http") ? rawUrl : `${SITE}${rawUrl}`;
  if (imageRegistry.has(url)) {
    return { url, localPath: imageRegistry.get(url)!, alt };
  }
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const hash = createHash("sha1").update(url).digest("hex").slice(0, 12);
    const extMatch = url.split("?")[0].match(/\.(jpe?g|png|gif|webp|svg)$/i);
    const ext = (extMatch?.[1] ?? "jpg").toLowerCase();
    const filename = `${hash}.${ext}`;
    const localPath = join(IMG_DIR, filename);
    await writeFile(localPath, buf);
    imageRegistry.set(url, localPath);
    return { url, localPath, alt };
  } catch {
    return null;
  }
}

/** "May 10th, 2026" → "2026-05-10". Falls back to undefined. */
function parseSermonDate(s?: string): string | undefined {
  if (!s) return;
  const m = s.match(/(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/);
  if (!m) return;
  const months: Record<string, number> = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  };
  const month = months[m[1]];
  const day = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  if (month === undefined || !day || !year) return;
  const d = new Date(Date.UTC(year, month, day));
  return d.toISOString().slice(0, 10);
}

/** Pull platform + video ID from a thumbnail URL. */
function parseVideoFromThumbnail(url?: string): {
  platform?: "youtube" | "vimeo";
  id?: string;
} {
  if (!url) return {};
  const m = url.match(/video_embed_field_thumbnails\/(youtube|vimeo)\/([^.]+)/);
  if (!m) return {};
  return { platform: m[1] as "youtube" | "vimeo", id: m[2] };
}

function videoUrl(platform?: string, id?: string): string | undefined {
  if (!platform || !id) return;
  if (platform === "youtube") return `https://www.youtube.com/watch?v=${id}`;
  if (platform === "vimeo") return `https://vimeo.com/${id}`;
}

async function enrichSeries(series: Series): Promise<Series> {
  const path = series.href.startsWith("http") ? series.href : series.href;
  const $ = await fetchHtml(path);
  if (!$) return series;

  // Series description
  const descEl = $(".seriesBody").first();
  const descriptionHtml = descEl.html()?.trim() ?? "";
  const description = descEl.text().replace(/\s+/g, " ").trim();

  // Sermon parts
  const sermons: Sermon[] = [];
  // Direct children of ul.node-series-list only — avoids matching the
  // inner <li> action buttons (Watch Video / Download Audio) inside each part.
  const parts = $("ul.node-series-list > li");
  for (const li of parts.toArray()) {
    const $li = $(li);
    const titleAnchor = $li.find(".partInfo h2 a, h2 a").first();
    let rawTitle = $li.find(".partInfo h2, h2").first().text().trim();
    // Strip leading "1. " ordering prefix.
    const orderMatch = rawTitle.match(/^(\d+)\.\s*/);
    const order = orderMatch ? parseInt(orderMatch[1], 10) : undefined;
    const title = rawTitle.replace(/^\d+\.\s*/, "");
    const detailHref = titleAnchor.attr("href") ?? "";

    const createdText = $li.find(".created").first().text().replace(/\s+/g, " ").trim();
    // Format: "May 10th, 2026 | Eddie Davis"
    const [dateText, speakerRaw] = createdText.split(/\s*\|\s*/);
    const date = parseSermonDate(dateText);
    const speaker = speakerRaw?.trim();

    const summary = $li.find(".body, p.body").text().replace(/\s+/g, " ").trim() || undefined;

    const audioUrl =
      $li.find("a.btn.hollow[href]").attr("href")?.trim() || undefined;

    const thumbSrc = $li.find(".partImage img, img").first().attr("src");
    const thumbnail = thumbSrc ? await downloadImage(thumbSrc, title) : null;

    const { platform, id } = parseVideoFromThumbnail(thumbSrc);

    sermons.push({
      order,
      title: title || "(untitled)",
      detailHref,
      date,
      dateText,
      speaker,
      summary,
      videoPlatform: platform,
      videoId: id,
      videoUrl: videoUrl(platform, id),
      audioUrl: audioUrl && audioUrl !== "" ? audioUrl : undefined,
      thumbnail,
    });
  }

  return {
    ...series,
    description: description || undefined,
    descriptionHtml: descriptionHtml || undefined,
    sermons,
  };
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });

  // Re-seed image registry from existing scrape.
  try {
    const existing = JSON.parse(
      await readFile(join(OUT, "images.json"), "utf8"),
    ) as Record<string, string>;
    for (const [url, path] of Object.entries(existing)) {
      imageRegistry.set(url, path);
    }
  } catch {
    /* fine — first run */
  }

  const raw = await readFile(join(OUT, "sermon-series.json"), "utf8");
  const series: Series[] = JSON.parse(raw);
  console.log(`Enriching ${series.length} series…\n`);

  const enriched: Series[] = [];
  let sermonCount = 0;
  let idx = 0;
  for (const s of series) {
    idx++;
    const detailed = await enrichSeries(s);
    enriched.push(detailed);
    const n = detailed.sermons?.length ?? 0;
    sermonCount += n;
    console.log(
      `  ${idx}/${series.length} [${n} sermon${n === 1 ? "" : "s"}] ${s.title}`,
    );
    await sleep(DELAY_MS);
  }

  await writeFile(
    join(OUT, "sermon-series.json"),
    JSON.stringify(enriched, null, 2),
  );
  await writeFile(
    join(OUT, "images.json"),
    JSON.stringify(Object.fromEntries(imageRegistry), null, 2),
  );

  // Build a flat sermons.json for easy browsing.
  const flat = enriched.flatMap((s) =>
    (s.sermons ?? []).map((m) => ({
      seriesTitle: s.title,
      seriesSlug: s.slug,
      ...m,
    })),
  );
  await writeFile(join(OUT, "sermons-flat.json"), JSON.stringify(flat, null, 2));

  console.log(`
✓ Done.
  Series enriched:  ${enriched.length}
  Sermons captured: ${sermonCount}
  Total images:     ${imageRegistry.size}

Files updated:
  ${OUT}/sermon-series.json  (enriched)
  ${OUT}/sermons-flat.json   (flat list of every sermon)
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

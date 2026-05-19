/**
 * Push scraped Drupal content into Sanity.
 *
 * Reads from ./migration-data/*.json (produced by `npm run scrape` and
 * `npm run scrape:sermons`) and creates/updates Sanity documents.
 *
 * Idempotent — every doc has a stable _id derived from its slug, so
 * re-running overwrites with the latest data.
 *
 * Run:
 *   npm run migrate
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_WRITE_TOKEN   (Editor role)
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";
import { htmlToPortableText } from "./lib/html-to-portable-text";

const DATA = "migration-data";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || projectId === "placeholder" || !token) {
  console.error(
    "✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env.local.",
  );
  console.error(
    "  Run `npx sanity@latest init --env=.env.local` to create a project,\n" +
      "  then create an Editor token at https://www.sanity.io/manage and paste it in.",
  );
  process.exit(1);
}

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2026-05-17",
  token,
  useCdn: false,
});

// ---------- types matching migration-data ----------

type ImgRef = { url: string; localPath: string; alt?: string };

type Page = {
  sourcePath: string;
  slug: string;
  section: string;
  title: string;
  summary?: string;
  bodyHtml: string;
  bodyText: string;
  images: ImgRef[];
};

type Leader = {
  name: string;
  role?: string;
  bio?: string;
  photo?: ImgRef | null;
};

type Ministry = {
  slug: string;
  title: string;
  ageRange?: string;
  bodyHtml: string;
  bodyText: string;
  images: ImgRef[];
};

type Sermon = {
  order?: number;
  title: string;
  detailHref: string;
  date?: string;
  dateText?: string;
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
  description?: string;
  descriptionHtml?: string;
  sermons?: Sermon[];
};

type SiteSettings = {
  siteTitle: string;
  address: string;
  phone: string;
  email: string;
  serviceTime: string;
  socials: Record<string, string>;
};

// ---------- helpers ----------

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function docId(prefix: string, slug: string): string {
  return `${prefix}-${slug.replace(/[^a-z0-9-]/g, "-")}`;
}

async function readJson<T>(name: string): Promise<T> {
  const path = join(DATA, name);
  return JSON.parse(await readFile(path, "utf8")) as T;
}

/** Cache of local image path → Sanity asset _ref so we upload each once. */
const assetCache = new Map<string, string>();

async function uploadAsset(localPath: string): Promise<string | null> {
  if (!localPath) return null;
  if (assetCache.has(localPath)) return assetCache.get(localPath)!;
  if (!existsSync(localPath)) {
    console.warn(`  ⚠ missing image: ${localPath}`);
    return null;
  }
  try {
    const buf = await readFile(localPath);
    const asset = await sanity.assets.upload("image", buf, {
      filename: basename(localPath),
    });
    assetCache.set(localPath, asset._id);
    return asset._id;
  } catch (e) {
    console.warn(`  ⚠ upload failed (${localPath}): ${(e as Error).message}`);
    return null;
  }
}

/** Build a resolver that maps an <img src> to its uploaded asset _ref. */
function makeImageResolver(images: ImgRef[]) {
  const byUrl = new Map<string, string>();
  // pre-populate from cache; we'll trigger uploads ahead of conversion
  for (const img of images) {
    const ref = assetCache.get(img.localPath);
    if (ref) byUrl.set(img.url, ref);
  }
  return (src: string) => byUrl.get(src);
}

function imageField(assetRef: string | null, alt?: string) {
  if (!assetRef) return undefined;
  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetRef },
    ...(alt && { alt }),
  };
}

function parseAddress(s: string) {
  if (!s) return undefined;
  // "3871 Kirby Whitten Parkway[, Apt …], Bartlett, TN 38135"
  const m = s.match(/^(.+?),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})$/);
  if (!m) return { line1: s };
  return { line1: m[1].trim(), city: m[2].trim(), state: m[3], zip: m[4] };
}

// ---------- migrators ----------

async function migrateSiteSettings() {
  console.log("→ Site settings");
  const s = await readJson<SiteSettings>("site-settings.json");
  await sanity.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    siteTitle: s.siteTitle || "River City Church",
    tagline:
      "A relaxed, friendly community where people accept you for who you are.",
    address: parseAddress(s.address) || {
      line1: "3871 Kirby Whitten Parkway",
      city: "Bartlett",
      state: "TN",
      zip: "38135",
    },
    phone: s.phone || "(901) 386-4171",
    email: s.email || "info@rivercitymemphis.org",
    serviceTime: s.serviceTime || "Sundays at 10:15 AM",
    socials: s.socials,
  });
  console.log("  ✓ siteSettings");
}

async function migratePages() {
  console.log("→ Pages");
  const pages = await readJson<Page[]>("pages.json");
  // Skip the homepage — it's rendered by the Next.js Home component, not Sanity.
  const filtered = pages.filter((p) => p.slug !== "home");
  for (const p of filtered) {
    // Pre-upload images so the HTML→PT converter can reference them.
    for (const img of p.images) await uploadAsset(img.localPath);
    const resolveImg = makeImageResolver(p.images);

    const body = htmlToPortableText(p.bodyHtml, resolveImg);

    await sanity.createOrReplace({
      _id: docId("page", p.slug),
      _type: "page",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      section: p.section === "home" ? "other" : p.section,
      summary: p.summary?.slice(0, 280),
      body,
    });
    console.log(`  ✓ ${p.slug}`);
  }
}

async function migrateLeadership(): Promise<Map<string, string>> {
  console.log("→ Leadership");
  const leaders = await readJson<Leader[]>("leadership.json");
  // Return a name → person _id map for sermon-speaker references later.
  const personIds = new Map<string, string>();

  for (const l of leaders) {
    const slug = slugify(l.name);
    const photoRef = l.photo ? await uploadAsset(l.photo.localPath) : null;

    const bioBlocks = l.bio
      ? l.bio.split(/\n\n+/).filter(Boolean).flatMap((para) =>
          htmlToPortableText(`<p>${escapeHtml(para)}</p>`),
        )
      : [];

    const id = docId("person", slug);
    await sanity.createOrReplace({
      _id: id,
      _type: "person",
      name: l.name,
      slug: { _type: "slug", current: slug },
      role: l.role,
      category: /pastor/i.test(l.role ?? "")
        ? "pastor"
        : /elder/i.test(l.role ?? "")
          ? "elder"
          : /director/i.test(l.role ?? "")
            ? "director"
            : "staff",
      bio: bioBlocks,
      ...(photoRef && { photo: imageField(photoRef, l.name) }),
    });
    personIds.set(l.name, id);
    console.log(`  ✓ ${l.name}`);
  }
  return personIds;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function migrateMinistries() {
  console.log("→ Ministries");
  const ministries = await readJson<Ministry[]>("ministries.json");
  for (const m of ministries) {
    for (const img of m.images) await uploadAsset(img.localPath);
    const resolveImg = makeImageResolver(m.images);
    const description = htmlToPortableText(m.bodyHtml, resolveImg);

    const firstImage = m.images[0];
    const heroRef = firstImage ? assetCache.get(firstImage.localPath) : null;

    await sanity.createOrReplace({
      _id: docId("ministry", m.slug),
      _type: "ministry",
      title: m.title,
      slug: { _type: "slug", current: m.slug },
      ageRange: m.ageRange,
      description,
      ...(heroRef && { image: imageField(heroRef, m.title) }),
    });
    console.log(`  ✓ ${m.title}`);
  }
}

function rangeDates(text?: string): { start?: string; end?: string } {
  if (!text) return {};
  const months: Record<string, number> = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  };
  const parts = text.split(/ to /i);
  const parseOne = (s: string) => {
    const m = s.match(/(\w+)\s+(\d{4})/);
    if (!m) return undefined;
    const month = months[m[1]];
    const year = parseInt(m[2], 10);
    if (month === undefined || !year) return undefined;
    return new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  };
  return { start: parseOne(parts[0]), end: parseOne(parts[1] ?? parts[0]) };
}

async function migrateSermonSeries(personIds: Map<string, string>) {
  console.log("→ Sermon series + sermons");
  const all = await readJson<Series[]>("sermon-series.json");

  // Optional date cutoff: SERMONS_FROM=YYYY-MM-DD trims to series whose
  // parsed startDate is on/after that date. Older series are skipped entirely.
  const cutoff = process.env.SERMONS_FROM;
  const series = cutoff
    ? all.filter((s) => {
        const { start } = rangeDates(s.dateText);
        return start && start >= cutoff;
      })
    : all;
  if (cutoff) {
    console.log(`  filter: SERMONS_FROM=${cutoff} → ${series.length}/${all.length} series in window`);
  }

  let idx = 0;
  for (const s of series) {
    idx++;
    const coverRef = s.coverImage ? await uploadAsset(s.coverImage.localPath) : null;
    const description = s.descriptionHtml
      ? htmlToPortableText(s.descriptionHtml)
      : [];
    const { start, end } = rangeDates(s.dateText);

    // Process sermons — upload thumbnails in parallel (small batch).
    const sermons: unknown[] = [];
    for (const sermon of s.sermons ?? []) {
      const thumbRef = sermon.thumbnail
        ? await uploadAsset(sermon.thumbnail.localPath)
        : null;
      const speakerId = sermon.speaker
        ? personIds.get(sermon.speaker)
        : undefined;
      sermons.push({
        _type: "sermon",
        _key: `${s.slug}-${sermon.order ?? sermons.length + 1}`,
        order: sermon.order,
        title: sermon.title,
        date: sermon.date,
        speakerName: sermon.speaker,
        ...(speakerId && {
          speaker: { _type: "reference", _ref: speakerId },
        }),
        videoPlatform: sermon.videoPlatform,
        videoId: sermon.videoId,
        videoUrl: sermon.videoUrl,
        audioUrl: sermon.audioUrl,
        summary: sermon.summary,
        ...(thumbRef && { thumbnail: imageField(thumbRef, sermon.title) }),
      });
    }

    await sanity.createOrReplace({
      _id: docId("series", s.slug),
      _type: "sermonSeries",
      title: s.title,
      slug: { _type: "slug", current: s.slug },
      startDate: start,
      endDate: end,
      sourceUrl: `https://rivercitymemphis.org${s.href}`,
      description,
      ...(coverRef && { coverImage: imageField(coverRef, s.title) }),
      sermons,
    });

    if (idx % 25 === 0 || idx === series.length) {
      console.log(`  … ${idx}/${series.length}`);
    }
  }
  console.log(`  ✓ ${series.length} series migrated`);
}

// ---------- main ----------

async function main() {
  console.log(`Migrating to Sanity project ${projectId} / dataset ${dataset}\n`);

  await migrateSiteSettings();
  await migratePages();
  const personIds = await migrateLeadership();
  await migrateMinistries();
  await migrateSermonSeries(personIds);

  console.log(`
✓ Migration complete.
  Assets uploaded: ${assetCache.size}

Open the Studio at http://localhost:3000/studio after \`npm run dev\` to review.
`);
}

main().catch((e) => {
  console.error("\n✗ Migration failed:");
  console.error(e);
  process.exit(1);
});

/**
 * Re-scrape the static Drupal pages with the cleaned-up selector logic
 * and push ONLY those pages to Sanity. Used to surgically fix breadcrumb
 * / sidebar contamination without re-running the full migration.
 *
 *   npm run recapture:pages
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import { createHash } from "node:crypto";
import { createClient } from "@sanity/client";
import * as cheerio from "cheerio";
import { htmlToPortableText } from "./lib/html-to-portable-text";

const SITE = "https://rivercitymemphis.org";
const OUT = "migration-data";
const IMG_DIR = join(OUT, "images");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  console.error("Missing Sanity env vars in .env.local");
  process.exit(1);
}

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2026-05-17",
  token,
  useCdn: false,
});

// Mirror of scrape-drupal.ts PAGE_DEFS — kept in sync intentionally.
const PAGE_DEFS = [
  { path: "/visit/who-we-are", slug: "visit/who-we-are", section: "visit" },
  { path: "/visit/what-expect", slug: "visit/what-to-expect", section: "visit" },
  { path: "/visit/location-and-time", slug: "visit/location", section: "visit" },
  { path: "/visit/leadership", slug: "visit/leadership", section: "visit" },
  { path: "/visit/faqs", slug: "visit/faqs", section: "visit" },
  { path: "/connect", slug: "connect", section: "connect" },
  { path: "/connect/next", slug: "connect/next", section: "connect" },
  { path: "/connect/families", slug: "connect/families", section: "connect" },
  { path: "/connect/rcc-groups", slug: "connect/rcc-groups", section: "connect" },
  { path: "/connect/be-rich", slug: "connect/be-rich", section: "connect" },
  { path: "/give/ways-give", slug: "give", section: "give" },
  { path: "/contact", slug: "contact", section: "other" },
];

const imageCache = new Map<string, string>(); // image URL → Sanity asset _ref

async function fetchHtml(path: string): Promise<cheerio.CheerioAPI | null> {
  const res = await fetch(`${SITE}${path}`, {
    headers: { "User-Agent": "Mozilla/5.0 (rivercity-recapture)" },
    redirect: "follow",
  });
  if (!res.ok) {
    console.warn(`  ✗ ${res.status} ${path}`);
    return null;
  }
  return cheerio.load(await res.text());
}

function selectMain($: cheerio.CheerioAPI): cheerio.Cheerio<any> {
  const candidates = [
    ".node .field-name-body",
    ".node-page > .content",
    ".node > .content",
    ".node .content",
    "#main-content",
    "#content",
    ".region-content",
    "main",
    "article",
  ];
  for (const sel of candidates) {
    const el = $(sel).first();
    if (el.length && el.text().trim().length > 50) return el;
  }
  return $("body");
}

function stripDrupalChrome(
  $: cheerio.CheerioAPI,
  main: cheerio.Cheerio<any>,
  pageTitle: string,
) {
  main
    .find(
      [
        ".breadcrumb",
        ".region-sidebar-first",
        ".region-sidebar-second",
        ".region-bottom",
        ".region-footer",
        ".region-help",
        ".region-page-bottom",
        ".region-page-top",
        ".you-are-here",
        ".submitted",
        ".field-label",
        ".sharethis-wrapper",
        "script",
        "noscript",
        "h1.page-title",
        "h1#page-title",
      ].join(", "),
    )
    .remove();

  const firstHeading = main.find("h1, h2").first();
  if (
    firstHeading.length &&
    firstHeading.text().trim().toLowerCase() === pageTitle.toLowerCase()
  ) {
    firstHeading.remove();
  }

  main.find("p, div, span").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text) return;
    if (
      /^come and enjoy the relaxed,? friendly atmosphere/i.test(text) ||
      /^first visit\?\s*get connected\s*$/i.test(text)
    ) {
      $(el).remove();
    }
  });
}

async function uploadImage(rawUrl: string): Promise<string | null> {
  const url = rawUrl.startsWith("http") ? rawUrl : `${SITE}${rawUrl}`;
  if (imageCache.has(url)) return imageCache.get(url)!;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const hash = createHash("sha1").update(url).digest("hex").slice(0, 12);
    const ext =
      url.split("?")[0].match(/\.(jpe?g|png|gif|webp|svg)$/i)?.[1] ?? "jpg";
    const filename = `${hash}.${ext.toLowerCase()}`;
    // Cache locally too so it lives in migration-data/images alongside the rest.
    await mkdir(IMG_DIR, { recursive: true });
    const local = join(IMG_DIR, filename);
    if (!existsSync(local)) await writeFile(local, buf);
    const asset = await sanity.assets.upload("image", buf, { filename });
    imageCache.set(url, asset._id);
    return asset._id;
  } catch (e) {
    console.warn(`    ⚠ image upload failed for ${url}: ${(e as Error).message}`);
    return null;
  }
}

function docId(slug: string): string {
  return `page-${slug.replace(/[^a-z0-9-]/g, "-")}`;
}

async function processPage(def: (typeof PAGE_DEFS)[number]) {
  const $ = await fetchHtml(def.path);
  if (!$) return false;

  const title =
    $("h1.page-title, h1#page-title, h1").first().text().trim() ||
    $("title").text().split("|")[0].trim();

  const main = selectMain($);
  stripDrupalChrome($, main, title);

  // Pre-upload images so HTML→PT converter can reference them.
  const imageUrlToRef = new Map<string, string>();
  for (const img of main.find("img").toArray()) {
    const src = $(img).attr("src");
    if (!src) continue;
    const ref = await uploadImage(src);
    if (ref) imageUrlToRef.set(src, ref);
  }

  const bodyHtml = main.html() ?? "";
  const body = htmlToPortableText(bodyHtml, (src) => imageUrlToRef.get(src));

  const summary =
    $('meta[name="description"]').attr("content")?.slice(0, 280) ??
    main.text().replace(/\s+/g, " ").trim().slice(0, 200);

  await sanity.createOrReplace({
    _id: docId(def.slug),
    _type: "page",
    title,
    slug: { _type: "slug", current: def.slug },
    section: def.section,
    summary,
    body,
  });

  // Quick stats line.
  const textLen = main.text().replace(/\s+/g, " ").trim().length;
  console.log(
    `  ✓ ${def.slug.padEnd(28)} title="${title}" body=${textLen}c img=${imageUrlToRef.size}`,
  );
  return true;
}

async function main() {
  console.log(`Recapturing ${PAGE_DEFS.length} pages → Sanity ${projectId}/${dataset}\n`);
  let ok = 0;
  for (const def of PAGE_DEFS) {
    const success = await processPage(def);
    if (success) ok++;
  }
  console.log(`\n✓ Done — ${ok}/${PAGE_DEFS.length} pages refreshed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

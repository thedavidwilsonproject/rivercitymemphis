/**
 * Pure scrape of rivercitymemphis.org — no Sanity required.
 *
 * Walks the live site and writes structured JSON + downloaded images to
 * ./migration-data/ so we can review before pushing to Sanity.
 *
 * Run: npm run scrape
 *
 * Outputs:
 *   migration-data/
 *     pages.json
 *     leadership.json
 *     ministries.json
 *     sermon-series.json
 *     site-settings.json
 *     images/<filename>         ← downloaded image files
 *     images.json               ← map of original URL → local path
 *     index.html                ← quick visual index of what was scraped
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import * as cheerio from "cheerio";

const SITE = "https://rivercitymemphis.org";
const OUT = "migration-data";
const IMG_DIR = join(OUT, "images");

type ImgRef = { url: string; localPath: string; alt?: string };
type ScrapedPage = {
  sourcePath: string;
  slug: string;
  section: string;
  title: string;
  summary?: string;
  bodyHtml: string;
  bodyText: string;
  images: ImgRef[];
};

const imageRegistry = new Map<string, string>(); // url → localPath

async function ensureDirs() {
  await mkdir(IMG_DIR, { recursive: true });
}

async function fetchHtml(path: string): Promise<cheerio.CheerioAPI | null> {
  const url = path.startsWith("http") ? path : `${SITE}${path}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (rivercity-scrape)" },
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

    // Stable filename: hash of URL + original extension if recognizable.
    const hash = createHash("sha1").update(url).digest("hex").slice(0, 12);
    const extMatch = url.split("?")[0].match(/\.(jpe?g|png|gif|webp|svg)$/i);
    const ext = (extMatch?.[1] ?? "jpg").toLowerCase();
    const filename = `${hash}.${ext}`;
    const localPath = join(IMG_DIR, filename);
    await writeFile(localPath, buf);
    imageRegistry.set(url, localPath);
    return { url, localPath, alt };
  } catch (e) {
    console.warn(`  ✗ image failed: ${url} — ${(e as Error).message}`);
    return null;
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Pick the most likely main content container — Drupal-aware ordering. */
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

/** Strip Drupal chrome (breadcrumbs, sidebars, page-title duplicates, promos). */
function stripDrupalChrome(
  $: cheerio.CheerioAPI,
  main: cheerio.Cheerio<any>,
  pageTitle: string,
) {
  // Remove site-wide regions accidentally pulled in.
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
        // Drupal often duplicates the H1 inside the body container.
        "h1.page-title",
        "h1#page-title",
      ].join(", "),
    )
    .remove();

  // Remove the first h1/h2 if it duplicates the page title verbatim.
  const firstHeading = main.find("h1, h2").first();
  if (
    firstHeading.length &&
    firstHeading.text().trim().toLowerCase() === pageTitle.toLowerCase()
  ) {
    firstHeading.remove();
  }

  // Drupal sidebar/footer text blocks that appear on every page.
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

// ---------- pages ----------

const PAGE_DEFS: { path: string; slug: string; section: string }[] = [
  { path: "/", slug: "home", section: "home" },
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

async function scrapePages(): Promise<ScrapedPage[]> {
  console.log("→ Scraping pages…");
  const results: ScrapedPage[] = [];
  for (const { path, slug, section } of PAGE_DEFS) {
    const $ = await fetchHtml(path);
    if (!$) continue;

    const title =
      $("h1.page-title, h1#page-title, h1").first().text().trim() ||
      $("title").text().split("|")[0].trim();

    const main = selectMain($);

    // Strip Drupal chrome (breadcrumbs, sidebars, footer regions, etc.).
    stripDrupalChrome($, main, title);

    const bodyHtml = main.html() ?? "";
    const bodyText = main.text().replace(/\s+/g, " ").trim();

    // Collect image refs (but don't download yet — done after dedupe).
    const imgUrls: { url: string; alt?: string }[] = [];
    main.find("img").each((_, img) => {
      const src = $(img).attr("src") ?? $(img).attr("data-src");
      if (src) imgUrls.push({ url: src, alt: $(img).attr("alt") });
    });

    const images: ImgRef[] = [];
    for (const i of imgUrls) {
      const ref = await downloadImage(i.url, i.alt);
      if (ref) images.push(ref);
    }

    const summary =
      $('meta[name="description"]').attr("content") ??
      bodyText.slice(0, 200);

    results.push({
      sourcePath: path,
      slug,
      section,
      title,
      summary,
      bodyHtml,
      bodyText,
      images,
    });
    console.log(`  ✓ ${path} → "${title}" (${images.length} img, ${bodyText.length} chars)`);
  }
  return results;
}

// ---------- leadership ----------

type Leader = {
  name: string;
  role?: string;
  bio?: string;
  photo?: ImgRef | null;
};

async function scrapeLeadership(): Promise<Leader[]> {
  console.log("→ Scraping leadership…");
  const $ = await fetchHtml("/visit/leadership");
  if (!$) return [];

  // Real markup: <ul class="staff"><li>… with .name, .position, .bio, .image img
  const leaders: Leader[] = [];
  for (const el of $("ul.staff > li, ul.staff li").toArray()) {
    const $el = $(el);
    const name = $el.find(".name").first().text().trim();
    if (!name) continue;
    const role = $el.find(".position").first().text().trim();
    const bio = $el.find(".bio").text().replace(/\s+/g, " ").trim();
    const imgSrc = $el.find("img").first().attr("src");
    const photo = imgSrc ? await downloadImage(imgSrc, name) : null;
    leaders.push({ name, role, bio, photo });
    console.log(`  ✓ ${name} — ${role || "(no role)"}`);
  }
  return leaders;
}

// ---------- ministries ----------

type Ministry = {
  slug: string;
  title: string;
  ageRange?: string;
  bodyHtml: string;
  bodyText: string;
  images: ImgRef[];
};

const MINISTRY_PATHS = [
  { path: "/connect/families", slug: "families" },
  { path: "/connect/rcc-groups", slug: "rcc-groups" },
  { path: "/connect/be-rich", slug: "be-rich" },
];

async function scrapeMinistries(): Promise<Ministry[]> {
  console.log("→ Scraping ministries…");
  const ministries: Ministry[] = [];
  for (const { path, slug } of MINISTRY_PATHS) {
    const $ = await fetchHtml(path);
    if (!$) continue;
    const title = $("h1").first().text().trim();
    const main = selectMain($);
    main.find("script, .sharethis-wrapper").remove();
    const bodyHtml = main.html() ?? "";
    const bodyText = main.text().replace(/\s+/g, " ").trim();

    const ageMatch = bodyText.match(/Age[s]?\s+[^.]+?(?:Pre[\s-]?K|K-?\d|\d+(?:st|nd|rd|th)?\s*[–-]\s*\d+(?:st|nd|rd|th)?\s*grade|grade|weeks)[^.]*/i);

    const images: ImgRef[] = [];
    for (const img of main.find("img").toArray()) {
      const src = $(img).attr("src");
      const alt = $(img).attr("alt");
      if (src) {
        const ref = await downloadImage(src, alt);
        if (ref) images.push(ref);
      }
    }

    ministries.push({
      slug,
      title,
      ageRange: ageMatch?.[0]?.trim(),
      bodyHtml,
      bodyText,
      images,
    });
    console.log(`  ✓ ${title} (${bodyText.length} chars, ${images.length} img)`);
  }
  return ministries;
}

// ---------- sermon series ----------

type Series = {
  title: string;
  slug: string;
  href: string;
  dateText?: string;
  coverImage?: ImgRef | null;
};

async function scrapeSermonSeries(): Promise<Series[]> {
  console.log("→ Scraping sermon series…");
  const all: Series[] = [];
  const seen = new Set<string>();

  for (let page = 0; page < 20; page++) {
    const $ = await fetchHtml(`/watch?page=${page}`);
    if (!$) break;

    const cards = $("ul.series > li, li.views-row");
    if (cards.length === 0) break;

    const before = all.length;
    for (const el of cards.toArray()) {
      const $el = $(el);
      const a = $el.find("a[href^='/watch/']").first();
      const title = a.text().trim();
      const href = a.attr("href") ?? "";
      if (!title || !href || seen.has(href)) continue;
      seen.add(href);

      const imgSrc = $el.find("img").first().attr("src");
      const dateText = $el.find(".seriesDate").first().text().replace(/\s+/g, " ").trim();
      const coverImage = imgSrc ? await downloadImage(imgSrc, title) : null;

      all.push({
        title,
        slug: slugify(title),
        href,
        dateText,
        coverImage,
      });
      console.log(`  ✓ series: ${title}${dateText ? ` (${dateText})` : ""}`);
    }

    if (all.length === before) break; // no new cards on this page → stop
  }
  return all;
}

// ---------- site settings ----------

type SiteSettings = {
  siteTitle: string;
  address: string;
  phone: string;
  email: string;
  serviceTime: string;
  socials: Record<string, string>;
};

async function scrapeSiteSettings(): Promise<SiteSettings> {
  console.log("→ Scraping site settings…");
  const $ = await fetchHtml("/");
  if (!$) {
    return {
      siteTitle: "River City Church",
      address: "",
      phone: "",
      email: "",
      serviceTime: "",
      socials: {},
    };
  }
  const text = $("body").text();
  const phoneMatch = text.match(/\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const addressMatch = text.match(
    /\d+\s+[\w\s]+(?:Parkway|Pkwy|Road|Rd|Street|St|Avenue|Ave|Drive|Dr|Boulevard|Blvd)[^,]*,\s*[\w\s]+,\s*[A-Z]{2}\s*\d{5}/,
  );

  const socials: Record<string, string> = {};
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href") ?? "";
    if (/facebook\.com/i.test(href) && !socials.facebook) socials.facebook = href;
    else if (/instagram\.com/i.test(href) && !socials.instagram) socials.instagram = href;
    else if (/twitter\.com|x\.com/i.test(href) && !socials.twitter) socials.twitter = href;
    else if (/vimeo\.com/i.test(href) && !socials.vimeo) socials.vimeo = href;
    else if (/youtube\.com/i.test(href) && !socials.youtube) socials.youtube = href;
  });

  const settings: SiteSettings = {
    siteTitle: "River City Church",
    address: addressMatch?.[0] ?? "",
    phone: phoneMatch?.[0] ?? "",
    email: emailMatch?.[0] ?? "",
    serviceTime: (text.match(/Sundays?\s+at\s+\d{1,2}[:.]?\d{0,2}\s*[ap]m/i)?.[0] ??
      text.match(/\d{1,2}:\d{2}\s*[ap]m/i)?.[0] ??
      "") as string,
    socials,
  };
  console.log(`  ✓ ${settings.address}`);
  console.log(`  ✓ ${settings.phone} / ${settings.email}`);
  return settings;
}

// ---------- index.html (visual report) ----------

function buildIndexHtml(data: {
  pages: ScrapedPage[];
  leadership: Leader[];
  ministries: Ministry[];
  series: Series[];
  settings: SiteSettings;
}): string {
  const rel = (p?: string | null) => (p ? p.replace(`${OUT}/`, "") : "");
  return `<!doctype html><html><head><meta charset="utf-8"><title>RCC Scrape Report</title>
<style>
  body{font-family:-apple-system,sans-serif;max-width:1100px;margin:2rem auto;padding:0 1.5rem;color:#262626}
  h1{font-size:2rem;margin-bottom:0}h2{margin-top:2.5rem;border-bottom:1px solid #ece2cb;padding-bottom:.3rem}
  table{width:100%;border-collapse:collapse;font-size:14px}td,th{border:1px solid #eee;padding:6px 10px;vertical-align:top;text-align:left}
  img{max-width:160px;height:auto;border-radius:6px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin-top:1rem}
  .card{border:1px solid #ece2cb;border-radius:10px;padding:1rem;background:#fbf7ee}
  .muted{color:#6b6b6b;font-size:13px}.tag{display:inline-block;background:#d8eef5;color:#1f7a93;padding:2px 8px;border-radius:99px;font-size:12px;margin-right:4px}
  code{background:#f2f2f2;padding:1px 6px;border-radius:4px;font-size:13px}
</style></head><body>
<h1>River City Church — Drupal Scrape</h1>
<p class="muted">Generated ${new Date().toISOString()}</p>

<h2>Site settings</h2>
<table><tbody>
<tr><th>Title</th><td>${data.settings.siteTitle}</td></tr>
<tr><th>Address</th><td>${data.settings.address || "(not detected)"}</td></tr>
<tr><th>Phone</th><td>${data.settings.phone || "(not detected)"}</td></tr>
<tr><th>Email</th><td>${data.settings.email || "(not detected)"}</td></tr>
<tr><th>Service time</th><td>${data.settings.serviceTime || "(not detected)"}</td></tr>
<tr><th>Socials</th><td>${Object.entries(data.settings.socials).map(([k, v]) => `<span class="tag">${k}</span> <code>${v}</code>`).join("<br>") || "(none)"}</td></tr>
</tbody></table>

<h2>Pages (${data.pages.length})</h2>
<table><thead><tr><th>Section</th><th>Slug</th><th>Title</th><th>Body chars</th><th>Images</th></tr></thead><tbody>
${data.pages.map(p => `<tr><td><span class="tag">${p.section}</span></td><td><code>/${p.slug}</code></td><td><strong>${p.title}</strong><br><span class="muted">${p.bodyText.slice(0, 160)}…</span></td><td>${p.bodyText.length.toLocaleString()}</td><td>${p.images.length}</td></tr>`).join("")}
</tbody></table>

<h2>Leadership (${data.leadership.length})</h2>
<div class="grid">
${data.leadership.map(l => `<div class="card">
  ${l.photo ? `<img src="${rel(l.photo.localPath)}" alt="${l.name}">` : ""}
  <div><strong>${l.name}</strong></div>
  <div class="muted">${l.role ?? ""}</div>
  ${l.bio ? `<p class="muted">${l.bio.slice(0, 180)}…</p>` : ""}
</div>`).join("")}
</div>

<h2>Ministries (${data.ministries.length})</h2>
<div class="grid">
${data.ministries.map(m => `<div class="card">
  ${m.images[0] ? `<img src="${rel(m.images[0].localPath)}" alt="${m.title}">` : ""}
  <div><strong>${m.title}</strong></div>
  ${m.ageRange ? `<div class="muted">${m.ageRange}</div>` : ""}
  <p class="muted">${m.bodyText.slice(0, 200)}…</p>
</div>`).join("")}
</div>

<h2>Sermon series (${data.series.length})</h2>
<div class="grid">
${data.series.map(s => `<div class="card">
  ${s.coverImage ? `<img src="${rel(s.coverImage.localPath)}" alt="${s.title}">` : ""}
  <div><strong>${s.title}</strong></div>
  ${s.dateText ? `<div class="muted">${s.dateText}</div>` : ""}
  <div class="muted"><code>${s.href}</code></div>
</div>`).join("")}
</div>

</body></html>`;
}

// ---------- main ----------

async function main() {
  await ensureDirs();
  console.log(`Scraping ${SITE} → ${OUT}/\n`);

  const settings = await scrapeSiteSettings();
  const pages = await scrapePages();
  const leadership = await scrapeLeadership();
  const ministries = await scrapeMinistries();
  const series = await scrapeSermonSeries();

  await writeFile(join(OUT, "site-settings.json"), JSON.stringify(settings, null, 2));
  await writeFile(join(OUT, "pages.json"), JSON.stringify(pages, null, 2));
  await writeFile(join(OUT, "leadership.json"), JSON.stringify(leadership, null, 2));
  await writeFile(join(OUT, "ministries.json"), JSON.stringify(ministries, null, 2));
  await writeFile(join(OUT, "sermon-series.json"), JSON.stringify(series, null, 2));
  await writeFile(
    join(OUT, "images.json"),
    JSON.stringify(Object.fromEntries(imageRegistry), null, 2),
  );
  await writeFile(
    join(OUT, "index.html"),
    buildIndexHtml({ pages, leadership, ministries, series, settings }),
  );

  console.log(`
✓ Done.
  Pages:        ${pages.length}
  Leadership:   ${leadership.length}
  Ministries:   ${ministries.length}
  Sermon series:${series.length}
  Images:       ${imageRegistry.size}

Open migration-data/index.html for a visual report.
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

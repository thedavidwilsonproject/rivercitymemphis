/**
 * Build a clickable contact-sheet HTML of all extracted Dropbox photos so
 * David can browse the library and tell me which to use where.
 *
 *   npm run photo:index
 *
 * Output: migration-data/dropbox/index.html
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "migration-data/dropbox";
const THUMBS_DIR = join(ROOT, "thumbnails");
const ORIGINALS_DIR = join(ROOT, "images");
const OUT = join(ROOT, "index.html");

type Entry = { thumb: string; full: string; folder: string; name: string };

function walk(dir: string, out: Entry[] = []): Entry[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(jpe?g|png)$/i.test(name)) {
      const rel = relative(THUMBS_DIR, p);
      const folder = rel.split("/").slice(0, -1).join("/") || "(root)";
      out.push({
        thumb: relative(ROOT, p),
        full: relative(ROOT, join(ORIGINALS_DIR, rel)),
        folder,
        name,
      });
    }
  }
  return out;
}

function groupByFolder(entries: Entry[]) {
  const map = new Map<string, Entry[]>();
  for (const e of entries) {
    const list = map.get(e.folder) ?? [];
    list.push(e);
    map.set(e.folder, list);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render(grouped: [string, Entry[]][], total: number) {
  return `<!doctype html>
<html><head><meta charset="utf-8">
<title>RCC Photo Library — ${total} images</title>
<style>
  body { font-family: -apple-system, sans-serif; margin: 0; background: #fdfbf6; color: #262626; }
  header { position: sticky; top: 0; z-index: 10; background: #2aa5ca; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,.1); }
  header h1 { margin: 0; font-size: 1.4rem; letter-spacing: .05em; text-transform: uppercase; }
  header .stats { font-size: .85rem; opacity: .9; }
  nav { position: sticky; top: 56px; z-index: 9; background: white; border-bottom: 1px solid #ece2cb; padding: .75rem 2rem; font-size: .85rem; overflow-x: auto; white-space: nowrap; }
  nav a { color: #2491af; text-decoration: none; margin-right: 1rem; }
  nav a:hover { text-decoration: underline; }
  section { padding: 2rem; }
  h2 { margin: 0 0 1rem 0; font-size: 1.1rem; color: #262626; text-transform: uppercase; letter-spacing: .1em; }
  .count { color: #6b6b6b; font-weight: normal; font-size: .85rem; margin-left: .5rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; }
  .grid a { display: block; border-radius: 6px; overflow: hidden; background: #ece2cb; aspect-ratio: 1/1; position: relative; }
  .grid img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .15s; }
  .grid a:hover img { transform: scale(1.05); }
  .grid a .name { position: absolute; bottom: 0; left: 0; right: 0; padding: 4px 6px; font-size: 10px; color: white; background: linear-gradient(transparent, rgba(0,0,0,.7)); opacity: 0; transition: opacity .15s; }
  .grid a:hover .name { opacity: 1; }
  footer { padding: 2rem; text-align: center; color: #6b6b6b; font-size: .85rem; }
</style>
</head><body>
<header>
  <h1>RCC Photo Library</h1>
  <div class="stats">${total} images across ${grouped.length} folders</div>
</header>
<nav>
  ${grouped.map(([folder]) => `<a href="#${folder.replace(/[^a-z0-9]/gi, "-")}">${escape(folder)}</a>`).join("")}
</nav>
${grouped
  .map(
    ([folder, entries]) => `
<section id="${folder.replace(/[^a-z0-9]/gi, "-")}">
  <h2>${escape(folder)}<span class="count">${entries.length} photos</span></h2>
  <div class="grid">
    ${entries
      .map(
        (e) => `
      <a href="${escape(e.full)}" target="_blank" title="${escape(e.name)}">
        <img loading="lazy" src="${escape(e.thumb)}" alt="${escape(e.name)}">
        <span class="name">${escape(e.name)}</span>
      </a>`,
      )
      .join("")}
  </div>
</section>`,
  )
  .join("")}
<footer>Click any thumbnail to open the full-resolution version. Tell David which folder + filename to use where.</footer>
</body></html>`;
}

const entries = walk(THUMBS_DIR);
const grouped = groupByFolder(entries);
writeFileSync(OUT, render(grouped, entries.length));
console.log(`✓ ${entries.length} entries → ${OUT}`);

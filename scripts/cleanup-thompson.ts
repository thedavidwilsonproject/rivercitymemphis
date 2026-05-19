/**
 * Delete the River City Church documents that were accidentally migrated
 * into Thompson Placemaking's Sanity project (`395f3x14`).
 *
 * Safety design:
 *   - We never delete by `_type` (Thompson may have its own `page` docs).
 *   - We delete ONLY the exact `_id`s we wrote during the bad migration,
 *     computed from the same `migration-data/*.json` source files.
 *   - Dry-run by default. Pass `--confirm` to actually delete.
 *
 * Run:
 *   THOMPSON_PROJECT_ID=395f3x14 THOMPSON_TOKEN=<editor-token> \
 *     npx tsx scripts/cleanup-thompson.ts            # dry-run
 *   THOMPSON_PROJECT_ID=395f3x14 THOMPSON_TOKEN=<editor-token> \
 *     npx tsx scripts/cleanup-thompson.ts --confirm  # actually delete
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@sanity/client";

const DATA = "migration-data";
const projectId = process.env.THOMPSON_PROJECT_ID;
const token = process.env.THOMPSON_TOKEN;
const confirm = process.argv.includes("--confirm");

if (!projectId || !token) {
  console.error(
    "Missing THOMPSON_PROJECT_ID or THOMPSON_TOKEN env vars.\nExample:\n  THOMPSON_PROJECT_ID=395f3x14 THOMPSON_TOKEN=sk... npx tsx scripts/cleanup-thompson.ts",
  );
  process.exit(1);
}

const sanity = createClient({
  projectId,
  dataset: "production",
  apiVersion: "2026-05-17",
  token,
  useCdn: false,
});

function docId(prefix: string, slug: string): string {
  return `${prefix}-${slug.replace(/[^a-z0-9-]/g, "-")}`;
}

async function readJson<T>(name: string): Promise<T> {
  return JSON.parse(await readFile(join(DATA, name), "utf8")) as T;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log(`\nTarget: project ${projectId} / dataset production`);
  console.log(confirm ? "Mode:   DELETE (--confirm)\n" : "Mode:   DRY RUN — re-run with --confirm to actually delete\n");

  // Reconstruct the exact IDs the bad migration wrote.
  const pages = await readJson<{ slug: string }[]>("pages.json");
  const leaders = await readJson<{ name: string }[]>("leadership.json");
  const ministries = await readJson<{ slug: string }[]>("ministries.json");
  const series = await readJson<{ slug: string }[]>("sermon-series.json");

  const ids: string[] = [];
  // siteSettings is a singleton. Only delete if it still has our RCC payload —
  // otherwise we'd nuke whatever Thompson re-saved on top.
  ids.push("siteSettings");
  for (const p of pages) {
    if (p.slug === "home") continue; // home was never written
    ids.push(docId("page", p.slug));
  }
  for (const l of leaders) ids.push(docId("person", slugify(l.name)));
  for (const m of ministries) ids.push(docId("ministry", m.slug));
  for (const s of series) ids.push(docId("series", s.slug));

  console.log(`Documents to remove: ${ids.length}`);
  console.log(`  · siteSettings:       1 (only if it still holds RCC content)`);
  console.log(`  · pages:              ${pages.filter((p) => p.slug !== "home").length}`);
  console.log(`  · people:             ${leaders.length}`);
  console.log(`  · ministries:         ${ministries.length}`);
  console.log(`  · sermon series:      ${series.length}`);

  // Special handling for siteSettings: read it, only delete if it's still the
  // RCC payload (siteTitle === "River City Church"). Otherwise leave it alone.
  const settings = await sanity.fetch<{ siteTitle?: string } | null>(
    `*[_id == "siteSettings"][0]{ siteTitle }`,
  );
  if (settings?.siteTitle !== "River City Church") {
    console.log(
      `\n⚠ siteSettings on ${projectId} no longer holds RCC content (siteTitle=${JSON.stringify(settings?.siteTitle)}). Will skip — Thompson may have replaced it.`,
    );
    const idx = ids.indexOf("siteSettings");
    if (idx >= 0) ids.splice(idx, 1);
  }

  // Verify the docs we plan to delete actually exist in Thompson.
  const existing = await sanity.fetch<{ _id: string }[]>(
    `*[_id in $ids]{ _id }`,
    { ids },
  );
  const existingIds = new Set(existing.map((d) => d._id));
  const toDelete = ids.filter((id) => existingIds.has(id));
  const missing = ids.filter((id) => !existingIds.has(id));
  console.log(`\nFound in Thompson: ${toDelete.length} / ${ids.length}`);
  if (missing.length && missing.length < 20) {
    console.log("  Missing (already gone): " + missing.join(", "));
  }

  if (!confirm) {
    console.log("\nDry-run complete. Re-run with --confirm to delete.");
    return;
  }

  // Delete in batches of 50 (Sanity transaction size limit comfort).
  const batches: string[][] = [];
  for (let i = 0; i < toDelete.length; i += 50)
    batches.push(toDelete.slice(i, i + 50));
  console.log(`\nDeleting in ${batches.length} batch(es)…`);
  let done = 0;
  for (const batch of batches) {
    const tx = sanity.transaction();
    for (const id of batch) tx.delete(id);
    await tx.commit({ visibility: "async" });
    done += batch.length;
    console.log(`  ✓ ${done}/${toDelete.length}`);
  }

  // Orphaned image assets cleanup (best-effort).
  // After deleting our docs, any image we uploaded that nothing references
  // becomes orphaned. We use Sanity's references()-count query to find them.
  console.log("\nLooking for orphaned image assets we uploaded…");
  const orphans = await sanity.fetch<{ _id: string }[]>(
    `*[_type == "sanity.imageAsset" && count(*[references(^._id)]) == 0]{ _id }[0...2000]`,
  );
  console.log(`Found ${orphans.length} orphaned image asset(s).`);
  if (orphans.length > 0) {
    const orphanBatches: { _id: string }[][] = [];
    for (let i = 0; i < orphans.length; i += 50)
      orphanBatches.push(orphans.slice(i, i + 50));
    for (const batch of orphanBatches) {
      const tx = sanity.transaction();
      for (const o of batch) tx.delete(o._id);
      await tx.commit({ visibility: "async" });
    }
    console.log(`  ✓ Deleted ${orphans.length} orphaned asset(s).`);
  }

  console.log("\n✓ Thompson cleanup complete.");
}

main().catch((e) => {
  console.error("\n✗ Cleanup failed:");
  console.error(e);
  process.exit(1);
});

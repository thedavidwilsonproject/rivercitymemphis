/**
 * Remove sermon series in the current Sanity project whose startDate is
 * older than the cutoff (default: 12 months ago). Used after switching
 * to a trimmed migration window to clean up out-of-scope series that
 * had been pushed during a previous full run.
 *
 *   npm run prune:old-series                   # dry-run, 12-mo cutoff
 *   PRUNE_CUTOFF=2025-05-01 npm run prune:old-series --confirm
 *
 * Safety:
 *   - Dry-run by default — prints what would be deleted and stops.
 *   - Only touches docs with _type == "sermonSeries".
 *   - Also removes orphaned image assets after series deletion.
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  console.error("Missing env: NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN");
  process.exit(1);
}

const confirm = process.argv.includes("--confirm");
const cutoff =
  process.env.PRUNE_CUTOFF ??
  (() => {
    const d = new Date();
    d.setUTCFullYear(d.getUTCFullYear() - 1);
    return d.toISOString().slice(0, 10);
  })();

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2026-05-17",
  token,
  useCdn: false,
});

async function main() {
  console.log(`Target: ${projectId}/${dataset}`);
  console.log(`Cutoff: startDate < ${cutoff}`);
  console.log(confirm ? "Mode:   DELETE\n" : "Mode:   DRY RUN (--confirm to delete)\n");

  const stale = await sanity.fetch<
    { _id: string; title: string; startDate?: string }[]
  >(
    `*[_type=="sermonSeries" && (startDate < $cutoff || !defined(startDate))]{ _id, title, startDate } | order(startDate desc)`,
    { cutoff },
  );

  console.log(`Stale series to remove: ${stale.length}`);
  for (const s of stale.slice(0, 5))
    console.log(`  · ${s.startDate ?? "(undated)"} — ${s.title}`);
  if (stale.length > 5) console.log(`  · …and ${stale.length - 5} more`);

  if (!confirm) {
    console.log("\nDry-run complete. Re-run with --confirm to actually delete.");
    return;
  }

  console.log("\nDeleting…");
  let done = 0;
  for (let i = 0; i < stale.length; i += 50) {
    const tx = sanity.transaction();
    for (const s of stale.slice(i, i + 50)) tx.delete(s._id);
    await tx.commit({ visibility: "async" });
    done += Math.min(50, stale.length - i);
    console.log(`  ✓ ${done}/${stale.length}`);
  }

  // Orphaned image assets (their referencing series just got deleted).
  console.log("\nLooking for orphaned image assets…");
  const orphans = await sanity.fetch<{ _id: string }[]>(
    `*[_type == "sanity.imageAsset" && count(*[references(^._id)]) == 0]{ _id }[0...2000]`,
  );
  console.log(`Found ${orphans.length} orphan(s).`);
  for (let i = 0; i < orphans.length; i += 50) {
    const tx = sanity.transaction();
    for (const o of orphans.slice(i, i + 50)) tx.delete(o._id);
    await tx.commit({ visibility: "async" });
  }
  if (orphans.length) console.log(`  ✓ Deleted ${orphans.length} orphan(s).`);

  console.log("\n✓ Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

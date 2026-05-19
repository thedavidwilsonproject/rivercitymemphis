/**
 * Publish any pending drafts for the `pcoEvent` document type.
 *
 *   npm run publish:event-drafts
 *
 * Use this when Studio's UI hides the per-doc Publish button (new
 * Releases-based publishing flow). For each draft, copies the draft
 * content to the published id and removes the draft.
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN");
  process.exit(1);
}

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2026-05-17",
  token,
  useCdn: false,
  perspective: "raw",
});

type DraftDoc = {
  _id: string;
  _type: string;
  [key: string]: unknown;
};

async function main() {
  const drafts = await sanity.fetch<DraftDoc[]>(
    `*[_type == "pcoEvent" && _id in path("drafts.**")]`,
  );

  if (drafts.length === 0) {
    console.log("No pcoEvent drafts to publish.");
    return;
  }

  console.log(`Publishing ${drafts.length} draft(s):`);
  const tx = sanity.transaction();
  for (const draft of drafts) {
    const publishedId = draft._id.replace(/^drafts\./, "");
    const { _id: _draftId, _rev: _rev, ...content } = draft as DraftDoc & {
      _rev?: string;
    };
    tx.createOrReplace({ ...content, _id: publishedId });
    tx.delete(draft._id);
    console.log(`  • ${publishedId} — ${String(draft.name ?? "")}`);
  }
  await tx.commit();
  console.log(`\n✓ Published ${drafts.length} draft(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

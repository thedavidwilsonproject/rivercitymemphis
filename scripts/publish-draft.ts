/**
 * Publish a Sanity draft from the command line.
 *
 * Usage:
 *   npm run publish:draft <documentId>
 *
 * Examples:
 *   npm run publish:draft homePage
 *   npm run publish:draft siteSettings
 *   npm run publish:draft whoWeArePage
 *
 * Works on any Sanity tier — does not require Releases or the Studio UI.
 * Reads SANITY_API_WRITE_TOKEN from .env.local.
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-17";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  process.exit(1);
}
if (!token) {
  console.error("Missing SANITY_API_WRITE_TOKEN (needed to publish)");
  process.exit(1);
}

const docId = process.argv[2];
if (!docId) {
  console.error("Usage: npm run publish:draft <documentId>");
  console.error("Example: npm run publish:draft homePage");
  process.exit(1);
}

const publishedId = docId.startsWith("drafts.") ? docId.slice(7) : docId;
const draftId = `drafts.${publishedId}`;

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

async function main() {
  const draft = await client.getDocument(draftId);
  if (!draft) {
    console.log(
      `No draft found at ${draftId}. Nothing to publish — either there are no pending changes or the document hasn't been edited.`,
    );
    return;
  }

  console.log(`Publishing ${draftId} → ${publishedId}...`);

  // Atomic transaction: write draft contents as published, then delete the draft.
  const published = { ...draft, _id: publishedId };
  delete (published as Record<string, unknown>)._rev;

  await client
    .transaction()
    .createOrReplace(published)
    .delete(draftId)
    .commit();

  console.log(`✓ Published ${publishedId}`);
}

main().catch((err) => {
  console.error("Failed to publish:", err.message || err);
  process.exit(1);
});

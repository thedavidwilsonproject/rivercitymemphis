/**
 * Publish-a-draft helpers shared by the /admin/publish UI and the CLI script.
 *
 * Sanity v5 hides per-document Publish on free tier (publishing is routed
 * through paid Content Releases). This is the workaround: copy the draft
 * to the published id and delete the draft, all in one atomic transaction.
 */
import "server-only";
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-17";

function writeClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error("SANITY_API_WRITE_TOKEN is not set");
  }
  // perspective: "raw" is essential — the default "published" perspective
  // filters out drafts, which is exactly what we need to list and publish.
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
    perspective: "raw",
  });
}

export type DraftInfo = {
  publishedId: string;
  draftId: string;
  type: string;
  title: string;
  updatedAt?: string;
};

/** Friendly titles for the singleton documents we expect editors to publish. */
const SINGLETON_TITLES: Record<string, string> = {
  homePage: "Home Page",
  whoWeArePage: "Who We Are Page",
  whatToExpectPage: "What to Expect Page",
  locationPage: "Location Page",
  faqPage: "FAQ Page",
  connectPage: "Connect Page",
  nextPage: "Next Step Page",
  familiesPage: "Family Ministry Page",
  groupsPage: "Groups Page",
  beRichPage: "Be Rich Page",
  contactPage: "Contact Page",
  givePage: "Give Page",
  siteSettings: "Site Settings",
};

/** Return every document that has a pending draft. */
export async function listPendingDrafts(): Promise<DraftInfo[]> {
  const client = writeClient();
  const rows = await client.fetch<
    { _id: string; _type: string; _updatedAt: string; title?: string; name?: string }[]
  >(
    `*[_id in path("drafts.**")]{ _id, _type, _updatedAt, title, name } | order(_updatedAt desc)`,
  );
  return rows.map((r) => {
    const publishedId = r._id.replace(/^drafts\./, "");
    const fallback =
      SINGLETON_TITLES[publishedId] || r.title || r.name || publishedId;
    return {
      publishedId,
      draftId: r._id,
      type: r._type,
      title: fallback,
      updatedAt: r._updatedAt,
    };
  });
}

/** Publish a single draft (copy → published id, delete draft). */
export async function publishDraft(publishedId: string) {
  const client = writeClient();
  const safeId = publishedId.replace(/^drafts\./, "");
  const draftId = `drafts.${safeId}`;
  const draft = await client.getDocument(draftId);
  if (!draft) {
    return { ok: false as const, reason: "no-draft" };
  }
  const published = { ...draft, _id: safeId };
  delete (published as Record<string, unknown>)._rev;
  await client
    .transaction()
    .createOrReplace(published)
    .delete(draftId)
    .commit();
  return { ok: true as const };
}

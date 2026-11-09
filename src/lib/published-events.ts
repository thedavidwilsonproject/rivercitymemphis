/**
 * Reads the editor-curated allowlist of PCO events from Sanity —
 * which IDs to show on the public /events pages, and in what order.
 */
import { client } from "@/sanity/client";
import { publishedEventsQuery } from "@/sanity/queries";
import { getChurchCenterListedSignupIds } from "@/lib/church-center";

export type PublishedEvent = {
  pcoId: string;
  displayOrder?: number;
};

export async function getPublishedEvents(): Promise<PublishedEvent[]> {
  try {
    const rows = await client.fetch<PublishedEvent[]>(
      publishedEventsQuery,
      {},
      { next: { revalidate: 0 } },
    );
    return rows ?? [];
  } catch (e) {
    console.error("Failed to read published events from Sanity:", e);
    return [];
  }
}

export async function getPublishedIdSet(): Promise<Set<string>> {
  const rows = await getPublishedEvents();
  return new Set(rows.map((r) => r.pcoId));
}

/** Map of pcoId → displayOrder (or undefined). */
export async function getPublishedOrderMap(): Promise<Map<string, number | undefined>> {
  const rows = await getPublishedEvents();
  return new Map(rows.map((r) => [r.pcoId, r.displayOrder]));
}

/**
 * Design v2: which PCO signups appear on the site. A signup is visible when
 * an editor switched it on in Sanity OR it is publicly listed on Church
 * Center (rivercitymemphis.churchcenter.com/registrations) — so the site
 * mirrors Church Center. If neither source has anything, show all open.
 */
export async function getSignupVisibility(): Promise<(id: string) => boolean> {
  const [published, listed] = await Promise.all([
    getPublishedIdSet(),
    getChurchCenterListedSignupIds(),
  ]);
  if (published.size === 0 && (!listed || listed.size === 0)) return () => true;
  return (id) => published.has(id) || Boolean(listed?.has(id));
}

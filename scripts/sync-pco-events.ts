/**
 * Sync open Planning Center event signups into Sanity as `pcoEvent` docs.
 *
 *   npm run sync:events
 *
 * On every run:
 *   - Pulls open, unarchived signups from PCO Registrations
 *   - For each, ensures a `pcoEvent` doc exists in Sanity (doc id = `pcoEvent.<pcoId>`)
 *   - Refreshes `name` and `lastSyncedAt`
 *   - Never touches `showOnSite` or `displayOrder` — those belong to the editor
 *
 * Run this on a cron (e.g. daily) once you're happy with the flow.
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const sanityToken = process.env.SANITY_API_WRITE_TOKEN;
const pcoAppId = process.env.PCO_APP_ID;
const pcoSecret = process.env.PCO_SECRET;

if (!projectId || !sanityToken) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN");
  process.exit(1);
}
if (!pcoAppId || !pcoSecret) {
  console.error("Missing PCO_APP_ID or PCO_SECRET");
  process.exit(1);
}

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2026-05-17",
  token: sanityToken,
  useCdn: false,
});

const pcoAuth =
  "Basic " + Buffer.from(`${pcoAppId}:${pcoSecret}`).toString("base64");

type Signup = { id: string; name: string };

async function fetchOpenSignups(): Promise<Signup[]> {
  const url =
    "https://api.planningcenteronline.com/registrations/v2/signups" +
    "?filter=unarchived&per_page=100&where%5Bopen%5D=true";
  const res = await fetch(url, {
    headers: { Authorization: pcoAuth, Accept: "application/vnd.api+json" },
  });
  if (!res.ok) throw new Error(`PCO ${res.status} ${res.statusText}`);
  const json = (await res.json()) as {
    data: Array<{ id: string; attributes: { name?: string } }>;
  };
  return json.data.map((d) => ({ id: d.id, name: d.attributes.name ?? "" }));
}

async function main() {
  console.log(`Syncing PCO events → Sanity ${projectId}/${dataset}\n`);
  const signups = await fetchOpenSignups();
  console.log(`Found ${signups.length} open signup(s) in PCO.\n`);

  const now = new Date().toISOString();
  const tx = sanity.transaction();

  for (const s of signups) {
    const docId = `pcoEvent.${s.id}`;
    // createIfNotExists seeds the doc the first time without overwriting
    // the editor's `showOnSite` later.
    tx.createIfNotExists({
      _id: docId,
      _type: "pcoEvent",
      pcoId: s.id,
      name: s.name,
      showOnSite: false,
      lastSyncedAt: now,
    });
    // patch refreshes name + lastSyncedAt on every run, but leaves
    // showOnSite + displayOrder alone.
    tx.patch(docId, (p) =>
      p.set({ pcoId: s.id, name: s.name, lastSyncedAt: now }),
    );
    console.log(`  • ${s.id} — ${s.name}`);
  }

  await tx.commit();
  console.log(`\n✓ Synced ${signups.length} event(s).`);
  console.log(
    "Open the Studio and flip 'Show on website' on the ones you want public.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

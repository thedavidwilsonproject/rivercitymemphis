/**
 * Seed the /contact page singleton with current copy AND upload hero +
 * pastors photos to Sanity.
 *
 *   npm run seed:contact
 */
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { randomBytes } from "node:crypto";
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
});

const key = () => randomBytes(4).toString("hex");
const assetCache = new Map<string, string>();

async function upload(path: string): Promise<string> {
  if (assetCache.has(path)) return assetCache.get(path)!;
  const buf = await readFile(path);
  const asset = await sanity.assets.upload("image", buf, {
    filename: basename(path),
  });
  assetCache.set(path, asset._id);
  return asset._id;
}

function imageRef(ref: string, alt: string) {
  return { _type: "image", asset: { _type: "reference", _ref: ref }, alt };
}

async function main() {
  console.log(`Seeding contact page → ${projectId}/${dataset}\n`);

  const [heroId, pastorsId] = await Promise.all([
    upload("public/brand/pages/contact/hero.jpg"),
    upload("public/brand/pages/contact/pastors.jpg"),
  ]);

  await sanity.createOrReplace({
    _id: "contactPage",
    _type: "contactPage",
    hero: {
      eyebrow: "Contact",
      headline: "We'd love to hear from you.",
      intro:
        "Whether you're new, exploring faith, walking through something hard, or just want to say hi — we'd love to connect. Reach out any of the ways below and a real person will get back to you.",
      image: imageRef(heroId, "RCC attendees walking into the building on a Sunday morning"),
    },
    infoIntro: {
      eyebrow: "How to reach us",
      headline: "Pick the way that works for you.",
      intro:
        "Stop by on a Sunday, call us during the week, or drop us an email — we're a phone call away.",
    },
    reasonsSection: {
      eyebrow: "What can we help with?",
      headline: "Tap a reason — we'll be in touch.",
      intro:
        "Each button opens a pre-filled email to info@rivercitymemphis.org so we can route it to the right person.",
      reasons: [
        { _key: key(), _type: "reason", label: "I just accepted Jesus", subject: "I just accepted Jesus" },
        { _key: key(), _type: "reason", label: "I need prayer", subject: "Prayer request" },
        { _key: key(), _type: "reason", label: "I want to share my story", subject: "I want to share my story" },
        { _key: key(), _type: "reason", label: "I'd like to get baptized", subject: "Baptism inquiry" },
        { _key: key(), _type: "reason", label: "I'm new at River City", subject: "I'm new at RCC" },
        { _key: key(), _type: "reason", label: "General contact", subject: "General contact" },
      ],
    },
    pastorsCallout: {
      eyebrow: "Talk to a pastor",
      headline: "There's a real person on the other end.",
      body: "If you'd rather talk with someone directly, our pastors are happy to grab a coffee, hop on a call, or meet up after a service. Just send a note and we'll reach out within a couple business days.",
      image: imageRef(pastorsId, "RCC pastors Jonathan Dunn and Eddie Davis talking on stage"),
      ctaLabel: "Email the pastors",
      ctaHref: "mailto:info@rivercitymemphis.org?subject=I'd like to talk with a pastor",
    },
    cta: {
      headline: "First time? Plan your visit.",
      body: "Coming Sunday? Let us know — we'll meet you at the door and walk you in.",
      primaryCta: { label: "Plan your visit", href: "/visit/what-to-expect" },
      secondaryCta: { label: "Get directions", href: "/visit/location" },
    },
  });

  console.log(`✓ contactPage seeded. ${assetCache.size} images uploaded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

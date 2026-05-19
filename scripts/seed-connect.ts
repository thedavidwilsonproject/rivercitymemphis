/**
 * Seed the /connect hub singleton (connectPage) with current copy
 * AND upload the curated photos to Sanity so editors see them in Studio.
 *
 *   npm run seed:connect
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
  console.log(`Seeding connect page → ${projectId}/${dataset}\n`);

  const [heroId, nextId, familiesId, groupsId, beRichId] = await Promise.all([
    upload("public/brand/pages/connect/hero.jpg"),
    upload("public/brand/pages/connect/next.jpg"),
    upload("public/brand/pages/connect/families.jpg"),
    upload("public/brand/pages/connect/groups.jpg"),
    upload("public/brand/pages/connect/be-rich.jpg"),
  ]);

  await sanity.createOrReplace({
    _id: "connectPage",
    _type: "connectPage",
    hero: {
      eyebrow: "Connect",
      headline: "Take your next step.",
      intro:
        "We're always looking for ways to help people plug in to what God is doing in our city, nation, and world. Here are four good places to start.",
      image: imageRef(heroId, "Families walking up to the RCC building on a Sunday morning"),
    },
    cards: [
      {
        _key: key(),
        _type: "card",
        eyebrow: "New here?",
        title: "Next",
        blurb:
          "A 15-minute session with our lead pastor Jonathan Dunn — why we exist, how to get connected, and answers to your questions.",
        href: "/connect/next",
        ctaLabel: "Plan to attend →",
        image: imageRef(nextId, "Jonathan Dunn teaching at RCC on a Sunday morning"),
        featured: true,
      },
      {
        _key: key(),
        _type: "card",
        eyebrow: "For your whole family",
        title: "Family Ministries",
        blurb:
          "Safe, fun, age-appropriate environments where your kids will love to grow — and where we partner with you to help them see Jesus more clearly.",
        href: "/connect/families",
        ctaLabel: "Meet the team →",
        image: imageRef(familiesId, "A small group leader teaching kids at RCC"),
        featured: false,
      },
      {
        _key: key(),
        _type: "card",
        eyebrow: "Real friendship",
        title: "Groups",
        blurb:
          "Circles are better than rows. Get plugged into a small group where life happens around a table — questions, laughter, prayer, and the kind of friendship that lasts.",
        href: "/groups",
        ctaLabel: "Find a group →",
        image: imageRef(groupsId, "RCC members talking in the lobby with coffee after a service"),
        featured: false,
      },
      {
        _key: key(),
        _type: "card",
        eyebrow: "Love your city",
        title: "Be Rich",
        blurb:
          "We believe we're on mission in our city to reach those in need — serving our neighbors, supporting non-profits, and showing the love of Jesus in tangible ways.",
        href: "/connect/be-rich",
        ctaLabel: "Get involved →",
        image: imageRef(beRichId, "RCC hosting Easter Fest — a free community event in Bartlett"),
        featured: true,
      },
    ],
    cta: {
      headline: "Not sure where to start?",
      body: "Come say hi this Sunday. Coffee starts at 10:00, the service is at 10:15 — and a friend you haven't met yet is already saving you a seat.",
      primaryCta: { label: "Plan your visit", href: "/visit/what-to-expect" },
      secondaryCta: { label: "Get directions", href: "/visit/location" },
    },
  });

  console.log(`✓ connectPage seeded. ${assetCache.size} images uploaded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

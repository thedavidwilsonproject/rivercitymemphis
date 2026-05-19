/**
 * Seed the /groups page singleton with current copy AND upload curated
 * photos to Sanity.
 *
 *   npm run seed:groups
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

function para(text: string) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

async function main() {
  console.log(`Seeding groups page → ${projectId}/${dataset}\n`);

  const [heroId, communityId, focusId] = await Promise.all([
    upload("public/brand/pages/groups/hero.jpg"),
    upload("public/brand/pages/groups/community.jpg"),
    upload("public/brand/pages/groups/focus.jpg"),
  ]);

  await sanity.createOrReplace({
    _id: "groupsPage",
    _type: "groupsPage",
    hero: {
      eyebrow: "Connect / Do life with people",
      headline: "RCC Groups",
      intro:
        "Real growth happens in circles, not rows. Groups at RCC are how we get to know each other, learn alongside each other, and experience the kind of community we were made for.",
      image: imageRef(
        heroId,
        "A crowd of RCC adults fellowshipping in the lobby after a Sunday service",
      ),
    },
    intro: {
      eyebrow: "Why groups",
      headline: "A huge deal at RCC.",
      body: [
        para(
          "Groups are a huge deal at River City Church. We believe that getting to know others better, learning alongside them, and experiencing true community are vital to spiritual growth.",
        ),
        para(
          "There are a few different ways to plug in — pick the one that fits your stage of life and your schedule. Whichever you choose, expect a relaxed, friendly room of people who'll accept you for who you are.",
        ),
      ],
    },
    kinds: [
      {
        _key: key(),
        _type: "groupKind",
        eyebrow: "For adults in similar seasons",
        name: "Community Groups",
        format: "10–12 adults · meets weekly in homes",
        schedule: "Ongoing · weekly · in homes around Memphis",
        blurb:
          "Real life change happens in community. Community Groups are 10–12 adults in similar seasons of life who meet weekly in homes — to get to know each other, share what life looks like, and connect Sunday's teaching to Monday's reality.",
        highlights: [
          "10–12 adults, similar life stage",
          "Weekly · in homes",
          "Discussion + life-on-life",
        ],
        image: imageRef(
          communityId,
          "A mixed group of RCC adults standing and talking outside the church entrance",
        ),
        ctaLabel: "Find a Community Group",
        ctaHref: "/groups",
      },
      {
        _key: key(),
        _type: "groupKind",
        eyebrow: "For deeper, shorter-term study",
        name: "Focus Groups",
        format: "Men with men, women with women · 90 days",
        schedule: "90-day sessions · book + discussion",
        blurb:
          "We also believe in connecting in even smaller groups with people in different ages and stages. Focus Groups are 90-day sessions that connect women with other women and men with other men around a particular book and discussion.",
        highlights: [
          "90-day commitment",
          "Men with men · women with women",
          "Book + guided discussion",
        ],
        image: imageRef(
          focusId,
          "Five women around a round table together at an RCC Focus Group",
        ),
        ctaLabel: "Learn about Next",
        ctaHref: "/connect/next",
      },
    ],
    join: {
      eyebrow: "How to join",
      headline: "Two easy on-ramps.",
      intro:
        "You don't need to know anyone to get started. Pick the on-ramp that fits, and we'll walk you through the next step.",
      steps: [
        {
          _key: key(),
          _type: "step",
          title: "Come to Discover River City",
          description:
            "Our short, no-pressure session for anyone interested in Community Groups or partnership at RCC. We'll get to know you and help you find a group.",
        },
        {
          _key: key(),
          _type: "step",
          title: "Go through Next",
          description:
            "Offered after our Sunday morning service. The best on-ramp to Focus Groups and to figuring out where you fit at RCC.",
        },
        {
          _key: key(),
          _type: "step",
          title: "Browse and request",
          description:
            "Below you'll find groups currently accepting new people. Click into one, and the leader will reach out to you directly.",
        },
      ],
      footnote:
        "Still not sure where to start? Email info@rivercitymemphis.org and we'll help you find a fit.",
    },
    embed: {
      eyebrow: "Available now",
      headline: "Find your group.",
      intro:
        "Browse groups currently open for new members. Click one to request to join — the group leader will reach out to you.",
    },
    cta: {
      headline: "Real growth happens in circles.",
      body: "Take the first step this week — pick a group, request to join, or start one of your own.",
      primaryCta: { label: "Browse all groups", href: "/groups" },
      secondaryCta: { label: "Start a new group", href: "/forms" },
    },
  });

  console.log(`✓ groupsPage seeded. ${assetCache.size} images uploaded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Seed the /connect/next page singleton with the current copy AND
 * upload the curated photos to Sanity.
 *
 *   npm run seed:next
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
  console.log(`Seeding next page → ${projectId}/${dataset}\n`);

  const [heroId, introId] = await Promise.all([
    upload("public/brand/pages/next/hero.jpg"),
    upload("public/brand/pages/next/jonathan.jpg"),
  ]);

  await sanity.createOrReplace({
    _id: "nextPage",
    _type: "nextPage",
    hero: {
      eyebrow: "Connect / Your next step",
      headline: "Welcome to Next.",
      intro:
        "A short, friendly 20 minutes with our lead pastor Jonathan Dunn — get to know RCC, find out how to plug in, and ask your questions.",
      image: imageRef(heroId, "An RCC host team volunteer welcoming guests at the front door"),
    },
    intro: {
      eyebrow: "What is Next?",
      headline: "A no-pressure intro to RCC.",
      body: [
        para(
          "One of the things we hope for everyone who visits is that you'll find a level of comfort in our environments — and then want to take a next step. Maybe that's understanding what RCC is all about, finding out how to get plugged in, or just getting answers to the questions on your mind.",
        ),
        para(
          "Next is the easiest way to do all three. It's a brief 20-minute session offered (usually) on the last Sunday of each month, right after the 10:15 AM service. We'll cover the mission and vision of the church and walk through your options if you want to get more involved.",
        ),
      ],
      image: imageRef(introId, "Jonathan Dunn, lead pastor of RCC, on stage during a service"),
      imageCaption: "Hosted by Jonathan Dunn, lead pastor.",
    },
    whatToExpect: {
      eyebrow: "What to expect",
      headline: "Friendly, focused, fast.",
      items: [
        {
          _key: key(),
          _type: "item",
          title: "Coffee + a quick hello",
          description:
            "Find us right after the service — grab a coffee, take a seat, settle in. The room is small and conversational on purpose.",
        },
        {
          _key: key(),
          _type: "item",
          title: "20 minutes with Jonathan",
          description:
            "Our lead pastor walks through who we are, why we exist, and what God is up to at River City — short, honest, no jargon.",
        },
        {
          _key: key(),
          _type: "item",
          title: "Your questions, answered",
          description:
            "Bring whatever you've been wondering about. Doctrine, kids' programs, how giving works, where to start — nothing is off the table.",
        },
        {
          _key: key(),
          _type: "item",
          title: "Clear next steps",
          description:
            "Leave with a concrete picture of how to get plugged in — a small group, serving on a team, baptism, or just coming back next Sunday.",
        },
      ],
    },
    quickFacts: {
      when: {
        label: "When",
        value: "Last Sunday of the month",
        note: "Right after the 10:15 service",
      },
      where: {
        label: "Where",
        value: "Right in the auditorium",
        note: "A host will point you to the row",
      },
      duration: {
        label: "How long",
        value: "About 20 minutes",
        note: "Kids stay in Family Ministry",
      },
    },
    cta: {
      headline: "Save us a seat at the next one.",
      body:
        "Let us know you're planning to come and we'll keep an eye out for you. Not ready yet? Plan a visit first — Next will still be here next month.",
      primaryCta: { label: "Tell us you're coming", href: "/contact" },
      secondaryCta: { label: "Plan a visit first", href: "/visit/what-to-expect" },
    },
  });

  console.log(`✓ nextPage seeded. ${assetCache.size} images uploaded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

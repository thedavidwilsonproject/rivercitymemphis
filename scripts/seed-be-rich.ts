/**
 * Seed the /connect/be-rich page singleton with current copy AND upload
 * the hero photo to Sanity.
 *
 *   npm run seed:be-rich
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
  console.log(`Seeding be-rich page → ${projectId}/${dataset}\n`);

  const [heroId] = await Promise.all([
    upload("public/brand/pages/be-rich/hero.jpg"),
  ]);

  await sanity.createOrReplace({
    _id: "beRichPage",
    _type: "beRichPage",
    hero: {
      eyebrow: "Connect / Do more. Give more.",
      headline: "Be Rich",
      tagline: "Do more. Give more.",
      intro:
        "We're on mission in our city to reach people in need — locally, nationally, and globally. Be Rich is how we put that mission into practice: pooling our generosity to share the love of Jesus in tangible ways.",
      image: imageRef(
        heroId,
        "A row of children's winter coats hung on hooks at River City Church — from a Be Rich coat drive",
      ),
    },
    intro: {
      eyebrow: "Why we do this",
      headline: "Generosity is part of the mission.",
      body: [
        para(
          "Our mission at River City Church is to lead people into a growing relationship with Jesus Christ. One key way we do that is by serving people in need. Be Rich is the simplest way to plug in: when we give and serve together, we accomplish more than any of us could on our own.",
        ),
        para(
          "Throughout the year, we support local schools, food banks, homeless shelters, and low-income relief organizations in Shelby County. We partner nationally to fight injustices like human trafficking. And we sponsor children around the world through trusted global partners.",
        ),
      ],
    },
    partnersSection: {
      eyebrow: "Where it goes",
      headline: "Our partners.",
      intro:
        "Every dollar we raise goes to organizations already doing the work. Here's who we partner with — locally, nationally, and globally.",
      partners: [
        {
          _key: key(),
          _type: "partner",
          scope: "local",
          name: "Memphis Dream Center",
          blurb:
            "A local organization that addresses both the symptoms of poverty and the root causes — meeting tangible needs while restoring hope, dignity, and dreams across our city.",
          url: "https://memphisdreamcenter.org/",
        },
        {
          _key: key(),
          _type: "partner",
          scope: "local",
          name: "Local schools, food banks & shelters",
          blurb:
            "Throughout the year we support schools, food banks, homeless shelters, and low-income relief organizations across Shelby County — meeting practical needs in our own backyard.",
        },
        {
          _key: key(),
          _type: "partner",
          scope: "national",
          name: "End It Movement",
          blurb:
            "A coalition of organizations confronting modern-day slavery and human trafficking. We partner to raise awareness and fund rescue and aftercare for those caught in it.",
          url: "https://enditmovement.com/",
        },
        {
          _key: key(),
          _type: "partner",
          scope: "global",
          name: "World Vision",
          blurb:
            "We sponsor children through World Vision's global relief and development work — partnering long-term with kids and families in some of the toughest places in the world.",
          url: "https://www.worldvision.org/",
        },
      ],
    },
    cta: {
      eyebrow: "Get involved",
      headline: "Do more. Give more.",
      body: "Whether it's a one-time gift, ongoing giving, or showing up to serve — every bit of generosity multiplies when we do it together. Pick the next step that fits.",
      primaryCta: { label: "Give now", href: "/give" },
      secondaryCta: { label: "Find a way to serve", href: "/connect" },
    },
  });

  console.log(`✓ beRichPage seeded. ${assetCache.size} images uploaded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

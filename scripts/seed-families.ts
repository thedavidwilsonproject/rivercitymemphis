/**
 * Seed the /connect/families page singleton with current copy AND
 * upload the curated photos to Sanity.
 *
 *   npm run seed:families
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
  console.log(`Seeding families page → ${projectId}/${dataset}\n`);

  const [heroId, waumbaId, upstreetId, studentsId] = await Promise.all([
    upload("public/brand/pages/families/hero.jpg"),
    upload("public/brand/pages/families/waumba.jpg"),
    upload("public/brand/pages/families/upstreet.jpg"),
    upload("public/brand/pages/families/students.jpg"),
  ]);

  await sanity.createOrReplace({
    _id: "familiesPage",
    _type: "familiesPage",
    hero: {
      eyebrow: "Connect / For your family",
      headline: "Family Ministry",
      intro:
        "Your kid's favorite day of the week. Skilled volunteers, fun environments, and a focused message that helps every age see Jesus more clearly — so you can worship freely while we take great care of them.",
      image: imageRef(heroId, "Families with kids of all ages outside RCC at Easter Fest"),
    },
    intro: {
      eyebrow: "What it's about",
      headline: "Partnering with parents.",
      body: [
        para(
          "From start to finish, we work hard to make your family's time with us a great experience. We use skilled volunteers, age-appropriate spaces, and a focused weekly message so your child leaves understanding one big idea — and asking when they can come back.",
        ),
        para(
          "Below are the three environments we offer. Each has its own room, its own rhythm, and a team of leaders who actually know your kid's name.",
        ),
      ],
    },
    environments: [
      {
        _key: key(),
        _type: "environment",
        eyebrow: "For your littles",
        name: "Waumba Land",
        ageRange: "Ages 6 weeks – Pre-K",
        schedule: "Sundays during the 10:15 service",
        blurb:
          "Infants through Pre-K cared for in small groups in clean, safe, carefully staffed rooms. Your littles will be loved on while you worship — and they'll come home smiling.",
        coreTruths: [
          "God made me.",
          "God loves me.",
          "Jesus wants to be my friend forever.",
        ],
        image: imageRef(waumbaId, "RCC Waumba Land — moms holding babies on a play mat in the nursery"),
        facebookUrl: "https://www.facebook.com/RCCKids/",
      },
      {
        _key: key(),
        _type: "environment",
        eyebrow: "For elementary kids",
        name: "UpStreet",
        ageRange: "Kindergarten – 5th grade",
        schedule: "Sundays during the 10:15 service · Kids & Students building",
        blurb:
          "An engaging large-group worship and teaching time, then small groups by grade (K-2 and 3-5) with adult leaders who know your kid. Every week lands on one clear truth your kid can take home and live out Monday morning.",
        coreTruths: [
          "Wisdom — make the wise choice.",
          "Faith — trust God no matter what.",
          "Friendship — treat others how you want to be treated.",
        ],
        image: imageRef(upstreetId, "An RCC UpStreet leader teaching elementary kids during a Sunday service"),
        facebookUrl: "https://www.facebook.com/RCCKids/",
      },
      {
        _key: key(),
        _type: "environment",
        eyebrow: "For middle + high school",
        name: "Students",
        ageRange: "6th – 12th grade",
        schedule: "Transit: Sundays at 10:15 · All Access: Wednesdays at 6:15 PM",
        blurb:
          "Middle schoolers gather Sunday mornings in Transit. High schoolers serve alongside our team in Waumba Land and UpStreet through Student Impact. Both groups come together Wednesdays for All Access — worship, teaching, and small group breakdown.",
        coreTruths: [
          "Created to pursue an authentic relationship with my Creator.",
          "I belong to Jesus, and He defines who I am.",
          "I exist to show God's love to a broken world.",
        ],
        image: imageRef(studentsId, "RCC students hanging out at All Access on a Wednesday evening"),
        facebookUrl: "https://www.facebook.com/RCCStudents/",
      },
    ],
    checkin: {
      eyebrow: "How it works",
      headline: "Check-In, made simple.",
      intro:
        "Your first time? Arrive about 15 minutes early. A host will walk you to the Waumba Land or UpStreet desk and stay with you through check-in.",
      steps: [
        {
          _key: key(),
          _type: "step",
          title: "Get matching tags",
          description:
            "You and your child each get a security tag with the same number. You'll need yours to pick them up.",
        },
        {
          _key: key(),
          _type: "step",
          title: "We've got safety covered",
          description:
            "Only you can pick up your child. Our team verifies every tag, every time — no exceptions.",
        },
        {
          _key: key(),
          _type: "step",
          title: "Need us? You'll know.",
          description:
            "If we ever need to reach you during the service, your child's number flashes on the screen and a host walks you back to them.",
        },
      ],
      footnote:
        "Two simple systems, one goal: your kid is safe, and you can worship distraction-free.",
    },
    cta: {
      headline: "Bring 'em this Sunday.",
      body: "We can't wait to meet your family. Arrive about 15 minutes early so we have time to walk you through Check-In and answer any questions.",
      primaryCta: { label: "Plan your visit", href: "/visit/what-to-expect" },
      secondaryCta: { label: "Get directions", href: "/visit/location" },
    },
  });

  console.log(`✓ familiesPage seeded. ${assetCache.size} images uploaded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Seed the three /visit/* page singletons (whoWeArePage,
 * whatToExpectPage, locationPage) with current production copy AND
 * upload all the curated photos to Sanity so editors see them in Studio.
 *
 *   npm run seed:visit
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
  const asset = await sanity.assets.upload("image", buf, { filename: basename(path) });
  assetCache.set(path, asset._id);
  return asset._id;
}

function imageRef(ref: string, alt: string) {
  return { _type: "image", asset: { _type: "reference", _ref: ref }, alt };
}

/** Minimal Portable Text helper. */
function para(text: string) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

async function seedWhoWeAre() {
  console.log("→ whoWeArePage");
  const heroId = await upload("public/brand/pages/who-we-are/exterior.jpg");
  const cultureId = await upload("public/brand/pages/who-we-are/entrance.jpg");
  const worshipId = await upload("public/brand/pages/who-we-are/worship.jpg");
  const beliefsId = await upload("public/brand/pages/who-we-are/teaching.jpg");
  const baptismId = await upload("public/brand/pages/who-we-are/baptism.jpg");

  await sanity.createOrReplace({
    _id: "whoWeArePage",
    _type: "whoWeArePage",
    hero: {
      eyebrow: "Visit",
      headline: "Who We Are",
      intro:
        "A relaxed, friendly community in Bartlett, TN — partnering with God to lead people to refocus their life, home, and the church back to Him.",
      image: imageRef(heroId, "Family walking up to the RCC building"),
    },
    mvs: {
      eyebrow: "Why we exist",
      headline: "Our Mission, Vision & Strategy",
      intro:
        "At River City Church, we are passionate in expressing our mission, vision, and strategy in clearly defined ways. It's why we exist, and why we do what we do each week in our gatherings.",
      mission: {
        label: "Mission",
        statement:
          "Lead people into a growing relationship with Jesus Christ.",
        description:
          "It's why we exist, and why we do what we do each week in our gatherings — every environment, every Sunday, every conversation points back to this.",
      },
      vision: {
        label: "Vision",
        statement:
          "Refocus each life, each home, and the church back to God.",
        description:
          "This vision permeates through all of our environments — from Family Ministry to our small group gatherings. A refocus is needed and a refocus is what we see as a unique call on this church.",
      },
      strategy: {
        label: "Strategy",
        statement:
          "Create irresistible environments where three key things happen:",
        pillars: [
          {
            _key: key(),
            _type: "pillar",
            name: "Intimacy with God",
            description:
              "Worship, prayer, and Scripture that draw people close to the One who made them.",
          },
          {
            _key: key(),
            _type: "pillar",
            name: "Community with insiders",
            description:
              "Small groups and shared life — friendship that goes deeper than Sunday morning.",
          },
          {
            _key: key(),
            _type: "pillar",
            name: "Influence with outsiders",
            description:
              "Living lives that point our neighbors and city back toward Jesus.",
          },
        ],
        description:
          "From our worship experience to our small group gatherings throughout the week, we hope to have these three elements illuminate both our mission and our vision for all those who are a part of RCC.",
      },
    },
    culture: {
      eyebrow: "Our culture",
      headline: "Come as you are.",
      body: [
        para(
          "The culture at RCC can best be defined as real — and it can be attributed to our desire to create a safe place for anyone to take that next step in their journey with God.",
        ),
        para(
          "Our hope is that each person leaves each week knowing that they have encountered God in a freeing and worshipful way.",
        ),
      ],
      image: imageRef(cultureId, "Walking into the RCC auditorium on a Sunday morning"),
      cta: { label: "Plan your visit →", href: "/visit/what-to-expect" },
    },
    worshipBanner: imageRef(worshipId, "RCC worship band on a Sunday morning"),
    story: {
      eyebrow: "Our story",
      headline: "Refocus.",
      body: [
        para(
          "Our journey began in 2007, when Jonathan Dunn began to sense God calling him to lead a church that would reach the people who were currently put off by church.",
        ),
        para(
          "He felt that God was calling him to plant a new church in the Memphis area with a clear vision: refocus our city back to God. That vision meant RCC would passionately pursue helping each person refocus their life back to God, each family refocus back to God, and even help the church refocus back to God.",
        ),
      ],
    },
    beliefs: {
      eyebrow: "What we believe",
      headline: "Jesus at the center.",
      body: [
        para(
          "RCC is non-denominational. We teach the Bible plainly each week with a focus on practical application — what does it actually look like to follow Jesus on Monday morning?",
        ),
        para(
          "Our preaching is honest about life's complexity, hopeful about God's grace, and rooted in Scripture from start to finish.",
        ),
      ],
      image: imageRef(beliefsId, "Jonathan Dunn teaching at RCC"),
      cta: { label: "Watch a recent message →", href: "/watch" },
    },
    baptismBanner: {
      image: imageRef(baptismId, "Baptism — 'Raised to Life' at RCC"),
      overlayTitle: "Raised to Life",
      overlayBody:
        "Real change. Real stories. Real people stepping toward Jesus — every week at RCC.",
    },
    cta: {
      headline: "We'd love to meet you.",
      body:
        "Visit us this Sunday at 10:15 AM — coffee starts 15 minutes earlier and a friend you haven't met yet is probably already saving you a seat.",
      primaryCta: { label: "Plan your visit", href: "/visit/what-to-expect" },
      secondaryCta: { label: "Get directions", href: "/visit/location" },
    },
  });
  console.log("  ✓ whoWeArePage");
}

async function seedWhatToExpect() {
  console.log("→ whatToExpectPage");
  const heroId = await upload("public/brand/pages/what-to-expect/hero.jpg");
  const stepImgIds = await Promise.all(
    [
      "public/brand/pages/what-to-expect/parking.jpg",
      "public/brand/pages/what-to-expect/welcomed.jpg",
      "public/brand/pages/what-to-expect/lobby.jpg",
      "public/brand/pages/what-to-expect/kids.jpg",
      "public/brand/pages/what-to-expect/service.jpg",
    ].map(upload),
  );

  const steps = [
    {
      number: "01",
      title: "Pull in.",
      body: "Easy parking off Kirby-Whitten Parkway. Look for a volunteer in a yellow vest — they'll wave you toward an open spot and point you to the entrance.",
      alt: "RCC parking team volunteers in yellow vests welcoming guests",
    },
    {
      number: "02",
      title: "Get welcomed.",
      body: "Someone will say hello at the door. You don't need to know anyone, dress a certain way, or have answers ready — just come as you are.",
      alt: "An RCC host team volunteer greeting people at the front door",
    },
    {
      number: "03",
      title: "Grab a coffee.",
      body: "Free coffee from 10:00 AM. Take a minute, meet someone, breathe. The lobby is the easiest place to get your bearings before the service starts.",
      alt: "Grabbing coffee at the RCC coffee bar before the service",
    },
    {
      number: "04",
      title: "Check the kids in.",
      body: "Family Ministry environments for infants through 8th grade are open at 10:15. Safe, trained, fun-filled — your kids will have a blast and you'll have a quiet, focused hour.",
      alt: "RCC Family Ministry baby room",
    },
    {
      number: "05",
      title: "Worship + a real message.",
      body: "Live band, contemporary music, then a clear teaching from Scripture that connects to everyday life. The full service runs 65–70 minutes — we start and end on time.",
      alt: "RCC worship leader on stage during a Sunday service",
    },
  ];

  await sanity.createOrReplace({
    _id: "whatToExpectPage",
    _type: "whatToExpectPage",
    hero: {
      eyebrow: "Visit",
      headline: "What to Expect",
      intro:
        "From the parking lot to your seat — here's exactly what your first Sunday at RCC looks like.",
      image: imageRef(heroId, "RCC Sunday morning — view from the soundboard"),
    },
    lede:
      "We aim to make every visit feel easy. From parking to the auditorium — coffee, kids check-in, a seat next to someone friendly. *You really do matter here.*",
    steps: steps.map((s, i) => ({
      _key: key(),
      _type: "step",
      number: s.number,
      title: s.title,
      body: s.body,
      image: imageRef(stepImgIds[i], s.alt),
    })),
    quickFacts: {
      serviceTime: {
        label: "Service time",
        value: "Sundays · 10:15 AM",
        note: "Coffee starts at 10:00",
      },
      address: {
        label: "Address",
        value: "3871 Kirby Whitten Pkwy",
        note: "Bartlett, TN 38135",
      },
      duration: {
        label: "How long",
        value: "65–70 minutes",
        note: "We start and end on time",
      },
    },
    cta: {
      headline: "Save us a seat.",
      body:
        "Already know you're coming? Tell us a little about yourself so we can look for you — or just show up. Either works.",
      primaryCta: { label: "Let us know", href: "/connect/next" },
      secondaryCta: { label: "Get directions", href: "/visit/location" },
    },
  });
  console.log("  ✓ whatToExpectPage");
}

async function seedLocation() {
  console.log("→ locationPage");
  await sanity.createOrReplace({
    _id: "locationPage",
    _type: "locationPage",
    hero: {
      eyebrow: "Visit",
      headline: "Location & Time",
      intro:
        "We meet in suburban Bartlett, at the corner of Kirby-Whitten Pkwy and St. Elmo Rd.",
    },
    serviceNote: "Coffee starts at 10:00 · Service runs 65–70 minutes",
    familyMinistryNote:
      "Family Ministry environments open at 10:15 for infants through 8th grade.",
    directionsLabel: "Get directions",
    appleMapsLabel: "Open in Apple Maps",
    communities: {
      eyebrow: "We serve",
      headline: "Memphis and the suburbs we call home.",
      list: ["Bartlett", "Lakeland", "Arlington", "Millington", "Cordova"],
      footer:
        "Whether you're coming from across the street or across the river, there's a seat saved for you.",
    },
    cta: {
      headline: "First time visiting?",
      body:
        "Here's exactly what your first Sunday will look like, from the parking lot to your seat.",
      primaryCta: { label: "What to expect", href: "/visit/what-to-expect" },
      secondaryCta: { label: "Let us know you're coming", href: "/connect/next" },
    },
  });
  console.log("  ✓ locationPage");
}

async function main() {
  console.log(`Seeding visit pages → ${projectId}/${dataset}\n`);
  await seedWhoWeAre();
  await seedWhatToExpect();
  await seedLocation();
  console.log(`\n✓ Done. ${assetCache.size} images uploaded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

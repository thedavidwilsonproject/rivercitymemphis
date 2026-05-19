/**
 * Seed the Home Page singleton.
 *
 * Pre-fills every field on the homePage doc with current production copy
 * AND uploads the four ministry photos to Sanity so editors see them
 * inside Studio (and can swap them image-by-image rather than via files).
 *
 *   npm run seed:home
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

async function uploadPhoto(path: string): Promise<string> {
  const buf = await readFile(path);
  const asset = await sanity.assets.upload("image", buf, {
    filename: basename(path),
  });
  return asset._id;
}

function imageRef(ref: string, alt: string) {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: ref },
    alt,
  };
}

const MINISTRIES = [
  {
    name: "Waumba Land",
    age: "Infants thru Pre-K",
    description:
      "Waumba Land & PreK Park are our weekly environments created especially for your infants (six weeks) through preschool-aged children.",
    color: "#DC5237",
    photo: "public/brand/ministries/photos/waumba.jpg",
    altText: "Toddler petting a goat at Easter Fest",
    href: "/connect/families",
  },
  {
    name: "UpStreet",
    age: "Kindergarten thru 5th",
    description:
      "In UpStreet we want kids to see how God's Word fits in to their lives, to learn how to talk to Him, and to build relationships that will last.",
    color: "#7BAA53",
    photo: "public/brand/ministries/photos/upstreet.jpg",
    altText: "Elementary-age kid on a bounce house",
    href: "/connect/families",
  },
  {
    name: "Transit",
    age: "Middle School",
    description:
      "Transit is the weekly teaching environment for 6th–8th grade students. Students experience a combination of music, games, teaching, and small group interaction with a dedicated small group of peers.",
    color: "#4AB5D7",
    photo: "public/brand/ministries/photos/transit.jpg",
    altText: "Students with hands raised in worship",
    href: "/connect/families",
  },
  {
    name: "All Access",
    age: "High School",
    description:
      "All Access is our high school experience (with middle school included) aimed to create moments where students are able to worship, learn, have fun, and be encouraged by our incredible small group leaders.",
    color: "#D8A33A",
    photo: "public/brand/ministries/photos/allaccess.jpg",
    altText: "High school worship night with hexagon LED stage",
    href: "/connect/families",
  },
];

async function main() {
  console.log(`Seeding Home Page → ${projectId}/${dataset}`);

  console.log("Uploading ministry photos…");
  const photoRefs: string[] = [];
  for (const m of MINISTRIES) {
    const ref = await uploadPhoto(m.photo);
    console.log(`  ✓ ${m.name} — ${ref}`);
    photoRefs.push(ref);
  }

  console.log("Writing homePage doc…");
  await sanity.createOrReplace({
    _id: "homePage",
    _type: "homePage",
    hero: {
      eyebrow: "Bartlett, TN",
      headline: "Refocus your life, home, and church back to God.",
      subhead:
        "A relaxed, friendly community where people accept you for who you are. Join us Sundays at 10:15 AM.",
      primaryCta: { label: "Plan Your Visit", href: "/visit/what-to-expect" },
      secondaryCta: { label: "Watch Online", href: "/watch" },
    },
    currentSeriesSection: {
      title: "Current Series",
      viewAllLabel: "View All →",
      viewAllHref: "/watch",
      count: 3,
    },
    kidsAndStudentsSection: {
      title: "Kids and Students",
      intro:
        "In our Family Ministry, we believe that we have an opportunity to share God's heart in some fun and inspiring ways. We aim to partner with parents in helping their child see Jesus more clearly!",
      ministries: MINISTRIES.map((m, i) => ({
        _key: key(),
        _type: "ministryCard",
        name: m.name,
        age: m.age,
        description: m.description,
        color: m.color,
        photo: imageRef(photoRefs[i], m.altText),
        href: m.href,
      })),
    },
  });
  console.log("✓ Home Page seeded.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

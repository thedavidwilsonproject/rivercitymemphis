/**
 * Seed the /give page singleton with current copy AND upload hero +
 * Dime accreditation badge to Sanity.
 *
 *   npm run seed:give
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
  console.log(`Seeding give page → ${projectId}/${dataset}\n`);

  const [heroId, dimeId] = await Promise.all([
    upload("public/brand/pages/give/hero.jpg"),
    upload("public/brand/pages/give/dime-accredited.png"),
  ]);

  await sanity.createOrReplace({
    _id: "givePage",
    _type: "givePage",
    hero: {
      eyebrow: "Give",
      headline: "Ways to Give",
      intro:
        "River City Church relies on your prayers and financial support to lead people into a growing relationship with Jesus Christ. Thank you for your generosity — every gift fuels the mission.",
      image: imageRef(
        heroId,
        "RCC attendees worshiping with hands raised during a Sunday service",
      ),
    },
    verse: {
      text: "Each of you must give as you have made up your mind, not reluctantly or under compulsion, for God loves a cheerful giver.",
      reference: "2 Corinthians 9:7",
    },
    intro: {
      eyebrow: "Why we give",
      headline: "Cheerful, not compelled.",
      body: [
        para(
          "Generosity is a posture before it's a transaction. We give cheerfully because God has been generous with us first — and every dollar you give in faith is stewarded around our mission: leading people to enjoy God through a relationship with Jesus Christ.",
        ),
        para(
          "Whether you give online, set up recurring giving, mail a check, or drop something in the box on a Sunday — every gift counts, and every gift goes further than you'd think.",
        ),
      ],
    },
    waysSection: {
      eyebrow: "Pick a way",
      headline: "Four ways to give.",
      intro:
        "Choose the option that fits. All gifts are tax-deductible — RCC is a 501(c)(3) organization.",
      ways: [
        {
          _key: key(),
          _type: "wayToGive",
          name: "Online",
          blurb:
            "Give a one-time gift securely through Pushpay. Debit, credit, or ACH — takes about a minute.",
          ctaLabel: "Give online",
          ctaHref: "https://pushpay.com/pay/rivercitymemphis",
          openInChurchCenter: false,
        },
        {
          _key: key(),
          _type: "wayToGive",
          name: "Recurring",
          blurb:
            "Set up automatic weekly, biweekly, or monthly giving so generosity becomes a rhythm, not a reminder.",
          ctaLabel: "Set up recurring",
          ctaHref: "https://pushpay.com/pay/rivercitymemphis",
          openInChurchCenter: false,
        },
        {
          _key: key(),
          _type: "wayToGive",
          name: "By mail",
          blurb:
            "Mail a check to: River City Church · 3871 Kirby Whitten Pkwy · Bartlett, TN 38135. Make checks payable to River City Church.",
          ctaLabel: "Copy mailing address",
          ctaHref:
            "https://www.google.com/maps/search/?api=1&query=3871+Kirby+Whitten+Pkwy+Bartlett+TN+38135",
        },
        {
          _key: key(),
          _type: "wayToGive",
          name: "In person",
          blurb:
            "Drop your gift in the giving box at the back of the auditorium on a Sunday morning. We see you, and so does God.",
          ctaLabel: "Plan a visit",
          ctaHref: "/visit/what-to-expect",
        },
      ],
    },
    trustSection: {
      eyebrow: "Stewardship",
      headline: "Every dollar, every time.",
      body: [
        para(
          "RCC is a 501(c)(3) organization, so all gifts are tax-deductible. We're also Dime Silver accredited — an independent confirmation that we follow financial best practices for a church our size.",
        ),
        para(
          "That includes bill-pay controls, expense reviews and audits, cash-counting controls, donor accounting, monthly reconciliations, and ongoing financial reporting. As a financial donor to River City Church, you can rest assured every dollar you give in faith is stewarded around the mission of leading people to enjoy God through a relationship with Jesus Christ.",
        ),
      ],
      dimeBadge: imageRef(
        dimeId,
        "Dime Silver — Accredited financial best-practices badge",
      ),
    },
    cta: {
      headline: "Be a cheerful giver.",
      body: "Whether it's your first gift or your thousandth — thank you. It all counts. It all matters. Tap below to get started.",
      primaryCta: {
        label: "Give now",
        href: "https://pushpay.com/pay/rivercitymemphis",
        openInChurchCenter: false,
      },
      secondaryCta: {
        label: "Email our finance team",
        href: "mailto:info@rivercitymemphis.org?subject=Giving question",
        openInChurchCenter: false,
      },
    },
  });

  console.log(`✓ givePage seeded. ${assetCache.size} images uploaded.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

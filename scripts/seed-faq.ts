/**
 * Seed the FAQ singleton with the 7 Q/A pairs lifted from the old Drupal
 * /visit/faqs page. Re-running overwrites the doc — safe to iterate.
 *
 *   npm run seed:faq
 */
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

function para(text: string) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

const FAQS = [
  {
    question: "What denomination is River City / what does the church believe?",
    answer: [
      para(
        "River City is non-denominational. Since this is pretty vague and can mean a lot of different things, get in touch with us if you'd like to find out more about what we believe.",
      ),
    ],
  },
  {
    question: "What time are the services?",
    answer: [para("We gather at 10:15 AM each Sunday morning.")],
  },
  {
    question: "Who is the pastor of River City Church?",
    answer: [
      para(
        "Jonathan Dunn is the lead pastor of River City Church. You can meet the rest of the leadership team on the Leadership page.",
      ),
    ],
  },
  {
    question: "Why doesn't River City Church have Sunday school?",
    answer: [
      para(
        "Instead of providing adult Sunday school classes on Sunday mornings in the church building, we provide small group environments. These groups — called RCC Groups — meet at a variety of times during the week in people's homes.",
      ),
      para(
        "We believe the small group is the best place for sustained life change to occur. In a small group, people study God's Word together and are in a small enough environment to discuss the issues and challenges of life. It's also where they pray and care for one another and where they are missed if they don't show up.",
      ),
      para(
        "Groups are typically five to six couples or five to eight individuals of the same gender — a setting where people are personally encouraged and challenged in their relationship with God and each other.",
      ),
    ],
  },
  {
    question: "How long does the service last?",
    answer: [
      para(
        "Our services are designed to run 65–70 minutes. We're conscious of your schedule and want to be as accommodating as possible by starting and ending on time.",
      ),
    ],
  },
  {
    question: "Where do kids go during the service?",
    answer: [
      para(
        "While you are in the auditorium, we have special environments designed specifically for infants through 8th grade at 10:15 AM. We provide a safe, secure, fun-filled experience with trained volunteers who are passionate about leading the next generation in the direction of Jesus.",
      ),
    ],
  },
  {
    question: "Where does River City meet?",
    answer: [
      para("3871 Kirby-Whitten Parkway, Bartlett, TN 38135."),
    ],
  },
];

async function main() {
  console.log(`Seeding FAQ Page → ${projectId}/${dataset}`);
  await sanity.createOrReplace({
    _id: "faqPage",
    _type: "faqPage",
    eyebrow: "Visit",
    headline: "FAQs",
    intro:
      "At River City, we want to make sure that you're comfortable with who we are, even before you come visit us for the first time. Below, you'll find some questions we thought you might have, along with their answers.",
    footer:
      "If you have a question outside of the ones provided, feel free to ask by emailing us at info@rivercitymemphis.org.",
    items: FAQS.map((f) => ({
      _key: key(),
      _type: "faqItem",
      question: f.question,
      answer: f.answer,
    })),
  });
  console.log(`✓ Seeded ${FAQS.length} questions.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

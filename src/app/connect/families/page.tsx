import type { Metadata } from "next";
import Image from "next/image";
import { client } from "@/sanity/client";
import { familiesPageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PortableBody } from "@/components/portable-body";
import {
  Button,
  Container,
  CtaBand,
  Headline,
  PhotoHero,
  Section,
  SectionHeader,
} from "@/components/v2/ui";
import { SignupCallout } from "@/components/v2/pco-blocks";
import type { FamiliesPageDoc, SanityImage } from "@/types/sanity";

export const metadata: Metadata = {
  title: "Family Ministry",
  description:
    "Safe, fun, age-appropriate environments at RCC for every kid — Waumba Land, UpStreet, and Students.",
};

const F = {
  hero: {
    headline: "Family Ministry",
    intro:
      "Your kid's favorite day of the week. Skilled volunteers, fun environments, and a focused message that helps every age see Jesus more clearly — so you can worship freely while we take great care of them.",
    image: "/brand/pages/families/hero.jpg",
    alt: "Families with kids of all ages outside RCC at Easter Fest",
  },
  intro: {
    headline: "Partnering with parents.",
    paragraphs: [
      "From start to finish, we work hard to make your family's time with us a great experience. We use skilled volunteers, age-appropriate spaces, and a focused weekly message so your child leaves understanding one big idea — and asking when they can come back.",
      "Below are the three environments we offer. Each has its own room, its own rhythm, and a team of leaders who actually know your kid's name.",
    ],
  },
  environments: [
    {
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
      image: "/brand/pages/families/waumba.jpg",
      alt: "RCC Waumba Land — moms holding babies on a play mat in the nursery",
      facebookUrl: "https://www.facebook.com/RCCKids/",
    },
    {
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
      image: "/brand/pages/families/upstreet.jpg",
      alt: "An RCC UpStreet leader teaching elementary kids during a Sunday service",
      facebookUrl: "https://www.facebook.com/RCCKids/",
    },
    {
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
      image: "/brand/pages/families/students.jpg",
      alt: "RCC students hanging out at All Access on a Wednesday evening",
      facebookUrl: "https://www.facebook.com/RCCStudents/",
    },
  ],
  checkin: {
    headline: "Check-In, made simple.",
    intro:
      "Your first time? Arrive about 15 minutes early. A host will walk you to the Waumba Land or UpStreet desk and stay with you through check-in.",
    steps: [
      {
        title: "Get matching tags",
        description:
          "You and your child each get a security tag with the same number. You'll need yours to pick them up.",
      },
      {
        title: "We've got safety covered",
        description:
          "Only you can pick up your child. Our team verifies every tag, every time — no exceptions.",
      },
      {
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
    primaryLabel: "Plan your visit",
    primaryHref: "/visit/what-to-expect",
    secondaryLabel: "Get directions",
    secondaryHref: "/visit/location",
  },
};

async function safeFetch<T>(q: string): Promise<T | null> {
  try {
    return await client.fetch<T>(q, {}, { next: { revalidate: 0 } });
  } catch {
    return null;
  }
}

function imgSrc(image: SanityImage | undefined, fallback: string, w = 1600) {
  return image?.asset ? urlFor(image).width(w).url() : fallback;
}

export default async function FamiliesPage() {
  const doc = await safeFetch<FamiliesPageDoc | null>(familiesPageQuery);

  const hero = doc?.hero ?? {};
  const heroHeadline = hero.headline ?? F.hero.headline;
  const heroIntro = hero.intro ?? F.hero.intro;
  const heroImageSrc = imgSrc(hero.image, F.hero.image, 2200);
  const heroImageAlt = hero.image?.alt ?? F.hero.alt;

  const intro = doc?.intro;
  const envs = (doc?.environments?.length ? doc.environments : F.environments).map(
    (e, i) => ({
      ...e,
      fallbackImage: F.environments[i]?.image,
      alt: (e.image as SanityImage | undefined)?.alt ?? F.environments[i]?.alt,
    }),
  );
  const checkin = doc?.checkin;
  const checkinSteps = checkin?.steps?.length ? checkin.steps : F.checkin.steps;
  const cta = doc?.cta;

  return (
    <div>
      <PhotoHero
        image={heroImageSrc}
        alt={heroImageAlt}
        headline={heroHeadline}
        intro={heroIntro}
      >
        <Button tone="dark" href={cta?.primaryCta?.href ?? F.cta.primaryHref}>
          {cta?.primaryCta?.label ?? F.cta.primaryLabel}
        </Button>
      </PhotoHero>

      {/* INTRO — editorial statement */}
      <Section tone="white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
            <div>
              <Headline
                text={intro?.headline ?? F.intro.headline}
                accent={
                  (intro?.headline ?? F.intro.headline).endsWith("with parents.")
                    ? "with parents."
                    : undefined
                }
                className="mt-4"
              />
            </div>
            <div className="space-y-5 text-lg leading-8 text-ink-600 md:text-xl md:leading-9">
              {intro?.body ? (
                <PortableBody value={intro.body} />
              ) : (
                F.intro.paragraphs.map((p, i) => <p key={i}>{p}</p>)
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* ENVIRONMENTS — alternating editorial rows */}
      <section className="bg-paper py-20 md:py-32">
        <Container className="space-y-28 md:space-y-40">
          {envs.map((env, i) => {
            const flip = i % 2 === 1;
            const src = imgSrc(env.image as SanityImage, env.fallbackImage ?? "", 1400);
            const color = ministryColor(env.name);
            return (
              <article
                key={`${env.name}-${i}`}
                className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24"
              >
                <div
                  className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream-200 ${
                    flip ? "lg:order-2" : ""
                  }`}
                >
                  {src && (
                    <Image
                      src={src}
                      alt={env.alt ?? env.name ?? ""}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 h-2 w-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div>
                  <h2 className="text-5xl font-bold leading-[0.95] tracking-tight text-ink-900 md:text-7xl">
                    {env.name}
                  </h2>
                  {(env.ageRange || env.schedule) && (
                    <div className="mt-6 border-t border-ink-900/15 pt-5">
                      {env.ageRange && (
                        <p className="font-serif text-2xl italic text-ink-900 md:text-3xl">
                          {env.ageRange}
                        </p>
                      )}
                      {env.schedule && (
                        <p className="mt-1 text-sm text-ink-500 md:text-base">
                          {env.schedule}
                        </p>
                      )}
                    </div>
                  )}
                  {env.blurb && (
                    <p className="mt-6 text-lg leading-8 text-ink-600">{env.blurb}</p>
                  )}
                  {env.coreTruths && env.coreTruths.length > 0 && (
                    <ul className="mt-8 divide-y divide-ink-900/10 border-y border-ink-900/10">
                      {env.coreTruths.map((truth, ti) => (
                        <li key={ti} className="flex items-baseline gap-5 py-3.5">
                          <span
                            className="font-serif text-xl italic"
                            style={{ color }}
                          >
                            {String(ti + 1).padStart(2, "0")}
                          </span>
                          <span className="text-ink-800">{truth}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {env.facebookUrl && (
                    <Button variant="link" href={env.facebookUrl} className="mt-8">
                      Follow on Facebook →
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </Container>
      </section>

      {/* CHECK-IN */}
      <Section tone="dark">
        <Container>
          <SectionHeader
            tone="dark"
            headline={checkin?.headline ?? F.checkin.headline}
            accent={
              (checkin?.headline ?? F.checkin.headline).endsWith("made simple.")
                ? "made simple."
                : undefined
            }
            intro={checkin?.intro ?? F.checkin.intro}
          />
          <ol className="grid gap-12 lg:grid-cols-3 lg:gap-10">
            {checkinSteps.map((step, i) => (
              <li
                key={`${step.title}-${i}`}
                className="border-t border-white/15 pt-8"
              >
                <p className="font-serif text-6xl italic leading-none text-brand-300">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-6 text-2xl font-bold tracking-tight md:text-3xl">
                  {step.title}
                </h3>
                {step.description && (
                  <p className="mt-3 text-lg leading-8 text-white/70">
                    {step.description}
                  </p>
                )}
              </li>
            ))}
          </ol>
          {(checkin?.footnote ?? F.checkin.footnote) && (
            <p className="mt-16 max-w-3xl font-serif text-2xl italic leading-snug text-white/80 md:text-3xl">
              {checkin?.footnote ?? F.checkin.footnote}
            </p>
          )}
        </Container>
      </Section>

      <SignupCallout
        match={/dedicat/i}
        body="Celebrate your child and commit to raising them in faith, with your church family beside you."
      />

      <CtaBand
        headline={cta?.headline ?? F.cta.headline}
        accent={
          (cta?.headline ?? F.cta.headline).endsWith("this Sunday.")
            ? "this Sunday."
            : undefined
        }
        body={cta?.body ?? F.cta.body}
        image={heroImageSrc}
      >
        <Button tone="dark" href={cta?.primaryCta?.href ?? F.cta.primaryHref}>
          {cta?.primaryCta?.label ?? F.cta.primaryLabel}
        </Button>
        <Button
          tone="dark"
          variant="outline"
          href={cta?.secondaryCta?.href ?? F.cta.secondaryHref}
        >
          {cta?.secondaryCta?.label ?? F.cta.secondaryLabel}
        </Button>
      </CtaBand>
    </div>
  );
}

/** Brand colors of each Family Ministry environment (same as the homepage). */
function ministryColor(name?: string): string {
  const n = (name ?? "").toLowerCase();
  if (n.includes("waumba")) return "#DC5237";
  if (n.includes("upstreet")) return "#7BAA53";
  if (n.includes("transit") || n.includes("student")) return "#4AB5D7";
  if (n.includes("all access")) return "#D8A33A";
  return "#2aa5ca";
}

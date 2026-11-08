import type { Metadata } from "next";
import Image from "next/image";
import {
  ChurchCenterScript,
  ChurchCenterModalLink,
} from "@/components/church-center";
import { client } from "@/sanity/client";
import { groupsPageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PortableBody } from "@/components/portable-body";
import {
  Container,
  CtaBand,
  Eyebrow,
  Headline,
  PhotoHero,
  Section,
  SectionHeader,
} from "@/components/v2/ui";
import type { GroupsPageDoc, SanityImage } from "@/types/sanity";

export const metadata: Metadata = {
  title: "Groups",
  description:
    "Real growth happens in circles, not rows. Join a Community Group or Focus Group at RCC — meet twice a month, study together, do life with people who are doing life with God.",
};

const F = {
  hero: {
    eyebrow: "Connect / Do life with people",
    headline: "RCC Groups",
    intro:
      "Real growth happens in circles, not rows. Groups at RCC are how we get to know each other, learn alongside each other, and experience the kind of community we were made for.",
    image: "/brand/pages/groups/hero.jpg",
    alt: "A crowd of RCC adults fellowshipping in the lobby after a Sunday service",
  },
  intro: {
    eyebrow: "Why groups",
    headline: "A huge deal at RCC.",
    paragraphs: [
      "Groups are a huge deal at River City Church. We believe that getting to know others better, learning alongside them, and experiencing true community are vital to spiritual growth.",
      "There are a few different ways to plug in — pick the one that fits your stage of life and your schedule. Whichever you choose, expect a relaxed, friendly room of people who'll accept you for who you are.",
    ],
  },
  kinds: [
    {
      eyebrow: "For adults in similar seasons",
      name: "Community Groups",
      format: "10–12 adults · meets twice a month in homes",
      schedule: "Ongoing · twice a month · in homes around Memphis",
      blurb:
        "Real life change happens in community. Community Groups are 10–12 adults in similar seasons of life who meet twice a month in homes — to get to know each other, share what life looks like, and connect Sunday's teaching to Monday's reality.",
      highlights: [
        "10–12 adults, similar life stage",
        "Twice a month · in homes",
        "Discussion + life-on-life",
      ],
      image: "/brand/pages/groups/community.jpg",
      alt: "A mixed group of RCC adults standing and talking outside the church entrance",
    },
    {
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
      image: "/brand/pages/groups/focus.jpg",
      alt: "Five women around a round table together at an RCC Focus Group",
    },
  ],
  join: {
    eyebrow: "How to join",
    headline: "Two easy on-ramps.",
    intro:
      "You don't need to know anyone to get started. Pick the on-ramp that fits, and we'll walk you through the next step.",
    steps: [
      {
        title: "Come to Discover River City",
        description:
          "Our short, no-pressure session for anyone interested in Community Groups or partnership at RCC. We'll get to know you and help you find a group.",
      },
      {
        title: "Go through Next",
        description:
          "Offered after our Sunday morning service. The best on-ramp to Focus Groups and to figuring out where you fit at RCC.",
      },
      {
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
    primaryLabel: "Browse all groups",
    primaryHref: "/groups",
    secondaryLabel: "Start a new group",
    secondaryHref: "/forms",
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

export default async function GroupsPage() {
  const doc = await safeFetch<GroupsPageDoc | null>(groupsPageQuery);

  const hero = doc?.hero ?? {};
  const heroEyebrow = hero.eyebrow ?? F.hero.eyebrow;
  const heroHeadline = hero.headline ?? F.hero.headline;
  const heroIntro = hero.intro ?? F.hero.intro;
  const heroImageSrc = imgSrc(hero.image, F.hero.image, 2200);
  const heroImageAlt = hero.image?.alt ?? F.hero.alt;

  const intro = doc?.intro;
  const kinds = (doc?.kinds?.length ? doc.kinds : F.kinds).map((k, i) => ({
    ...k,
    fallbackImage: F.kinds[i]?.image,
    alt: (k.image as SanityImage | undefined)?.alt ?? F.kinds[i]?.alt,
  }));
  const join = doc?.join;
  const joinSteps = join?.steps?.length ? join.steps : F.join.steps;
  const cta = doc?.cta;

  return (
    <div>
      <ChurchCenterScript />

      <PhotoHero
        image={heroImageSrc}
        alt={heroImageAlt}
        eyebrow={heroEyebrow}
        headline={heroHeadline}
        intro={heroIntro}
      >
        <ChurchCenterModalLink href="/groups" className={CC_SOLID_DARK}>
          Browse all groups
        </ChurchCenterModalLink>
        <ChurchCenterModalLink href="/forms" className={CC_OUTLINE_DARK}>
          Start a new group
        </ChurchCenterModalLink>
      </PhotoHero>

      {/* INTRO */}
      <Section tone="white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
            <div>
              <Eyebrow>{intro?.eyebrow ?? F.intro.eyebrow}</Eyebrow>
              <Headline
                text={intro?.headline ?? F.intro.headline}
                accent={
                  (intro?.headline ?? F.intro.headline).endsWith("at RCC.")
                    ? "at RCC."
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

      {/* KINDS — alternating editorial rows */}
      <section className="bg-paper py-20 md:py-32">
        <Container className="space-y-28 md:space-y-40">
          {kinds.map((k, i) => {
            const flip = i % 2 === 1;
            const src = imgSrc(k.image as SanityImage, k.fallbackImage ?? "", 1400);
            return (
              <article
                key={`${k.name}-${i}`}
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
                      alt={k.alt ?? k.name ?? ""}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  {k.eyebrow && <Eyebrow>{k.eyebrow}</Eyebrow>}
                  <h2 className="mt-4 text-5xl font-bold leading-[0.95] tracking-tight text-ink-900 md:text-7xl">
                    {k.name}
                  </h2>
                  {(k.format || k.schedule) && (
                    <div className="mt-6 border-t border-ink-900/15 pt-5">
                      {k.format && (
                        <p className="font-serif text-2xl italic text-ink-900 md:text-3xl">
                          {k.format}
                        </p>
                      )}
                      {k.schedule && (
                        <p className="mt-1 text-sm text-ink-500 md:text-base">
                          {k.schedule}
                        </p>
                      )}
                    </div>
                  )}
                  {k.blurb && (
                    <p className="mt-6 text-lg leading-8 text-ink-600">{k.blurb}</p>
                  )}
                  {k.highlights && k.highlights.length > 0 && (
                    <ul className="mt-8 divide-y divide-ink-900/10 border-y border-ink-900/10">
                      {k.highlights.map((h, hi) => (
                        <li key={hi} className="flex items-baseline gap-5 py-3.5">
                          <span className="font-serif text-xl italic text-brand-600">
                            {String(hi + 1).padStart(2, "0")}
                          </span>
                          <span className="text-ink-800">{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            );
          })}
        </Container>
      </section>

      {/* HOW TO JOIN */}
      <Section tone="dark">
        <Container>
          <SectionHeader
            tone="dark"
            eyebrow={join?.eyebrow ?? F.join.eyebrow}
            headline={join?.headline ?? F.join.headline}
            accent={
              (join?.headline ?? F.join.headline).endsWith("on-ramps.")
                ? "on-ramps."
                : undefined
            }
            intro={join?.intro ?? F.join.intro}
          />
          <ol className="grid gap-12 lg:grid-cols-3 lg:gap-10">
            {joinSteps.map((step, i) => (
              <li key={`${step.title}-${i}`} className="border-t border-white/15 pt-8">
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
          {(join?.footnote ?? F.join.footnote) && (
            <p className="mt-16 max-w-3xl text-white/60">
              {join?.footnote ?? F.join.footnote}
            </p>
          )}
        </Container>
      </Section>

      <CtaBand
        headline={cta?.headline ?? F.cta.headline}
        accent={
          (cta?.headline ?? F.cta.headline).endsWith("circles.") ? "circles." : undefined
        }
        body={cta?.body ?? F.cta.body}
        image={imgSrc(kinds[0]?.image as SanityImage, kinds[0]?.fallbackImage ?? F.kinds[0].image, 2000)}
      >
        <ChurchCenterModalLink
          href={cta?.primaryCta?.href ?? F.cta.primaryHref}
          className={CC_SOLID_DARK}
        >
          {cta?.primaryCta?.label ?? F.cta.primaryLabel}
        </ChurchCenterModalLink>
        <ChurchCenterModalLink
          href={cta?.secondaryCta?.href ?? F.cta.secondaryHref}
          className={CC_OUTLINE_DARK}
        >
          {cta?.secondaryCta?.label ?? F.cta.secondaryLabel}
        </ChurchCenterModalLink>
      </CtaBand>
    </div>
  );
}

// v2 button styles for Church Center modal links (on dark backgrounds).
const CC_SOLID_DARK =
  "inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink-900 transition hover:bg-brand-100";
const CC_OUTLINE_DARK =
  "inline-flex items-center justify-center rounded-full border border-white/35 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10";

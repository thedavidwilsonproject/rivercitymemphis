import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ChurchCenterScript,
  ChurchCenterModalLink,
} from "@/components/church-center";
import { client } from "@/sanity/client";
import { groupsPageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PortableBody } from "@/components/portable-body";
import type { GroupsPageDoc, SanityImage } from "@/types/sanity";

export const metadata: Metadata = {
  title: "Groups",
  description:
    "Real growth happens in circles, not rows. Find a Community Group or Focus Group at RCC — meet twice a month, study together, do life with people who are doing life with God.",
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
      ctaLabel: "Find a Community Group",
      ctaHref: "/groups",
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

  return (
    <div>
      <ChurchCenterScript />

      {/* HERO */}
      <section className="relative isolate overflow-hidden text-white">
        <Image
          src={heroImageSrc}
          alt={heroImageAlt}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[center_40%]"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-900/85 via-ink-900/55 to-ink-900/30"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-6 py-32 md:py-44">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-300">
            {heroEyebrow}
          </p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-tight tracking-wide md:text-7xl">
            {heroHeadline}
          </h1>
          {heroIntro && (
            <p className="mt-5 max-w-2xl text-lg leading-8 text-cream-50/95 md:text-xl md:leading-9">
              {heroIntro}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <ChurchCenterModalLink href="/groups" variant="primary">
              Browse all groups
            </ChurchCenterModalLink>
            <ChurchCenterModalLink
              href="/forms"
              className="rounded-full border border-white/50 bg-white/5 px-6 py-3 font-display text-sm uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/15"
            >
              Start a new group
            </ChurchCenterModalLink>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
            {intro?.eyebrow ?? F.intro.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
            {intro?.headline ?? F.intro.headline}
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-8 text-ink-700">
            {intro?.body ? (
              <PortableBody value={intro.body} />
            ) : (
              F.intro.paragraphs.map((p, i) => <p key={i}>{p}</p>)
            )}
          </div>
        </div>
      </section>

      {/* KINDS — alternating side-by-side */}
      <section className="bg-cream-50">
        {kinds.map((k, i) => {
          const flip = i % 2 === 1;
          const src = imgSrc(k.image as SanityImage, k.fallbackImage ?? "", 1400);
          return (
            <div
              key={`${k.name}-${i}`}
              className={[
                "py-20 md:py-28",
                i % 2 === 0 ? "bg-cream-50" : "bg-white",
              ].join(" ")}
            >
              <div
                className={[
                  "mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2 md:items-center md:gap-16",
                  flip ? "md:[&>figure]:order-2" : "",
                ].join(" ")}
              >
                <figure className="relative">
                  {src && (
                    <Image
                      src={src}
                      alt={k.alt ?? k.name ?? ""}
                      width={1400}
                      height={1050}
                      className="aspect-[4/3] w-full rounded-2xl object-cover shadow-md"
                    />
                  )}
                </figure>
                <div>
                  {k.eyebrow && (
                    <p className="font-display text-xs uppercase tracking-[0.3em] text-brand-600">
                      {k.eyebrow}
                    </p>
                  )}
                  <h2 className="mt-2 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
                    {k.name}
                  </h2>
                  {k.format && (
                    <p className="mt-2 font-display text-base uppercase tracking-widest text-ink-500 md:text-lg">
                      {k.format}
                    </p>
                  )}
                  {k.schedule && (
                    <p className="mt-1 text-sm text-ink-500 md:text-base">
                      {k.schedule}
                    </p>
                  )}
                  {k.blurb && (
                    <p className="mt-5 text-base leading-7 text-ink-700 md:text-lg md:leading-8">
                      {k.blurb}
                    </p>
                  )}
                  {k.highlights && k.highlights.length > 0 && (
                    <ul className="mt-6 space-y-2">
                      {k.highlights.map((h, hi) => (
                        <li
                          key={hi}
                          className="flex items-start gap-3 rounded-xl border-l-4 border-brand-500 bg-white px-4 py-3 text-base text-ink-800 shadow-sm"
                        >
                          <span className="font-display text-xs uppercase tracking-[0.3em] text-brand-600">
                            {String(hi + 1).padStart(2, "0")}
                          </span>
                          <span className="leading-7">{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {k.ctaLabel && k.ctaHref && (
                    <Link
                      href={k.ctaHref}
                      className="mt-7 inline-flex items-center font-display text-sm uppercase tracking-widest text-brand-600 transition hover:text-brand-700"
                    >
                      {k.ctaLabel} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* HOW TO JOIN */}
      <section className="bg-ink-900 py-20 text-white md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <header className="mb-12 max-w-2xl">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-300">
              {join?.eyebrow ?? F.join.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide md:text-5xl">
              {join?.headline ?? F.join.headline}
            </h2>
            {(join?.intro ?? F.join.intro) && (
              <p className="mt-5 text-lg leading-8 text-cream-50/90">
                {join?.intro ?? F.join.intro}
              </p>
            )}
          </header>
          <ol className="grid gap-5 md:grid-cols-3 md:gap-6">
            {joinSteps.map((step, i) => (
              <li
                key={`${step.title}-${i}`}
                className="relative overflow-hidden rounded-2xl bg-ink-800/70 p-7 backdrop-blur-sm md:p-8"
              >
                <span
                  aria-hidden="true"
                  className="font-display text-5xl text-brand-400"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-2xl uppercase leading-tight tracking-wide">
                  {step.title}
                </h3>
                {step.description && (
                  <p className="mt-2 text-base leading-7 text-cream-50/85">
                    {step.description}
                  </p>
                )}
              </li>
            ))}
          </ol>
          {(join?.footnote ?? F.join.footnote) && (
            <p className="mt-10 text-base leading-7 text-cream-50/75 md:text-base">
              {join?.footnote ?? F.join.footnote}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

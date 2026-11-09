import type { Metadata } from "next";
import Image from "next/image";
import { client } from "@/sanity/client";
import { beRichPageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PortableBody } from "@/components/portable-body";
import {
  Button,
  ButtonRow,
  Container,
  Headline,
  Section,
  SectionHeader,
} from "@/components/v2/ui";
import type {
  BeRichPageDoc,
  BeRichPartner,
  SanityImage,
} from "@/types/sanity";

export const metadata: Metadata = {
  title: "Be Rich",
  description:
    "Do more. Give more. Be Rich is how River City Church pools its generosity to serve people in need locally, nationally, and globally.",
};

const F = {
  hero: {
    headline: "Be Rich",
    tagline: "Do more. Give more.",
    intro:
      "We're on mission in our city to reach people in need — locally, nationally, and globally. Be Rich is how we put that mission into practice: pooling our generosity to share the love of Jesus in tangible ways.",
    image: "/brand/pages/be-rich/hero.jpg",
    alt: "A row of children's winter coats hung on hooks at River City Church — from a Be Rich coat drive",
  },
  intro: {
    headline: "Generosity is part of the mission.",
    paragraphs: [
      "Our mission at River City Church is to lead people into a growing relationship with Jesus Christ. One key way we do that is by serving people in need. Be Rich is the simplest way to plug in: when we give and serve together, we accomplish more than any of us could on our own.",
      "Throughout the year, we support local schools, food banks, homeless shelters, and low-income relief organizations in Shelby County. We partner nationally to fight injustices like human trafficking. And we sponsor children around the world through trusted global partners.",
    ],
  },
  partnersSection: {
    headline: "Our partners.",
    intro:
      "Every dollar we raise goes to organizations already doing the work. Here's who we partner with — locally, nationally, and globally.",
    partners: [
      {
        scope: "local",
        name: "Memphis Dream Center",
        blurb:
          "A local organization that addresses both the symptoms of poverty and the root causes — meeting tangible needs while restoring hope, dignity, and dreams across our city.",
        url: "https://memphisdreamcenter.org/",
      },
      {
        scope: "local",
        name: "Local schools, food banks & shelters",
        blurb:
          "Throughout the year we support schools, food banks, homeless shelters, and low-income relief organizations across Shelby County — meeting practical needs in our own backyard.",
      },
      {
        scope: "national",
        name: "End It Movement",
        blurb:
          "A coalition of organizations confronting modern-day slavery and human trafficking. We partner to raise awareness and fund rescue and aftercare for those caught in it.",
        url: "https://enditmovement.com/",
      },
      {
        scope: "global",
        name: "World Vision",
        blurb:
          "We sponsor children through World Vision's global relief and development work — partnering long-term with kids and families in some of the toughest places in the world.",
        url: "https://www.worldvision.org/",
      },
    ] satisfies BeRichPartner[],
  },
  cta: {
    headline: "Do more. Give more.",
    body: "Whether it's a one-time gift, ongoing giving, or showing up to serve — every bit of generosity multiplies when we do it together. Pick the next step that fits.",
    primaryLabel: "Give now",
    primaryHref: "/give",
    secondaryLabel: "Find a way to serve",
    secondaryHref: "/connect",
  },
};

const SCOPE_LABEL: Record<NonNullable<BeRichPartner["scope"]>, string> = {
  local: "Local",
  national: "National",
  global: "Global",
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

export default async function BeRichPage() {
  const doc = await safeFetch<BeRichPageDoc | null>(beRichPageQuery);

  const hero = doc?.hero ?? {};
  const heroHeadline = hero.headline ?? F.hero.headline;
  const heroTagline = hero.tagline ?? F.hero.tagline;
  const heroIntro = hero.intro ?? F.hero.intro;
  const heroImageSrc = imgSrc(hero.image, F.hero.image, 2200);
  const heroImageAlt = hero.image?.alt ?? F.hero.alt;

  const intro = doc?.intro;
  const partnersSection = doc?.partnersSection;
  const partners = partnersSection?.partners?.length
    ? partnersSection.partners
    : F.partnersSection.partners;
  const cta = doc?.cta;

  const heroWord = heroHeadline.replace(/^Be\s+/i, "");

  return (
    <div>
      {/* HERO — kit-styled, keeps the Be ♥ Rich lockup */}
      <section className="relative isolate flex min-h-[78svh] flex-col overflow-hidden bg-river-950 text-white">
        <Image
          src={heroImageSrc}
          alt={heroImageAlt}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[center_60%]"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-river-950 via-river-950/55 to-river-950/25"
          aria-hidden="true"
        />
        <Container className="flex w-full flex-1 flex-col justify-end pb-12 pt-28 md:pb-16">

          <h1 className="rise rise-2 mt-5 flex flex-wrap items-center gap-x-5 text-6xl font-bold leading-[0.95] tracking-tight md:text-8xl lg:text-[8.5rem]">
            <span>Be</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 32 28"
              className="inline-block h-12 w-14 fill-[#e2333e] md:h-20 md:w-24"
            >
              <path d="M16 26 C2 18 0 9 6 4 C10 0 14 2 16 6 C18 2 22 0 26 4 C32 9 30 18 16 26 Z" />
            </svg>
            <em className="text-brand-300">{heroWord}</em>
          </h1>
          {(heroTagline || heroIntro) && (
            <div className="rise rise-3 mt-10 grid gap-6 border-t border-white/20 pt-8 md:grid-cols-[auto_1fr] md:gap-16">
              {heroTagline && (
                <p className="font-serif text-3xl italic text-white md:text-4xl">
                  {heroTagline}
                </p>
              )}
              {heroIntro && (
                <p className="max-w-2xl text-lg leading-8 text-white/80">{heroIntro}</p>
              )}
            </div>
          )}
        </Container>
      </section>

      {/* INTRO */}
      <Section tone="white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
            <div>
              <Headline
                text={intro?.headline ?? F.intro.headline}
                accent={
                  (intro?.headline ?? F.intro.headline).endsWith("the mission.")
                    ? "the mission."
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

      {/* PARTNERS */}
      <Section tone="light">
        <Container>
          <SectionHeader
            headline={partnersSection?.headline ?? F.partnersSection.headline}
            intro={partnersSection?.intro ?? F.partnersSection.intro}
          />
          <ul className="grid gap-x-12 md:grid-cols-2">
            {partners.map((p, i) => (
              <li
                key={`${p.name}-${i}`}
                className="border-t border-ink-900/15 py-10"
              >
                <h3 className="text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">
                  {p.name}
                </h3>
                {p.scope && (
                  <p className="mt-2 text-sm font-semibold text-accent-600">{SCOPE_LABEL[p.scope]}</p>
                )}
                {p.blurb && (
                  <p className="mt-4 text-lg leading-8 text-ink-600">{p.blurb}</p>
                )}
                {p.url && (
                  <Button variant="link" href={p.url} className="mt-6">
                    Visit {p.name} →
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* CTA — dark band */}
      <section className="relative isolate overflow-hidden bg-river-900 text-white">
        <Image
          src={heroImageSrc}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-river-950/95 via-river-950/75 to-river-950/40"
          aria-hidden="true"
        />
        <Container className="py-24 md:py-36">

          <Headline
            text={cta?.headline ?? F.cta.headline}
            accent={
              (cta?.headline ?? F.cta.headline).endsWith("Give more.")
                ? "Give more."
                : undefined
            }
            tone="dark"
            size="xl"
            className="mt-5 max-w-5xl"
          />
          <p className="mt-8 max-w-xl text-lg leading-8 text-white/80">
            {cta?.body ?? F.cta.body}
          </p>
          <ButtonRow className="mt-10">
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
          </ButtonRow>
        </Container>
      </section>
    </div>
  );
}

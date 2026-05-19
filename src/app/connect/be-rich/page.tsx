import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { beRichPageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PortableBody } from "@/components/portable-body";
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
    eyebrow: "Connect / Do more. Give more.",
    headline: "Be Rich",
    tagline: "Do more. Give more.",
    intro:
      "We're on mission in our city to reach people in need — locally, nationally, and globally. Be Rich is how we put that mission into practice: pooling our generosity to share the love of Jesus in tangible ways.",
    image: "/brand/pages/be-rich/hero.jpg",
    alt: "A row of children's winter coats hung on hooks at River City Church — from a Be Rich coat drive",
  },
  intro: {
    eyebrow: "Why we do this",
    headline: "Generosity is part of the mission.",
    paragraphs: [
      "Our mission at River City Church is to lead people into a growing relationship with Jesus Christ. One key way we do that is by serving people in need. Be Rich is the simplest way to plug in: when we give and serve together, we accomplish more than any of us could on our own.",
      "Throughout the year, we support local schools, food banks, homeless shelters, and low-income relief organizations in Shelby County. We partner nationally to fight injustices like human trafficking. And we sponsor children around the world through trusted global partners.",
    ],
  },
  partnersSection: {
    eyebrow: "Where it goes",
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
    eyebrow: "Get involved",
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
  const heroEyebrow = hero.eyebrow ?? F.hero.eyebrow;
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

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden text-white">
        <Image
          src={heroImageSrc}
          alt={heroImageAlt}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[center_60%]"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-900/85 via-ink-900/55 to-ink-900/30"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-6 py-32 md:py-44">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-300">
            {heroEyebrow}
          </p>
          <h1 className="mt-3 flex flex-wrap items-center gap-x-4 font-display text-5xl uppercase leading-tight tracking-wide md:text-7xl">
            <span>Be</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 32 28"
              className="inline-block h-7 w-8 fill-[#e2333e] md:h-9 md:w-10"
            >
              <path d="M16 26 C2 18 0 9 6 4 C10 0 14 2 16 6 C18 2 22 0 26 4 C32 9 30 18 16 26 Z" />
            </svg>
            <span>{heroHeadline.replace(/^Be\s+/i, "")}</span>
          </h1>
          {heroTagline && (
            <p className="mt-4 font-display text-xl uppercase tracking-[0.25em] text-brand-300 md:text-2xl">
              {heroTagline}
            </p>
          )}
          {heroIntro && (
            <p className="mt-6 max-w-2xl text-lg leading-8 text-cream-50/95 md:text-xl md:leading-9">
              {heroIntro}
            </p>
          )}
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

      {/* PARTNERS */}
      <section className="bg-cream-50 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <header className="mx-auto mb-12 max-w-2xl text-center">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
              {partnersSection?.eyebrow ?? F.partnersSection.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
              {partnersSection?.headline ?? F.partnersSection.headline}
            </h2>
            {(partnersSection?.intro ?? F.partnersSection.intro) && (
              <p className="mt-5 text-lg leading-8 text-ink-700">
                {partnersSection?.intro ?? F.partnersSection.intro}
              </p>
            )}
          </header>
          <ul className="grid gap-6 md:grid-cols-2">
            {partners.map((p, i) => (
              <li
                key={`${p.name}-${i}`}
                className="group relative overflow-hidden rounded-2xl border border-cream-200 bg-white p-7 shadow-sm transition hover:shadow-md md:p-8"
              >
                <span
                  className="inline-block rounded-full bg-[#e2333e]/10 px-3 py-1 font-display text-xs uppercase tracking-[0.25em] text-[#e2333e]"
                  aria-label={`Scope: ${p.scope ? SCOPE_LABEL[p.scope] : ""}`}
                >
                  {p.scope ? SCOPE_LABEL[p.scope] : ""}
                </span>
                <h3 className="mt-4 font-display text-2xl uppercase leading-tight tracking-wide text-ink-800 md:text-3xl">
                  {p.name}
                </h3>
                {p.blurb && (
                  <p className="mt-3 text-base leading-7 text-ink-700 md:text-lg md:leading-8">
                    {p.blurb}
                  </p>
                )}
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center font-display text-sm uppercase tracking-widest text-brand-600 transition hover:text-brand-700"
                  >
                    Visit {p.name} →
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-20 text-white md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          {(cta?.eyebrow ?? F.cta.eyebrow) && (
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-100/90">
              {cta?.eyebrow ?? F.cta.eyebrow}
            </p>
          )}
          <h2 className="mt-3 font-display text-4xl uppercase tracking-wide md:text-5xl">
            {cta?.headline ?? F.cta.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-brand-50/95">
            {cta?.body ?? F.cta.body}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={cta?.primaryCta?.href ?? F.cta.primaryHref}
              className="rounded-full bg-white px-6 py-3 font-display text-sm uppercase tracking-widest text-brand-700 transition hover:bg-cream-50"
            >
              {cta?.primaryCta?.label ?? F.cta.primaryLabel}
            </Link>
            <Link
              href={cta?.secondaryCta?.href ?? F.cta.secondaryHref}
              className="rounded-full border border-white/40 bg-white/5 px-6 py-3 font-display text-sm uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/15"
            >
              {cta?.secondaryCta?.label ?? F.cta.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ChurchCenterScript,
  ChurchCenterModalLink,
} from "@/components/church-center";
import { client } from "@/sanity/client";
import { givePageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PortableBody } from "@/components/portable-body";
import type { GivePageDoc, GiveWay, SanityImage } from "@/types/sanity";

export const metadata: Metadata = {
  title: "Ways to Give",
  description:
    "Give to River City Church online, set up recurring giving, or mail a check. RCC is a 501(c)(3) organization and Dime Silver accredited — every gift is tax-deductible.",
};

const F = {
  hero: {
    eyebrow: "Give",
    headline: "Ways to Give",
    intro:
      "River City Church relies on your prayers and financial support to lead people into a growing relationship with Jesus Christ. Thank you for your generosity — every gift fuels the mission.",
    image: "/brand/pages/give/hero.jpg",
    alt: "RCC attendees worshiping with hands raised during a Sunday service",
  },
  verse: {
    text: "Each of you must give as you have made up your mind, not reluctantly or under compulsion, for God loves a cheerful giver.",
    reference: "2 Corinthians 9:7",
  },
  intro: {
    eyebrow: "Why we give",
    headline: "Cheerful, not compelled.",
    paragraphs: [
      "Generosity is a posture before it's a transaction. We give cheerfully because God has been generous with us first — and every dollar you give in faith is stewarded around our mission: leading people to enjoy God through a relationship with Jesus Christ.",
      "Whether you give online, set up recurring giving, mail a check, or drop something in the box on a Sunday — every gift counts, and every gift goes further than you'd think.",
    ],
  },
  waysSection: {
    eyebrow: "Pick a way",
    headline: "Four ways to give.",
    intro:
      "Choose the option that fits. All gifts are tax-deductible — RCC is a 501(c)(3) organization.",
    ways: [
      {
        name: "Online",
        blurb:
          "Give a one-time gift securely through Pushpay. Debit, credit, or ACH — takes about a minute.",
        ctaLabel: "Give online",
        ctaHref: "https://pushpay.com/pay/rivercitymemphis",
        openInChurchCenter: false,
      },
      {
        name: "Recurring",
        blurb:
          "Set up automatic weekly, biweekly, or monthly giving so generosity becomes a rhythm, not a reminder.",
        ctaLabel: "Set up recurring",
        ctaHref: "https://pushpay.com/pay/rivercitymemphis",
        openInChurchCenter: false,
      },
      {
        name: "By mail",
        blurb:
          "Mail a check to: River City Church · 3871 Kirby Whitten Pkwy · Bartlett, TN 38135. Make checks payable to River City Church.",
        ctaLabel: "Open in Maps",
        ctaHref:
          "https://www.google.com/maps/search/?api=1&query=3871+Kirby+Whitten+Pkwy+Bartlett+TN+38135",
      },
      {
        name: "In person",
        blurb:
          "Drop your gift in the giving box at the back of the auditorium on a Sunday morning. We see you, and so does God.",
        ctaLabel: "Plan a visit",
        ctaHref: "/visit/what-to-expect",
      },
    ] satisfies GiveWay[],
  },
  trustSection: {
    eyebrow: "Stewardship",
    headline: "Every dollar, every time.",
    paragraphs: [
      "RCC is a 501(c)(3) organization, so all gifts are tax-deductible. We're also Dime Silver accredited — an independent confirmation that we follow financial best practices for a church our size.",
      "That includes bill-pay controls, expense reviews and audits, cash-counting controls, donor accounting, monthly reconciliations, and ongoing financial reporting. As a financial donor to River City Church, you can rest assured every dollar you give in faith is stewarded around the mission of leading people to enjoy God through a relationship with Jesus Christ.",
    ],
    dimeBadge: "/brand/pages/give/dime-accredited.png",
    dimeAlt: "Dime Silver — Accredited financial best-practices badge",
  },
  cta: {
    headline: "Be a cheerful giver.",
    body: "Whether it's your first gift or your thousandth — thank you. It all counts. It all matters. Tap below to get started.",
    primaryLabel: "Give now",
    primaryHref: "https://pushpay.com/pay/rivercitymemphis",
    primaryChurchCenter: false,
    secondaryLabel: "Email our finance team",
    secondaryHref:
      "mailto:info@rivercitymemphis.org?subject=Giving question",
    secondaryChurchCenter: false,
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

function isExternal(href: string) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

type SmartCtaProps = {
  href: string;
  label: string;
  openInChurchCenter?: boolean;
  className?: string;
};

function SmartCta({ href, label, openInChurchCenter, className }: SmartCtaProps) {
  if (openInChurchCenter) {
    return (
      <ChurchCenterModalLink href={href} className={className}>
        {label}
      </ChurchCenterModalLink>
    );
  }
  if (isExternal(href)) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={className}
      >
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export default async function GivePage() {
  const doc = await safeFetch<GivePageDoc | null>(givePageQuery);

  const hero = doc?.hero ?? {};
  const heroEyebrow = hero.eyebrow ?? F.hero.eyebrow;
  const heroHeadline = hero.headline ?? F.hero.headline;
  const heroIntro = hero.intro ?? F.hero.intro;
  const heroImageSrc = imgSrc(hero.image, F.hero.image, 2200);
  const heroImageAlt = hero.image?.alt ?? F.hero.alt;

  const verse = doc?.verse;
  const verseText = verse?.text ?? F.verse.text;
  const verseRef = verse?.reference ?? F.verse.reference;

  const intro = doc?.intro;
  const waysSection = doc?.waysSection;
  const ways = waysSection?.ways?.length ? waysSection.ways : F.waysSection.ways;
  const trust = doc?.trustSection;
  const dimeSrc = imgSrc(trust?.dimeBadge, F.trustSection.dimeBadge, 600);
  const dimeAlt = trust?.dimeBadge?.alt ?? F.trustSection.dimeAlt;
  const cta = doc?.cta;

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
            <a
              href="https://pushpay.com/pay/rivercitymemphis"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
            >
              Give now
            </a>
          </div>
        </div>
      </section>

      {/* VERSE */}
      <section className="bg-cream-50 py-16 md:py-20">
        <figure className="mx-auto max-w-3xl px-6 text-center">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mx-auto h-8 w-8 fill-brand-400"
          >
            <path d="M6 17h3l2-4V7H5v6h3l-2 4Zm9 0h3l2-4V7h-6v6h3l-2 4Z" />
          </svg>
          <blockquote className="mt-4 font-display text-2xl uppercase leading-snug tracking-wide text-ink-800 md:text-3xl">
            &ldquo;{verseText}&rdquo;
          </blockquote>
          <figcaption className="mt-5 font-display text-sm uppercase tracking-[0.3em] text-brand-600">
            {verseRef}
          </figcaption>
        </figure>
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

      {/* WAYS TO GIVE */}
      <section className="bg-cream-50 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <header className="mx-auto mb-12 max-w-2xl text-center">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
              {waysSection?.eyebrow ?? F.waysSection.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
              {waysSection?.headline ?? F.waysSection.headline}
            </h2>
            {(waysSection?.intro ?? F.waysSection.intro) && (
              <p className="mt-5 text-lg leading-8 text-ink-700">
                {waysSection?.intro ?? F.waysSection.intro}
              </p>
            )}
          </header>
          <ul className="grid gap-6 md:grid-cols-2">
            {ways.map((w, i) => (
              <li
                key={`${w.name}-${i}`}
                className="relative flex flex-col rounded-2xl border border-cream-200 bg-white p-7 shadow-sm transition hover:shadow-md md:p-8"
              >
                <span className="font-display text-5xl text-brand-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-3xl uppercase leading-tight tracking-wide text-ink-800 md:text-4xl">
                  {w.name}
                </h3>
                {w.blurb && (
                  <p className="mt-3 flex-1 text-base leading-7 text-ink-700 md:text-lg md:leading-8">
                    {w.blurb}
                  </p>
                )}
                {w.ctaLabel && w.ctaHref && (
                  <div className="mt-6">
                    <SmartCta
                      href={w.ctaHref}
                      label={w.ctaLabel}
                      openInChurchCenter={w.openInChurchCenter}
                      className="inline-flex items-center rounded-full bg-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TRUST / DIME */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1fr_320px] md:items-center md:gap-16">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
              {trust?.eyebrow ?? F.trustSection.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
              {trust?.headline ?? F.trustSection.headline}
            </h2>
            <div className="mt-6 space-y-5 text-base leading-7 text-ink-700 md:text-lg md:leading-8">
              {trust?.body ? (
                <PortableBody value={trust.body} />
              ) : (
                F.trustSection.paragraphs.map((p, i) => <p key={i}>{p}</p>)
              )}
            </div>
            <ul className="mt-7 flex flex-wrap gap-2">
              <li className="rounded-full bg-cream-100 px-4 py-1.5 font-display text-xs uppercase tracking-[0.25em] text-ink-700">
                501(c)(3)
              </li>
              <li className="rounded-full bg-cream-100 px-4 py-1.5 font-display text-xs uppercase tracking-[0.25em] text-ink-700">
                Tax-deductible
              </li>
              <li className="rounded-full bg-cream-100 px-4 py-1.5 font-display text-xs uppercase tracking-[0.25em] text-ink-700">
                Dime Silver accredited
              </li>
            </ul>
          </div>
          <figure className="mx-auto md:mx-0">
            <Image
              src={dimeSrc}
              alt={dimeAlt ?? ""}
              width={400}
              height={400}
              className="h-auto w-64 md:w-80"
            />
            <figcaption className="sr-only">
              Dime Silver financial best-practices accreditation
            </figcaption>
          </figure>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-20 text-white md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-4xl uppercase tracking-wide md:text-5xl">
            {cta?.headline ?? F.cta.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-brand-50/95">
            {cta?.body ?? F.cta.body}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <SmartCta
              href={cta?.primaryCta?.href ?? F.cta.primaryHref}
              label={cta?.primaryCta?.label ?? F.cta.primaryLabel}
              openInChurchCenter={
                cta?.primaryCta?.openInChurchCenter ?? F.cta.primaryChurchCenter
              }
              className="rounded-full bg-white px-6 py-3 font-display text-sm uppercase tracking-widest text-brand-700 transition hover:bg-cream-50"
            />
            <SmartCta
              href={cta?.secondaryCta?.href ?? F.cta.secondaryHref}
              label={cta?.secondaryCta?.label ?? F.cta.secondaryLabel}
              openInChurchCenter={
                cta?.secondaryCta?.openInChurchCenter ??
                F.cta.secondaryChurchCenter
              }
              className="rounded-full border border-white/40 bg-white/5 px-6 py-3 font-display text-sm uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/15"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

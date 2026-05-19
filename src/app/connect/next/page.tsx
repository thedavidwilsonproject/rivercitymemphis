import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { nextPageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PortableBody } from "@/components/portable-body";
import type { NextPageDoc, SanityImage } from "@/types/sanity";

export const metadata: Metadata = {
  title: "Next",
  description:
    "A 20-minute info session with our lead pastor — get to know RCC, find out how to plug in, ask your questions.",
};

const F = {
  hero: {
    eyebrow: "Connect / Your next step",
    headline: "Welcome to Next.",
    intro:
      "A short, friendly 20 minutes with our lead pastor Jonathan Dunn — get to know RCC, find out how to plug in, and ask your questions.",
    image: "/brand/pages/next/hero.jpg",
    alt: "An RCC host team volunteer welcoming guests at the front door",
  },
  intro: {
    eyebrow: "What is Next?",
    headline: "A no-pressure intro to RCC.",
    image: "/brand/pages/next/jonathan.jpg",
    imageAlt: "Jonathan Dunn, lead pastor of RCC, on stage during a service",
    imageCaption: "Hosted by Jonathan Dunn, lead pastor.",
    paragraphs: [
      "One of the things we hope for everyone who visits is that you'll find a level of comfort in our environments — and then want to take a next step. Maybe that's understanding what RCC is all about, finding out how to get plugged in, or just getting answers to the questions on your mind.",
      "Next is the easiest way to do all three. It's a brief 20-minute session offered (usually) on the last Sunday of each month, right after the 10:15 AM service. We'll cover the mission and vision of the church and walk through your options if you want to get more involved.",
    ],
  },
  expect: {
    eyebrow: "What to expect",
    headline: "Friendly, focused, fast.",
    items: [
      {
        title: "Coffee + a quick hello",
        description:
          "Find us right after the service — grab a coffee, take a seat, settle in. The room is small and conversational on purpose.",
      },
      {
        title: "20 minutes with Jonathan",
        description:
          "Our lead pastor walks through who we are, why we exist, and what God is up to at River City — short, honest, no jargon.",
      },
      {
        title: "Your questions, answered",
        description:
          "Bring whatever you've been wondering about. Doctrine, kids' programs, how giving works, where to start — nothing is off the table.",
      },
      {
        title: "Clear next steps",
        description:
          "Leave with a concrete picture of how to get plugged in — a small group, serving on a team, baptism, or just coming back next Sunday.",
      },
    ],
  },
  quickFacts: {
    when: {
      label: "When",
      value: "Last Sunday of the month",
      note: "Right after the 10:15 service",
    },
    where: {
      label: "Where",
      value: "Right in the auditorium",
      note: "A host will point you to the row",
    },
    duration: {
      label: "How long",
      value: "About 20 minutes",
      note: "Kids stay in Family Ministry",
    },
  },
  cta: {
    headline: "Save us a seat at the next one.",
    body:
      "Let us know you're planning to come and we'll keep an eye out for you. Not ready yet? Plan a visit first — Next will still be here next month.",
    primaryLabel: "Tell us you're coming",
    primaryHref: "/contact",
    secondaryLabel: "Plan a visit first",
    secondaryHref: "/visit/what-to-expect",
  },
};

async function safeFetch<T>(q: string): Promise<T | null> {
  try {
    return await client.fetch<T>(q);
  } catch {
    return null;
  }
}

function imgSrc(image: SanityImage | undefined, fallback: string, w = 1600) {
  return image?.asset ? urlFor(image).width(w).url() : fallback;
}

export default async function NextSessionPage() {
  const doc = await safeFetch<NextPageDoc | null>(nextPageQuery);

  const hero = doc?.hero ?? {};
  const heroEyebrow = hero.eyebrow ?? F.hero.eyebrow;
  const heroHeadline = hero.headline ?? F.hero.headline;
  const heroIntro = hero.intro ?? F.hero.intro;
  const heroImageSrc = imgSrc(hero.image, F.hero.image, 2200);
  const heroImageAlt = hero.image?.alt ?? F.hero.alt;

  const intro = doc?.intro;
  const introImageSrc = imgSrc(intro?.image, F.intro.image, 1400);
  const introImageAlt = intro?.image?.alt ?? F.intro.imageAlt;

  const expect = doc?.whatToExpect;
  const expectItems = expect?.items?.length ? expect.items : F.expect.items;

  const qf = doc?.quickFacts;
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
          className="-z-10 object-cover object-[center_30%]"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-900/85 via-ink-900/55 to-ink-900/30"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-6 py-32 md:py-44">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-300">
            {heroEyebrow}
          </p>
          <h1 className="mt-3 font-display text-6xl uppercase leading-[0.95] tracking-wide md:text-8xl">
            {heroHeadline}
          </h1>
          {heroIntro && (
            <p className="mt-6 max-w-2xl text-lg leading-8 text-cream-50/95 md:text-xl md:leading-9">
              {heroIntro}
            </p>
          )}
        </div>
      </section>

      {/* INTRO — two-column with image on the right */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
              {intro?.eyebrow ?? F.intro.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
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
          <figure className="relative">
            <Image
              src={introImageSrc}
              alt={introImageAlt}
              width={1400}
              height={2100}
              className="aspect-[4/5] w-full rounded-2xl object-cover shadow-md"
            />
            <figcaption className="mt-3 text-sm italic text-ink-500">
              {intro?.imageCaption ?? F.intro.imageCaption}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* WHAT TO EXPECT — 4 tiles */}
      <section className="bg-cream-100 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <header className="mb-12 text-center md:mb-16">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
              {expect?.eyebrow ?? F.expect.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
              {expect?.headline ?? F.expect.headline}
            </h2>
          </header>
          <ol className="grid gap-5 md:grid-cols-2 md:gap-6">
            {expectItems.map((item, i) => (
              <li
                key={`${item.title}-${i}`}
                className="relative overflow-hidden rounded-2xl border border-cream-200 bg-white p-7 shadow-sm md:p-8"
              >
                <span
                  aria-hidden="true"
                  className="absolute -right-3 -top-4 font-display text-[7rem] leading-none text-brand-100 md:text-[8rem]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="relative font-display text-2xl uppercase leading-tight tracking-wide text-ink-800 md:text-3xl">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="relative mt-3 text-base leading-7 text-ink-700">
                    {item.description}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* QUICK FACTS */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <dl className="grid gap-5 rounded-2xl border border-cream-200 bg-cream-50 p-6 md:grid-cols-3 md:gap-0 md:divide-x md:divide-cream-200 md:p-0">
            {([
              ["when", F.quickFacts.when, qf?.when],
              ["where", F.quickFacts.where, qf?.where],
              ["duration", F.quickFacts.duration, qf?.duration],
            ] as const).map(([k, fallback, fact]) => (
              <div key={k} className="md:p-8 md:text-center">
                <dt className="font-display text-xs uppercase tracking-[0.3em] text-brand-600">
                  {fact?.label ?? fallback.label}
                </dt>
                <dd className="mt-2 font-display text-xl uppercase leading-tight tracking-wide text-ink-800 md:text-2xl">
                  {fact?.value ?? fallback.value}
                </dd>
                {(fact?.note ?? fallback.note) && (
                  <p className="mt-1 text-sm text-ink-500">
                    {fact?.note ?? fallback.note}
                  </p>
                )}
              </div>
            ))}
          </dl>
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

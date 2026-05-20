import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { whatToExpectPageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { WhatToExpectPageDoc, WhatToExpectStep } from "@/types/sanity";

export const metadata: Metadata = {
  title: "What to Expect",
  description:
    "From the parking lot to your seat in the auditorium — here's exactly what to expect on your first Sunday at RCC.",
};

const F = {
  hero: {
    eyebrow: "Visit",
    headline: "What to Expect",
    intro:
      "From the parking lot to your seat — here's exactly what your first Sunday at RCC looks like.",
    image: "/brand/pages/what-to-expect/hero.jpg",
    alt: "RCC Sunday morning — view from the soundboard",
  },
  lede: "We aim to make every visit feel easy. From parking to the auditorium — coffee, kids check-in, a seat next to someone friendly. **You really do matter here.**",
  steps: [
    {
      number: "01",
      title: "Pull in.",
      body: "Easy parking off Kirby-Whitten Parkway. Look for a volunteer in a yellow vest — they'll wave you toward an open spot and point you to the entrance.",
      image: "/brand/pages/what-to-expect/parking.jpg",
      alt: "RCC parking team volunteers in yellow vests welcoming guests",
    },
    {
      number: "02",
      title: "Get welcomed.",
      body: "Someone will say hello at the door. You don't need to know anyone, dress a certain way, or have answers ready — just come as you are.",
      image: "/brand/pages/what-to-expect/welcomed.jpg",
      alt: "An RCC host team volunteer greeting people at the front door",
    },
    {
      number: "03",
      title: "Grab a coffee.",
      body: "Free coffee from 10:00 AM. Take a minute, meet someone, breathe. The lobby is the easiest place to get your bearings before the service starts.",
      image: "/brand/pages/what-to-expect/lobby.jpg",
      alt: "Grabbing coffee at the RCC coffee bar before the service",
    },
    {
      number: "04",
      title: "Check the kids in.",
      body: "Family Ministry environments for infants through 8th grade are open at 10:15. Safe, trained, fun-filled — your kids will have a blast and you'll have a quiet, focused hour.",
      image: "/brand/pages/what-to-expect/kids.jpg",
      alt: "RCC Family Ministry baby room",
    },
    {
      number: "05",
      title: "Worship + a real message.",
      body: "Live band, contemporary music, then a clear teaching from Scripture that connects to everyday life. The full service runs 65–70 minutes — we start and end on time.",
      image: "/brand/pages/what-to-expect/service.jpg",
      alt: "RCC worship leader on stage during a Sunday service",
    },
  ],
  quickFacts: {
    serviceTime: {
      label: "Service time",
      value: "Sundays · 10:15 AM",
      note: "Coffee starts at 10:00",
    },
    address: {
      label: "Address",
      value: "3871 Kirby Whitten Pkwy",
      note: "Bartlett, TN 38135",
    },
    duration: {
      label: "How long",
      value: "65–70 minutes",
      note: "We start and end on time",
    },
  },
  cta: {
    headline: "Save us a seat.",
    body: "Want to know exactly where to go? Get directions and we'll see you Sunday.",
    primaryLabel: "Get directions",
    primaryHref: "/visit/location",
  },
};

async function safeFetch<T>(q: string): Promise<T | null> {
  try {
    return await client.fetch<T>(q);
  } catch {
    return null;
  }
}

function img(sanity: { asset?: unknown } | undefined, fallback: string) {
  return sanity?.asset
    ? urlFor(sanity as Parameters<typeof urlFor>[0])
        .width(1600)
        .url()
    : fallback;
}

/** Render *bold* markers in the lede as <strong>. */
function renderLede(text: string) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((p, i) =>
    p.startsWith("*") && p.endsWith("*") ? (
      <strong key={i} className="font-semibold text-ink-800">
        {p.slice(1, -1)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export default async function WhatToExpectPage() {
  const doc = await safeFetch<WhatToExpectPageDoc | null>(whatToExpectPageQuery);

  const hero = { ...F.hero, ...(doc?.hero ?? {}) };
  const lede = doc?.lede ?? F.lede;
  const steps =
    doc?.steps && doc.steps.length > 0 ? (doc.steps as WhatToExpectStep[]) : F.steps;
  const qf = {
    serviceTime: {
      ...F.quickFacts.serviceTime,
      ...(doc?.quickFacts?.serviceTime ?? {}),
    },
    address: { ...F.quickFacts.address, ...(doc?.quickFacts?.address ?? {}) },
    duration: { ...F.quickFacts.duration, ...(doc?.quickFacts?.duration ?? {}) },
  };
  const cta = doc?.cta;

  return (
    <div>
      <section className="relative isolate overflow-hidden text-white">
        <Image
          src={img(hero.image as { asset?: unknown }, F.hero.image)}
          alt={
            (typeof hero.image === "object" && (hero.image as { alt?: string })?.alt) ||
            F.hero.alt
          }
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-900/85 via-ink-900/55 to-ink-900/30"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-6 py-32 md:py-44">
          {hero.eyebrow && (
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-300">
              {hero.eyebrow}
            </p>
          )}
          <h1 className="mt-3 font-display text-5xl uppercase leading-tight tracking-wide md:text-7xl">
            {hero.headline}
          </h1>
          {hero.intro && (
            <p className="mt-5 max-w-2xl text-lg leading-8 text-cream-50/95 md:text-xl md:leading-9">
              {hero.intro}
            </p>
          )}
        </div>
      </section>

      <section className="bg-cream-50 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xl leading-9 text-ink-700 md:text-2xl md:leading-relaxed">
            {renderLede(lede)}
          </p>
        </div>
      </section>

      <section className="bg-white">
        {steps.map((s, i) => {
          const sanityImg = (s.image as { asset?: unknown }) || undefined;
          const sanityAlt = (s.image as { alt?: string })?.alt;
          const fallback = F.steps[i];
          return (
            <div
              key={`${s.number}-${s.title}`}
              className={
                i % 2 === 0
                  ? "border-t border-cream-200 first:border-t-0"
                  : "border-t border-cream-200 bg-cream-50"
              }
            >
              <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:gap-16 md:py-24">
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <p className="font-display text-5xl tracking-wide text-brand-500 md:text-6xl">
                    {s.number}
                  </p>
                  <h2 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
                    {s.title}
                  </h2>
                  {s.body && (
                    <p className="mt-5 text-lg leading-8 text-ink-700 md:text-xl md:leading-9">
                      {s.body}
                    </p>
                  )}
                </div>
                <div className={i % 2 === 1 ? "md:order-1" : ""}>
                  <Image
                    src={img(sanityImg, fallback?.image ?? "")}
                    alt={sanityAlt ?? fallback?.alt ?? s.title ?? ""}
                    width={1200}
                    height={1200}
                    className="aspect-square w-full rounded-2xl object-cover shadow-md"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="bg-cream-100 py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {[qf.serviceTime, qf.address, qf.duration].map((f, i) => (
              <div key={i} className="text-center">
                <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
                  {f.label}
                </p>
                <p
                  className={`mt-2 font-display uppercase tracking-wide text-ink-800 ${
                    i === 1 ? "text-2xl" : "text-3xl"
                  }`}
                >
                  {f.value}
                </p>
                {f.note && (
                  <p className="mt-1 text-sm text-ink-600">{f.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

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
            {cta?.secondaryCta?.label && cta.secondaryCta.href && (
              <Link
                href={cta.secondaryCta.href}
                className="rounded-full border border-white/40 bg-white/5 px-6 py-3 font-display text-sm uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/15"
              >
                {cta.secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

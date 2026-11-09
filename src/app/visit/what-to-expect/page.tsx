import type { Metadata } from "next";
import Image from "next/image";
import { client } from "@/sanity/client";
import { whatToExpectPageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { WhatToExpectPageDoc, WhatToExpectStep } from "@/types/sanity";
import {
  Button,
  Container,
  CtaBand,
  FactCard,
  PhotoHero,
  Section,
} from "@/components/v2/ui";

export const metadata: Metadata = {
  title: "What to Expect",
  description:
    "From the parking lot to your seat in the auditorium — here's exactly what to expect on your first Sunday at RCC.",
};

const F = {
  hero: {
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
      <strong key={i} className="font-semibold text-brand-600">
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

  const heroAlt =
    (typeof hero.image === "object" && (hero.image as { alt?: string })?.alt) ||
    F.hero.alt;

  return (
    <div>
      <PhotoHero
        image={img(hero.image as { asset?: unknown }, F.hero.image)}
        alt={heroAlt}
        headline={hero.headline ?? F.hero.headline}
        accent="Expect"
        intro={hero.intro}
      />

      {/* LEDE + QUICK FACTS */}
      <Section tone="white">
        <Container>
          <p className="max-w-5xl text-3xl font-semibold leading-[1.2] tracking-tight text-ink-900 md:text-5xl">
            {renderLede(lede)}
          </p>
          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {[qf.serviceTime, qf.address, qf.duration].map((f, i) => (
              <FactCard
                key={i}
                label={f.label ?? ""}
                value={f.value}
                note={f.note}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* STEPS */}
      <Section tone="light">
        <Container>
          <div className="space-y-20 md:space-y-32">
            {steps.map((s, i) => {
              const sanityImg = (s.image as { asset?: unknown }) || undefined;
              const sanityAlt = (s.image as { alt?: string })?.alt;
              const fallback = F.steps[i];
              const flip = i % 2 === 1;
              return (
                <article
                  key={`${i}-${s.title}`}
                  className="grid items-center gap-10 lg:grid-cols-2 lg:gap-24"
                >
                  <div className={flip ? "lg:order-2" : ""}>
                    <h2 className="text-5xl font-bold leading-[0.95] tracking-tight text-ink-900 md:text-6xl">
                      {s.title}
                    </h2>
                    {s.body && (
                      <p className="mt-6 max-w-xl text-lg leading-8 text-ink-600 md:text-xl md:leading-9">
                        {s.body}
                      </p>
                    )}
                  </div>
                  <div
                    className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream-200 ${
                      flip ? "lg:order-1" : ""
                    }`}
                  >
                    <Image
                      src={img(sanityImg, fallback?.image ?? "")}
                      alt={sanityAlt ?? fallback?.alt ?? s.title ?? ""}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <CtaBand
        headline={cta?.headline ?? F.cta.headline}
        accent="a seat."
        body={cta?.body ?? F.cta.body}
      >
        <Button tone="dark" href={cta?.primaryCta?.href ?? F.cta.primaryHref}>
          {cta?.primaryCta?.label ?? F.cta.primaryLabel}
        </Button>
        {cta?.secondaryCta?.label && cta.secondaryCta.href && (
          <Button tone="dark" variant="outline" href={cta.secondaryCta.href}>
            {cta.secondaryCta.label}
          </Button>
        )}
      </CtaBand>
    </div>
  );
}

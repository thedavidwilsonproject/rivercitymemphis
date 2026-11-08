import type { Metadata } from "next";
import Image from "next/image";
import { client } from "@/sanity/client";
import { nextPageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PortableBody } from "@/components/portable-body";
import {
  Button,
  Container,
  CtaBand,
  Eyebrow,
  FactCard,
  Headline,
  NumberedItem,
  PhotoHero,
  Section,
  SectionHeader,
} from "@/components/v2/ui";
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
      "Not ready yet? Plan a visit first — Next will still be here next month.",
    primaryLabel: "Plan a visit first",
    primaryHref: "/visit/what-to-expect",
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
      <PhotoHero
        image={heroImageSrc}
        alt={heroImageAlt}
        eyebrow={heroEyebrow}
        headline={heroHeadline}
        intro={heroIntro}
      />

      {/* INTRO — text left, captioned portrait right */}
      <Section tone="light">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
            <div>
              <Eyebrow>{intro?.eyebrow ?? F.intro.eyebrow}</Eyebrow>
              <Headline
                text={intro?.headline ?? F.intro.headline}
                accent={
                  (intro?.headline ?? F.intro.headline).endsWith("intro to RCC.")
                    ? "intro to RCC."
                    : undefined
                }
                className="mt-4"
              />
              <div className="mt-8 space-y-5 text-lg leading-8 text-ink-600">
                {intro?.body ? (
                  <PortableBody value={intro.body} />
                ) : (
                  F.intro.paragraphs.map((p, i) => <p key={i}>{p}</p>)
                )}
              </div>
            </div>
            <figure>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream-200">
                <Image
                  src={introImageSrc}
                  alt={introImageAlt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-4 font-serif text-xl italic text-ink-500">
                {intro?.imageCaption ?? F.intro.imageCaption}
              </figcaption>
            </figure>
          </div>
        </Container>
      </Section>

      {/* WHAT TO EXPECT — numbered list on dark */}
      <Section tone="dark">
        <Container>
          <SectionHeader
            tone="dark"
            align="left"
            eyebrow={expect?.eyebrow ?? F.expect.eyebrow}
            headline={expect?.headline ?? F.expect.headline}
          />
          <ol className="grid gap-12 lg:grid-cols-2 lg:gap-x-16">
            {expectItems.map((item, i) => (
              <li key={`${item.title}-${i}`}>
                <NumberedItem
                  tone="dark"
                  number={String(i + 1).padStart(2, "0")}
                  title={item.title ?? ""}
                >
                  {item.description}
                </NumberedItem>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* QUICK FACTS */}
      <Section tone="light">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {([
              ["when", F.quickFacts.when, qf?.when],
              ["where", F.quickFacts.where, qf?.where],
              ["duration", F.quickFacts.duration, qf?.duration],
            ] as const).map(([k, fallback, fact]) => (
              <FactCard
                key={k}
                label={fact?.label ?? fallback.label}
                value={fact?.value ?? fallback.value}
                note={fact?.note ?? fallback.note}
              />
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        headline={cta?.headline ?? F.cta.headline}
        accent={
          (cta?.headline ?? F.cta.headline).endsWith("next one.") ? "next one." : undefined
        }
        body={cta?.body ?? F.cta.body}
        image={heroImageSrc}
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

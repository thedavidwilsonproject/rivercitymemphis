import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { connectPageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import {
  Button,
  Container,
  CtaBand,
  PhotoCard,
  PhotoHero,
  Section,
} from "@/components/v2/ui";
import type { ConnectPageDoc, SanityImage } from "@/types/sanity";
import { ChurchCenterForms } from "@/components/v2/pco-blocks";

export const metadata: Metadata = {
  title: "Connect",
  description:
    "Take your next step at River City Church — Next Step session, Family Ministries, Groups, and Be Rich.",
};

const F = {
  hero: {
    headline: "Take your next step.",
    intro:
      "We're always looking for ways to help people plug in to what God is doing in our city, nation, and world. Here are four good places to start.",
    image: "/brand/pages/connect/hero.jpg",
    alt: "Families walking up to the RCC building on a Sunday morning",
  },
  cards: [
    {
      title: "Next",
      blurb:
        "A 15-minute session with our lead pastor Jonathan Dunn — why we exist, how to get connected, and answers to your questions.",
      href: "/connect/next",
      ctaLabel: "Plan to attend →",
      image: "/brand/pages/connect/next.jpg",
      alt: "Jonathan Dunn teaching at RCC on a Sunday morning",
      featured: true,
    },
    {
      title: "Family Ministries",
      blurb:
        "Safe, fun, age-appropriate environments where your kids will love to grow — and where we partner with you to help them see Jesus more clearly.",
      href: "/connect/families",
      ctaLabel: "Meet the team →",
      image: "/brand/pages/connect/families.jpg",
      alt: "A small group leader teaching kids at RCC",
    },
    {
      title: "Groups",
      blurb:
        "Circles are better than rows. Get plugged into a small group where life happens around a table — questions, laughter, prayer, and the kind of friendship that lasts.",
      href: "/groups",
      ctaLabel: "Find a group →",
      image: "/brand/pages/connect/groups.jpg",
      alt: "RCC members talking in the lobby with coffee after a service",
    },
    {
      title: "Be Rich",
      blurb:
        "We believe we're on mission in our city to reach those in need — serving our neighbors, supporting non-profits, and showing the love of Jesus in tangible ways.",
      href: "/connect/be-rich",
      ctaLabel: "Get involved →",
      image: "/brand/pages/connect/be-rich.jpg",
      alt: "RCC hosting Easter Fest — a free community event in Bartlett",
      featured: true,
    },
  ],
  cta: {
    headline: "Not sure where to start?",
    body: "Come say hi this Sunday. Coffee starts at 10:00, the service is at 10:15 — and a friend you haven't met yet is already saving you a seat.",
    primaryLabel: "Plan your visit",
    primaryHref: "/visit/what-to-expect",
    secondaryLabel: "Get directions",
    secondaryHref: "/visit/location",
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

export default async function ConnectHubPage() {
  const doc = await safeFetch<ConnectPageDoc | null>(connectPageQuery);
  const hero = { ...F.hero, ...(doc?.hero ?? {}) };
  const cards = (doc?.cards?.length ? doc.cards : F.cards).map((c, i) => ({
    title: c.title ?? F.cards[i]?.title ?? "",
    blurb: c.blurb ?? F.cards[i]?.blurb,
    href: c.href ?? F.cards[i]?.href ?? "#",
    ctaLabel: c.ctaLabel ?? F.cards[i]?.ctaLabel ?? "Learn more →",
    featured: c.featured ?? F.cards[i]?.featured ?? false,
    image: c.image,
    fallbackImage: F.cards[i]?.image,
    alt:
      (c.image as SanityImage | undefined)?.alt ??
      F.cards[i]?.alt ??
      c.title ??
      "",
  }));
  const cta = doc?.cta;

  return (
    <div>
      <PhotoHero
        image={imgSrc(hero.image as SanityImage, F.hero.image, 2200)}
        alt={(hero.image as SanityImage)?.alt ?? F.hero.alt}
        headline={hero.headline ?? F.hero.headline}
        accent={
          (hero.headline ?? F.hero.headline).endsWith("next step.")
            ? "next step."
            : undefined
        }
        intro={hero.intro}
      />

      {/* HUB CARDS — featured cards span wide, others sit in pairs */}
      <Section tone="light">
        <Container>
          <div className="grid gap-x-6 gap-y-20 md:grid-cols-2">
            {(() => {
              let featuredSeen = 0;
              return cards.map((c, i) => {
                const src = imgSrc(c.image as SanityImage, c.fallbackImage ?? "", 1600);
                if (!c.featured) {
                  return (
                    <PhotoCard
                      key={`${c.title}-${i}`}
                      href={c.href}
                      image={src || undefined}
                      alt={c.alt}
                      title={c.title}
                      blurb={c.blurb}
                      cta={c.ctaLabel}
                      aspect="aspect-[4/3]"
                    />
                  );
                }
                const flip = featuredSeen++ % 2 === 1;
                return (
                  <Link
                    key={`${c.title}-${i}`}
                    href={c.href}
                    className="group grid items-center gap-10 md:col-span-2 lg:grid-cols-[1.2fr_1fr] lg:gap-20"
                  >
                    <div
                      className={`relative aspect-[16/10] overflow-hidden rounded-2xl bg-cream-200 ${
                        flip ? "lg:order-2" : ""
                      }`}
                    >
                      {src && (
                        <Image
                          src={src}
                          alt={c.alt}
                          fill
                          sizes="(min-width: 1024px) 55vw, 100vw"
                          className="object-cover transition duration-700 group-hover:scale-[1.03]"
                        />
                      )}
                    </div>
                    <div>
                      <h2 className="text-5xl font-bold leading-[0.95] tracking-tight text-ink-900 md:text-7xl">
                        {c.title}
                      </h2>
                      {c.blurb && (
                        <p className="mt-6 max-w-lg text-lg leading-8 text-ink-600">
                          {c.blurb}
                        </p>
                      )}
                      <span className="py-2 mt-8 inline-block text-sm font-semibold text-ink-900 underline decoration-brand-500 decoration-2 underline-offset-[6px] transition group-hover:text-brand-800">
                        {c.ctaLabel}
                      </span>
                    </div>
                  </Link>
                );
              });
            })()}
          </div>
        </Container>
      </Section>

      <ChurchCenterForms />

      <CtaBand
        headline={cta?.headline ?? F.cta.headline}
        accent={(cta?.headline ?? F.cta.headline).endsWith("start?") ? "start?" : undefined}
        body={cta?.body ?? F.cta.body}
        image="/brand/pages/connect/hero.jpg"
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

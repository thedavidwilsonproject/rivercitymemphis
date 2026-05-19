import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { connectPageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { ConnectPageDoc, SanityImage } from "@/types/sanity";

export const metadata: Metadata = {
  title: "Connect",
  description:
    "Take your next step at River City Church — Next Step session, Family Ministries, Groups, and Be Rich.",
};

const F = {
  hero: {
    eyebrow: "Connect",
    headline: "Take your next step.",
    intro:
      "We're always looking for ways to help people plug in to what God is doing in our city, nation, and world. Here are four good places to start.",
    image: "/brand/pages/connect/hero.jpg",
    alt: "Families walking up to the RCC building on a Sunday morning",
  },
  cards: [
    {
      eyebrow: "New here?",
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
      eyebrow: "For your whole family",
      title: "Family Ministries",
      blurb:
        "Safe, fun, age-appropriate environments where your kids will love to grow — and where we partner with you to help them see Jesus more clearly.",
      href: "/connect/families",
      ctaLabel: "Meet the team →",
      image: "/brand/pages/connect/families.jpg",
      alt: "A small group leader teaching kids at RCC",
    },
    {
      eyebrow: "Real friendship",
      title: "Groups",
      blurb:
        "Circles are better than rows. Get plugged into a small group where life happens around a table — questions, laughter, prayer, and the kind of friendship that lasts.",
      href: "/groups",
      ctaLabel: "Find a group →",
      image: "/brand/pages/connect/groups.jpg",
      alt: "RCC members talking in the lobby with coffee after a service",
    },
    {
      eyebrow: "Love your city",
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
    eyebrow: c.eyebrow ?? F.cards[i]?.eyebrow,
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
      {/* HERO */}
      <section className="relative isolate overflow-hidden text-white">
        <Image
          src={imgSrc(hero.image as SanityImage, F.hero.image, 2200)}
          alt={(hero.image as SanityImage)?.alt ?? F.hero.alt}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-900/85 via-ink-900/55 to-ink-900/35"
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

      {/* HUB CARDS */}
      <section className="bg-cream-50 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl auto-rows-fr gap-6 px-6 md:grid-cols-2 md:gap-8">
          {(() => {
            let featuredSeen = 0;
            return cards.map((c, i) => {
              const src = imgSrc(c.image as SanityImage, c.fallbackImage ?? "", 1600);
              const featured = c.featured;
              const flipImage = featured && featuredSeen++ % 2 === 1;
              return (
              <Link
                key={`${c.title}-${i}`}
                href={c.href}
                className={[
                  "group relative isolate flex flex-col overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl",
                  featured ? "md:col-span-2 md:items-stretch" : "",
                  featured && !flipImage ? "md:flex-row" : "",
                  featured && flipImage ? "md:flex-row-reverse" : "",
                ].join(" ")}
              >
                <div
                  className={[
                    "relative overflow-hidden bg-ink-100",
                    featured
                      ? "aspect-[16/9] md:aspect-auto md:w-[55%]"
                      : "aspect-[4/3]",
                  ].join(" ")}
                >
                  {src && (
                    <Image
                      src={src}
                      alt={c.alt}
                      fill
                      sizes={
                        featured
                          ? "(min-width: 768px) 720px, 100vw"
                          : "(min-width: 768px) 560px, 100vw"
                      }
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <div
                  className={[
                    "flex flex-col gap-3 p-6 md:p-8",
                    featured ? "md:flex-1 md:justify-center md:p-10" : "",
                  ].join(" ")}
                >
                  {c.eyebrow && (
                    <p className="font-display text-xs uppercase tracking-[0.3em] text-brand-600">
                      {c.eyebrow}
                    </p>
                  )}
                  <h2
                    className={[
                      "font-display uppercase leading-tight tracking-wide text-ink-800",
                      featured ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl",
                    ].join(" ")}
                  >
                    {c.title}
                  </h2>
                  {c.blurb && (
                    <p className="text-base leading-7 text-ink-700 md:text-lg md:leading-8">
                      {c.blurb}
                    </p>
                  )}
                  <span className="mt-2 inline-flex items-center font-display text-sm uppercase tracking-widest text-brand-600 transition group-hover:text-brand-700">
                    {c.ctaLabel}
                  </span>
                </div>
              </Link>
              );
            });
          })()}
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

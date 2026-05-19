import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { whoWeArePageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PortableBody } from "@/components/portable-body";
import type { WhoWeArePageDoc } from "@/types/sanity";

export const metadata: Metadata = {
  title: "Who We Are",
  description:
    "A real, friendly church in Bartlett, TN — partnering with God to refocus life, home, and church back to Him.",
};

/** Hardcoded fallbacks — used when Sanity field is blank or doc is missing. */
const F = {
  hero: {
    eyebrow: "Visit",
    headline: "Who We Are",
    intro:
      "A relaxed, friendly community in Bartlett, TN — partnering with God to lead people to refocus their life, home, and the church back to Him.",
    image: "/brand/pages/who-we-are/exterior.jpg",
    alt: "Family walking up to the RCC building",
  },
  culture: {
    eyebrow: "Our culture",
    headline: "Come as you are.",
    image: "/brand/pages/who-we-are/entrance.jpg",
    alt: "Walking into the RCC auditorium on a Sunday morning",
    ctaLabel: "Plan your visit →",
    ctaHref: "/visit/what-to-expect",
  },
  worshipImage: "/brand/pages/who-we-are/worship.jpg",
  story: {
    eyebrow: "Our story",
    headline: "Refocus.",
  },
  beliefs: {
    eyebrow: "What we believe",
    headline: "Jesus at the center.",
    image: "/brand/pages/who-we-are/teaching.jpg",
    alt: "Jonathan Dunn teaching at RCC",
    ctaLabel: "Watch a recent message →",
    ctaHref: "/watch",
  },
  baptism: {
    image: "/brand/pages/who-we-are/baptism.jpg",
    alt: "Baptism — 'Raised to Life' at RCC",
    overlayTitle: "Raised to Life",
    overlayBody:
      "Real change. Real stories. Real people stepping toward Jesus — every week at RCC.",
  },
  cta: {
    headline: "We'd love to meet you.",
    body: "Visit us this Sunday at 10:15 AM — coffee starts 15 minutes earlier and a friend you haven't met yet is probably already saving you a seat.",
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

function img(sanity: { asset?: unknown } | undefined, fallback: string) {
  return sanity?.asset
    ? urlFor(sanity as Parameters<typeof urlFor>[0])
        .width(1600)
        .url()
    : fallback;
}

export default async function WhoWeArePage() {
  const doc = await safeFetch<WhoWeArePageDoc | null>(whoWeArePageQuery);

  const hero = { ...F.hero, ...(doc?.hero ?? {}) };
  const mvs = doc?.mvs;
  const culture = doc?.culture;
  const story = doc?.story;
  const beliefs = doc?.beliefs;
  const baptism = doc?.baptismBanner;
  const cta = doc?.cta;

  return (
    <div>
      {/* HERO */}
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
          className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-900/80 via-ink-900/45 to-ink-900/30"
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

      {/* MISSION / VISION / STRATEGY */}
      {mvs && (
        <section className="bg-white py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-6">
            {(mvs.eyebrow || mvs.headline) && (
              <header className="mb-14 text-center md:mb-20">
                {mvs.eyebrow && (
                  <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
                    {mvs.eyebrow}
                  </p>
                )}
                {mvs.headline && (
                  <h2 className="mt-3 font-display text-5xl uppercase leading-tight tracking-wide text-ink-800 md:text-6xl">
                    {mvs.headline}
                  </h2>
                )}
                {mvs.intro && (
                  <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-ink-700 md:text-xl md:leading-9">
                    {mvs.intro}
                  </p>
                )}
              </header>
            )}

            {/* Mission + Vision side by side */}
            <div className="grid gap-6 md:grid-cols-2">
              {mvs.mission && (
                <article className="rounded-2xl border-l-4 border-brand-500 bg-cream-50 p-8 md:p-10">
                  <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
                    {mvs.mission.label ?? "Mission"}
                  </p>
                  <p className="mt-4 font-display text-2xl uppercase leading-tight tracking-wide text-ink-800 md:text-3xl">
                    {mvs.mission.statement}
                  </p>
                  {mvs.mission.description && (
                    <p className="mt-5 text-base leading-7 text-ink-700 md:text-lg md:leading-8">
                      {mvs.mission.description}
                    </p>
                  )}
                </article>
              )}
              {mvs.vision && (
                <article className="rounded-2xl border-l-4 border-brand-500 bg-cream-50 p-8 md:p-10">
                  <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
                    {mvs.vision.label ?? "Vision"}
                  </p>
                  <p className="mt-4 font-display text-2xl uppercase leading-tight tracking-wide text-ink-800 md:text-3xl">
                    {mvs.vision.statement}
                  </p>
                  {mvs.vision.description && (
                    <p className="mt-5 text-base leading-7 text-ink-700 md:text-lg md:leading-8">
                      {mvs.vision.description}
                    </p>
                  )}
                </article>
              )}
            </div>

            {/* Strategy — full width with pillars sub-grid */}
            {mvs.strategy && (
              <article className="mt-6 rounded-2xl bg-brand-600 p-8 text-white md:p-10">
                <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-100">
                  {mvs.strategy.label ?? "Strategy"}
                </p>
                {mvs.strategy.statement && (
                  <p className="mt-4 font-display text-2xl uppercase leading-tight tracking-wide md:text-3xl">
                    {mvs.strategy.statement}
                  </p>
                )}
                {mvs.strategy.pillars && mvs.strategy.pillars.length > 0 && (
                  <div className="mt-8 grid gap-6 md:grid-cols-3">
                    {mvs.strategy.pillars.map((p, i) => (
                      <div
                        key={`${p.name}-${i}`}
                        className="rounded-xl bg-brand-700/40 p-6 backdrop-blur-sm"
                      >
                        <p className="font-display text-xl uppercase tracking-wide text-white md:text-2xl">
                          {p.name}
                        </p>
                        {p.description && (
                          <p className="mt-2 text-base leading-7 text-brand-50/90">
                            {p.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {mvs.strategy.description && (
                  <p className="mt-8 max-w-3xl text-base leading-7 text-brand-50/95 md:text-lg md:leading-8">
                    {mvs.strategy.description}
                  </p>
                )}
              </article>
            )}
          </div>
        </section>
      )}

      {/* CULTURE — two-column */}
      <section className="bg-cream-50 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center md:gap-16">
          <div className="order-2 md:order-1">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
              {culture?.eyebrow ?? F.culture.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
              {culture?.headline ?? F.culture.headline}
            </h2>
            <div className="mt-6 text-lg leading-8 text-ink-700">
              {culture?.body ? (
                <PortableBody value={culture.body} />
              ) : (
                <>
                  <p className="mb-5">
                    The culture at RCC can best be defined as{" "}
                    <strong className="text-ink-800">real</strong> — and it can
                    be attributed to our desire to create a safe place for
                    anyone to take that next step in their journey with God.
                  </p>
                  <p>
                    Our hope is that each person leaves each week knowing that
                    they have encountered God in a freeing and worshipful way.
                  </p>
                </>
              )}
            </div>
            {(culture?.cta?.label ?? F.culture.ctaLabel) &&
              (culture?.cta?.href ?? F.culture.ctaHref) && (
                <Link
                  href={culture?.cta?.href ?? F.culture.ctaHref}
                  className="mt-8 inline-flex rounded-full bg-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
                >
                  {culture?.cta?.label ?? F.culture.ctaLabel}
                </Link>
              )}
          </div>
          <div className="order-1 md:order-2">
            <Image
              src={img(culture?.image, F.culture.image)}
              alt={culture?.image?.alt ?? F.culture.alt}
              width={1400}
              height={1600}
              className="aspect-[7/8] w-full rounded-2xl object-cover shadow-md"
            />
          </div>
        </div>
      </section>

      {/* WORSHIP BANNER */}
      <section>
        <Image
          src={img(doc?.worshipBanner, F.worshipImage)}
          alt={doc?.worshipBanner?.alt ?? "RCC worship band on a Sunday morning"}
          width={1600}
          height={1067}
          className="aspect-[16/9] w-full object-cover md:aspect-[21/9]"
        />
      </section>

      {/* STORY */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
            {story?.eyebrow ?? F.story.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
            {story?.headline ?? F.story.headline}
          </h2>
          <div className="mt-6 text-lg leading-8 text-ink-700">
            {story?.body ? (
              <PortableBody value={story.body} />
            ) : (
              <>
                <p className="mb-5">
                  Our journey began in 2007, when Jonathan Dunn began to sense
                  God calling him to lead a church that would reach the people
                  who were currently put off by church.
                </p>
                <p>
                  He felt that God was calling him to plant a new church in the
                  Memphis area with a clear vision:{" "}
                  <em className="text-ink-800">refocus our city back to God.</em>{" "}
                  That vision meant RCC would passionately pursue helping each
                  person refocus their life back to God, each family refocus
                  back to God, and even help the church refocus back to God.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* BELIEFS */}
      <section className="bg-cream-100 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <Image
              src={img(beliefs?.image, F.beliefs.image)}
              alt={beliefs?.image?.alt ?? F.beliefs.alt}
              width={1600}
              height={900}
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-md"
            />
          </div>
          <div>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
              {beliefs?.eyebrow ?? F.beliefs.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
              {beliefs?.headline ?? F.beliefs.headline}
            </h2>
            <div className="mt-6 text-lg leading-8 text-ink-700">
              {beliefs?.body ? (
                <PortableBody value={beliefs.body} />
              ) : (
                <>
                  <p className="mb-5">
                    RCC is non-denominational. We teach the Bible plainly each
                    week with a focus on practical application — what does it
                    actually look like to follow Jesus on Monday morning?
                  </p>
                  <p>
                    Our preaching is honest about life's complexity, hopeful
                    about God's grace, and rooted in Scripture from start to
                    finish.
                  </p>
                </>
              )}
            </div>
            {(beliefs?.cta?.label ?? F.beliefs.ctaLabel) &&
              (beliefs?.cta?.href ?? F.beliefs.ctaHref) && (
                <Link
                  href={beliefs?.cta?.href ?? F.beliefs.ctaHref}
                  className="mt-8 inline-flex rounded-full border border-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-brand-600 transition hover:bg-brand-50"
                >
                  {beliefs?.cta?.label ?? F.beliefs.ctaLabel}
                </Link>
              )}
          </div>
        </div>
      </section>

      {/* BAPTISM BANNER */}
      <section className="relative">
        <Image
          src={img(baptism?.image, F.baptism.image)}
          alt={baptism?.image?.alt ?? F.baptism.alt}
          width={1600}
          height={1067}
          className="aspect-[16/9] w-full object-cover md:aspect-[21/9]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-10 text-white md:pb-16">
          <p className="font-display text-2xl uppercase tracking-[0.2em] md:text-3xl">
            {baptism?.overlayTitle ?? F.baptism.overlayTitle}
          </p>
          <p className="mt-2 max-w-xl text-base leading-7 text-cream-50/95 md:text-lg">
            {baptism?.overlayBody ?? F.baptism.overlayBody}
          </p>
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

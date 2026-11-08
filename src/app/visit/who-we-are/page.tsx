import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { whoWeArePageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PortableBody } from "@/components/portable-body";
import type { WhoWeArePageDoc } from "@/types/sanity";
import {
  Button,
  Container,
  CtaBand,
  Eyebrow,
  Headline,
  ImageBanner,
  PhotoHero,
  Section,
  SectionHeader,
  SplitSection,
} from "@/components/v2/ui";

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

  const heroAlt =
    (typeof hero.image === "object" &&
      (hero.image as { alt?: string })?.alt) ||
    F.hero.alt;

  return (
    <div>
      {/* HERO */}
      <PhotoHero
        image={img(hero.image as { asset?: unknown }, F.hero.image)}
        alt={heroAlt}
        eyebrow={hero.eyebrow}
        headline={hero.headline ?? F.hero.headline}
        intro={hero.intro}
      />

      {/* MISSION / VISION / STRATEGY */}
      {mvs && (
        <Section tone="white">
          <Container>
            {mvs.headline && (
              <SectionHeader
                eyebrow={mvs.eyebrow}
                headline={mvs.headline}
                intro={mvs.intro}
                align="split"
              />
            )}

            <div className="grid gap-px overflow-hidden rounded-2xl border border-ink-900/15 bg-ink-900/15 md:grid-cols-2">
              {[mvs.mission, mvs.vision].map((m, i) =>
                m ? (
                  <article key={i} className="bg-paper p-8 md:p-12">
                    <Eyebrow>{m.label ?? (i === 0 ? "Mission" : "Vision")}</Eyebrow>
                    {m.statement && (
                      <p className="mt-5 text-3xl font-bold leading-tight tracking-tight text-ink-900 md:text-4xl">
                        {m.statement}
                      </p>
                    )}
                    {m.description && (
                      <p className="mt-6 text-lg leading-8 text-ink-600">
                        {m.description}
                      </p>
                    )}
                  </article>
                ) : null,
              )}
            </div>

            {mvs.strategy && (
              <article className="mt-6 rounded-2xl bg-river-950 p-8 text-white md:p-12">
                <Eyebrow tone="dark">{mvs.strategy.label ?? "Strategy"}</Eyebrow>
                {mvs.strategy.statement && (
                  <p className="mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                    {mvs.strategy.statement}
                  </p>
                )}
                {mvs.strategy.pillars && mvs.strategy.pillars.length > 0 && (
                  <div className="mt-10 grid gap-8 md:grid-cols-3">
                    {mvs.strategy.pillars.map((p, i) => (
                      <div
                        key={`${p.name}-${i}`}
                        className="border-t border-white/20 pt-6"
                      >
                        <p className="font-serif text-4xl italic text-brand-300">
                          {p.name}
                        </p>
                        {p.description && (
                          <p className="mt-3 leading-7 text-white/70">
                            {p.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {mvs.strategy.description && (
                  <p className="mt-10 max-w-3xl text-lg leading-8 text-white/75">
                    {mvs.strategy.description}
                  </p>
                )}
              </article>
            )}
          </Container>
        </Section>
      )}

      {/* CULTURE */}
      <SplitSection
        image={img(culture?.image, F.culture.image)}
        alt={culture?.image?.alt ?? F.culture.alt}
        eyebrow={culture?.eyebrow ?? F.culture.eyebrow}
        headline={culture?.headline ?? F.culture.headline}
        accent="as you are."
        reverse
        actions={
          (culture?.cta?.label ?? F.culture.ctaLabel) &&
          (culture?.cta?.href ?? F.culture.ctaHref) ? (
            <Button href={culture?.cta?.href ?? F.culture.ctaHref}>
              {culture?.cta?.label ?? F.culture.ctaLabel}
            </Button>
          ) : undefined
        }
      >
        {culture?.body ? (
          <PortableBody value={culture.body} />
        ) : (
          <>
            <p>
              The culture at RCC can best be defined as{" "}
              <strong className="font-semibold text-ink-900">real</strong> —
              and it can be attributed to our desire to create a safe place for
              anyone to take that next step in their journey with God.
            </p>
            <p>
              Our hope is that each person leaves each week knowing that they
              have encountered God in a freeing and worshipful way.
            </p>
          </>
        )}
      </SplitSection>

      {/* WORSHIP BANNER */}
      <ImageBanner
        image={img(doc?.worshipBanner, F.worshipImage)}
        alt={doc?.worshipBanner?.alt ?? "RCC worship band on a Sunday morning"}
      />

      {/* STORY */}
      <Section tone="dark">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
            <div>
              <Eyebrow tone="dark">{story?.eyebrow ?? F.story.eyebrow}</Eyebrow>
              <Headline
                text={story?.headline ?? F.story.headline}
                tone="dark"
                size="xl"
                className="mt-4"
              />
            </div>
            <div className="space-y-5 text-lg leading-8 text-white/75 lg:pt-6">
              {story?.body ? (
                <PortableBody value={story.body} />
              ) : (
                <>
                  <p>
                    Our journey began in 2007, when Jonathan Dunn began to
                    sense God calling him to lead a church that would reach the
                    people who were currently put off by church.
                  </p>
                  <p>
                    He felt that God was calling him to plant a new church in
                    the Memphis area with a clear vision:{" "}
                    <em className="font-serif text-2xl text-brand-300">
                      refocus our city back to God.
                    </em>{" "}
                    That vision meant RCC would passionately pursue helping
                    each person refocus their life back to God, each family
                    refocus back to God, and even help the church refocus back
                    to God.
                  </p>
                </>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* BELIEFS */}
      <SplitSection
        image={img(beliefs?.image, F.beliefs.image)}
        alt={beliefs?.image?.alt ?? F.beliefs.alt}
        eyebrow={beliefs?.eyebrow ?? F.beliefs.eyebrow}
        headline={beliefs?.headline ?? F.beliefs.headline}
        accent="at the center."
        aspect="aspect-[4/3]"
        actions={
          (beliefs?.cta?.label ?? F.beliefs.ctaLabel) &&
          (beliefs?.cta?.href ?? F.beliefs.ctaHref) ? (
            <Button href={beliefs?.cta?.href ?? F.beliefs.ctaHref} variant="outline">
              {beliefs?.cta?.label ?? F.beliefs.ctaLabel}
            </Button>
          ) : undefined
        }
      >
        {beliefs?.body ? (
          <PortableBody value={beliefs.body} />
        ) : (
          <>
            <p>
              RCC is non-denominational. We teach the Bible plainly each week
              with a focus on practical application — what does it actually
              look like to follow Jesus on Monday morning?
            </p>
            <p>
              Our preaching is honest about life&apos;s complexity, hopeful
              about God&apos;s grace, and rooted in Scripture from start to
              finish.
            </p>
          </>
        )}
      </SplitSection>

      {/* BAPTISM BANNER */}
      <ImageBanner
        image={img(baptism?.image, F.baptism.image)}
        alt={baptism?.image?.alt ?? F.baptism.alt}
        title={baptism?.overlayTitle ?? F.baptism.overlayTitle}
        body={baptism?.overlayBody ?? F.baptism.overlayBody}
      />

      {/* CTA */}
      <CtaBand
        headline={cta?.headline ?? F.cta.headline}
        accent="meet you."
        body={cta?.body ?? F.cta.body}
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

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { familiesPageQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PortableBody } from "@/components/portable-body";
import type { FamiliesPageDoc, SanityImage } from "@/types/sanity";

export const metadata: Metadata = {
  title: "Family Ministry",
  description:
    "Safe, fun, age-appropriate environments at RCC for every kid — Waumba Land, UpStreet, and Students.",
};

const F = {
  hero: {
    eyebrow: "Connect / For your family",
    headline: "Family Ministry",
    intro:
      "Your kid's favorite day of the week. Skilled volunteers, fun environments, and a focused message that helps every age see Jesus more clearly — so you can worship freely while we take great care of them.",
    image: "/brand/pages/families/hero.jpg",
    alt: "Families with kids of all ages outside RCC at Easter Fest",
  },
  intro: {
    eyebrow: "What it's about",
    headline: "Partnering with parents.",
    paragraphs: [
      "From start to finish, we work hard to make your family's time with us a great experience. We use skilled volunteers, age-appropriate spaces, and a focused weekly message so your child leaves understanding one big idea — and asking when they can come back.",
      "Below are the three environments we offer. Each has its own room, its own rhythm, and a team of leaders who actually know your kid's name.",
    ],
  },
  environments: [
    {
      eyebrow: "For your littles",
      name: "Waumba Land",
      ageRange: "Ages 6 weeks – Pre-K",
      schedule: "Sundays during the 10:15 service",
      blurb:
        "Infants through Pre-K cared for in small groups in clean, safe, carefully staffed rooms. Your littles will be loved on while you worship — and they'll come home smiling.",
      coreTruths: [
        "God made me.",
        "God loves me.",
        "Jesus wants to be my friend forever.",
      ],
      image: "/brand/pages/families/waumba.jpg",
      alt: "RCC Waumba Land — moms holding babies on a play mat in the nursery",
      facebookUrl: "https://www.facebook.com/RCCKids/",
    },
    {
      eyebrow: "For elementary kids",
      name: "UpStreet",
      ageRange: "Kindergarten – 5th grade",
      schedule: "Sundays during the 10:15 service · Kids & Students building",
      blurb:
        "An engaging large-group worship and teaching time, then small groups by grade (K-2 and 3-5) with adult leaders who know your kid. Every week lands on one clear truth your kid can take home and live out Monday morning.",
      coreTruths: [
        "Wisdom — make the wise choice.",
        "Faith — trust God no matter what.",
        "Friendship — treat others how you want to be treated.",
      ],
      image: "/brand/pages/families/upstreet.jpg",
      alt: "An RCC UpStreet leader teaching elementary kids during a Sunday service",
      facebookUrl: "https://www.facebook.com/RCCKids/",
    },
    {
      eyebrow: "For middle + high school",
      name: "Students",
      ageRange: "6th – 12th grade",
      schedule: "Transit: Sundays at 10:15 · All Access: Wednesdays at 6:15 PM",
      blurb:
        "Middle schoolers gather Sunday mornings in Transit. High schoolers serve alongside our team in Waumba Land and UpStreet through Student Impact. Both groups come together Wednesdays for All Access — worship, teaching, and small group breakdown.",
      coreTruths: [
        "Created to pursue an authentic relationship with my Creator.",
        "I belong to Jesus, and He defines who I am.",
        "I exist to show God's love to a broken world.",
      ],
      image: "/brand/pages/families/students.jpg",
      alt: "RCC students hanging out at All Access on a Wednesday evening",
      facebookUrl: "https://www.facebook.com/RCCStudents/",
    },
  ],
  checkin: {
    eyebrow: "How it works",
    headline: "Check-In, made simple.",
    intro:
      "Your first time? Arrive about 15 minutes early. A host will walk you to the Waumba Land or UpStreet desk and stay with you through check-in.",
    steps: [
      {
        title: "Get matching tags",
        description:
          "You and your child each get a security tag with the same number. You'll need yours to pick them up.",
      },
      {
        title: "We've got safety covered",
        description:
          "Only you can pick up your child. Our team verifies every tag, every time — no exceptions.",
      },
      {
        title: "Need us? You'll know.",
        description:
          "If we ever need to reach you during the service, your child's number flashes on the screen and a host walks you back to them.",
      },
    ],
    footnote:
      "Two simple systems, one goal: your kid is safe, and you can worship distraction-free.",
  },
  cta: {
    headline: "Bring 'em this Sunday.",
    body: "We can't wait to meet your family. Arrive about 15 minutes early so we have time to walk you through Check-In and answer any questions.",
    primaryLabel: "Plan your visit",
    primaryHref: "/visit/what-to-expect",
    secondaryLabel: "Get directions",
    secondaryHref: "/visit/location",
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

export default async function FamiliesPage() {
  const doc = await safeFetch<FamiliesPageDoc | null>(familiesPageQuery);

  const hero = doc?.hero ?? {};
  const heroEyebrow = hero.eyebrow ?? F.hero.eyebrow;
  const heroHeadline = hero.headline ?? F.hero.headline;
  const heroIntro = hero.intro ?? F.hero.intro;
  const heroImageSrc = imgSrc(hero.image, F.hero.image, 2200);
  const heroImageAlt = hero.image?.alt ?? F.hero.alt;

  const intro = doc?.intro;
  const envs = (doc?.environments?.length ? doc.environments : F.environments).map(
    (e, i) => ({
      ...e,
      fallbackImage: F.environments[i]?.image,
      alt: (e.image as SanityImage | undefined)?.alt ?? F.environments[i]?.alt,
    }),
  );
  const checkin = doc?.checkin;
  const checkinSteps = checkin?.steps?.length ? checkin.steps : F.checkin.steps;
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

      {/* ENVIRONMENTS — alternating side-by-side */}
      <section className="bg-cream-50">
        {envs.map((env, i) => {
          const flip = i % 2 === 1;
          const src = imgSrc(env.image as SanityImage, env.fallbackImage ?? "", 1400);
          return (
            <div
              key={`${env.name}-${i}`}
              className={[
                "py-20 md:py-28",
                i % 2 === 0 ? "bg-cream-50" : "bg-white",
              ].join(" ")}
            >
              <div
                className={[
                  "mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2 md:items-center md:gap-16",
                  flip ? "md:[&>figure]:order-2" : "",
                ].join(" ")}
              >
                <figure className="relative">
                  {src && (
                    <Image
                      src={src}
                      alt={env.alt ?? env.name ?? ""}
                      width={1400}
                      height={1050}
                      className="aspect-[4/3] w-full rounded-2xl object-cover shadow-md"
                    />
                  )}
                </figure>
                <div>
                  {env.eyebrow && (
                    <p className="font-display text-xs uppercase tracking-[0.3em] text-brand-600">
                      {env.eyebrow}
                    </p>
                  )}
                  <h2 className="mt-2 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
                    {env.name}
                  </h2>
                  {env.ageRange && (
                    <p className="mt-2 font-display text-base uppercase tracking-widest text-ink-500 md:text-lg">
                      {env.ageRange}
                    </p>
                  )}
                  {env.schedule && (
                    <p className="mt-1 text-sm text-ink-500 md:text-base">
                      {env.schedule}
                    </p>
                  )}
                  {env.blurb && (
                    <p className="mt-5 text-base leading-7 text-ink-700 md:text-lg md:leading-8">
                      {env.blurb}
                    </p>
                  )}
                  {env.coreTruths && env.coreTruths.length > 0 && (
                    <ul className="mt-6 space-y-2">
                      {env.coreTruths.map((truth, ti) => (
                        <li
                          key={ti}
                          className="flex items-start gap-3 rounded-xl border-l-4 border-brand-500 bg-white px-4 py-3 text-base text-ink-800 shadow-sm"
                        >
                          <span className="font-display text-xs uppercase tracking-[0.3em] text-brand-600">
                            {String(ti + 1).padStart(2, "0")}
                          </span>
                          <span className="leading-7">{truth}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {env.facebookUrl && (
                    <a
                      href={env.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-7 inline-flex items-center font-display text-sm uppercase tracking-widest text-brand-600 transition hover:text-brand-700"
                    >
                      Follow on Facebook →
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* CHECK-IN */}
      <section className="bg-ink-900 py-20 text-white md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <header className="mb-12 max-w-2xl">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-300">
              {checkin?.eyebrow ?? F.checkin.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide md:text-5xl">
              {checkin?.headline ?? F.checkin.headline}
            </h2>
            {(checkin?.intro ?? F.checkin.intro) && (
              <p className="mt-5 text-lg leading-8 text-cream-50/90">
                {checkin?.intro ?? F.checkin.intro}
              </p>
            )}
          </header>
          <ol className="grid gap-5 md:grid-cols-3 md:gap-6">
            {checkinSteps.map((step, i) => (
              <li
                key={`${step.title}-${i}`}
                className="relative overflow-hidden rounded-2xl bg-ink-800/70 p-7 backdrop-blur-sm md:p-8"
              >
                <span
                  aria-hidden="true"
                  className="font-display text-5xl text-brand-400"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-2xl uppercase leading-tight tracking-wide">
                  {step.title}
                </h3>
                {step.description && (
                  <p className="mt-2 text-base leading-7 text-cream-50/85">
                    {step.description}
                  </p>
                )}
              </li>
            ))}
          </ol>
          {(checkin?.footnote ?? F.checkin.footnote) && (
            <p className="mt-10 max-w-3xl text-base leading-7 text-cream-50/75 md:text-lg">
              {checkin?.footnote ?? F.checkin.footnote}
            </p>
          )}
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

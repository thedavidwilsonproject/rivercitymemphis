import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/types/sanity";
import { Button, Container, PhotoHero, Section, SectionHeader } from "@/components/v2/ui";

export const metadata: Metadata = {
  title: "Plan Your Visit",
  description:
    "Visiting River City Church in Bartlett, TN? Sundays at 10:15 AM — what to expect, where to park, who we are, and answers to common questions.",
};

const FALLBACK_ADDRESS = "3871 Kirby Whitten Pkwy, Bartlett, TN 38135";

/** The two practical pages lead; the "get to know us" pages follow. */
const PLAN = [
  {
    href: "/visit/what-to-expect",
    title: "What to Expect",
    blurb:
      "From the parking lot to your seat — here's exactly what your first Sunday at RCC looks like.",
    image: "/brand/pages/what-to-expect/welcomed.jpg",
    alt: "An RCC volunteer welcoming a guest at the door",
  },
  {
    href: "/visit/location",
    title: "Location & Time",
    blurb:
      "3871 Kirby Whitten Parkway, Bartlett. Sundays at 10:15 AM, with Family Ministry for infants through 8th grade.",
    image: "/brand/pages/who-we-are/exterior.jpg",
    alt: "Family walking up to the RCC building",
  },
];

const KNOW = [
  {
    href: "/visit/who-we-are",
    title: "Who We Are",
    blurb:
      "A relaxed, friendly community partnering with God to lead people to refocus their life, home, and the church back to Him.",
    image: "/brand/pages/who-we-are/worship.jpg",
    alt: "Worship during a Sunday gathering at RCC",
  },
  {
    href: "/visit/leadership",
    title: "Leadership",
    blurb: "The people God has called to shepherd, teach, and serve our church family.",
    image: "/brand/pages/next/jonathan.jpg",
    alt: "Jonathan Dunn, lead pastor of RCC, on stage during a service",
  },
  {
    href: "/visit/faqs",
    title: "FAQs",
    blurb: "Questions we thought you might have before your first visit — along with their answers.",
    image: "/brand/pages/what-to-expect/lobby.jpg",
    alt: "The RCC lobby on a Sunday morning",
  },
];

const FACTS = [
  { k: "Time", v: "10:15 AM", n: "Sundays · coffee from 10:00" },
  { k: "Place", v: "Bartlett", n: "3871 Kirby Whitten Pkwy" },
  { k: "Kids", v: "Infants–8th", n: "Family Ministry" },
];

function VisitCard({
  c,
  large = false,
}: {
  c: (typeof PLAN)[number];
  large?: boolean;
}) {
  return (
    <Link href={c.href} className="group block">
      <div
        className={`relative overflow-hidden rounded-2xl bg-cream-200 ${
          large ? "aspect-[16/10]" : "aspect-[4/3]"
        }`}
      >
        <Image
          src={c.image}
          alt={c.alt}
          fill
          sizes={large ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <h3
        className={`mt-6 font-bold tracking-tight text-ink-900 transition group-hover:text-brand-600 ${
          large ? "text-4xl md:text-5xl" : "text-3xl"
        }`}
      >
        {c.title}
      </h3>
      <p className={`mt-3 max-w-xl leading-7 text-ink-600 ${large ? "text-lg" : ""}`}>{c.blurb}</p>
      <span className="mt-4 inline-block py-2 text-sm font-semibold text-ink-900 transition group-hover:translate-x-1 group-hover:text-brand-800">
        Read more →
      </span>
    </Link>
  );
}

export default async function VisitPage() {
  let settings: SiteSettings | null = null;
  try {
    settings = await client.fetch<SiteSettings | null>(siteSettingsQuery);
  } catch {
    /* fall back to defaults */
  }
  const a = settings?.address;
  const address =
    a?.line1 && a.city ? `${a.line1}, ${a.city}, ${a.state ?? "TN"} ${a.zip ?? ""}`.trim() : FALLBACK_ADDRESS;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div>
      <PhotoHero
        image="/brand/pages/who-we-are/entrance.jpg"
        alt="Walking into the RCC auditorium on a Sunday morning"
        headline="Plan your visit."
        accent="visit."
        intro="Sundays at 10:15 AM in Bartlett. Here's everything you need for your first time with us — come as you are."
      >
        <Button href="/visit/what-to-expect" tone="dark">
          What to Expect
        </Button>
        <Button href={directions} tone="dark" variant="outline">
          Get directions
        </Button>
      </PhotoHero>

      {/* Sunday at a glance */}
      <section className="border-b border-ink-900/10 bg-paper">
        <Container className="py-12 md:py-16">
          <dl className="grid gap-3 sm:grid-cols-3">
            {FACTS.map((f) => (
              <div key={f.k} className="rounded-2xl border border-ink-900/15 p-6">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">{f.k}</dt>
                <dd className="mt-3 text-3xl font-bold tracking-tight text-ink-900">{f.v}</dd>
                <dd className="mt-1 text-sm text-ink-500">{f.n}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Section>
        <Container>
          <SectionHeader headline="Your first Sunday." accent="Sunday." />
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
            {PLAN.map((c) => (
              <VisitCard key={c.href} c={c} large />
            ))}
          </div>

          <div className="mt-24 md:mt-32">
            <SectionHeader headline="Get to know us." accent="us." />
            <div className="grid gap-x-6 gap-y-14 md:grid-cols-3">
              {KNOW.map((c) => (
                <VisitCard key={c.href} c={c} />
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}

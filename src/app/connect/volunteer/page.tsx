import type { Metadata } from "next";
import Image from "next/image";
import {
  Button,
  Container,
  CtaBand,
  Headline,
  PhotoHero,
  Section,
} from "@/components/v2/ui";

export const metadata: Metadata = {
  title: "Volunteer",
  description:
    "Serve at River City Church — host team, kids and students, production and tech, parking and setup, and more. Find a spot that fits.",
};

const VOLUNTEER_FORM_URL =
  "https://rivercitymemphis.churchcenter.com/pages/volunteer-form";

const HERO = {
  headline: "Volunteer at RCC",
  intro:
    "RCC runs on people who show up to serve. Whether you've got 30 minutes or a Sunday, there's a spot that fits your gifts and your schedule. Tell us a little about yourself and we'll connect you with a team lead.",
  image: "/brand/pages/volunteer/hero.jpg",
  alt: "An RCC leader laughing outside the building with a host-team lanyard",
};

const INTRO = {
  headline: "Real people. Real impact.",
  paragraphs: [
    "Every Sunday at RCC happens because volunteers show up early and stay late. Host team, kids and students, production, parking, coffee, prayer — it all takes hands.",
    "And serving isn't just about Sundays. It's one of the fastest ways to get connected, meet people in similar life stages, and grow alongside a team. Most of our deepest friendships at RCC started with someone saying, 'I'll take that shift.'",
  ],
};

const AREAS = [
  {
    name: "Host & Welcome",
    blurb:
      "Greeters, coffee bar, info desk, new-guest follow-up. The friendly faces who help first-time visitors feel like they've been here all year.",
    bullets: ["Greeters", "Coffee bar", "Info desk", "Guest follow-up"],
    image: "/brand/pages/volunteer/host.jpg",
    alt: "An RCC host team volunteer giving a thumbs up at the front entrance",
  },
  {
    name: "Kids & Students",
    blurb:
      "Waumba Land, UpStreet, Transit, and All Access. Background checks, real training, and the most fun room in the building every week.",
    bullets: [
      "Waumba Land (nursery–Pre-K)",
      "UpStreet (K–5)",
      "Transit + All Access (middle + high school)",
    ],
    image: "/brand/pages/volunteer/kids.jpg",
    alt: "An UpStreet leader at a table with elementary kids during a Sunday service",
  },
  {
    name: "Production & Tech",
    blurb:
      "Audio, video, lighting, slides, livestream, social. If you've got a curious brain and a steady hand, this team will make room for you.",
    bullets: ["Audio", "Lighting", "Camera / livestream", "Slides + ProPresenter"],
    image: "/brand/pages/volunteer/production.jpg",
    alt: "An RCC volunteer running the sound board during a Sunday service",
  },
  {
    name: "Parking & Setup",
    blurb:
      "First impressions in the parking lot, weekly setup and teardown, building care. Outdoors, hands-on, and surprisingly fun.",
    bullets: [
      "Parking team",
      "Sunday setup + teardown",
      "Building & grounds",
    ],
    image: "/brand/pages/volunteer/parking.jpg",
    alt: "Three RCC parking team volunteers in safety vests outside the building",
  },
];

const FAQS = [
  {
    q: "Do I need to be a member to serve?",
    a: "Nope. Most serve teams have a couple of weeks of shadowing before you're scheduled. Anyone who's been around RCC a few times is welcome to take a next step.",
  },
  {
    q: "What's the time commitment?",
    a: "Most teams ask for one Sunday a month, sometimes two. A few (production, kids) ask for a little more depending on the role.",
  },
  {
    q: "Do you do background checks?",
    a: "Yes — for any role involving kids or students. We use a third-party service and the church covers the cost.",
  },
  {
    q: "What if I don't know where I fit?",
    a: "That's most of us at the start. Fill out the form and the team that fits your interests and schedule will reach out within a few days.",
  },
];

export default function VolunteerPage() {
  return (
    <div>
      <PhotoHero
        image={HERO.image}
        alt={HERO.alt}
        headline={HERO.headline}
        accent="at RCC"
        intro={HERO.intro}
      >
        <Button tone="dark" href={VOLUNTEER_FORM_URL}>
          Sign up to serve
        </Button>
        <Button tone="dark" variant="outline" href="#areas">
          See the teams
        </Button>
      </PhotoHero>

      {/* INTRO */}
      <Section tone="white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
            <div>
              <Headline text={INTRO.headline} accent="Real impact." />
            </div>
            <div className="space-y-5 text-lg leading-8 text-ink-600 md:text-xl md:leading-9">
              {INTRO.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* TEAMS — 2×2 photo cards */}
      <Section tone="light" id="areas">
        <Container>
          <div className="grid gap-x-8 gap-y-20 md:grid-cols-2">
            {AREAS.map((area) => (
              <article key={area.name}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream-200">
                  <Image
                    src={area.image}
                    alt={area.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <h2 className="text-4xl font-bold tracking-tight text-ink-900 md:text-5xl">
                  {area.name}
                </h2>
                <p className="mt-4 text-lg leading-8 text-ink-600">{area.blurb}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {area.bullets.map((b) => (
                    <li
                      key={b}
                      className="rounded-full border border-ink-900/15 px-4 py-1.5 text-sm text-ink-700"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section tone="white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
            <div>
              <Headline text="Good to know." accent="to know." />
            </div>
            <dl className="divide-y divide-ink-900/10 border-y border-ink-900/10">
              {FAQS.map((f, i) => (
                <div key={i} className="py-7">
                  <dt className="text-xl font-bold tracking-tight text-ink-900 md:text-2xl">
                    {f.q}
                  </dt>
                  <dd className="mt-3 text-lg leading-8 text-ink-600">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </Section>

      <CtaBand
        headline="Ready to jump in?"
        accent="jump in?"
        body="Two minutes to fill out the form. A real person on our team will reach out within a few days to walk you through the next step."
        image={HERO.image}
      >
        <Button tone="dark" href={VOLUNTEER_FORM_URL}>
          Sign up to serve
        </Button>
        <Button tone="dark" variant="outline" href="/contact">
          Questions? Contact us
        </Button>
      </CtaBand>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Volunteer",
  description:
    "Serve at River City Church — host team, kids and students, production and tech, parking and setup, and more. Find a spot that fits.",
};

const VOLUNTEER_FORM_URL =
  "https://rivercitymemphis.churchcenter.com/pages/volunteer-form";

const HERO = {
  eyebrow: "Connect / Get plugged in",
  headline: "Volunteer at RCC",
  intro:
    "RCC runs on people who show up to serve. Whether you've got 30 minutes or a Sunday, there's a spot that fits your gifts and your schedule. Tell us a little about yourself and we'll connect you with a team lead.",
  image: "/brand/pages/volunteer/hero.jpg",
  alt: "An RCC leader laughing outside the building with a host-team lanyard",
};

const INTRO = {
  eyebrow: "Why we serve",
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
      {/* HERO */}
      <section className="relative isolate overflow-hidden text-white">
        <Image
          src={HERO.image}
          alt={HERO.alt}
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
            {HERO.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-tight tracking-wide md:text-7xl">
            {HERO.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-cream-50/95 md:text-xl md:leading-9">
            {HERO.intro}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={VOLUNTEER_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
            >
              Sign up to serve
            </a>
            <a
              href="#areas"
              className="rounded-full border border-white/50 bg-white/5 px-6 py-3 font-display text-sm uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/15"
            >
              See the teams
            </a>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
            {INTRO.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
            {INTRO.headline}
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-8 text-ink-700">
            {INTRO.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* AREAS */}
      <section id="areas" className="bg-cream-50">
        {AREAS.map((area, i) => {
          const flip = i % 2 === 1;
          return (
            <div
              key={area.name}
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
                  <Image
                    src={area.image}
                    alt={area.alt}
                    width={1400}
                    height={1050}
                    className="aspect-[4/3] w-full rounded-2xl object-cover shadow-md"
                  />
                </figure>
                <div>
                  <p className="font-display text-xs uppercase tracking-[0.3em] text-brand-600">
                    Team
                  </p>
                  <h2 className="mt-2 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
                    {area.name}
                  </h2>
                  <p className="mt-5 text-base leading-7 text-ink-700 md:text-lg md:leading-8">
                    {area.blurb}
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {area.bullets.map((b) => (
                      <li
                        key={b}
                        className="rounded-full bg-white px-4 py-1.5 font-display text-xs uppercase tracking-[0.25em] text-ink-700 shadow-sm"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-center font-display text-sm uppercase tracking-[0.3em] text-brand-600">
            Common questions
          </p>
          <h2 className="mt-3 text-center font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
            Good to know.
          </h2>
          <dl className="mt-10 space-y-6">
            {FAQS.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-cream-200 bg-cream-50 p-6 md:p-7"
              >
                <dt className="font-display text-lg uppercase tracking-wide text-ink-800">
                  {f.q}
                </dt>
                <dd className="mt-2 text-base leading-7 text-ink-700 md:text-lg md:leading-8">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-20 text-white md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-4xl uppercase tracking-wide md:text-5xl">
            Ready to jump in?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-brand-50/95">
            Two minutes to fill out the form. A real person on our team will
            reach out within a few days to walk you through the next step.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={VOLUNTEER_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-7 py-3.5 font-display text-sm uppercase tracking-widest text-brand-700 transition hover:bg-cream-50"
            >
              Sign up to serve
            </a>
            <Link
              href="/contact"
              className="rounded-full border border-white/40 bg-white/5 px-6 py-3 font-display text-sm uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/15"
            >
              Questions? Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

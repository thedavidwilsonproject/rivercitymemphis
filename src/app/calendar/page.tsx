import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  listOpenSignups,
  formatSignupSchedule,
  type PcoSignup,
} from "@/lib/pco";
import { getPublishedIdSet } from "@/lib/published-events";

export const metadata: Metadata = {
  title: "Calendar",
  description:
    "Dated events at River City Church — services, kids' camps, conferences, baby dedications, baptisms, and more.",
};

export const revalidate = 300;

const HERO = {
  eyebrow: "Plan ahead",
  headline: "Calendar",
  intro:
    "Every dated event coming up at RCC — grouped by month, so you can plan what to put on the family calendar.",
  image: "/brand/pages/events/hero.jpg",
  alt: "Jonathan Dunn speaking on stage at an RCC Vision Night event",
};

function monthKey(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(d);
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

function CalendarRow({ s }: { s: PcoSignup }) {
  // Defensive — only rendered for dated signups, but TS doesn't know that.
  if (!s.startsAt) return null;
  return (
    <li className="group">
      <Link
        href={`/events/${s.id}`}
        className="flex flex-col gap-4 rounded-2xl border border-cream-200 bg-white p-6 shadow-sm transition hover:border-brand-500 hover:shadow-md md:flex-row md:items-center md:gap-7 md:p-7"
      >
        {/* Date block */}
        <div className="flex shrink-0 items-center gap-4 md:flex-col md:items-start md:gap-1 md:border-r md:border-cream-200 md:pr-7">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-brand-600">
            {dayLabel(s.startsAt)}
          </p>
          <p className="text-sm text-ink-500">
            {new Intl.DateTimeFormat("en-US", {
              hour: "numeric",
              minute: "2-digit",
            }).format(new Date(s.startsAt))}
          </p>
        </div>

        {/* Image thumb */}
        {s.logoUrl && (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-100 md:h-20 md:w-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.logoUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Info */}
        <div className="flex-1">
          <h3 className="font-display text-xl uppercase leading-tight tracking-wide text-ink-800 transition group-hover:text-brand-700 md:text-2xl">
            {s.name}
          </h3>
          <p className="mt-1 text-sm text-ink-500">{formatSignupSchedule(s)}</p>
          {s.location && (
            <p className="mt-1 text-sm text-ink-500">{s.location}</p>
          )}
        </div>

        <span
          aria-hidden="true"
          className="hidden font-display text-2xl text-brand-500 transition group-hover:translate-x-1 md:block"
        >
          →
        </span>
      </Link>
    </li>
  );
}

export default async function CalendarPage() {
  let events: PcoSignup[] = [];
  let loadError = false;
  try {
    const [allEvents, published] = await Promise.all([
      listOpenSignups(50),
      getPublishedIdSet(),
    ]);
    // Only show events that are: (a) toggled on in Sanity, AND
    // (b) have an actual start date (i.e. not "ongoing" sign-ups)
    events = allEvents
      .filter((e) => published.has(e.id) && Boolean(e.startsAt))
      .sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? ""));
  } catch (e) {
    console.error("Failed to load calendar events:", e);
    loadError = true;
  }

  // Group by month
  const groups = new Map<string, PcoSignup[]>();
  for (const e of events) {
    if (!e.startsAt) continue;
    const k = monthKey(e.startsAt);
    const list = groups.get(k) ?? [];
    list.push(e);
    groups.set(k, list);
  }

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
        </div>
      </section>

      {/* EVENTS BY MONTH */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          {groups.size > 0 ? (
            <div className="space-y-16 md:space-y-20">
              {[...groups.entries()].map(([month, items]) => (
                <div key={month}>
                  <h2 className="mb-8 font-display text-3xl uppercase tracking-wide text-ink-800 md:text-4xl">
                    {month}
                  </h2>
                  <ul className="space-y-4">
                    {items.map((s) => (
                      <CalendarRow key={s.id} s={s} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
                Quiet on the calendar
              </p>
              <h2 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
                {loadError
                  ? "Couldn't load the calendar right now."
                  : "Nothing dated coming up."}
              </h2>
              <p className="mt-5 text-lg leading-8 text-ink-700">
                {loadError
                  ? "We hit a snag pulling events. Check back in a few minutes."
                  : "There aren't any scheduled events open for registration right now. Browse all events for ongoing sign-ups."}
              </p>
              <div className="mt-8">
                <Link
                  href="/events"
                  className="rounded-full bg-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
                >
                  All events
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream-50 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl uppercase tracking-wide text-ink-800 md:text-4xl">
            Looking for something specific?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-ink-700 md:text-lg md:leading-8">
            Browse every event open for sign-up, including ongoing ones like
            Baptism and Baby Dedication.
          </p>
          <div className="mt-7">
            <Link
              href="/events"
              className="rounded-full bg-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
            >
              See all events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

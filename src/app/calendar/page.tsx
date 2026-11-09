import type { Metadata } from "next";
import Link from "next/link";
import {
  listOpenSignups,
  formatSignupSchedule,
  type PcoSignup,
} from "@/lib/pco";
import { getPublishedIdSet, isVisibleSignup } from "@/lib/published-events";
import {
  Button,
  Container,
  CtaBand,
  Eyebrow,
  Headline,
  Lede,
  PhotoHero,
  Section,
} from "@/components/v2/ui";

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
    <li className="group border-b border-ink-900/15">
      <Link
        href={`/events/${s.id}`}
        className="flex flex-col gap-5 py-7 transition md:flex-row md:items-center md:gap-10"
      >
        {/* Date block */}
        <div className="flex shrink-0 items-baseline gap-3 md:w-44 md:flex-col md:gap-1">
          <p className="font-serif text-3xl italic leading-none text-brand-600">
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
          <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-cream-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.logoUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
              loading="lazy"
            />
          </div>
        )}

        {/* Info */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold leading-tight tracking-tight text-ink-900 transition group-hover:text-brand-600 md:text-3xl">
            {s.name}
          </h3>
          <p className="mt-1 text-sm text-ink-500">{formatSignupSchedule(s)}</p>
          {s.location && (
            <p className="mt-1 text-sm text-ink-500">{s.location}</p>
          )}
        </div>

        <span
          aria-hidden="true"
          className="hidden text-2xl text-ink-900 transition group-hover:translate-x-1 group-hover:text-brand-600 md:block"
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
      .filter((e) => isVisibleSignup(published, e.id) && Boolean(e.startsAt))
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
      <PhotoHero
        image={HERO.image}
        alt={HERO.alt}
        eyebrow={HERO.eyebrow}
        headline={HERO.headline}
        intro={HERO.intro}
        short
      />

      {/* EVENTS BY MONTH */}
      <Section>
        <Container>
          {groups.size > 0 ? (
            <div className="space-y-20 md:space-y-28">
              {[...groups.entries()].map(([month, items]) => (
                <div
                  key={month}
                  className="grid gap-6 lg:grid-cols-[18rem_1fr] lg:gap-16"
                >
                  <h2 className="text-4xl font-bold leading-[0.95] tracking-tight md:text-5xl lg:sticky lg:top-28 lg:self-start">
                    <MonthTitle month={month} />
                  </h2>
                  <ul className="border-t border-ink-900/15">
                    {items.map((s) => (
                      <CalendarRow key={s.id} s={s} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl">
              <Eyebrow>Quiet on the calendar</Eyebrow>
              <Headline
                className="mt-4"
                text={
                  loadError
                    ? "Couldn't load the calendar right now."
                    : "Nothing dated coming up."
                }
              />
              <Lede className="mt-6 max-w-2xl">
                {loadError
                  ? "We hit a snag pulling events. Check back in a few minutes."
                  : "There aren't any scheduled events open for registration right now. Browse all events for ongoing sign-ups."}
              </Lede>
              <div className="mt-10">
                <Button href="/events">All events</Button>
              </div>
            </div>
          )}
        </Container>
      </Section>

      {/* CTA */}
      <CtaBand
        headline="Looking for something specific?"
        accent="specific?"
        body="Browse every event open for sign-up, including ongoing ones like Baptism and Baby Dedication."
      >
        <Button tone="dark" href="/events">
          See all events
        </Button>
      </CtaBand>
    </div>
  );
}

/** "November 2026" → bold month + italic serif year. */
function MonthTitle({ month }: { month: string }) {
  const [name, year] = month.split(" ");
  return (
    <>
      {name}
      {year && (
        <>
          {" "}
          <em className="text-brand-600">{year}</em>
        </>
      )}
    </>
  );
}

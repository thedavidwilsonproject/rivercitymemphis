import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CHURCH_CENTER_HOST } from "@/components/church-center";
import {
  listOpenSignups,
  formatSignupDate,
  type PcoSignup,
} from "@/lib/pco";
import { getPublishedOrderMap } from "@/lib/published-events";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming events at River City Church — pulled live from Church Center. Camps, classes, baptism, baby dedication, and more.",
};

// Revalidate this page every 5 minutes
export const revalidate = 300;

const cc = (path: string) =>
  `https://${CHURCH_CENTER_HOST}${path.startsWith("/") ? "" : "/"}${path}`;

const HERO = {
  eyebrow: "What's happening",
  headline: "Events at RCC",
  intro:
    "From camps to classes to baby dedications — everything open for registration, live from our Church Center. Tap an event to sign up.",
  image: "/brand/pages/events/hero.jpg",
  alt: "Jonathan Dunn speaking on stage at an RCC Vision Night event",
};

const EMPTY = {
  eyebrow: "Nothing on the books",
  headline: "No events open right now.",
  body: "We don't have any registrations open at the moment. Check back soon, or browse the full church calendar for what's coming up.",
};

function truncate(s: string | undefined, n: number): string {
  if (!s) return "";
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length > n ? clean.slice(0, n - 1).trimEnd() + "…" : clean;
}

function EventCard({ s }: { s: PcoSignup }) {
  const dateLabel = formatSignupDate(s);
  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={`/events/${s.id}`}
        className="flex flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {s.logoUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-cream-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.logoUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="grid aspect-[16/9] w-full place-items-center bg-gradient-to-br from-brand-500/15 to-brand-700/20">
            <span className="font-display text-4xl uppercase tracking-widest text-brand-700/50">
              RCC
            </span>
          </div>
        )}
        <div className="flex flex-1 flex-col p-6 md:p-7">
          <p className="font-display text-xs uppercase tracking-[0.25em] text-brand-600">
            {dateLabel}
          </p>
          <h3 className="mt-2 font-display text-2xl uppercase leading-tight tracking-wide text-ink-800 transition group-hover:text-brand-700">
            {s.name}
          </h3>
          {s.location && (
            <p className="mt-1 text-sm text-ink-500">{s.location}</p>
          )}
          {s.description && (
            <p className="mt-3 flex-1 text-base leading-7 text-ink-700">
              {truncate(s.description, 200)}
            </p>
          )}
          <span className="mt-6 inline-flex items-center font-display text-sm uppercase tracking-widest text-brand-600 transition group-hover:text-brand-700">
            View details →
          </span>
        </div>
      </Link>
    </li>
  );
}

export default async function EventsPage() {
  let events: PcoSignup[] = [];
  let loadError = false;
  try {
    const [allEvents, orderMap] = await Promise.all([
      listOpenSignups(50),
      getPublishedOrderMap(),
    ]);
    // Keep only events the editor has flipped to "Show on website",
    // then sort: manual displayOrder first (ascending), then the
    // PCO library's date-based default order.
    events = allEvents
      .filter((e) => orderMap.has(e.id))
      .sort((a, b) => {
        const oa = orderMap.get(a.id);
        const ob = orderMap.get(b.id);
        if (oa !== undefined && ob !== undefined) return oa - ob;
        if (oa !== undefined) return -1;
        if (ob !== undefined) return 1;
        return 0; // preserve listOpenSignups' default sort
      });
  } catch (e) {
    console.error("Failed to load events:", e);
    loadError = true;
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
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={cc("/calendar")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/50 bg-white/5 px-6 py-3 font-display text-sm uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/15"
            >
              Full calendar
            </a>
          </div>
        </div>
      </section>

      {/* EVENTS GRID */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          {events.length > 0 ? (
            <>
              <header className="mx-auto mb-12 max-w-2xl text-center">
                <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
                  Open for registration
                </p>
                <h2 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
                  {events.length === 1
                    ? "1 event open now."
                    : `${events.length} events open now.`}
                </h2>
                <p className="mt-5 text-lg leading-8 text-ink-700">
                  Tap an event to register. Sign-ups happen on Church Center —
                  you'll come right back when you're done.
                </p>
              </header>
              <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((s) => (
                  <EventCard key={s.id} s={s} />
                ))}
              </ul>
            </>
          ) : (
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
                {EMPTY.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
                {loadError
                  ? "Couldn't load events right now."
                  : EMPTY.headline}
              </h2>
              <p className="mt-5 text-lg leading-8 text-ink-700">
                {loadError
                  ? "We hit a snag pulling events from Church Center. Check back in a few minutes, or open the full calendar below."
                  : EMPTY.body}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a
                  href={cc("/calendar")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
                >
                  Open the calendar
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-20 text-white md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-4xl uppercase tracking-wide md:text-5xl">
            Want to host something?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-brand-50/95">
            Group launch, women's brunch, men's breakfast, baby dedication — if
            you're planning it, we want to help promote it. Let us know.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:info@rivercitymemphis.org?subject=Event submission"
              className="rounded-full bg-white px-6 py-3 font-display text-sm uppercase tracking-widest text-brand-700 transition hover:bg-cream-50"
            >
              Email the team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

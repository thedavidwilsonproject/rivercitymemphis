import type { Metadata } from "next";
import Link from "next/link";
import { CHURCH_CENTER_HOST } from "@/components/church-center";
import {
  listOpenSignups,
  formatSignupDate,
  type PcoSignup,
} from "@/lib/pco";
import { getPublishedOrderMap } from "@/lib/published-events";
import {
  Button,
  Container,
  CtaBand,
  Eyebrow,
  Headline,
  Lede,
  PhotoHero,
  Section,
  SectionHeader,
} from "@/components/v2/ui";

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
    <li className="group flex flex-col">
      <Link
        href={`/events/${s.id}`}
        className="flex flex-1 flex-col rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {s.logoUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-cream-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.logoUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="grid aspect-[16/9] w-full place-items-center rounded-2xl bg-river-900">
            <span className="font-serif text-5xl italic text-brand-300">
              RCC
            </span>
          </div>
        )}
        <div className="flex flex-1 flex-col pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">
            {dateLabel}
          </p>
          <h3 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-ink-900 transition group-hover:text-brand-600">
            {s.name}
          </h3>
          {s.location && (
            <p className="mt-1 text-sm text-ink-500">{s.location}</p>
          )}
          {s.description && (
            <p className="mt-3 flex-1 leading-7 text-ink-600">
              {truncate(s.description, 200)}
            </p>
          )}
          <span className="mt-5 inline-block text-sm font-semibold text-ink-900 transition group-hover:translate-x-1 group-hover:text-brand-600">
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
      <PhotoHero
        image={HERO.image}
        alt={HERO.alt}
        eyebrow={HERO.eyebrow}
        headline={HERO.headline}
        accent="at RCC"
        intro={HERO.intro}
      >
        <Button href={cc("/calendar")} tone="dark" variant="outline">
          Full calendar
        </Button>
      </PhotoHero>

      {/* EVENTS GRID */}
      <Section>
        <Container>
          {events.length > 0 ? (
            <>
              <SectionHeader
                eyebrow="Open for registration"
                headline={
                  events.length === 1
                    ? "1 event open now."
                    : `${events.length} events open now.`
                }
                accent="open now."
                intro="Tap an event to register. Sign-ups happen on Church Center — you'll come right back when you're done."
              />
              <ul className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                {events.map((s) => (
                  <EventCard key={s.id} s={s} />
                ))}
              </ul>
            </>
          ) : (
            <div className="max-w-3xl">
              <Eyebrow>{EMPTY.eyebrow}</Eyebrow>
              <Headline
                className="mt-4"
                text={
                  loadError
                    ? "Couldn't load events right now."
                    : EMPTY.headline
                }
              />
              <Lede className="mt-6 max-w-2xl">
                {loadError
                  ? "We hit a snag pulling events from Church Center. Check back in a few minutes, or open the full calendar below."
                  : EMPTY.body}
              </Lede>
              <div className="mt-10">
                <Button href={cc("/calendar")}>Open the calendar</Button>
              </div>
            </div>
          )}
        </Container>
      </Section>

      {/* CTA */}
      <CtaBand
        headline="Want to host something?"
        accent="something?"
        body="Group launch, women's brunch, men's breakfast, baby dedication — if you're planning it, we want to help promote it. Let us know."
      >
        <Button
          tone="dark"
          href="mailto:info@rivercitymemphis.org?subject=Event submission"
        >
          Email the team
        </Button>
      </CtaBand>
    </div>
  );
}

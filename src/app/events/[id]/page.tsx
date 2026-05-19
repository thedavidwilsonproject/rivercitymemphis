import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSignup, formatSignupSchedule } from "@/lib/pco";
import { getPublishedIdSet } from "@/lib/published-events";

export const revalidate = 300;

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [s, published] = await Promise.all([
    getSignup(id),
    getPublishedIdSet(),
  ]);
  if (!s || !published.has(id)) return { title: "Event" };
  return {
    title: s.name,
    description:
      s.description?.slice(0, 160) ||
      `Register for ${s.name} at River City Church.`,
  };
}

export default async function EventDetailPage({ params }: Params) {
  const { id } = await params;
  const [s, published] = await Promise.all([
    getSignup(id),
    getPublishedIdSet(),
  ]);
  // Hide events that aren't open OR haven't been flipped on by an editor
  if (!s || !s.open || !published.has(id)) notFound();

  const schedule = formatSignupSchedule(s);
  const isOngoing = !s.startsAt;
  const mapsUrl = s.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.location)}`
    : undefined;

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-ink-900 text-white">
        {s.logoUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.logoUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
            />
            <div
              className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-900/85 via-ink-900/70 to-ink-900/85"
              aria-hidden="true"
            />
          </>
        )}
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-16 md:py-28">
          <div>
            <Link
              href="/events"
              className="inline-flex items-center font-display text-xs uppercase tracking-[0.3em] text-brand-300 transition hover:text-white"
            >
              ← All events
            </Link>
            <h1 className="mt-5 font-display text-5xl uppercase leading-tight tracking-wide md:text-6xl">
              {s.name}
            </h1>
            <p className="mt-4 font-display text-base uppercase tracking-[0.25em] text-brand-300 md:text-lg">
              {schedule}
            </p>
            {s.location && (
              <p className="mt-2 text-base text-cream-50/90 md:text-lg">
                {s.location}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={s.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-brand-500 px-7 py-3.5 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
              >
                Register for {s.name}
              </a>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/50 bg-white/5 px-6 py-3 font-display text-sm uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/15"
                >
                  Map it
                </a>
              )}
            </div>
            <p className="mt-5 text-sm text-cream-50/70">
              Registration happens on Church Center — it'll open in a new tab.
            </p>
          </div>
          {s.logoUrl && (
            <figure className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.logoUrl}
                alt={s.name}
                className="aspect-square w-full rounded-2xl object-cover shadow-2xl"
              />
            </figure>
          )}
        </div>
      </section>

      {/* DESCRIPTION + AT-A-GLANCE */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1fr_320px] md:gap-16">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
              About this event
            </p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-tight tracking-wide text-ink-800 md:text-5xl">
              What to expect.
            </h2>
            <div className="mt-6 space-y-5 text-base leading-7 text-ink-700 md:text-lg md:leading-8">
              {s.descriptionParagraphs && s.descriptionParagraphs.length > 0 ? (
                s.descriptionParagraphs.map((p, i) => <p key={i}>{p}</p>)
              ) : s.description ? (
                <p>{s.description}</p>
              ) : (
                <p className="text-ink-500">
                  No description provided. Tap the register button to see full
                  details on Church Center.
                </p>
              )}
            </div>
          </div>
          <aside>
            <div className="sticky top-24 rounded-2xl border border-cream-200 bg-cream-50 p-6 md:p-7">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-brand-600">
                At a glance
              </p>
              <dl className="mt-5 space-y-5 text-sm">
                <div>
                  <dt className="font-display uppercase tracking-widest text-ink-500">
                    When
                  </dt>
                  <dd className="mt-1 text-base text-ink-800">{schedule}</dd>
                  {isOngoing && (
                    <dd className="mt-1 text-xs text-ink-500">
                      Sign up anytime — we'll get back to you.
                    </dd>
                  )}
                </div>
                {s.location && (
                  <div>
                    <dt className="font-display uppercase tracking-widest text-ink-500">
                      Where
                    </dt>
                    <dd className="mt-1 whitespace-pre-line text-base text-ink-800">
                      {s.location}
                    </dd>
                  </div>
                )}
                {s.closeAt && (
                  <div>
                    <dt className="font-display uppercase tracking-widest text-ink-500">
                      Registration closes
                    </dt>
                    <dd className="mt-1 text-base text-ink-800">
                      {new Intl.DateTimeFormat("en-US", {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(s.closeAt))}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="font-display uppercase tracking-widest text-ink-500">
                    Host
                  </dt>
                  <dd className="mt-1 text-base text-ink-800">
                    River City Church
                  </dd>
                </div>
              </dl>
              <a
                href={s.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
              >
                Register →
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream-50 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl uppercase tracking-wide text-ink-800 md:text-4xl">
            Questions about {s.name}?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-ink-700 md:text-lg md:leading-8">
            Reach out and we'll get back to you. Or browse other events that
            might fit.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:info@rivercitymemphis.org?subject=${encodeURIComponent(`Question about ${s.name}`)}`}
              className="rounded-full bg-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
            >
              Email us
            </a>
            <Link
              href="/events"
              className="rounded-full border border-cream-300 bg-white px-6 py-3 font-display text-sm uppercase tracking-widest text-ink-700 transition hover:border-brand-500 hover:text-brand-600"
            >
              All events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

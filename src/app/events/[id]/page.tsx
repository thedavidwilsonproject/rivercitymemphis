import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSignup, formatSignupSchedule } from "@/lib/pco";
import { getSignupVisibility } from "@/lib/published-events";
import { ChurchCenterModalLink, ChurchCenterScript } from "@/components/church-center";
import {
  Button,
  Container,
  CtaBand,
  Eyebrow,
  Headline,
  Section,
} from "@/components/v2/ui";

export const revalidate = 300;

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [s, isVisible] = await Promise.all([getSignup(id), getSignupVisibility()]);
  if (!s || !isVisible(id)) return { title: "Event" };
  return {
    title: s.name,
    description:
      s.description?.slice(0, 160) ||
      `Register for ${s.name} at River City Church.`,
  };
}

export default async function EventDetailPage({ params }: Params) {
  const { id } = await params;
  const [s, isVisible] = await Promise.all([getSignup(id), getSignupVisibility()]);
  // Hide events that aren't open OR haven't been flipped on by an editor
  if (!s || !s.open || !isVisible(id)) notFound();

  const schedule = formatSignupSchedule(s);
  const isOngoing = !s.startsAt;
  const mapsUrl = s.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.location)}`
    : undefined;

  const closesLabel = s.closeAt
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(s.closeAt))
    : null;

  return (
    <div>
      <ChurchCenterScript />
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-river-950 text-white">
        {s.logoUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.logoUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
            />
            <div
              className="absolute inset-0 -z-10 bg-gradient-to-t from-river-950 via-river-950/80 to-river-950/60"
              aria-hidden="true"
            />
          </>
        )}
        <Container className="grid gap-12 pb-16 pt-16 md:grid-cols-[1.25fr_1fr] md:items-end md:gap-16 md:pb-24 md:pt-24">
          <div>
            <Link
              href="/events"
              className="inline-block text-sm font-semibold text-white/70 transition hover:text-white"
            >
              ← All events
            </Link>
            <p className="rise mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">
              {schedule}
            </p>
            <h1 className="rise rise-2 mt-4 text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
              {s.name}
            </h1>
            {s.location && (
              <p className="mt-5 text-lg text-white/75">{s.location}</p>
            )}
            <div className="mt-10 flex flex-wrap gap-3">
              <ChurchCenterModalLink
                href={s.registrationUrl}
                className="inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink-900 transition hover:bg-brand-100"
              >
                Register for {s.name}
              </ChurchCenterModalLink>
              {mapsUrl && (
                <Button href={mapsUrl} tone="dark" variant="outline">
                  Map it
                </Button>
              )}
            </div>
            <p className="mt-5 text-sm text-white/55">
              Registration happens on Church Center — it&apos;ll open in a new
              tab.
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
        </Container>
      </section>

      {/* DESCRIPTION + AT-A-GLANCE */}
      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_360px] lg:gap-24">
            <div>
              <Eyebrow>About this event</Eyebrow>
              <Headline text="What to expect." accent="expect." className="mt-4" />
              <div className="mt-8 max-w-2xl space-y-5 text-lg leading-8 text-ink-600">
                {s.descriptionParagraphs && s.descriptionParagraphs.length > 0 ? (
                  s.descriptionParagraphs.map((p, i) => <p key={i}>{p}</p>)
                ) : s.description ? (
                  <p>{s.description}</p>
                ) : (
                  <p className="text-ink-500">
                    No description provided. Tap the register button to see
                    full details on Church Center.
                  </p>
                )}
              </div>
            </div>
            <aside>
              <div className="sticky top-28 rounded-2xl border border-ink-900/15 p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">
                  At a glance
                </p>
                <dl className="mt-6 divide-y divide-ink-900/10">
                  <GlanceRow label="When">
                    {schedule}
                    {isOngoing && (
                      <span className="mt-1 block text-sm text-ink-500">
                        Sign up anytime — we&apos;ll get back to you.
                      </span>
                    )}
                  </GlanceRow>
                  {s.location && (
                    <GlanceRow label="Where">
                      <span className="whitespace-pre-line">{s.location}</span>
                    </GlanceRow>
                  )}
                  {closesLabel && (
                    <GlanceRow label="Registration closes">
                      {closesLabel}
                    </GlanceRow>
                  )}
                  <GlanceRow label="Host">River City Church</GlanceRow>
                </dl>
                <ChurchCenterModalLink
                  href={s.registrationUrl}
                  className="mt-7 flex w-full justify-center rounded-full bg-ink-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Register →
                </ChurchCenterModalLink>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <CtaBand
        headline={`Questions about ${s.name}?`}
        accent={`${s.name}?`}
        body="Reach out and we'll get back to you. Or browse other events that might fit."
      >
        <Button
          tone="dark"
          href={`mailto:info@rivercitymemphis.org?subject=${encodeURIComponent(`Question about ${s.name}`)}`}
        >
          Email us
        </Button>
        <Button tone="dark" variant="outline" href="/events">
          All events
        </Button>
      </CtaBand>
    </div>
  );
}

function GlanceRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4 first:pt-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
        {label}
      </dt>
      <dd className="mt-1.5 text-base text-ink-900">{children}</dd>
    </div>
  );
}

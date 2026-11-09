/**
 * Planning Center (Church Center Registrations) tie-ins for design v2.
 * Server components — PCO credentials never reach the browser. Each block
 * renders nothing if PCO is unreachable or has nothing to show.
 */
import Link from "next/link";
import { listOpenSignups, formatSignupDate, type PcoSignup } from "@/lib/pco";
import { getPublishedIdSet, isVisibleSignup } from "@/lib/published-events";
import { ChurchCenterModalLink, ChurchCenterScript } from "@/components/church-center";
import { Container, SectionHeader } from "@/components/v2/ui";

async function visibleSignups(): Promise<PcoSignup[]> {
  try {
    const [all, published] = await Promise.all([listOpenSignups(50), getPublishedIdSet()]);
    return all.filter((s) => isVisibleSignup(published, s.id));
  } catch (e) {
    console.error("PCO signups unavailable:", e);
    return [];
  }
}

function Art({ s, className = "" }: { s: PcoSignup; className?: string }) {
  return s.logoUrl ? (
    <div className={`relative overflow-hidden rounded-2xl bg-cream-200 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={s.logoUrl}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
      />
    </div>
  ) : (
    <div className={`grid place-items-center rounded-2xl bg-river-900 ${className}`}>
      <span className="font-serif text-4xl italic text-brand-300">RCC</span>
    </div>
  );
}

/**
 * Homepage strip: the next few open registrations, dated events first.
 */
export async function UpcomingEvents({ limit = 3 }: { limit?: number }) {
  const events = (await visibleSignups()).slice(0, limit);
  if (events.length === 0) return null;
  return (
    <section className="border-t border-ink-900/10 bg-paper">
      <Container className="py-20 md:py-28">
        <SectionHeader
          eyebrow="Coming up"
          headline="What's happening."
          accent="happening."
          intro="Open for sign-up now, live from Church Center."
          action={
            <Link
              href="/events"
              className="inline-flex rounded-full border border-ink-900/25 px-6 py-3 text-sm font-semibold text-ink-900 transition hover:border-ink-900 hover:bg-ink-900/5"
            >
              All events →
            </Link>
          }
        />
        <ul className="grid gap-x-6 gap-y-12 md:grid-cols-3">
          {events.map((s) => (
            <li key={s.id}>
              <Link href={`/events/${s.id}`} className="group block">
                <Art s={s} className="aspect-[16/9]" />
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">
                  {formatSignupDate(s)}
                </p>
                <h3 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-ink-900 transition group-hover:text-brand-600">
                  {s.name}
                </h3>
                <span className="mt-3 inline-block text-sm font-semibold text-ink-900 transition group-hover:translate-x-1 group-hover:text-brand-600">
                  Details &amp; sign-up →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/**
 * Contextual sign-up card for a specific registration, matched by name
 * (e.g. /baptism/i on the Next page). Renders nothing if no open match.
 * The Sign-up button opens Church Center's modal so visitors stay on-site.
 */
export async function SignupCallout({
  match,
  eyebrow,
  body,
  tone = "light",
}: {
  match: RegExp;
  eyebrow: string;
  /** Fallback copy when the PCO description is empty. */
  body?: string;
  tone?: "light" | "dark";
}) {
  const s = (await visibleSignups()).find((x) => match.test(x.name));
  if (!s || !s.registrationUrl) return null;
  const dark = tone === "dark";
  const desc = s.descriptionParagraphs?.[0] ?? body;
  return (
    <section className={dark ? "bg-river-950 text-white" : "bg-paper text-ink-900"}>
      <ChurchCenterScript />
      <Container className="py-16 md:py-24">
        <div
          className={`group grid gap-8 overflow-hidden rounded-3xl p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:items-center md:gap-12 md:p-10 ${
            dark ? "bg-river-900" : "border border-ink-900/10 bg-white/70"
          }`}
        >
          <Art s={s} className="aspect-[16/9]" />
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.22em] ${
                dark ? "text-brand-300" : "text-brand-600"
              }`}
            >
              {eyebrow}
            </p>
            <h2 className="mt-3 text-4xl font-bold leading-[1.02] tracking-tight md:text-5xl">
              {s.name}
            </h2>
            <p className={`mt-3 text-sm font-semibold ${dark ? "text-white/60" : "text-ink-500"}`}>
              {s.startsAt ? formatSignupDate(s) : "Sign-ups open year-round"}
            </p>
            {desc && (
              <p className={`mt-4 max-w-xl leading-7 ${dark ? "text-white/75" : "text-ink-600"}`}>
                {desc.length > 260 ? desc.slice(0, 259).trimEnd() + "…" : desc}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <ChurchCenterModalLink
                href={s.registrationUrl}
                className={`inline-flex rounded-full px-7 py-3.5 text-sm font-semibold transition ${
                  dark ? "bg-white text-ink-900 hover:bg-brand-100" : "bg-ink-900 text-white hover:bg-brand-600"
                }`}
              >
                Sign up
              </ChurchCenterModalLink>
              <Link
                href={`/events/${s.id}`}
                className={`text-sm font-semibold underline decoration-2 underline-offset-[6px] ${
                  dark ? "decoration-brand-300" : "decoration-brand-500"
                }`}
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

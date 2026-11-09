import type { Metadata } from "next";
import Link from "next/link";
import { listOpenSignups, type PcoSignup } from "@/lib/pco";
import { getSignupVisibility } from "@/lib/published-events";
import { listChurchCenterCalendar, ccUrl } from "@/lib/church-center";
import { ChurchCenterModalLink, ChurchCenterScript } from "@/components/church-center";
import { Button, Container, CtaBand, PhotoHero } from "@/components/v2/ui";

export const metadata: Metadata = {
  title: "Calendar",
  description:
    "The River City Church calendar — Sunday gatherings, events, and sign-ups, month by month.",
};

export const revalidate = 300;

const TZ = "America/Chicago";
/** How far ahead visitors can page. */
const MONTHS_AHEAD = 11;

const HERO = {
  eyebrow: "Plan ahead",
  headline: "Calendar",
  intro:
    "Sundays, events, and sign-ups at a glance — live from our Church Center. Tap anything to see details or register.",
  image: "/brand/pages/events/hero.jpg",
  alt: "Jonathan Dunn speaking on stage at an RCC Vision Night event",
};

type Kind = "gathering" | "signup" | "calendar";

type Item = {
  key: string;
  /** YYYY-MM-DD in Central time. */
  date: string;
  title: string;
  time?: string;
  kind: Kind;
  href: string;
  /** Opens in the Church Center modal. */
  cc?: boolean;
  /** Second+ day of a multi-day event. */
  continued?: boolean;
};

const KIND: Record<Kind, { label: string; chip: string; dot: string }> = {
  gathering: {
    label: "Sunday gathering",
    chip: "bg-river-900 text-white hover:bg-river-800",
    dot: "bg-river-900",
  },
  signup: {
    label: "Event · sign-up open",
    chip: "bg-brand-100 text-river-950 shadow-[inset_3px_0_0_var(--color-brand-500)] hover:bg-brand-200",
    dot: "bg-brand-500",
  },
  calendar: {
    label: "On the church calendar",
    chip: "bg-white text-ink-900 ring-1 ring-inset ring-ink-900/15 hover:ring-ink-900/40",
    dot: "bg-ink-300",
  },
};

// ── Date helpers (all bucketing in Central time) ───────────────────────

const ymd = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

const timeLabel = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" })
    .format(new Date(iso))
    .replace(":00", "");

function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function monthOffset(y: number, m: number, delta: number): { y: number; m: number } {
  const t = y * 12 + (m - 1) + delta;
  return { y: Math.floor(t / 12), m: (t % 12) + 1 };
}

const pad = (n: number) => String(n).padStart(2, "0");
const monthParam = (y: number, m: number) => `${y}-${pad(m)}`;

// ── Data → items ───────────────────────────────────────────────────────

function signupItems(s: PcoSignup, first: string, last: string): Item[] {
  if (!s.startsAt) return [];
  const start = ymd(new Date(s.startsAt));
  const end = s.endsAt ? ymd(new Date(s.endsAt)) : start;
  const out: Item[] = [];
  // Cap long spans so a mis-entered end date can't flood the grid.
  for (let d = start, i = 0; d <= end && i < 31; d = addDays(d, 1), i++) {
    if (d < first || d > last) continue;
    out.push({
      key: `s-${s.id}-${d}`,
      date: d,
      title: s.name,
      time: d === start ? timeLabel(s.startsAt) : undefined,
      kind: "signup",
      href: `/events/${s.id}`,
      continued: d !== start,
    });
  }
  return out;
}

function sundayItems(first: string, last: string): Item[] {
  const out: Item[] = [];
  for (let d = first; d <= last; d = addDays(d, 1)) {
    if (new Date(`${d}T12:00:00Z`).getUTCDay() === 0) {
      out.push({
        key: `g-${d}`,
        date: d,
        title: "Sunday Gathering",
        time: "10:15 AM",
        kind: "gathering",
        href: "/visit/what-to-expect",
      });
    }
  }
  return out;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m: mParam } = await searchParams;

  const today = ymd(new Date());
  const [ty, tm] = today.split("-").map(Number);
  const min = { y: ty, m: tm };
  const max = monthOffset(ty, tm, MONTHS_AHEAD);

  let { y, m } = min;
  const match = mParam?.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const req = { y: Number(match[1]), m: Number(match[2]) };
    const idx = (v: { y: number; m: number }) => v.y * 12 + v.m;
    if (req.m >= 1 && req.m <= 12 && idx(req) >= idx(min) && idx(req) <= idx(max)) {
      ({ y, m } = req);
    }
  }

  const first = `${y}-${pad(m)}-01`;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const last = `${y}-${pad(m)}-${pad(daysInMonth)}`;
  const prev = monthOffset(y, m, -1);
  const next = monthOffset(y, m, 1);
  const hasPrev = y * 12 + m > min.y * 12 + min.m;
  const hasNext = y * 12 + m < max.y * 12 + max.m;

  const [signupsResult, isVisible, ccEvents] = await Promise.all([
    listOpenSignups(50).then(
      (list) => ({ list, ok: true }),
      () => ({ list: [] as PcoSignup[], ok: false }),
    ),
    getSignupVisibility(),
    // Pad a day either side so late-night UTC times still land correctly.
    listChurchCenterCalendar(`${addDays(first, -1)}T00:00:00Z`, `${addDays(last, 2)}T00:00:00Z`),
  ]);

  const items: Item[] = [
    ...sundayItems(first, last),
    ...signupsResult.list.filter((s) => isVisible(s.id)).flatMap((s) => signupItems(s, first, last)),
    ...ccEvents
      .map((e): Item => ({
        key: `c-${e.id}`,
        date: ymd(new Date(e.startsAt)),
        title: e.name,
        time: e.allDay ? "All day" : timeLabel(e.startsAt),
        kind: "calendar",
        href: e.url,
        cc: true,
      }))
      .filter((i) => i.date >= first && i.date <= last),
  ];

  const loadError = !signupsResult.ok;

  const byDay = new Map<string, Item[]>();
  for (const it of items) {
    const list = byDay.get(it.date) ?? [];
    list.push(it);
    byDay.set(it.date, list);
  }
  const order: Record<Kind, number> = { gathering: 0, calendar: 1, signup: 2 };
  for (const list of byDay.values()) list.sort((a, b) => order[a.kind] - order[b.kind]);

  // Leading blanks so the 1st lands on its weekday (weeks start Sunday).
  const lead = new Date(`${first}T12:00:00Z`).getUTCDay();
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${y}-${pad(m)}-${pad(i + 1)}`),
  ];
  while (cells.length % 7) cells.push(null);

  const monthName = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, 15)),
  );
  const agenda = items
    .filter((i) => i.kind !== "gathering" && !i.continued)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <ChurchCenterScript />
      <PhotoHero
        image={HERO.image}
        alt={HERO.alt}
        eyebrow={HERO.eyebrow}
        headline={HERO.headline}
        intro={HERO.intro}
        short
      />

      <section className="bg-paper py-16 md:py-24">
        <Container>
          {/* Month header + navigation */}
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
              {monthName} <em className="text-brand-600">{y}</em>
            </h2>
            <nav aria-label="Change month" className="flex items-center gap-2">
              <MonthLink enabled={hasPrev} href={`/calendar?m=${monthParam(prev.y, prev.m)}`} label="Previous month">
                ←
              </MonthLink>
              <Link
                href="/calendar"
                className="rounded-full border border-ink-900/20 px-5 py-2.5 text-sm font-semibold text-ink-900 transition hover:border-ink-900 hover:bg-ink-900/5"
              >
                Today
              </Link>
              <MonthLink enabled={hasNext} href={`/calendar?m=${monthParam(next.y, next.m)}`} label="Next month">
                →
              </MonthLink>
            </nav>
          </div>

          {/* Legend */}
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">
            {(Object.keys(KIND) as Kind[])
              .filter((k) => k !== "calendar" || ccEvents.length > 0)
              .map((k) => (
                <li key={k} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${KIND[k].dot}`} aria-hidden="true" />
                  {KIND[k].label}
                </li>
              ))}
          </ul>

          {/* Month grid */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-ink-900/10 bg-white/70">
            <div className="grid grid-cols-7 border-b border-ink-900/10 bg-river-950 text-white" aria-hidden="true">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] md:px-3 md:text-left">
                  {d}
                </div>
              ))}
            </div>
            <ol className="grid grid-cols-7">
              {cells.map((date, i) => {
                const dayItems = date ? byDay.get(date) ?? [] : [];
                const isToday = date === today;
                const isPast = date !== null && date < today;
                return (
                  <li
                    key={date ?? `blank-${i}`}
                    className={`min-h-16 border-b border-r border-ink-900/10 p-1.5 md:min-h-32 md:p-2.5 ${
                      (i + 1) % 7 === 0 ? "border-r-0" : ""
                    } ${date ? "" : "bg-ink-900/[0.03]"} ${isPast ? "opacity-45" : ""}`}
                  >
                    {date && (
                      <>
                        <span
                          className={`grid h-7 w-7 place-items-center rounded-full text-sm font-semibold tabular-nums md:h-8 md:w-8 ${
                            isToday ? "bg-brand-600 text-white" : "text-ink-800"
                          }`}
                        >
                          {Number(date.slice(8))}
                          <span className="sr-only">
                            {isToday ? " (today)" : ""}
                            {dayItems.length ? `: ${dayItems.map((x) => x.title).join(", ")}` : ""}
                          </span>
                        </span>
                        {/* Phones: dots */}
                        {dayItems.length > 0 && (
                          <span className="mt-1 flex flex-wrap gap-1 px-1 md:hidden" aria-hidden="true">
                            {dayItems.map((it) => (
                              <span key={it.key} className={`h-1.5 w-1.5 rounded-full ${KIND[it.kind].dot}`} />
                            ))}
                          </span>
                        )}
                        {/* Tablet+: chips */}
                        <ul className="mt-1.5 hidden space-y-1 md:block">
                          {dayItems.map((it) => (
                            <li key={it.key}>
                              <Chip it={it} />
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Agenda */}
          <div className="mt-16 grid gap-8 lg:grid-cols-[18rem_1fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">This month</p>
              <h3 className="mt-3 text-3xl font-bold tracking-tight">
                {agenda.length === 0 ? "Just Sundays." : `${agenda.length} event${agenda.length === 1 ? "" : "s"}.`}
              </h3>
              <p className="mt-3 text-ink-600">
                Plus every Sunday at 10:15 AM in Bartlett — coffee&rsquo;s on 15 minutes before.
              </p>
            </div>
            {loadError ? (
              <p className="rounded-2xl border border-dashed border-ink-900/20 p-8 text-ink-600">
                We couldn&rsquo;t reach Church Center just now. Check back in a few minutes.
              </p>
            ) : agenda.length > 0 ? (
              <ul className="border-t border-ink-900/15">
                {agenda.map((it) => (
                  <li key={it.key} className="border-b border-ink-900/15">
                    <AgendaRow it={it} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-ink-900/20 p-8 text-ink-600">
                Nothing else on the books for {monthName} yet.{" "}
                {hasNext && (
                  <Link href={`/calendar?m=${monthParam(next.y, next.m)}`} className="font-semibold text-ink-900 underline decoration-brand-500 decoration-2 underline-offset-4">
                    See next month →
                  </Link>
                )}
              </p>
            )}
          </div>
        </Container>
      </section>

      <CtaBand
        headline="Looking for something specific?"
        accent="specific?"
        body="Browse every event open for sign-up, including ongoing ones like Baptism and Baby Dedication."
      >
        <Button tone="dark" href="/events">
          See all events
        </Button>
        <Button tone="dark" variant="outline" href={ccUrl("/calendar")} newTab>
          Open in Church Center
        </Button>
      </CtaBand>
    </div>
  );
}

function MonthLink({
  enabled,
  href,
  label,
  children,
}: {
  enabled: boolean;
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const cls = "grid h-11 w-11 place-items-center rounded-full border text-lg transition";
  return enabled ? (
    <Link href={href} aria-label={label} className={`${cls} border-ink-900/20 text-ink-900 hover:border-ink-900 hover:bg-ink-900/5`}>
      {children}
    </Link>
  ) : (
    <span aria-hidden="true" className={`${cls} border-ink-900/10 text-ink-900/25`}>
      {children}
    </span>
  );
}

function Chip({ it }: { it: Item }) {
  const cls = `block rounded-md px-2 py-1 text-xs font-semibold leading-snug transition ${KIND[it.kind].chip}`;
  const text = (
    <>
      {it.time && <span className="block text-[10px] font-normal opacity-75">{it.time}</span>}
      <span className="line-clamp-2 break-words">{it.continued ? `↳ ${it.title}` : it.title}</span>
    </>
  );
  return it.cc ? (
    <ChurchCenterModalLink href={it.href} className={cls}>
      {text}
    </ChurchCenterModalLink>
  ) : (
    <Link href={it.href} className={cls} title={it.title}>
      {text}
    </Link>
  );
}

function AgendaRow({ it }: { it: Item }) {
  const d = new Date(`${it.date}T12:00:00Z`);
  const dow = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(d);
  const inner = (
    <span className="group grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 py-5">
      <span className="text-center">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">{dow}</span>
        <span className="block text-3xl font-bold tabular-nums tracking-tight">{d.getUTCDate()}</span>
      </span>
      <span>
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600">
          <span className={`h-2 w-2 rounded-full ${KIND[it.kind].dot}`} aria-hidden="true" />
          {KIND[it.kind].label}
          {it.time ? ` · ${it.time}` : ""}
        </span>
        <span className="mt-1 block text-xl font-bold leading-tight tracking-tight text-ink-900 transition group-hover:text-brand-600 md:text-2xl">
          {it.title}
        </span>
      </span>
      <span className="text-ink-300 transition group-hover:translate-x-1 group-hover:text-ink-900">→</span>
    </span>
  );
  return it.cc ? (
    <ChurchCenterModalLink href={it.href} className="block">
      {inner}
    </ChurchCenterModalLink>
  ) : (
    <Link href={it.href} className="block">
      {inner}
    </Link>
  );
}

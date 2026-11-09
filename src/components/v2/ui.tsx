/**
 * Design v2 component kit — editorial church site.
 *
 * Type: Inter Tight (display, bold, tight), Inter (body), Instrument Serif
 * italic (accent word in headlines). Palette: paper background, ink text,
 * river-950/900 darks, brand turquoise accents (brand-600 on light,
 * brand-300 on dark).
 *
 * Every inner page should be composed from these so the whole site reads
 * as one system. All are server components.
 */
import Image from "next/image";
import Link from "next/link";

type Tone = "light" | "white" | "dark";

/* ── Layout ─────────────────────────────────────────────────────────── */

export function Container({
  children,
  className = "",
  narrow = false,
}: {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div
      className={`mx-auto px-5 md:px-10 ${narrow ? "max-w-4xl" : "max-w-[90rem]"} ${className}`}
    >
      {children}
    </div>
  );
}

const SECTION_TONE: Record<Tone, string> = {
  light: "bg-paper text-ink-900",
  white: "bg-white/60 text-ink-900 border-y border-ink-900/10",
  dark: "bg-river-950 text-white",
};

/** Vertical rhythm wrapper. `tone` sets background + text color. */
export function Section({
  children,
  tone = "light",
  className = "",
  id,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`${SECTION_TONE[tone]} py-20 md:py-32 ${className}`}
    >
      {children}
    </section>
  );
}

/* ── Type ───────────────────────────────────────────────────────────── */

/**
 * Split a headline so its last word (or an explicit `accent` phrase)
 * renders in the italic serif. "Take your next step." → "Take your next" +
 * *step.*
 */
/** Small label naming a value or field ("Address", "Mission"). Never a
 *  kicker above a heading — headings carry themselves in v2. */
export function FieldLabel({
  children,
  tone = "light",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <p
      className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
        tone === "dark" ? "text-white/55" : "text-ink-500"
      } ${className}`}
    >
      {children}
    </p>
  );
}

export function splitAccent(text: string, accent?: string): [string, string] {
  const t = (text ?? "").trim();
  if (accent && t.toLowerCase().endsWith(accent.toLowerCase())) {
    return [t.slice(0, t.length - accent.length), t.slice(t.length - accent.length)];
  }
  const words = t.split(/\s+/);
  if (words.length < 2) return ["", t];
  const last = words.pop()!;
  return [words.join(" ") + " ", last];
}

const HEADLINE_SIZE = {
  md: "text-4xl md:text-5xl",
  lg: "text-5xl md:text-7xl",
  xl: "text-6xl md:text-8xl lg:text-[8.5rem]",
} as const;

/**
 * Bold tight headline with italic-serif accent. Use `as="h1"` once per
 * page (PhotoHero/PageHero already do this).
 */
export function Headline({
  text,
  accent,
  as: Tag = "h2",
  size = "lg",
  tone = "light",
  className = "",
}: {
  text: string;
  /** Trailing phrase to italicise; defaults to the last word. */
  accent?: string;
  as?: "h1" | "h2" | "h3";
  size?: keyof typeof HEADLINE_SIZE;
  tone?: Tone;
  className?: string;
}) {
  const [lead, last] = splitAccent(text, accent);
  return (
    <Tag
      className={`font-bold leading-[0.95] tracking-tight ${HEADLINE_SIZE[size]} ${className}`}
    >
      {lead}
      <em className={tone === "dark" ? "text-brand-300" : "text-brand-600"}>
        {last}
      </em>
    </Tag>
  );
}

export function Lede({
  children,
  tone = "light",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <p
      className={`text-lg leading-8 md:text-xl md:leading-9 ${
        tone === "dark" ? "text-white/75" : "text-ink-600"
      } ${className}`}
    >
      {children}
    </p>
  );
}

/** Headline + optional intro, left or centered, with an optional
 *  action on the right (desktop). */
export function SectionHeader({
  headline,
  accent,
  intro,
  tone = "light",
  align = "split",
  action,
  className = "",
}: {
  headline: string;
  accent?: string;
  intro?: React.ReactNode;
  tone?: Tone;
  align?: "split" | "left" | "center";
  action?: React.ReactNode;
  className?: string;
}) {
  if (align === "center") {
    return (
      <header className={`mx-auto mb-14 max-w-3xl text-center md:mb-20 ${className}`}>
        <Headline text={headline} accent={accent} tone={tone} />
        {intro && (
          <Lede tone={tone} className="mx-auto mt-6 max-w-2xl">
            {intro}
          </Lede>
        )}
        {action && <div className="mt-8 flex justify-center">{action}</div>}
      </header>
    );
  }
  return (
    <header
      className={`mb-14 flex flex-col gap-6 md:mb-20 ${
        align === "split" ? "md:flex-row md:items-end md:justify-between" : ""
      } ${className}`}
    >
      <div className="max-w-4xl">
        <Headline text={headline} accent={accent} tone={tone} />
      </div>
      {(intro || action) && (
        <div className={`max-w-md ${align === "split" ? "" : "mt-2"}`}>
          {intro && (
            <p className={tone === "dark" ? "text-white/70" : "text-ink-600"}>
              {intro}
            </p>
          )}
          {action && <div className={intro ? "mt-6" : ""}>{action}</div>}
        </div>
      )}
    </header>
  );
}

/* ── Buttons ────────────────────────────────────────────────────────── */

type ButtonVariant = "solid" | "outline" | "link";

const BTN: Record<Tone, Record<ButtonVariant, string>> = {
  light: {
    solid: "rounded-full bg-ink-900 px-7 py-3.5 text-white hover:bg-brand-800",
    outline:
      "rounded-full border border-ink-900/25 px-7 py-3.5 text-ink-900 hover:border-ink-900 hover:bg-ink-900/5",
    link: "py-2 text-ink-900 underline decoration-brand-500 decoration-2 underline-offset-[6px] hover:text-brand-800",
  },
  white: {
    solid: "rounded-full bg-ink-900 px-7 py-3.5 text-white hover:bg-brand-800",
    outline:
      "rounded-full border border-ink-900/25 px-7 py-3.5 text-ink-900 hover:border-ink-900 hover:bg-ink-900/5",
    link: "py-2 text-ink-900 underline decoration-brand-500 decoration-2 underline-offset-[6px] hover:text-brand-800",
  },
  dark: {
    solid: "rounded-full bg-white px-7 py-3.5 text-ink-900 hover:bg-brand-100",
    outline:
      "rounded-full border border-white/35 px-7 py-3.5 text-white hover:bg-white/10",
    link: "py-2 text-white underline decoration-brand-300 decoration-2 underline-offset-[6px] hover:text-brand-200",
  },
};

/** Link-as-button. External hrefs (http, mailto, tel) open correctly. */
export function Button({
  href,
  children,
  variant = "solid",
  tone = "light",
  className = "",
  newTab,
}: {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  tone?: Tone;
  className?: string;
  /** Defaults to true for http(s) links. */
  newTab?: boolean;
}) {
  const cls = `inline-flex items-center justify-center gap-2 text-sm font-semibold transition ${BTN[tone][variant]} ${className}`;
  const external = /^(https?:|mailto:|tel:)/.test(href);
  if (external) {
    const blank = newTab ?? href.startsWith("http");
    return (
      <a
        href={href}
        className={cls}
        {...(blank ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function ButtonRow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {children}
    </div>
  );
}

/* ── Heroes ─────────────────────────────────────────────────────────── */

/**
 * Full-bleed photo hero with bottom-aligned editorial headline — the
 * inner-page counterpart to the homepage video hero.
 */
export function PhotoHero({
  image,
  alt,
  headline,
  accent,
  intro,
  children,
  backlink,
  short = false,
}: {
  image: string;
  alt: string;
  headline: string;
  accent?: string;
  intro?: React.ReactNode;
  /** Buttons or extra content under the intro. */
  children?: React.ReactNode;
  backlink?: { label: string; href: string };
  /** Shorter hero for detail pages. */
  short?: boolean;
}) {
  return (
    <section
      className={`relative isolate flex flex-col overflow-hidden bg-river-950 text-white ${
        short ? "min-h-[60svh]" : "min-h-[78svh]"
      }`}
    >
      <Image
        src={image}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-river-950 via-river-950/55 to-river-950/25"
        aria-hidden="true"
      />
      <Container className="flex w-full flex-1 flex-col justify-end pb-12 pt-28 md:pb-16">
        {backlink && (
          <Link
            href={backlink.href}
            className="mb-6 inline-block w-fit py-2 text-sm font-semibold text-white/70 transition hover:text-white"
          >
            ← {backlink.label}
          </Link>
        )}
        <Headline
          as="h1"
          size="xl"
          tone="dark"
          text={headline}
          accent={accent}
          className="rise rise-2 mt-5 max-w-6xl"
        />
        {(intro || children) && (
          <div className="rise rise-3 mt-10 grid gap-8 border-t border-white/20 pt-8 md:grid-cols-[1fr_auto] md:items-end">
            {intro ? (
              <p className="max-w-2xl text-lg leading-8 text-white/80">{intro}</p>
            ) : (
              <span />
            )}
            {children && <ButtonRow>{children}</ButtonRow>}
          </div>
        )}
      </Container>
    </section>
  );
}

/* ── Content blocks ─────────────────────────────────────────────────── */

/**
 * Two-column text + image. Image is rounded, tall; text side takes
 * headline/body/actions.
 */
export function SplitSection({
  image,
  alt,
  headline,
  accent,
  children,
  actions,
  reverse = false,
  tone = "light",
  aspect = "aspect-[4/5]",
}: {
  image: string;
  alt: string;
  headline: string;
  accent?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  /** Image on the right when true. */
  reverse?: boolean;
  tone?: Tone;
  aspect?: string;
}) {
  return (
    <Section tone={tone}>
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div className={`relative overflow-hidden rounded-2xl ${aspect} ${reverse ? "lg:order-2" : ""}`}>
            <Image src={image} alt={alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <Headline text={headline} accent={accent} tone={tone} />
            {children && (
              <div
                className={`mt-8 space-y-5 text-lg leading-8 ${
                  tone === "dark" ? "text-white/75" : "text-ink-600"
                }`}
              >
                {children}
              </div>
            )}
            {actions && <ButtonRow className="mt-10">{actions}</ButtonRow>}
          </div>
        </div>
      </Container>
    </Section>
  );
}

/** Full-bleed photograph with optional caption overlay bottom-left. */
export function ImageBanner({
  image,
  alt,
  title,
  accent,
  body,
}: {
  image: string;
  alt: string;
  title?: string;
  accent?: string;
  body?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative aspect-[4/3] w-full md:aspect-[21/9]">
        <Image src={image} alt={alt} fill sizes="100vw" className="object-cover" />
      </div>
      {(title || body) && (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-river-950/85 via-river-950/20 to-transparent"
            aria-hidden="true"
          />
          <Container className="absolute inset-x-0 bottom-0 pb-10 text-white md:pb-16">
            {title && (
              <Headline text={title} accent={accent} tone="dark" size="lg" />
            )}
            {body && (
              <p className="mt-4 max-w-xl text-lg leading-8 text-white/80">
                {body}
              </p>
            )}
          </Container>
        </>
      )}
    </section>
  );
}

/** Rounded photo card (Whitestone-style) with title/blurb/link. */
export function PhotoCard({
  href,
  image,
  alt,
  title,
  blurb,
  cta = "Learn more →",
  aspect = "aspect-[4/5]",
  tone = "light",
}: {
  href?: string;
  image?: string;
  alt?: string;
  title: string;
  blurb?: React.ReactNode;
  cta?: string;
  aspect?: string;
  tone?: Tone;
}) {
  const inner = (
    <>
      <div className={`relative overflow-hidden rounded-2xl ${tone === "dark" ? "bg-river-800" : "bg-cream-200"} ${aspect}`}>
        {image && (
          <Image
            src={image}
            alt={alt ?? title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        )}
      </div>
      <h3 className="mt-6 text-3xl font-bold tracking-tight">
        {title}
      </h3>
      {blurb && (
        <p className={`mt-3 leading-7 ${tone === "dark" ? "text-white/70" : "text-ink-600"}`}>
          {blurb}
        </p>
      )}
      {href && cta && (
        <span
          className={`mt-4 inline-block text-sm font-semibold transition group-hover:translate-x-1 ${
            tone === "dark" ? "text-white group-hover:text-brand-300" : "text-ink-900 group-hover:text-brand-600"
          }`}
        >
          {cta}
        </span>
      )}
    </>
  );
  if (!href) return <div>{inner}</div>;
  const external = /^https?:/.test(href);
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
      {inner}
    </a>
  ) : (
    <Link href={href} className="group block">
      {inner}
    </Link>
  );
}

export function CardGrid({
  children,
  cols = 3,
  className = "",
}: {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  const c =
    cols === 4
      ? "md:grid-cols-2 lg:grid-cols-4"
      : cols === 2
        ? "md:grid-cols-2"
        : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid gap-x-6 gap-y-14 ${c} ${className}`}>{children}</div>
  );
}

/** Outlined fact box (Bridge-style service-time card). */
export function FactCard({
  label,
  value,
  note,
  tone = "light",
  children,
}: {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  tone?: Tone;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 transition md:p-7 ${
        tone === "dark"
          ? "border-white/20 hover:border-brand-300"
          : "border-ink-900/15 hover:border-brand-500"
      }`}
    >
      <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${tone === "dark" ? "text-white/55" : "text-ink-500"}`}>
        {label}
      </p>
      <div className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">{value}</div>
      {note && (
        <p className={`mt-2 text-sm leading-6 ${tone === "dark" ? "text-white/60" : "text-ink-500"}`}>
          {note}
        </p>
      )}
      {children}
    </div>
  );
}

/** Numbered step row: big numeral, title, body, optional image. */
export function NumberedItem({
  number,
  title,
  children,
  tone = "light",
}: {
  number: string;
  title: string;
  children?: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <div className={`grid gap-4 border-t pt-8 md:grid-cols-[8rem_1fr] ${tone === "dark" ? "border-white/15" : "border-ink-900/15"}`}>
      <p className={`font-serif text-6xl italic leading-none ${tone === "dark" ? "text-brand-300" : "text-brand-600"}`}>
        {number}
      </p>
      <div>
        <h3 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h3>
        {children && (
          <div className={`mt-4 max-w-2xl text-lg leading-8 ${tone === "dark" ? "text-white/70" : "text-ink-600"}`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

/** Large pull quote / scripture in the italic serif. */
export function PullQuote({
  children,
  cite,
  tone = "light",
}: {
  children: React.ReactNode;
  cite?: string;
  tone?: Tone;
}) {
  return (
    <figure className="mx-auto max-w-5xl text-center">
      <blockquote
        className={`font-serif text-4xl italic leading-[1.15] md:text-6xl ${
          tone === "dark" ? "text-white" : "text-ink-900"
        }`}
      >
        {children}
      </blockquote>
      {cite && (
        <figcaption className={`mt-8 text-xs font-semibold uppercase tracking-[0.22em] ${tone === "dark" ? "text-brand-300" : "text-brand-800"}`}>
          {cite}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Closing call-to-action band, dark river navy. Every page should end with
 * one (before the global "See you Sunday" footer) unless the page's own
 * last section already is a CTA.
 */
export function CtaBand({
  headline,
  accent,
  body,
  children,
  image,
}: {
  headline: string;
  accent?: string;
  body?: React.ReactNode;
  /** Buttons — use tone="dark" on each Button. */
  children?: React.ReactNode;
  /** Optional background photograph. */
  image?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-river-900 text-white">
      {image && (
        <>
          <Image src={image} alt="" aria-hidden="true" fill sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-river-950/95 via-river-950/70 to-river-950/30" aria-hidden="true" />
        </>
      )}
      <Container className="py-24 md:py-36">
        <Headline text={headline} accent={accent} tone="dark" size="xl" className="max-w-5xl" />
        {body && (
          <p className="mt-8 max-w-xl text-lg leading-8 text-white/80">{body}</p>
        )}
        {children && <ButtonRow className="mt-10">{children}</ButtonRow>}
      </Container>
    </section>
  );
}

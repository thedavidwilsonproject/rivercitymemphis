import Link from "next/link";

type Variant = "brand" | "dark" | "cream";

type Props = {
  eyebrow?: string;
  headline: string;
  intro?: string;
  variant?: Variant;
  /** Optional small backlink shown above the eyebrow. */
  backlink?: { label: string; href: string };
};

const STYLES: Record<
  Variant,
  {
    section: string;
    eyebrow: string;
    headline: string;
    intro: string;
    backlink: string;
  }
> = {
  brand: {
    section: "bg-brand-600 text-white",
    eyebrow: "text-brand-100",
    headline: "text-white",
    intro: "text-brand-50/95",
    backlink: "text-brand-100 hover:text-white",
  },
  dark: {
    section: "bg-ink-900 text-white",
    eyebrow: "text-brand-300",
    headline: "text-white",
    intro: "text-cream-50/90",
    backlink: "text-brand-300 hover:text-brand-200",
  },
  cream: {
    section: "bg-cream-100 text-ink-700",
    eyebrow: "text-brand-600",
    headline: "text-ink-800",
    intro: "text-ink-600",
    backlink: "text-brand-600 hover:text-brand-700",
  },
};

export function PageHero({
  eyebrow,
  headline,
  intro,
  variant = "brand",
  backlink,
}: Props) {
  const s = STYLES[variant];
  return (
    <section className={`${s.section} relative`}>
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        {backlink && (
          <Link
            href={backlink.href}
            className={`mb-4 inline-block font-display text-sm uppercase tracking-widest ${s.backlink}`}
          >
            ← {backlink.label}
          </Link>
        )}
        {eyebrow && (
          <p
            className={`font-display text-sm uppercase tracking-[0.3em] ${s.eyebrow}`}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className={`mt-2 font-display text-5xl uppercase leading-tight tracking-wide md:text-6xl ${s.headline}`}
        >
          {headline}
        </h1>
        {intro && (
          <p className={`mt-4 max-w-2xl text-lg leading-7 ${s.intro}`}>
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}

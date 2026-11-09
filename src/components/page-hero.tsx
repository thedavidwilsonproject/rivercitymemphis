import Link from "next/link";

type Variant = "brand" | "dark" | "cream";

type Props = {
  headline: string;
  intro?: string;
  variant?: Variant;
  /** Optional small backlink shown above the headline. */
  backlink?: { label: string; href: string };
};

// Design v2: oversized editorial headline, the last word set in the
// italic serif accent. Variants map onto the new palette.
const STYLES: Record<
  Variant,
  { section: string; link: string; intro: string; accent: string; rule: string }
> = {
  brand: {
    section: "bg-river-900 text-white",
    link: "text-brand-300",
    intro: "text-white/75",
    accent: "text-brand-300",
    rule: "border-white/15",
  },
  dark: {
    section: "bg-river-950 text-white",
    link: "text-brand-300",
    intro: "text-white/75",
    accent: "text-brand-300",
    rule: "border-white/15",
  },
  cream: {
    section: "bg-paper text-ink-900",
    link: "text-brand-800",
    intro: "text-ink-600",
    accent: "text-brand-600",
    rule: "border-ink-900/10",
  },
};

function splitLast(headline: string): [string, string] {
  const words = headline.trim().split(/\s+/);
  if (words.length < 2) return ["", headline];
  const last = words.pop()!;
  return [words.join(" ") + " ", last];
}

export function PageHero({
  headline,
  intro,
  variant = "brand",
  backlink,
}: Props) {
  const s = STYLES[variant];
  const [lead, last] = splitLast(headline);
  return (
    <section className={`${s.section} relative overflow-hidden`}>
      <div className="mx-auto max-w-[90rem] px-5 pb-16 pt-20 md:px-10 md:pb-24 md:pt-32">
        {backlink && (
          <Link
            href={backlink.href}
            className={`mb-4 inline-block py-2 text-sm font-semibold ${s.link} hover:opacity-80`}
          >
            ← {backlink.label}
          </Link>
        )}
        <h1 className="rise max-w-5xl text-6xl font-bold leading-[0.95] tracking-tight md:text-8xl lg:text-[8.5rem]">
          {lead}
          <em className={s.accent}>{last}</em>
        </h1>
        {intro && (
          <div className={`rise rise-2 mt-10 border-t pt-8 ${s.rule}`}>
            <p className={`max-w-2xl text-lg leading-8 md:text-xl ${s.intro}`}>
              {intro}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { faqPageQuery, siteSettingsQuery } from "@/sanity/queries";
import { FaqItem } from "@/components/faq-item";
import { JsonLd } from "@/components/json-ld";
import type { SiteSettings } from "@/types/sanity";

type PortableBlock = {
  _type?: string;
  children?: { text?: string }[];
};

function portableTextToPlain(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return (value as PortableBlock[])
    .map((block) =>
      (block.children ?? []).map((c) => c.text ?? "").join(""),
    )
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

type FaqEntry = {
  question: string;
  answer: unknown;
};

type FaqPageDoc = {
  eyebrow?: string;
  headline?: string;
  intro?: string;
  footer?: string;
  items?: FaqEntry[];
};

const FALLBACK: FaqPageDoc = {
  eyebrow: "Visit",
  headline: "FAQs",
  intro:
    "At River City, we want to make sure that you're comfortable with who we are, even before you come visit us for the first time. Below, you'll find some questions we thought you might have, along with their answers.",
  footer:
    "If you have a question outside of the ones provided, feel free to ask by emailing us at info@rivercitymemphis.org.",
  items: [],
};

export async function generateMetadata(): Promise<Metadata> {
  let doc: FaqPageDoc | null = null;
  try {
    doc = await client.fetch<FaqPageDoc | null>(faqPageQuery);
  } catch {
    /* fallback */
  }
  return {
    title: doc?.headline ?? "FAQs",
    description: doc?.intro ?? FALLBACK.intro,
  };
}

export default async function FaqsPage() {
  let doc: FaqPageDoc | null = null;
  let settings: SiteSettings | null = null;
  try {
    [doc, settings] = await Promise.all([
      client.fetch<FaqPageDoc | null>(faqPageQuery),
      client.fetch<SiteSettings | null>(siteSettingsQuery),
    ]);
  } catch {
    /* fallback */
  }
  const data: FaqPageDoc = { ...FALLBACK, ...(doc ?? {}) };
  const items = data.items ?? [];
  const email = settings?.email ?? "info@rivercitymemphis.org";

  const faqJsonLd =
    items.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items
            .filter((it) => it.question)
            .map((it) => ({
              "@type": "Question",
              name: it.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: portableTextToPlain(it.answer) || it.question,
              },
            })),
        }
      : null;

  return (
    <div>
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <section className="bg-cream-100">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          {data.eyebrow && (
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-600">
              {data.eyebrow}
            </p>
          )}
          <h1 className="mt-2 font-display text-5xl uppercase tracking-wide text-ink-800 md:text-6xl">
            {data.headline}
          </h1>
          {data.intro && (
            <p className="mt-4 text-lg leading-7 text-ink-600">{data.intro}</p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-300 p-10 text-center text-ink-500">
            No questions added yet. Add them in Sanity Studio → FAQ Page.
          </p>
        ) : (
          <ul className="divide-y divide-cream-200 border-y border-cream-200">
            {items.map((item, i) => (
              <li key={i}>
                <FaqItem question={item.question} answer={item.answer} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 rounded-2xl border border-cream-200 bg-cream-50 p-8 text-center md:p-10">
          <h2 className="font-display text-2xl uppercase tracking-wide text-ink-800 md:text-3xl">
            Still have a question?
          </h2>
          {data.footer && (
            <p className="mx-auto mt-3 max-w-xl text-ink-600">{data.footer}</p>
          )}
          <a
            href={`mailto:${email}?subject=Question%20for%20RCC`}
            className="mt-6 inline-flex rounded-full bg-brand-500 px-6 py-3 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
          >
            Ask a question
          </a>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { faqPageQuery, siteSettingsQuery } from "@/sanity/queries";
import { FaqItem } from "@/components/faq-item";
import { JsonLd } from "@/components/json-ld";
import type { SiteSettings } from "@/types/sanity";
import { PageHero } from "@/components/page-hero";
import { Button, Container, CtaBand, Section } from "@/components/v2/ui";

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
  headline?: string;
  intro?: string;
  footer?: string;
  items?: FaqEntry[];
};

const FALLBACK: FaqPageDoc = {
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
      <PageHero
        headline={data.headline ?? "FAQs"}
        intro={data.intro}
        variant="cream"
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-24">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="mt-4 font-serif text-5xl italic leading-tight text-ink-900">
                {items.length > 0 ? `${items.length} answers` : "Answers"}
              </p>
              <Button
                href={`mailto:${email}?subject=Question%20for%20RCC`}
                variant="link"
                className="mt-8"
              >
                Ask a question →
              </Button>
            </div>
            {items.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-ink-900/20 p-10 text-center text-ink-500">
                No questions added yet. Add them in Sanity Studio → FAQ Page.
              </p>
            ) : (
              <ul className="divide-y divide-ink-900/15 border-y border-ink-900/15">
                {items.map((item, i) => (
                  <li key={i}>
                    <FaqItem question={item.question} answer={item.answer} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Container>
      </Section>

      <CtaBand
        headline="Still have a question?"
        accent="a question?"
        body={data.footer}
      >
        <Button tone="dark" href={`mailto:${email}?subject=Question%20for%20RCC`}>
          Ask a question
        </Button>
      </CtaBand>
    </div>
  );
}

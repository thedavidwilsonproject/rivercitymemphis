import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/client";
import { leadershipQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL } from "@/lib/site";
import type { Person } from "@/types/sanity";
import {
  Button,
  Container,
  CtaBand,
  Eyebrow,
  Section,
} from "@/components/v2/ui";

function Bio({ value, tone = "light" }: { value: unknown; tone?: "light" | "dark" }) {
  if (!Array.isArray(value) || value.length === 0) return null;
  return (
    <div
      className={`mt-6 space-y-4 text-lg leading-8 ${
        tone === "dark" ? "text-white/75" : "text-ink-600"
      }`}
    >
      <PortableText value={value as Parameters<typeof PortableText>[0]["value"]} />
    </div>
  );
}

export const metadata: Metadata = {
  title: "Leadership",
  description:
    "Meet the pastors and elders of River City Church in Bartlett, TN — Lead Pastor Jonathan Dunn and the team that shepherds, teaches, and serves our church family.",
};

type PortableBlock = { _type?: string; children?: { text?: string }[] };
function portableTextToPlain(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return (value as PortableBlock[])
    .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
    .filter(Boolean)
    .join(" ")
    .trim();
}

/** Display order — Jonathan first, then Eddie, Ken, Barrett. Anyone else falls in after. */
const DISPLAY_ORDER = [
  "Jonathan Dunn",
  "Eddie Davis",
  "Ken Nick",
  "Barrett Linhoss",
];

function sortPeople(people: Person[]): Person[] {
  const idx = (name: string) => {
    const i = DISPLAY_ORDER.indexOf(name);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...people].sort((a, b) => idx(a.name) - idx(b.name));
}

export default async function LeadershipPage() {
  let people: Person[] = [];
  try {
    people = (await client.fetch<Person[]>(leadershipQuery)) ?? [];
  } catch {
    /* empty state */
  }

  const sorted = sortPeople(people);

  const peopleJsonLd =
    sorted.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${SITE_URL}/visit/leadership#people`,
          itemListElement: sorted.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Person",
              "@id": `${SITE_URL}/visit/leadership#${p.slug ?? p.name.replace(/\s+/g, "-").toLowerCase()}`,
              name: p.name,
              jobTitle: p.role,
              description: portableTextToPlain(p.bio) || undefined,
              image: p.photo?.asset
                ? urlFor(p.photo).width(640).height(640).url()
                : undefined,
              worksFor: { "@id": `${SITE_URL}#church` },
              affiliation: { "@id": `${SITE_URL}#church` },
            },
          })),
        }
      : null;

  const [lead, ...rest] = sorted;

  return (
    <div>
      {peopleJsonLd && <JsonLd data={peopleJsonLd} />}
      <PageHero
        eyebrow="Visit"
        headline="Leadership"
        intro="The people God has called to shepherd, teach, and serve our church family."
        variant="cream"
      />

      {sorted.length === 0 ? (
        <Section>
          <Container>
            <p className="rounded-2xl border border-dashed border-ink-900/20 p-10 text-center text-ink-500">
              No leadership profiles in Sanity yet.
            </p>
          </Container>
        </Section>
      ) : (
        <>
          {/* LEAD — featured */}
          <Section tone="dark">
            <Container>
              <article className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
                {lead.photo?.asset && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={urlFor(lead.photo).width(1000).height(1200).url()}
                    alt={lead.photo.alt ?? lead.name}
                    className="aspect-[5/6] w-full rounded-2xl object-cover"
                  />
                )}
                <div>
                  {lead.role && <Eyebrow tone="dark">{lead.role}</Eyebrow>}
                  <h2 className="mt-4 text-6xl font-bold leading-[0.95] tracking-tight md:text-8xl">
                    {lead.name.split(" ").slice(0, -1).join(" ")}{" "}
                    <em className="text-brand-300">
                      {lead.name.split(" ").slice(-1)[0]}
                    </em>
                  </h2>
                  <Bio value={lead.bio} tone="dark" />
                </div>
              </article>
            </Container>
          </Section>

          {/* TEAM */}
          {rest.length > 0 && (
            <Section tone="light">
              <Container>
                <div className="grid gap-x-10 gap-y-20 md:grid-cols-2">
                  {rest.map((p) => (
                    <article key={p.slug ?? p.name}>
                      {p.photo?.asset && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={urlFor(p.photo).width(900).height(900).url()}
                          alt={p.photo.alt ?? p.name}
                          className="aspect-square w-full max-w-md rounded-2xl object-cover"
                        />
                      )}
                      {p.role && (
                        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-800">
                          {p.role}
                        </p>
                      )}
                      <h3 className="mt-2 text-4xl font-bold tracking-tight text-ink-900">
                        {p.name}
                      </h3>
                      <Bio value={p.bio} />
                    </article>
                  ))}
                </div>
              </Container>
            </Section>
          )}
        </>
      )}

      {/* Closing CTA — copy reused from the Who We Are page fallback. */}
      <CtaBand
        headline="We'd love to meet you."
        accent="meet you."
        body="Visit us this Sunday at 10:15 AM — coffee starts 15 minutes earlier and a friend you haven't met yet is probably already saving you a seat."
      >
        <Button tone="dark" href="/visit/what-to-expect">
          Plan your visit
        </Button>
        <Button tone="dark" variant="outline" href="/visit/location">
          Get directions
        </Button>
      </CtaBand>
    </div>
  );
}

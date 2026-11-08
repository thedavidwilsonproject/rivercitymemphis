import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import {
  ministriesQuery,
  ministryBySlugQuery,
  pageBySlugQuery,
} from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PageHero } from "@/components/page-hero";
import { PortableBody } from "@/components/portable-body";
import {
  Button,
  ButtonRow,
  Container,
  Eyebrow,
  FactCard,
  PhotoHero,
  Section,
} from "@/components/v2/ui";
import type { Ministry, PageDoc } from "@/types/sanity";

type Params = { slug: string };

async function getPageDoc(slug: string): Promise<PageDoc | null> {
  try {
    return await client.fetch<PageDoc | null>(pageBySlugQuery, {
      slug: `connect/${slug}`,
    });
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const all = (await client.fetch<Ministry[]>(ministriesQuery)) ?? [];
    return all.map((m) => ({ slug: m.slug! })).filter((m) => m.slug);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const m = await client.fetch<Ministry | null>(ministryBySlugQuery, { slug });
    if (m) return { title: m.title, description: m.tagline };
    const page = await getPageDoc(slug);
    if (page) return { title: page.seoTitle ?? page.title, description: page.summary };
    return {};
  } catch {
    return {};
  }
}

export default async function ConnectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  let m: Ministry | null = null;
  try {
    m = await client.fetch<Ministry | null>(ministryBySlugQuery, { slug });
  } catch {
    m = null;
  }

  if (!m) {
    const page = await getPageDoc(slug);
    if (!page) notFound();
    return (
      <div>
        {page.heroImage?.asset ? (
          <PhotoHero
            short
            image={urlFor(page.heroImage).width(2200).url()}
            alt={page.heroImage.alt ?? page.title}
            eyebrow="Connect"
            headline={page.title}
            intro={page.summary}
            backlink={{ label: "Connect", href: "/connect" }}
          />
        ) : (
          <PageHero
            eyebrow="Connect"
            headline={page.title}
            intro={page.summary}
            variant="cream"
            backlink={{ label: "Connect", href: "/connect" }}
          />
        )}
        <Section tone="light">
          <Container narrow>
            <article className="text-ink-700">
              <PortableBody value={page.body} />
            </article>
          </Container>
        </Section>
      </div>
    );
  }

  return (
    <div>
      {m.image?.asset ? (
        <PhotoHero
          short
          image={urlFor(m.image).width(2200).url()}
          alt={m.image.alt ?? m.title}
          eyebrow={m.ageRange ? `Connect · ${m.ageRange}` : "Connect"}
          headline={m.title}
          intro={m.tagline}
          backlink={{ label: "Connect", href: "/connect" }}
        />
      ) : (
        <PageHero
          eyebrow={m.ageRange ? `Connect · ${m.ageRange}` : "Connect"}
          headline={m.title}
          intro={m.tagline}
          variant="dark"
          backlink={{ label: "Connect", href: "/connect" }}
        />
      )}

      {(m.schedule || m.location) && (
        <section className="border-b border-ink-900/10 bg-white/60">
          <Container className="grid gap-4 py-12 md:grid-cols-2">
            {m.schedule && <FactCard label="When" value={m.schedule} />}
            {m.location && <FactCard label="Where" value={m.location} />}
          </Container>
        </section>
      )}

      <Section tone="light">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.6fr] lg:gap-24">
            {Array.isArray(m.coreValues) && m.coreValues.length > 0 ? (
              <div>
                <Eyebrow>Core values</Eyebrow>
                <ul className="mt-6 divide-y divide-ink-900/10 border-y border-ink-900/10">
                  {m.coreValues.map((v, i) => (
                    <li key={i} className="flex items-baseline gap-5 py-4">
                      <span className="font-serif text-xl italic text-brand-600">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-lg font-semibold text-ink-900">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <span className="hidden lg:block" />
            )}
            <div>
              {Array.isArray(m.description) && m.description.length > 0 && (
                <div className="text-ink-700">
                  <PortableBody value={m.description} />
                </div>
              )}
              {m.facebookUrl && (
                <ButtonRow className="mt-10">
                  <Button href={m.facebookUrl}>Find us on Facebook</Button>
                </ButtonRow>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}

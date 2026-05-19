import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/client";
import {
  ministriesQuery,
  ministryBySlugQuery,
  pageBySlugQuery,
} from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PageHero } from "@/components/page-hero";
import { PortableBody } from "@/components/portable-body";
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
        <PageHero
          eyebrow="Connect"
          headline={page.title}
          intro={page.summary}
          variant="brand"
        />
        {page.heroImage?.asset && (
          <div className="mx-auto -mt-12 max-w-5xl px-6 md:-mt-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlFor(page.heroImage).width(1600).height(800).url()}
              alt={page.heroImage.alt ?? page.title}
              className="aspect-[2/1] w-full rounded-2xl object-cover shadow-xl"
            />
          </div>
        )}
        <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
          <PortableBody value={page.body} />
        </article>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-brand-600 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-[1fr_360px] md:py-24">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-brand-100">
              Connect
            </p>
            <h1 className="mt-2 font-display text-5xl uppercase leading-tight tracking-wide md:text-6xl">
              {m.title}
            </h1>
            {m.ageRange && (
              <p className="mt-3 font-display text-lg uppercase tracking-widest text-brand-100">
                {m.ageRange}
              </p>
            )}
            {m.tagline && (
              <p className="mt-4 max-w-xl text-lg leading-7 text-brand-50/95">
                {m.tagline}
              </p>
            )}
          </div>
          {m.image?.asset && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={urlFor(m.image).width(720).height(720).url()}
              alt={m.image.alt ?? m.title}
              className="rounded-2xl shadow-2xl md:justify-self-end"
            />
          )}
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-16">
        {(m.schedule || m.location) && (
          <dl className="mb-10 grid gap-4 rounded-xl border border-cream-200 bg-cream-50 p-6 md:grid-cols-2">
            {m.schedule && (
              <div>
                <dt className="font-display text-xs uppercase tracking-widest text-brand-600">
                  When
                </dt>
                <dd className="mt-1 text-ink-700">{m.schedule}</dd>
              </div>
            )}
            {m.location && (
              <div>
                <dt className="font-display text-xs uppercase tracking-widest text-brand-600">
                  Where
                </dt>
                <dd className="mt-1 text-ink-700">{m.location}</dd>
              </div>
            )}
          </dl>
        )}

        {Array.isArray(m.coreValues) && m.coreValues.length > 0 && (
          <ul className="mb-10 grid gap-3 md:grid-cols-3">
            {m.coreValues.map((v, i) => (
              <li
                key={i}
                className="rounded-xl border border-cream-200 bg-white p-4 text-center font-display text-sm uppercase tracking-widest text-ink-700"
              >
                {v}
              </li>
            ))}
          </ul>
        )}

        {Array.isArray(m.description) && m.description.length > 0 && (
          <div className="prose prose-slab max-w-none text-ink-700">
            <PortableText
              value={
                m.description as Parameters<typeof PortableText>[0]["value"]
              }
            />
          </div>
        )}

        {m.facebookUrl && (
          <a
            href={m.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center rounded-full bg-brand-600 px-6 py-3 font-display text-sm uppercase tracking-widest text-white hover:bg-brand-700"
          >
            Find us on Facebook
          </a>
        )}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import { pageBySlugQuery, pagesIndexQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PageHero } from "@/components/page-hero";
import { PortableBody } from "@/components/portable-body";
import type { PageDoc } from "@/types/sanity";

type Params = { slug: string[] };

const SECTION_EYEBROW: Record<string, string> = {
  visit: "Visit",
  connect: "Connect",
  give: "Give",
  other: "RCC",
};

export async function generateStaticParams() {
  try {
    const pages = await client.fetch<{ slug: string }[]>(pagesIndexQuery);
    return pages
      .filter((p) => p.slug && p.slug !== "/")
      .map((p) => ({ slug: p.slug.split("/") }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const fullSlug = slug.join("/");
  try {
    const page = await client.fetch<PageDoc | null>(pageBySlugQuery, {
      slug: fullSlug,
    });
    if (!page) return {};
    return {
      title: page.seoTitle ?? page.title,
      description: page.summary,
    };
  } catch {
    return {};
  }
}

export default async function ContentPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const fullSlug = slug.join("/");

  let page: PageDoc | null = null;
  try {
    page = await client.fetch<PageDoc | null>(pageBySlugQuery, {
      slug: fullSlug,
    });
  } catch {
    page = null;
  }

  if (!page) notFound();

  const eyebrow =
    page.section && SECTION_EYEBROW[page.section]
      ? SECTION_EYEBROW[page.section]
      : undefined;

  return (
    <div>
      <PageHero
        eyebrow={eyebrow}
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

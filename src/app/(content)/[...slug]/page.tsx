import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import { pageBySlugQuery, pagesIndexQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PageHero } from "@/components/page-hero";
import { PortableBody } from "@/components/portable-body";
import { Button, CtaBand } from "@/components/v2/ui";
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
        variant="cream"
      />

      {page.heroImage?.asset && (
        <div className="mx-auto max-w-[90rem] px-5 md:px-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlFor(page.heroImage).width(2000).height(900).url()}
            alt={page.heroImage.alt ?? page.title}
            className="aspect-[2/1] w-full rounded-2xl object-cover md:aspect-[20/9]"
          />
        </div>
      )}

      <article className="mx-auto max-w-3xl px-5 py-20 text-ink-600 md:px-10 md:py-28">
        <PortableBody value={page.body} />
      </article>

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

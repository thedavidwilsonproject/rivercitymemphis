import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/client";
import { leadershipQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { PageHero } from "@/components/page-hero";
import type { Person } from "@/types/sanity";

export const metadata: Metadata = {
  title: "Leadership",
  description: "Meet the pastors and elders at RCC.",
};

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

  return (
    <div>
      <PageHero
        eyebrow="Visit"
        headline="Leadership"
        intro="The people God has called to shepherd, teach, and serve our church family."
        variant="brand"
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        {sorted.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-300 p-10 text-center text-ink-500">
            No leadership profiles in Sanity yet.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {sorted.map((p) => (
              <article
                key={p.slug ?? p.name}
                className="rounded-2xl border border-cream-200 bg-white p-7 md:p-8"
              >
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                  {p.photo?.asset && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={urlFor(p.photo).width(320).height(320).url()}
                      alt={p.photo.alt ?? p.name}
                      className="h-36 w-36 flex-none rounded-full object-cover md:h-40 md:w-40"
                    />
                  )}
                  <div className="text-center sm:text-left">
                    <h3 className="font-display text-2xl uppercase tracking-wide text-ink-800">
                      {p.name}
                    </h3>
                    {p.role && (
                      <p className="mt-1 text-sm font-semibold text-brand-600">
                        {p.role}
                      </p>
                    )}
                  </div>
                </div>
                {Array.isArray(p.bio) && p.bio.length > 0 && (
                  <div className="prose prose-sm mt-6 max-w-none text-ink-700">
                    <PortableText
                      value={
                        p.bio as Parameters<typeof PortableText>[0]["value"]
                      }
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

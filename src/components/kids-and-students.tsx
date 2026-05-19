import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/image";
import type { HomeMinistryCard } from "@/types/sanity";

type Props = {
  title?: string;
  intro?: string;
  ministries?: HomeMinistryCard[];
};

const FALLBACK_TITLE = "Kids and Students";
const FALLBACK_INTRO =
  "In our Family Ministry, we believe that we have an opportunity to share God's heart in some fun and inspiring ways. We aim to partner with parents in helping their child see Jesus more clearly!";

const FALLBACK_MINISTRIES: HomeMinistryCard[] = [
  {
    name: "Waumba Land",
    age: "Infants thru Pre-K",
    description:
      "Waumba Land & PreK Park are our weekly environments created especially for your infants (six weeks) through preschool-aged children.",
    color: "#DC5237",
    href: "/connect/families",
  },
  {
    name: "UpStreet",
    age: "Kindergarten thru 5th",
    description:
      "In UpStreet we want kids to see how God's Word fits in to their lives, to learn how to talk to Him, and to build relationships that will last.",
    color: "#7BAA53",
    href: "/connect/families",
  },
  {
    name: "Transit",
    age: "Middle School",
    description:
      "Transit is the weekly teaching environment for 6th–8th grade students. Students experience a combination of music, games, teaching, and small group interaction with a dedicated small group of peers.",
    color: "#4AB5D7",
    href: "/connect/families",
  },
  {
    name: "All Access",
    age: "High School",
    description:
      "All Access is our high school experience (with middle school included) aimed to create moments where students are able to worship, learn, have fun, and be encouraged by our incredible small group leaders.",
    color: "#D8A33A",
    href: "/connect/families",
  },
];

const FALLBACK_PHOTO: Record<string, string> = {
  "Waumba Land": "/brand/ministries/photos/waumba.jpg",
  UpStreet: "/brand/ministries/photos/upstreet.jpg",
  Transit: "/brand/ministries/photos/transit.jpg",
  "All Access": "/brand/ministries/photos/allaccess.jpg",
};

const FALLBACK_MARK: Record<string, string> = {
  "Waumba Land": "/brand/ministries/waumba-mark.png",
  UpStreet: "/brand/ministries/upstreet-mark.png",
  Transit: "/brand/ministries/transit-mark.png",
  "All Access": "/brand/ministries/allaccess-mark.png",
};

export function KidsAndStudents({
  title = FALLBACK_TITLE,
  intro = FALLBACK_INTRO,
  ministries,
}: Props) {
  const cards =
    ministries && ministries.length > 0 ? ministries : FALLBACK_MINISTRIES;

  return (
    <section className="bg-cream-50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-14 text-center">
          <div className="mx-auto mb-5 flex items-center justify-center gap-5">
            <span
              className="h-px w-16 bg-ink-300/50 md:w-24"
              aria-hidden="true"
            />
            <h2 className="font-display text-2xl uppercase tracking-[0.3em] text-ink-700 md:text-3xl">
              {title}
            </h2>
            <span
              className="h-px w-16 bg-ink-300/50 md:w-24"
              aria-hidden="true"
            />
          </div>
          {intro && (
            <p className="mx-auto max-w-3xl text-base leading-7 text-ink-700 md:text-lg md:leading-8">
              {intro}
            </p>
          )}
        </header>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((m, idx) => {
            const photoUrl = m.photo?.asset
              ? urlFor(m.photo).width(900).height(900).url()
              : FALLBACK_PHOTO[m.name];
            const ringColor = m.color ?? "#2aa5ca";
            const markPng = FALLBACK_MARK[m.name];
            const href = m.href || "/connect/families";

            return (
              <Link
                key={`${m.name}-${idx}`}
                href={href}
                className="group block"
              >
                {/* PHOTO CARD with badge overlapping the bottom-left corner */}
                <div className="relative">
                  <div className="aspect-square w-full overflow-hidden rounded-2xl bg-cream-100 shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt={`${m.name} ministry`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{ backgroundColor: ringColor }}
                      />
                    )}
                  </div>

                  {/* Badge — small color circle with white logo, overlapping bottom-left edge */}
                  <div
                    className="absolute -bottom-3 -left-3 flex h-20 w-20 items-center justify-center rounded-full shadow-md ring-4 ring-cream-50 transition-transform duration-500 group-hover:scale-110 md:-bottom-4 md:-left-4 md:h-24 md:w-24"
                    style={{ backgroundColor: ringColor }}
                  >
                    {markPng && (
                      <Image
                        src={markPng}
                        alt={`${m.name} logo`}
                        width={120}
                        height={120}
                        className="h-3/4 w-3/4 object-contain"
                      />
                    )}
                  </div>
                </div>

                {/* Text block */}
                <div className="mt-8">
                  {m.age && (
                    <h3 className="font-body text-2xl font-medium leading-tight text-ink-800 transition-colors group-hover:text-brand-600">
                      {m.age}
                    </h3>
                  )}
                  {m.name && (
                    <p
                      className="mt-1 font-display text-sm uppercase tracking-[0.2em]"
                      style={{ color: ringColor }}
                    >
                      {m.name}
                    </p>
                  )}
                  {m.description && (
                    <p className="mt-3 text-sm leading-6 text-ink-600">
                      {m.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

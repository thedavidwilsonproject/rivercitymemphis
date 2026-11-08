import Link from "next/link";
import Image from "next/image";
import type { SiteSettings } from "@/types/sanity";

const FALLBACK_ADDRESS = {
  line1: "3871 Kirby Whitten Parkway",
  city: "Bartlett",
  state: "TN",
  zip: "38135",
};

const FALLBACK_SOCIALS = {
  facebook: "https://www.facebook.com/RiverCityChurchBartlett",
  instagram: "https://www.instagram.com/rivercitymemphis",
  twitter: "https://twitter.com/rivercitymem",
  vimeo: "https://vimeo.com/rivercitychurch",
};

function httpsOnly(url?: string): string | undefined {
  if (!url) return undefined;
  return url.replace(/^http:\/\//i, "https://");
}

const COLUMNS = [
  {
    title: "Visit",
    links: [
      { label: "What to Expect", href: "/visit/what-to-expect" },
      { label: "Who We Are", href: "/visit/who-we-are" },
      { label: "Location & Time", href: "/visit/location" },
      { label: "Leadership", href: "/visit/leadership" },
      { label: "FAQs", href: "/visit/faqs" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Next Step", href: "/connect/next" },
      { label: "Families", href: "/connect/families" },
      { label: "Groups", href: "/groups" },
      { label: "Volunteer", href: "/connect/volunteer" },
      { label: "Events", href: "/events" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Watch", href: "/watch" },
      { label: "Sermon Archive", href: "/watch/archive" },
      { label: "Give", href: "/give" },
      { label: "Be Rich", href: "/connect/be-rich" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  const address = settings?.address ?? FALLBACK_ADDRESS;
  const rawSocials = settings?.socials ?? FALLBACK_SOCIALS;
  const socials = [
    { label: "Facebook", href: httpsOnly(rawSocials.facebook) },
    { label: "Instagram", href: httpsOnly(rawSocials.instagram) },
    { label: "Vimeo", href: httpsOnly(rawSocials.vimeo) },
    { label: "X / Twitter", href: httpsOnly(rawSocials.twitter) },
    {
      label: "YouTube",
      href: httpsOnly((rawSocials as { youtube?: string }).youtube),
    },
  ].filter((s) => s.href);
  const serviceTime = settings?.serviceTime ?? "Sundays at 10:15 AM";
  const phone = settings?.phone ?? "(901) 386-4171";
  const email = settings?.email ?? "info@rivercitymemphis.org";

  return (
    <footer className="bg-river-950 text-white">
      {/* Sign-off */}
      <div className="mx-auto max-w-[90rem] px-5 pb-16 pt-24 md:px-10 md:pt-32">
        <div className="flex flex-col gap-10 border-b border-white/10 pb-16 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="text-6xl font-bold leading-[0.95] tracking-tight md:text-8xl">
            See you <em className="text-brand-300">Sunday.</em>
          </h2>
          <div className="max-w-sm">
            <p className="text-lg text-white/80">
              {serviceTime}. Coffee starts 15 minutes prior.
            </p>
            <p className="mt-1 text-white/55">
              {address.line1}, {address.city}, {address.state} {address.zip}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/visit/what-to-expect"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition hover:bg-brand-100"
              >
                Plan a Visit
              </Link>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${address.line1}, ${address.city}, ${address.state} ${address.zip}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-12 pt-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Image
              src="/brand/logo-white.svg"
              alt="River City Church"
              width={183}
              height={57}
              className="h-11 w-auto"
            />
            <ul className="mt-6 space-y-1.5 text-white/65">
              <li>
                <a href={`tel:${phone}`} className="hover:text-white">
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="hover:text-white">
                  {email}
                </a>
              </li>
            </ul>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-white/75 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-4 px-5 py-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between md:px-10">
          <p>© {new Date().getFullYear()} River City Church · Bartlett, TN</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { NavItem, SiteSettings } from "@/types/sanity";
import { NavDropdown } from "@/components/nav-dropdown";

type FallbackNavItem = NavItem & { external?: boolean };

const FALLBACK_NAV: FallbackNavItem[] = [
  {
    label: "Visit",
    href: "/visit/who-we-are",
    children: [
      { label: "Who We Are", href: "/visit/who-we-are" },
      { label: "What to Expect", href: "/visit/what-to-expect" },
      { label: "Location & Time", href: "/visit/location" },
      { label: "Leadership", href: "/visit/leadership" },
      { label: "FAQs", href: "/visit/faqs" },
    ],
  },
  {
    label: "Connect",
    href: "/connect",
    children: [
      { label: "Next Step", href: "/connect/next" },
      { label: "Families", href: "/connect/families" },
      { label: "Groups", href: "/groups" },
      { label: "Be Rich", href: "/connect/be-rich" },
      { label: "Volunteer", href: "/connect/volunteer" },
    ],
  },
  {
    label: "Events",
    href: "/events",
    children: [
      { label: "Events & Sign Up", href: "/events" },
      { label: "Calendar", href: "/calendar" },
    ],
  },
  { label: "Watch", href: "/watch" },
  {
    label: "Give",
    href: "/give",
    children: [
      { label: "Ways to Give", href: "/give/ways-to-give" },
      { label: "Be Rich", href: "/connect/be-rich" },
    ],
  },
  {
    label: "Resources",
    href: "https://rcresources.printful.me",
    external: true,
  },
  { label: "Contact", href: "/contact" },
];

function NavLink({
  item,
}: {
  item: FallbackNavItem;
}) {
  const isExternal = item.external || item.href.startsWith("http");
  const linkClass =
    "font-display text-lg uppercase tracking-widest text-ink-700 hover:text-brand-600 transition-colors";

  if (isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {item.label}
      </a>
    );
  }

  if (!item.children?.length) {
    return (
      <Link href={item.href} className={linkClass}>
        {item.label}
      </Link>
    );
  }

  return (
    <NavDropdown label={item.label} href={item.href} children={item.children} />
  );
}

export function SiteHeader({ settings }: { settings: SiteSettings | null }) {
  const nav = (settings?.mainNav?.length
    ? settings.mainNav
    : FALLBACK_NAV) as FallbackNavItem[];
  const siteTitle = settings?.siteTitle ?? "River City Church";

  return (
    <header className="sticky top-0 z-40 border-b border-cream-200/60 bg-[#fdfbf6]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          className="flex items-center text-ink-800 hover:opacity-80 transition"
          aria-label={siteTitle}
        >
          <Image
            src="/brand/logo.svg"
            alt={siteTitle}
            width={183}
            height={57}
            priority
            className="h-10 w-auto md:h-12"
          />
        </Link>
        <nav
          aria-label="Primary"
          className="hidden items-center gap-7 md:flex"
        >
          {nav.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
        <Link
          href="/connect/next"
          className="hidden rounded-full bg-brand-500 px-5 py-2 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600 md:inline-flex"
        >
          New Here?
        </Link>
      </div>
    </header>
  );
}

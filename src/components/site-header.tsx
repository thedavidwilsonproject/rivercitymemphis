import type { NavItem, SiteSettings } from "@/types/sanity";
import { HeaderBar, type HeaderNavItem } from "@/components/header-bar";

const FALLBACK_NAV: HeaderNavItem[] = [
  {
    label: "Visit",
    href: "/visit",
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

export function SiteHeader({ settings }: { settings: SiteSettings | null }) {
  const source = (
    settings?.mainNav?.length ? settings.mainNav : FALLBACK_NAV
  ) as (NavItem & { external?: boolean })[];
  // v2: the top-level "Visit" link opens the /visit hub (not Who We Are).
  const nav = source.map((item) =>
    item.label === "Visit" ? { ...item, href: "/visit" } : item,
  );

  return (
    <HeaderBar
      nav={nav}
      siteTitle={settings?.siteTitle ?? "River City Church"}
      serviceTime={settings?.serviceTime ?? "Sundays at 10:15 AM"}
      address={
        settings?.address
          ? `${settings.address.line1 ?? ""}, ${settings.address.city ?? ""}, ${settings.address.state ?? ""} ${settings.address.zip ?? ""}`
          : "3871 Kirby Whitten Pkwy, Bartlett, TN 38135"
      }
    />
  );
}

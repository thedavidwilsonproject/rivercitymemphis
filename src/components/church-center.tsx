/**
 * Church Center (Planning Center Online) embed primitives.
 *
 * PCO exposes member-facing content (groups, events, registrations, calendar,
 * forms, giving) on a hosted Church Center site. They provide a Modal JS
 * script (`https://js.churchcenter.com/modal/v1`) that intercepts links to
 * churchcenter.com paths and opens them in an in-page modal — so the user
 * never leaves rivercitymemphis.org.
 *
 * For full-page experiences (calendar, full groups directory) we also expose
 * a simple iframe embed component.
 */
import Script from "next/script";

export const CHURCH_CENTER_HOST = "rivercitymemphis.churchcenter.com";

/**
 * Drop this once on any page that needs Church Center modal links.
 * It loads PCO's modal script (~10 KB) and auto-wires `data-open-in-church-center-modal`
 * links to open as overlays.
 */
export function ChurchCenterScript() {
  return (
    <Script
      src="https://js.churchcenter.com/modal/v1"
      strategy="afterInteractive"
    />
  );
}

type CCModalLinkProps = {
  /** Path on churchcenter.com (e.g. "/groups", "/events/123") or full URL. */
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "subtle";
  className?: string;
};

const VARIANTS: Record<NonNullable<CCModalLinkProps["variant"]>, string> = {
  primary:
    "inline-flex items-center justify-center rounded-full bg-ink-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-600",
  secondary:
    "inline-flex items-center justify-center rounded-full border border-ink-900/25 px-7 py-3.5 text-sm font-semibold text-ink-900 transition hover:border-ink-900 hover:bg-ink-900/5",
  subtle:
    "text-sm font-semibold text-ink-900 underline decoration-brand-500 decoration-2 underline-offset-[6px] hover:text-brand-600",
};

/** Link that opens a Church Center page in PCO's modal overlay. */
export function ChurchCenterModalLink({
  href,
  children,
  variant = "primary",
  className,
}: CCModalLinkProps) {
  const url = href.startsWith("http")
    ? href
    : `https://${CHURCH_CENTER_HOST}${href.startsWith("/") ? "" : "/"}${href}`;
  return (
    <a
      href={url}
      data-open-in-church-center-modal="true"
      className={className ?? VARIANTS[variant]}
    >
      {children}
    </a>
  );
}

type CCEmbedProps = {
  /** Path on churchcenter.com — e.g. "/groups", "/calendar", "/registrations". */
  path: string;
  title: string;
  /** Tailwind height class, e.g. "h-[1400px]". */
  heightClass?: string;
};

/**
 * iframe embed of a full Church Center page. Use for browsable lists
 * (groups directory, events list, calendar) when you want the visitor
 * to stay on rivercitymemphis.org and not pop a modal.
 *
 * Note: PCO sets `X-Frame-Options: SAMEORIGIN` on some screens. For those,
 * use ChurchCenterModalLink instead.
 */
export function ChurchCenterEmbed({
  path,
  title,
  heightClass = "h-[1200px] md:h-[1400px]",
}: CCEmbedProps) {
  const src = `https://${CHURCH_CENTER_HOST}${path.startsWith("/") ? "" : "/"}${path}`;
  return (
    <iframe
      src={src}
      title={title}
      loading="lazy"
      className={`w-full ${heightClass} rounded-2xl border border-cream-200 bg-white shadow-sm`}
      // Embed-safe permissions for any PCO interaction inside the frame.
      allow="clipboard-write; payment"
    />
  );
}

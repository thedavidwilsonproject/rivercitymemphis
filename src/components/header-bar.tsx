"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type HeaderNavItem = {
  label: string;
  href: string;
  external?: boolean;
  children?: { label: string; href: string; external?: boolean }[];
};

type Props = {
  nav: HeaderNavItem[];
  siteTitle: string;
  serviceTime: string;
  address: string;
};

/** Top-level links shown inline on desktop; everything else lives in the menu. */
const INLINE = ["Visit", "Watch", "Events", "Give"];

function isExternal(item: { href: string; external?: boolean }) {
  return item.external || item.href.startsWith("http");
}

function SmartLink({
  item,
  className,
  onClick,
  children,
}: {
  item: { href: string; external?: boolean };
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (isExternal(item)) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export function HeaderBar({ nav, siteTitle, serviceTime, address }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  // Menu is "open" only for the path it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof v === "function" ? v(open) : v;
    setOpenOn(next ? pathname : null);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Transparent over the homepage hero until the visitor scrolls.
  const overHero = isHome && !scrolled && !open;
  const light = overHero || open;

  const inline = nav.filter((n) => INLINE.includes(n.label));

  return (
    <>
      <header
        className={`sticky top-0 z-50 h-20 transition-colors duration-300 ${
          open
            ? "bg-transparent"
            : overHero
              ? "bg-transparent"
              : "border-b border-ink-900/5 bg-paper/90 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[90rem] items-center justify-between gap-6 px-5 md:px-10">
          <Link
            href="/"
            aria-label={siteTitle}
            className="relative z-[60] flex items-center transition hover:opacity-80"
          >
            <Image
              src={light ? "/brand/logo-white.svg" : "/brand/logo.svg"}
              alt={siteTitle}
              width={183}
              height={57}
              priority
              className="h-9 w-auto md:h-11"
            />
          </Link>

          <div className="relative z-[60] flex items-center gap-2 md:gap-8">
            <nav
              aria-label="Primary"
              className={`hidden items-center gap-8 lg:flex ${open ? "invisible" : ""}`}
            >
              {inline.map((item) => (
                <SmartLink
                  key={item.href}
                  item={item}
                  className={`text-[15px] font-medium transition-colors ${
                    light
                      ? "text-white/85 hover:text-white"
                      : "text-ink-700 hover:text-brand-600"
                  }`}
                >
                  {item.label}
                </SmartLink>
              ))}
            </nav>

            <Link
              href="/visit/what-to-expect"
              className={`hidden rounded-full px-5 py-2.5 text-sm font-semibold transition sm:inline-flex ${
                light
                  ? "bg-white text-ink-900 hover:bg-brand-100"
                  : "bg-ink-900 text-white hover:bg-brand-600"
              } ${open ? "invisible" : ""}`}
            >
              Plan a Visit
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={`group inline-flex h-11 items-center gap-3 rounded-full pl-4 pr-3 text-sm font-semibold transition ${
                light ? "text-white" : "text-ink-800"
              }`}
            >
              <span className="hidden sm:inline">{open ? "Close" : "Menu"}</span>
              <span className="relative block h-3 w-7" aria-hidden="true">
                <span
                  className="absolute left-0 top-0 h-[2px] w-7 bg-current transition-transform duration-300"
                  style={{
                    transform: open ? "translateY(5px) rotate(45deg)" : "none",
                  }}
                />
                <span
                  className="absolute bottom-0 right-0 h-[2px] bg-current transition-all duration-300"
                  style={{
                    width: open ? "1.75rem" : "1.1rem",
                    transform: open ? "translateY(-5px) rotate(-45deg)" : "none",
                  }}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen menu */}
      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed inset-0 z-40 overflow-y-auto bg-river-950 text-white transition-[opacity,visibility] duration-300 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="mx-auto grid min-h-full max-w-[90rem] gap-14 px-5 pb-16 pt-28 md:px-10 lg:grid-cols-[1.4fr_1fr] lg:pt-36">
          <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {nav.map((item, i) => (
              <li
                key={item.href}
                className={`transition-all duration-500 ${
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
              >
                <SmartLink
                  item={item}
                  onClick={() => setOpen(false)}
                  className="font-serif text-5xl italic leading-none text-white transition hover:text-brand-300 md:text-6xl"
                >
                  {item.label}
                </SmartLink>
                {item.children?.length ? (
                  <ul className="mt-4 space-y-1.5 border-l border-white/15 pl-4">
                    {item.children.map((c) => (
                      <li key={c.href + c.label}>
                        <SmartLink
                          item={c}
                          onClick={() => setOpen(false)}
                          className="text-[15px] text-white/65 transition hover:text-white"
                        >
                          {c.label}
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>

          <aside className="flex flex-col justify-between gap-10 border-t border-white/10 pt-10 lg:border-l lg:border-t-0 lg:pl-14 lg:pt-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                Join us
              </p>
              <p className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                {serviceTime}
              </p>
              <p className="mt-3 text-white/70">{address}</p>
              <p className="mt-1 text-white/50">Coffee starts 15 minutes prior.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/visit/what-to-expect"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition hover:bg-brand-100"
                >
                  Plan a Visit
                </Link>
                <Link
                  href="/watch"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Watch Online
                </Link>
              </div>
            </div>
            <p className="font-serif text-3xl italic text-white/40">
              Refocus your life, home &amp; church back to God.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}

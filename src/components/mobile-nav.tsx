"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavChild = { label: string; href: string; external?: boolean };

type MobileNavItem = {
  label: string;
  href: string;
  external?: boolean;
  children?: NavChild[];
};

type Props = {
  items: MobileNavItem[];
  ctaLabel?: string;
  ctaHref?: string;
};

export function MobileNav({ items, ctaLabel = "New Here?", ctaHref = "/connect/next" }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    setExpanded(null);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-800 transition hover:bg-cream-200/60 md:hidden"
      >
        <span className="relative block h-4 w-6" aria-hidden="true">
          <span
            className={`absolute left-0 top-0 h-0.5 w-6 bg-current transition-all duration-200 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-[7px] h-0.5 w-6 bg-current transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 top-[14px] h-0.5 w-6 bg-current transition-all duration-200 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      <div
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 200ms",
        }}
        className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm md:hidden"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        style={{
          width: "min(88vw, 24rem)",
          height: "100dvh",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 200ms ease-out",
        }}
        className="fixed right-0 top-0 z-50 flex flex-col overflow-y-auto bg-cream-50 shadow-2xl md:hidden"
      >
        <div className="flex items-center justify-between border-b border-cream-200/80 px-5 py-4">
          <span className="font-display text-sm uppercase tracking-widest text-ink-500">
            Menu
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 transition hover:bg-cream-200/60"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobile primary" className="flex-1 px-2 py-3">
          <ul className="flex flex-col">
            {items.map((item) => {
              const hasChildren = !!item.children?.length;
              const isOpen = expanded === item.href;
              const isExternal = item.external || item.href.startsWith("http");

              if (!hasChildren) {
                const linkClass =
                  "block rounded-lg px-4 py-3 font-display text-lg uppercase tracking-widest text-ink-800 transition hover:bg-brand-50 hover:text-brand-700";
                return (
                  <li key={item.href}>
                    {isExternal ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link href={item.href} className={linkClass}>
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : item.href)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between rounded-lg px-4 py-3 font-display text-lg uppercase tracking-widest text-ink-800 transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    <span>{item.label}</span>
                    <svg
                      viewBox="0 0 12 12"
                      className={`h-3 w-3 opacity-60 transition-transform duration-150 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <path
                        d="M2 4l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        fill="none"
                      />
                    </svg>
                  </button>
                  {isOpen && (
                    <ul className="mb-2 ml-3 mt-1 border-l border-cream-200 pl-3">
                      <li>
                        <Link
                          href={item.href}
                          className="block rounded-lg px-3 py-2 font-display text-xs uppercase tracking-widest text-ink-500 transition hover:bg-brand-50 hover:text-brand-700"
                        >
                          Overview
                        </Link>
                      </li>
                      {item.children!.map((child) => (
                        <li key={child.href}>
                          {child.external ? (
                            <a
                              href={child.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-lg px-3 py-2 font-display text-sm uppercase tracking-widest text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
                            >
                              {child.label}
                            </a>
                          ) : (
                            <Link
                              href={child.href}
                              className="block rounded-lg px-3 py-2 font-display text-sm uppercase tracking-widest text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
                            >
                              {child.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-cream-200/80 px-5 py-4">
          <Link
            href={ctaHref}
            className="block w-full rounded-full bg-brand-500 px-5 py-3 text-center font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </>
  );
}

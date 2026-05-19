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

const itemClass =
  "block rounded-lg px-4 py-3 font-display text-lg uppercase tracking-widest text-ink-800 transition active:bg-brand-50";

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

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-800 md:hidden"
      >
        <span className="relative block h-4 w-6" aria-hidden="true">
          <span
            className="absolute left-0 h-0.5 w-6 bg-current"
            style={{
              top: 0,
              transform: open ? "translateY(7px) rotate(45deg)" : "none",
              transition: "transform 200ms",
            }}
          />
          <span
            className="absolute left-0 h-0.5 w-6 bg-current"
            style={{
              top: "7px",
              opacity: open ? 0 : 1,
              transition: "opacity 200ms",
            }}
          />
          <span
            className="absolute left-0 h-0.5 w-6 bg-current"
            style={{
              top: "14px",
              transform: open ? "translateY(-7px) rotate(-45deg)" : "none",
              transition: "transform 200ms",
            }}
          />
        </span>
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="absolute left-0 right-0 top-full z-50 border-t border-cream-200 bg-cream-50 shadow-lg md:hidden"
        >
          <nav
            aria-label="Mobile primary"
            className="max-h-[calc(100dvh-5rem)] overflow-y-auto px-3 py-3"
          >
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => {
                const hasChildren = !!item.children?.length;
                const isOpen = expanded === item.href;
                const isExternal =
                  item.external || (item.href && item.href.startsWith("http"));

                if (!hasChildren) {
                  return (
                    <li key={item.href || item.label}>
                      {isExternal ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={itemClass}
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          href={item.href || "#"}
                          className={itemClass}
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.href || item.label}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded(isOpen ? null : item.href || item.label)
                      }
                      aria-expanded={isOpen}
                      className={`${itemClass} flex w-full items-center justify-between`}
                    >
                      <span>{item.label}</span>
                      <span
                        aria-hidden="true"
                        style={{
                          display: "inline-block",
                          transform: isOpen ? "rotate(180deg)" : "none",
                          transition: "transform 150ms",
                          fontSize: "0.75rem",
                          opacity: 0.6,
                        }}
                      >
                        ▾
                      </span>
                    </button>
                    {isOpen && (
                      <ul className="mb-1 ml-3 border-l border-cream-200 pl-2">
                        <li>
                          <Link
                            href={item.href || "#"}
                            onClick={() => setOpen(false)}
                            className="block rounded-lg px-3 py-2 font-display text-xs uppercase tracking-widest text-ink-500 active:bg-brand-50"
                          >
                            Overview
                          </Link>
                        </li>
                        {item.children!.map((child) => (
                          <li key={child.href || child.label}>
                            {child.external ? (
                              <a
                                href={child.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setOpen(false)}
                                className="block rounded-lg px-3 py-2 font-display text-sm uppercase tracking-widest text-ink-700 active:bg-brand-50"
                              >
                                {child.label}
                              </a>
                            ) : (
                              <Link
                                href={child.href || "#"}
                                onClick={() => setOpen(false)}
                                className="block rounded-lg px-3 py-2 font-display text-sm uppercase tracking-widest text-ink-700 active:bg-brand-50"
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
              <li className="mt-2 px-1 pb-1">
                <Link
                  href={ctaHref}
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-full bg-brand-500 px-5 py-3 text-center font-display text-sm uppercase tracking-widest text-white"
                >
                  {ctaLabel}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}

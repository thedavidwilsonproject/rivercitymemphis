"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavChild = { label: string; href: string; external?: boolean };

type Props = {
  label: string;
  href: string;
  children: NavChild[];
};

/**
 * Hover/focus dropdown with explicit open state so the menu reliably closes:
 *   - When a child link is clicked
 *   - When the route changes (Next.js navigation)
 *   - When the user presses Escape
 *   - When focus or hover leaves the dropdown area
 */
export function NavDropdown({ label, href, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close whenever the URL changes (after a click navigates to a new page).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close when focus leaves the entire dropdown.
  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!ref.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  }

  const linkClass =
    "font-display text-lg uppercase tracking-widest text-ink-700 hover:text-brand-600 transition-colors";

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={handleBlur}
    >
      <Link
        href={href}
        className={`${linkClass} inline-flex items-center gap-1`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(false)}
      >
        {label}
        <svg
          className={`h-3 w-3 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          } opacity-60`}
          fill="currentColor"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </Link>
      <div
        className={`absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 transition-all duration-150 ${
          open
            ? "visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        }`}
      >
        <ul
          role="menu"
          className="min-w-[220px] rounded-2xl border border-cream-200 bg-[#fdfbf6] py-2 shadow-lg"
        >
          {children.map((child) => {
            const className =
              "block px-5 py-2 font-display text-sm uppercase tracking-widest text-ink-700 transition hover:bg-brand-50 hover:text-brand-700";
            const handleClick = (
              e: React.MouseEvent<HTMLAnchorElement>,
            ) => {
              setOpen(false);
              e.currentTarget.blur();
            };
            return (
              <li key={child.href} role="none">
                {child.external ? (
                  <a
                    role="menuitem"
                    href={child.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                    onClick={handleClick}
                  >
                    {child.label}
                  </a>
                ) : (
                  <Link
                    role="menuitem"
                    href={child.href}
                    className={className}
                    onClick={handleClick}
                  >
                    {child.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

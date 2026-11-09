"use client";

import { usePathname } from "next/navigation";

/**
 * Design v2 prototype only: floating pill that opens the same page on the
 * live (original-design) site, for side-by-side comparison.
 */
export function PrototypeBadge() {
  const pathname = usePathname() || "/";
  return (
    <a
      href={`https://rivercitymemphis.org${pathname}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-[70] inline-flex items-center gap-2 rounded-full bg-ink-900/90 py-2 pl-3 pr-4 text-xs font-semibold text-white shadow-lg backdrop-blur transition hover:bg-brand-800"
    >
      <span className="rounded-full bg-brand-400 px-2 py-0.5 text-[11px] uppercase tracking-wider text-ink-900">
        Prototype v2
      </span>
      View original ↗
    </a>
  );
}

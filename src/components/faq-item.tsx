"use client";

import { useId, useState } from "react";
import { PortableText } from "@portabletext/react";

type Props = {
  question: string;
  answer: unknown;
};

export function FaqItem({ question, answer }: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left transition hover:text-brand-700"
      >
        <span
          className={`font-display text-xl uppercase tracking-wide transition-colors ${
            open ? "text-brand-700" : "text-ink-800"
          }`}
        >
          {question}
        </span>
        <svg
          className={`h-5 w-5 flex-none text-brand-500 transition-transform duration-500 ${
            open ? "rotate-45" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 5v14M5 12h14"
          />
        </svg>
      </button>
      <div
        id={id}
        className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`prose prose-slab max-w-none pb-6 pr-10 text-ink-700 transition-opacity duration-300 ${
              open ? "opacity-100 delay-200" : "opacity-0"
            }`}
          >
            <PortableText
              value={answer as Parameters<typeof PortableText>[0]["value"]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

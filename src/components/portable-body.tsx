import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/image";

type Span = { text?: string };
type Block =
  | { _type: "block"; children?: Span[]; style?: string; listItem?: string }
  | { _type: "image"; asset?: unknown };

/**
 * Filters out empty blocks (whitespace-only spans) from migrated Portable
 * Text so legacy noise doesn't render as huge vertical gaps.
 */
function cleanBlocks(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [];
  return (value as Block[]).filter((b) => {
    if (b._type !== "block") return true;
    const text = (b.children ?? [])
      .map((c) => c.text ?? "")
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    return text.length > 0;
  });
}

const components = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-5 text-lg leading-8 text-ink-700 last:mb-0">
        {children}
      </p>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="mt-12 mb-4 font-display text-3xl uppercase tracking-wide text-ink-800">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="mt-8 mb-3 font-display text-2xl uppercase tracking-wide text-ink-800">
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="mt-6 mb-2 font-display text-xl uppercase tracking-widest text-brand-600">
        {children}
      </h4>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="my-6 border-l-4 border-brand-500 pl-5 italic text-ink-600">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="mb-5 list-disc space-y-2 pl-6 text-lg leading-8 text-ink-700">
        {children}
      </ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="mb-5 list-decimal space-y-2 pl-6 text-lg leading-8 text-ink-700">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-ink-800">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    link: ({
      value,
      children,
    }: {
      value?: { href?: string; blank?: boolean };
      children?: React.ReactNode;
    }) => (
      <a
        href={value?.href}
        target={value?.blank ? "_blank" : undefined}
        rel={value?.blank ? "noopener noreferrer" : undefined}
        className="text-brand-600 underline-offset-4 hover:underline"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({
      value,
    }: {
      value?: { asset?: unknown; alt?: string };
    }) =>
      value?.asset ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={urlFor(value as Parameters<typeof urlFor>[0])
            .width(1200)
            .url()}
          alt={value.alt ?? ""}
          className="my-8 w-full rounded-xl"
        />
      ) : null,
  },
};

export function PortableBody({ value }: { value: unknown }) {
  const blocks = cleanBlocks(value);
  if (blocks.length === 0) return null;
  return (
    <PortableText
      value={blocks as Parameters<typeof PortableText>[0]["value"]}
      components={components}
    />
  );
}

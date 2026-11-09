import Link from "next/link";
import { formatPublished, type YtVideo } from "@/lib/youtube";

/** Small meta line: "Part 3 · Rhythms of Grace · 6 days ago". */
export function videoMeta(
  v: YtVideo,
  { withSeries = true, withPart = true } = {},
): string {
  return [
    withPart && v.part && !v.title.includes(v.part) ? v.part : undefined,
    withSeries && v.series && !v.title.includes(v.series) ? v.series : undefined,
    v.speaker,
    formatPublished(v),
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Thumbnail card linking to the on-site player at /watch/video/[id]. */
export function VideoCard({
  v,
  tone = "dark",
  size = "md",
  withSeries = true,
}: {
  v: YtVideo;
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  withSeries?: boolean;
}) {
  const dark = tone === "dark";
  return (
    <Link href={`/watch/video/${v.id}`} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-river-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={v.thumbnail}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute inset-0 grid place-items-center bg-black/0 transition group-hover:bg-black/25">
          <span className="grid h-14 w-14 scale-90 place-items-center rounded-full bg-white/95 text-river-950 opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" fill="currentColor" aria-hidden="true">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.05-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
            </svg>
          </span>
        </span>
        {v.duration && (
          <span className="absolute bottom-3 right-3 rounded-md bg-black/75 px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
            {v.duration}
          </span>
        )}
        {v.kind === "stream" && (
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
            Full service
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <h3
          className={`font-bold leading-tight tracking-tight transition ${
            size === "lg" ? "text-3xl md:text-4xl" : size === "sm" ? "text-lg" : "text-xl md:text-2xl"
          } ${dark ? "text-white group-hover:text-brand-300" : "text-ink-900 group-hover:text-brand-600"}`}
        >
          {v.title}
        </h3>
        <p className={`text-sm ${dark ? "text-white/50" : "text-ink-500"}`}>
          {videoMeta(v, { withSeries })}
        </p>
      </div>
    </Link>
  );
}

const YT_ICON = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
  </svg>
);

/** Pill linking out to YouTube with the YouTube glyph. */
export function YouTubeLink({
  href,
  children,
  tone = "dark",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "dark" | "light";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
        tone === "dark"
          ? "border-white/25 text-white hover:bg-white/10"
          : "border-ink-900/15 text-ink-900 hover:bg-ink-900/5"
      }`}
    >
      {YT_ICON}
      {children}
    </a>
  );
}

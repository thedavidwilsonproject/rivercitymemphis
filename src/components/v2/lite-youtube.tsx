"use client";

import { useState } from "react";

/**
 * Click-to-load YouTube player. Shows the thumbnail + play button and only
 * mounts the (heavy) iframe once the visitor presses play.
 */
export function LiteYouTube({
  id,
  title,
  thumbnail,
  className = "",
  autoload = false,
}: {
  id: string;
  title: string;
  thumbnail?: string;
  className?: string;
  /** Mount the iframe immediately (e.g. on a dedicated video page). */
  autoload?: boolean;
}) {
  const [playing, setPlaying] = useState(autoload);
  const thumb = thumbnail ?? `https://i.ytimg.com/vi/${id}/hq720.jpg`;

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/30 ${className}`}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1${autoload ? "" : "&autoplay=1"}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play: ${title}`}
          className="group absolute inset-0 block h-full w-full cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-river-950 shadow-xl transition group-hover:scale-110 group-hover:bg-white md:h-24 md:w-24">
            <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 md:h-10 md:w-10" fill="currentColor" aria-hidden="true">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.05-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}

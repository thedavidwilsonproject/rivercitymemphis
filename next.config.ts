import type { NextConfig } from "next";

// CSP whitelists — narrow on purpose. Each entry must justify a real third party we load.
const SCRIPT_SRC = [
  "'self'",
  "'unsafe-inline'", // Next.js inline hydration scripts (no nonce middleware yet)
  "'unsafe-eval'", // required by some third-party libs + Vercel toolbar
  "https://js.churchcenter.com",
  "https://vercel.live",
];
const STYLE_SRC = ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"];
const IMG_SRC = [
  "'self'",
  "data:",
  "blob:",
  "https://cdn.sanity.io",
  "https://i.vimeocdn.com",
  "https://img.youtube.com",
  "https://i.ytimg.com",
  "https://*.googleusercontent.com",
  "https://*.gstatic.com",
  "https://*.googleapis.com",
  // Planning Center / Church Center event logos + avatars
  "https://registrations-production.s3.amazonaws.com",
  "https://avatars.planningcenteronline.com",
  "https://*.churchcenter.com",
];
const FONT_SRC = ["'self'", "data:", "https://fonts.gstatic.com"];
const FRAME_SRC = [
  "'self'",
  "https://player.vimeo.com",
  "https://www.youtube-nocookie.com",
  "https://www.youtube.com",
  "https://maps.google.com",
  "https://www.google.com",
  "https://churchcenter.com",
  "https://*.churchcenter.com",
];
const CONNECT_SRC = [
  "'self'",
  "https://cdn.sanity.io",
  "https://*.sanity.io",
  "https://*.churchcenter.com",
  "https://vercel.live",
  "wss://ws-us3.pusher.com", // Vercel toolbar realtime
];
const MEDIA_SRC = ["'self'", "https://cdn.sanity.io", "https://*.vimeocdn.com"];

const CSP = [
  "default-src 'self'",
  `script-src ${SCRIPT_SRC.join(" ")}`,
  `style-src ${STYLE_SRC.join(" ")}`,
  `img-src ${IMG_SRC.join(" ")}`,
  `font-src ${FONT_SRC.join(" ")}`,
  `frame-src ${FRAME_SRC.join(" ")}`,
  `connect-src ${CONNECT_SRC.join(" ")}`,
  `media-src ${MEDIA_SRC.join(" ")}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.churchcenter.com mailto:",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Override Vercel's edge-injected wildcard ACAO on HTML responses.
  // Same-origin requests don't trigger CORS; cross-origin readers get nothing.
  { key: "Access-Control-Allow-Origin", value: "https://rivercitymemphis.org" },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
      "interest-cohort=()",
    ].join(", "),
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // Preserve inbound links from the old Drupal site by 301-ing legacy slugs
  // to their new canonical paths.
  async redirects() {
    return [
      { source: "/visit/what-expect", destination: "/visit/what-to-expect", permanent: true },
      { source: "/visit/location-and-time", destination: "/visit/location", permanent: true },
      { source: "/give/ways-give", destination: "/give", permanent: true },
      { source: "/rss.xml", destination: "/watch", permanent: false },
    ];
  },

  async headers() {
    // Subset of security headers safe for Studio (no CSP — Sanity Studio loads
    // its own bundled SPA from cdn.sanity.io with workers and dynamic chunks).
    const studioSafeHeaders = SECURITY_HEADERS.filter(
      (h) => h.key !== "Content-Security-Policy",
    );

    return [
      {
        source: "/studio/:path*",
        headers: studioSafeHeaders,
      },
      {
        source: "/((?!studio).*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;

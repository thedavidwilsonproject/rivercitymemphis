import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Preserve inbound links from the old Drupal site by 301-ing legacy slugs
  // to their new canonical paths. Anything not listed here either kept its
  // slug verbatim (e.g. /visit/who-we-are, every /watch/<series>, /connect/*)
  // or is handled by the catch-all CMS route.
  async redirects() {
    return [
      { source: "/visit/what-expect", destination: "/visit/what-to-expect", permanent: true },
      { source: "/visit/location-and-time", destination: "/visit/location", permanent: true },
      { source: "/give/ways-give", destination: "/give", permanent: true },
      // Drupal-style category page that's now folded into the main archive.
      { source: "/rss.xml", destination: "/watch", permanent: false },
    ];
  },

  // Sanity hosts images on cdn.sanity.io — register it for next/image optimization.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;

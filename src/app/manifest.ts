import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "River City Church",
    short_name: "RCC",
    description:
      "A non-denominational church in Bartlett, TN. Sundays at 10:15 AM.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfbf6",
    theme_color: "#2aa5ca",
    icons: [
      {
        src: "/brand/logo-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}

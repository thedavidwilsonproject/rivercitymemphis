import type { Metadata } from "next";
import { Bebas_Neue, Roboto_Slab } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { client } from "@/sanity/client";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/types/sanity";
import { ORG, SITE_URL } from "@/lib/site";

const display = Bebas_Neue({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = Roboto_Slab({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "River City Church — Bartlett, TN",
    template: "%s | River City Church",
  },
  description:
    "A non-denominational church in Bartlett, TN. Sundays at 10:15 AM. Family Ministry for infants through 8th grade.",
  applicationName: "River City Church",
  authors: [{ name: "River City Church" }],
  creator: "River City Church",
  publisher: "River City Church",
  keywords: [
    "River City Church",
    "Bartlett TN church",
    "Memphis church",
    "non-denominational church Memphis",
    "Jonathan Dunn",
    "Sunday service Bartlett",
    "family ministry Bartlett",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "River City Church",
    title: "River City Church — Bartlett, TN",
    description:
      "A non-denominational church in Bartlett, TN. Sundays at 10:15 AM.",
    url: SITE_URL,
    images: [
      {
        url: "/brand/hero-poster.webp",
        width: 1920,
        height: 1080,
        alt: "River City Church — Bartlett, TN",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "River City Church — Bartlett, TN",
    description:
      "A non-denominational church in Bartlett, TN. Sundays at 10:15 AM.",
    images: ["/brand/hero-poster.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: SITE_URL },
  category: "religion",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let settings: SiteSettings | null = null;
  try {
    settings = await client.fetch<SiteSettings | null>(siteSettingsQuery);
  } catch {
    // Sanity not configured yet — render with fallback content.
  }

  const churchJsonLd = {
    "@context": "https://schema.org",
    "@type": "Church",
    "@id": `${SITE_URL}#church`,
    name: ORG.name,
    legalName: ORG.legalName,
    url: ORG.url,
    logo: ORG.logo,
    image: `${SITE_URL}/brand/hero-poster.webp`,
    email: ORG.email,
    telephone: ORG.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: ORG.address.street,
      addressLocality: ORG.address.locality,
      addressRegion: ORG.address.region,
      postalCode: ORG.address.postalCode,
      addressCountry: ORG.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: ORG.geo.latitude,
      longitude: ORG.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ORG.serviceTime.day,
        opens: ORG.serviceTime.opens,
        closes: ORG.serviceTime.closes,
        description: ORG.serviceTime.description,
      },
    ],
    sameAs: ORG.socials,
  };

  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={churchJsonLd} />
        <SiteHeader settings={settings} />
        <main className="flex-1">{children}</main>
        <SiteFooter settings={settings} />
      </body>
    </html>
  );
}

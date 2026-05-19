import type { Metadata } from "next";
import { Bebas_Neue, Roboto_Slab } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { client } from "@/sanity/client";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/types/sanity";

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
  metadataBase: new URL("https://rivercitymemphis.org"),
  title: {
    default: "River City Church — Bartlett, TN",
    template: "%s | River City Church",
  },
  description:
    "A church in Bartlett, TN partnering with God to lead people to refocus their life, home, and church back to God.",
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

  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader settings={settings} />
        <main className="flex-1">{children}</main>
        <SiteFooter settings={settings} />
      </body>
    </html>
  );
}

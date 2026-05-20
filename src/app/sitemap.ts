import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";
import {
  sermonSeriesIndexQuery,
  sermonArchiveYearsQuery,
} from "@/sanity/queries";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/visit/who-we-are", priority: 0.9, changeFrequency: "monthly" },
  { path: "/visit/what-to-expect", priority: 0.9, changeFrequency: "monthly" },
  { path: "/visit/location", priority: 0.9, changeFrequency: "monthly" },
  { path: "/visit/leadership", priority: 0.7, changeFrequency: "monthly" },
  { path: "/visit/faqs", priority: 0.7, changeFrequency: "monthly" },
  { path: "/connect", priority: 0.8, changeFrequency: "monthly" },
  { path: "/connect/next", priority: 0.7, changeFrequency: "monthly" },
  { path: "/connect/families", priority: 0.7, changeFrequency: "monthly" },
  { path: "/connect/be-rich", priority: 0.7, changeFrequency: "monthly" },
  { path: "/connect/volunteer", priority: 0.6, changeFrequency: "monthly" },
  { path: "/groups", priority: 0.8, changeFrequency: "weekly" },
  { path: "/events", priority: 0.8, changeFrequency: "weekly" },
  { path: "/calendar", priority: 0.7, changeFrequency: "weekly" },
  { path: "/watch", priority: 0.9, changeFrequency: "weekly" },
  { path: "/watch/archive", priority: 0.6, changeFrequency: "monthly" },
  { path: "/give", priority: 0.7, changeFrequency: "monthly" },
  { path: "/give/ways-to-give", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let seriesEntries: MetadataRoute.Sitemap = [];
  let yearEntries: MetadataRoute.Sitemap = [];

  try {
    const series = await client.fetch<{ slug?: string; endDate?: string; startDate?: string }[]>(
      sermonSeriesIndexQuery,
    );
    seriesEntries = (series ?? [])
      .filter((s) => s.slug)
      .map((s) => ({
        url: `${SITE_URL}/watch/${s.slug}`,
        lastModified: s.endDate || s.startDate ? new Date(s.endDate || s.startDate!) : now,
        changeFrequency: "monthly",
        priority: 0.6,
      }));

    const years = await client.fetch<{ year?: string }[]>(sermonArchiveYearsQuery);
    const uniqueYears = Array.from(
      new Set((years ?? []).map((y) => y.year).filter(Boolean) as string[]),
    );
    yearEntries = uniqueYears.map((year) => ({
      url: `${SITE_URL}/watch/archive/${year}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    }));
  } catch {
    // Sanity unreachable at build time — ship static routes only.
  }

  return [...staticEntries, ...seriesEntries, ...yearEntries];
}

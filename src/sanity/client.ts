import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

// Read token — server-side only (this client is only imported from server
// components / route handlers, so the token never reaches the browser).
// Falls back to anonymous reads if no token is set, which only works when
// the dataset is publicly readable.
const token =
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN;

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Disable CDN when authenticated so token-gated reads aren't served from
  // a stale unauthenticated cache. With useCdn:false we get fresh data on
  // every request; revalidate config on individual fetches still controls
  // caching at the Next.js layer.
  useCdn: !token,
  token,
  perspective: "published",
});

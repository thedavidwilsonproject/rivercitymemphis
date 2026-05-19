// Sanity env. We intentionally don't throw at module load so the app builds
// before a Sanity project is provisioned — fetches will simply fail and be
// caught by the call sites, which render fallback content.

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "placeholder";
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-17";

export const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== undefined &&
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder" &&
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "";

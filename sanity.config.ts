import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "@/sanity/schemaTypes";
import { structure } from "@/sanity/structure";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-17";

export default defineConfig({
  name: "rivercity",
  title: "River City Church",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  schema: { types: schemaTypes },
  // Disable Content Releases — it's a paid feature on Sanity's higher tiers
  // (the Releases tab says "talk to sales") and the new Studio routes the
  // publish UI through it, hiding the per-document Publish button on free
  // tier. Disabling restores the classic footer Publish action.
  releases: { enabled: false },
});

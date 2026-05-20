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
  // Disable Content Releases AND Scheduled Publishing — both are paid features
  // on Sanity's higher tiers and the new Studio routes the publish UI through
  // them, hiding the per-document Publish button on free tier. Disabling both
  // restores the classic footer Publish action.
  releases: { enabled: false },
  scheduledPublishing: { enabled: false },
});

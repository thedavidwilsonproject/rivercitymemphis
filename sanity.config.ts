import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "@/sanity/schemaTypes";
import { structure } from "@/sanity/structure";
import { customPublishAction } from "@/sanity/actions/publishAction";

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
  // them, hiding the per-document Publish button on free tier.
  releases: { enabled: false },
  scheduledPublishing: { enabled: false },
  // Inject a custom Publish action at the front of the action list. Sanity v5
  // hides its default per-document Publish on free tier (because publishing is
  // routed through paid Content Releases), so we render our own button that
  // calls the same underlying publish operation. Always visible, always
  // clickable when there's a draft to publish.
  document: {
    actions: (prev) => [
      customPublishAction,
      // Keep the default non-publish actions (discard, duplicate, delete, etc.)
      ...prev.filter((a) => a.action !== "publish"),
    ],
  },
});

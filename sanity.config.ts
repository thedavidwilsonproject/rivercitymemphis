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
  // Prepend a guaranteed-visible custom Publish action without filtering out
  // any defaults. We don't disable releases or scheduledPublishing — leaving
  // them at defaults so Sanity renders its normal action UI; our action
  // becomes one of the listed actions (possibly duplicate of default publish,
  // which is fine for now).
  document: {
    actions: (prev) => [customPublishAction, ...prev],
  },
});

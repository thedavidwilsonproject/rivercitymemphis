import { defineType, defineField } from "sanity";

/**
 * "Connect" hub page singleton — the four-card hub that links to
 * Next, Family Ministries, Groups, and Be Rich.
 */
export const connectPage = defineType({
  name: "connectPage",
  title: "Connect Page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({
          name: "headline",
          type: "string",
          validation: (r) => r.required(),
        }),
        defineField({ name: "intro", type: "text", rows: 3 }),
        defineField({
          name: "image",
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", type: "string", title: "Alt text" }],
        }),
      ],
    }),
    defineField({
      name: "cards",
      title: "Hub cards",
      description:
        "Four cards shown in a 2x2 grid linking to the Connect sub-pages. The first card is featured (larger / accent style).",
      type: "array",
      validation: (r) => r.min(1).max(8),
      of: [
        {
          type: "object",
          name: "card",
          fields: [
            defineField({ name: "eyebrow", type: "string" }),
            defineField({
              name: "title",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({ name: "blurb", type: "text", rows: 3 }),
            defineField({
              name: "href",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "ctaLabel",
              type: "string",
              description: "Defaults to “Learn more →”.",
            }),
            defineField({
              name: "image",
              type: "image",
              options: { hotspot: true },
              fields: [{ name: "alt", type: "string", title: "Alt text" }],
            }),
            defineField({
              name: "featured",
              type: "boolean",
              description: "Featured cards render full-width with larger type.",
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "href", media: "image" },
          },
        },
      ],
    }),
    defineField({
      name: "cta",
      title: "Bottom CTA",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "body", type: "text", rows: 3 }),
        defineField({
          name: "primaryCta",
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "href", type: "string" },
          ],
        }),
        defineField({
          name: "secondaryCta",
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "href", type: "string" },
          ],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Connect Page" }) },
});

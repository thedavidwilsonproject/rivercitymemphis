import { defineType, defineField } from "sanity";

/**
 * "Next" page singleton — /connect/next.
 * A short, focused landing page for the monthly Next info session.
 */
export const nextPage = defineType({
  name: "nextPage",
  title: "Next Page",
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
      name: "intro",
      title: "Intro section (two-column with image)",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "body", type: "blockContent" }),
        defineField({
          name: "image",
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", type: "string", title: "Alt text" }],
        }),
        defineField({
          name: "imageCaption",
          type: "string",
          description: "Optional caption shown below the image.",
        }),
      ],
    }),
    defineField({
      name: "whatToExpect",
      title: "What to expect (tiles)",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({
          name: "items",
          type: "array",
          validation: (r) => r.min(1).max(8),
          of: [
            {
              type: "object",
              name: "item",
              fields: [
                defineField({
                  name: "title",
                  type: "string",
                  validation: (r) => r.required(),
                }),
                defineField({ name: "description", type: "text", rows: 3 }),
              ],
              preview: {
                select: { title: "title", subtitle: "description" },
              },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "quickFacts",
      title: "Quick facts (3 boxes)",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        ...["when", "where", "duration"].flatMap((f) => [
          defineField({
            name: f,
            type: "object",
            fields: [
              { name: "label", type: "string" },
              { name: "value", type: "string" },
              { name: "note", type: "string" },
            ],
          }),
        ]),
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
  preview: { prepare: () => ({ title: "Next Page" }) },
});

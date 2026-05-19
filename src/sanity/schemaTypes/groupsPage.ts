import { defineType, defineField } from "sanity";

/**
 * "RCC Groups" page singleton — /groups.
 * Hero + intro + group kinds (Community Groups, Focus Groups)
 * + how-to-join steps + Church Center embed + CTA.
 */
export const groupsPage = defineType({
  name: "groupsPage",
  title: "RCC Groups Page",
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
      title: "Intro section",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "body", type: "blockContent" }),
      ],
    }),
    defineField({
      name: "kinds",
      title: "Group kinds (Community / Focus)",
      type: "array",
      validation: (r) => r.min(1).max(6),
      of: [
        {
          type: "object",
          name: "groupKind",
          fields: [
            defineField({
              name: "eyebrow",
              type: "string",
              description: "e.g., 'For adults in similar seasons'",
            }),
            defineField({
              name: "name",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "format",
              type: "string",
              description: "e.g., '10–12 adults · meets weekly in homes'",
            }),
            defineField({ name: "schedule", type: "string" }),
            defineField({ name: "blurb", type: "text", rows: 4 }),
            defineField({
              name: "highlights",
              title: "Highlights",
              description: "Short bullet phrases shown as pill tags.",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "image",
              type: "image",
              options: { hotspot: true },
              fields: [{ name: "alt", type: "string", title: "Alt text" }],
            }),
            defineField({ name: "ctaLabel", type: "string" }),
            defineField({ name: "ctaHref", type: "string" }),
          ],
          preview: {
            select: { title: "name", subtitle: "format", media: "image" },
          },
        },
      ],
    }),
    defineField({
      name: "join",
      title: "How to join",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "intro", type: "text", rows: 3 }),
        defineField({
          name: "steps",
          type: "array",
          of: [
            {
              type: "object",
              name: "step",
              fields: [
                defineField({
                  name: "title",
                  type: "string",
                  validation: (r) => r.required(),
                }),
                defineField({ name: "description", type: "text", rows: 3 }),
              ],
              preview: { select: { title: "title", subtitle: "description" } },
            },
          ],
        }),
        defineField({ name: "footnote", type: "text", rows: 2 }),
      ],
    }),
    defineField({
      name: "embed",
      title: "Church Center embed",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "intro", type: "text", rows: 2 }),
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
  preview: { prepare: () => ({ title: "RCC Groups Page" }) },
});

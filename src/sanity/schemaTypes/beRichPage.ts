import { defineType, defineField } from "sanity";

/**
 * "Be Rich" page singleton — /connect/be-rich.
 * RCC's outward-facing campaign — "Do more. Give more."
 * Hero + intro + partner grid + how-to-give CTA.
 */
export const beRichPage = defineType({
  name: "beRichPage",
  title: "Be Rich Page",
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
          description: "Wordmark text, e.g. 'BE RICH'",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "tagline",
          type: "string",
          description: "e.g. 'Do more. Give more.'",
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
      title: "Why we do this",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "body", type: "blockContent" }),
      ],
    }),
    defineField({
      name: "partnersSection",
      title: "Partners section",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "intro", type: "text", rows: 3 }),
        defineField({
          name: "partners",
          type: "array",
          validation: (r) => r.min(1).max(12),
          of: [
            {
              type: "object",
              name: "partner",
              fields: [
                defineField({
                  name: "scope",
                  title: "Scope",
                  type: "string",
                  description:
                    "Where the work happens — Local, National, or Global.",
                  options: {
                    list: [
                      { title: "Local", value: "local" },
                      { title: "National", value: "national" },
                      { title: "Global", value: "global" },
                    ],
                    layout: "radio",
                  },
                }),
                defineField({
                  name: "name",
                  type: "string",
                  validation: (r) => r.required(),
                }),
                defineField({ name: "blurb", type: "text", rows: 4 }),
                defineField({
                  name: "url",
                  type: "url",
                  description: "Partner organization website (optional)",
                }),
              ],
              preview: {
                select: { title: "name", subtitle: "scope" },
              },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "cta",
      title: "How to give CTA",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
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
  preview: { prepare: () => ({ title: "Be Rich Page" }) },
});

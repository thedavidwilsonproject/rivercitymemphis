import { defineType, defineField } from "sanity";

/**
 * "Family Ministry" page singleton — /connect/families.
 * Hero + intro + 3 environment cards (Waumba Land, UpStreet, Students)
 * + Check-In how-it-works + CTA.
 */
export const familiesPage = defineType({
  name: "familiesPage",
  title: "Family Ministry Page",
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
      name: "environments",
      title: "Environments (Waumba Land, UpStreet, Students)",
      type: "array",
      validation: (r) => r.min(1).max(6),
      of: [
        {
          type: "object",
          name: "environment",
          fields: [
            defineField({ name: "eyebrow", type: "string", description: "e.g., 'For your littles'" }),
            defineField({
              name: "name",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "ageRange",
              type: "string",
              description: "e.g., 'Ages 6 weeks – Pre-K'",
            }),
            defineField({ name: "schedule", type: "string" }),
            defineField({ name: "blurb", type: "text", rows: 4 }),
            defineField({
              name: "coreTruths",
              title: "Core truths",
              description: "Short statements (typically 3) shown as pill tags.",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "image",
              type: "image",
              options: { hotspot: true },
              fields: [{ name: "alt", type: "string", title: "Alt text" }],
            }),
            defineField({ name: "facebookUrl", type: "url" }),
          ],
          preview: {
            select: { title: "name", subtitle: "ageRange", media: "image" },
          },
        },
      ],
    }),
    defineField({
      name: "checkin",
      title: "Check-In section",
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
  preview: { prepare: () => ({ title: "Family Ministry Page" }) },
});

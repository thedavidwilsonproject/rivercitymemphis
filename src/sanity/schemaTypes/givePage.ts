import { defineType, defineField } from "sanity";

/**
 * "Ways to Give" page singleton — /give.
 * Hero + verse + intro + ways-to-give grid + trust signals (501c3, Dime).
 */
export const givePage = defineType({
  name: "givePage",
  title: "Give Page",
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
      name: "verse",
      title: "Scripture quote",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "text", type: "text", rows: 3 }),
        defineField({
          name: "reference",
          type: "string",
          description: "e.g. '2 Corinthians 9:7'",
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
      name: "waysSection",
      title: "Ways to give",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "intro", type: "text", rows: 3 }),
        defineField({
          name: "ways",
          type: "array",
          validation: (r) => r.min(1).max(8),
          of: [
            {
              type: "object",
              name: "wayToGive",
              fields: [
                defineField({
                  name: "name",
                  type: "string",
                  validation: (r) => r.required(),
                }),
                defineField({ name: "blurb", type: "text", rows: 4 }),
                defineField({
                  name: "ctaLabel",
                  type: "string",
                  description: "e.g. 'Give online'",
                }),
                defineField({
                  name: "ctaHref",
                  type: "string",
                  description:
                    "URL — supports churchcenter.com paths (opens in modal), mailto:, tel:, http(s)://, or internal paths.",
                }),
                defineField({
                  name: "openInChurchCenter",
                  title: "Open in Church Center modal",
                  type: "boolean",
                  description:
                    "Check if the CTA href is a Church Center path that should open as an in-page modal.",
                  initialValue: false,
                }),
              ],
              preview: { select: { title: "name", subtitle: "ctaLabel" } },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "trustSection",
      title: "Trust / accreditation",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "body", type: "blockContent" }),
        defineField({
          name: "dimeBadge",
          title: "Dime accreditation badge",
          type: "image",
          options: { hotspot: false },
          fields: [{ name: "alt", type: "string", title: "Alt text" }],
        }),
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
            { name: "openInChurchCenter", type: "boolean", initialValue: false },
          ],
        }),
        defineField({
          name: "secondaryCta",
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "href", type: "string" },
            { name: "openInChurchCenter", type: "boolean", initialValue: false },
          ],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Give Page" }) },
});

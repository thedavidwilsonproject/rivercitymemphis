import { defineType, defineField } from "sanity";

/**
 * "Location & Time" page singleton — editable copy + community list.
 * The actual address and service time live in Site Settings (single
 * source of truth); this page just owns its own headlines and intro.
 */
export const locationPage = defineType({
  name: "locationPage",
  title: "Location Page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
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
      ],
    }),
    defineField({
      name: "serviceNote",
      title: "Service note (small caption under time)",
      type: "string",
      description: 'e.g. "Coffee starts at 10:00 · Service runs 65–70 minutes"',
    }),
    defineField({
      name: "familyMinistryNote",
      title: "Family Ministry note",
      type: "string",
      description: "Optional second line under the service time.",
    }),
    defineField({
      name: "directionsLabel",
      title: "Get-directions button label",
      type: "string",
    }),
    defineField({
      name: "appleMapsLabel",
      title: "Apple Maps button label",
      type: "string",
    }),
    defineField({
      name: "communities",
      title: "Communities we serve",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({
          name: "list",
          title: "Community names",
          type: "array",
          of: [{ type: "string" }],
        }),
        defineField({ name: "footer", type: "text", rows: 2 }),
      ],
    }),
    defineField({
      name: "cta",
      title: "Bottom CTA section",
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
  preview: { prepare: () => ({ title: "Location Page" }) },
});

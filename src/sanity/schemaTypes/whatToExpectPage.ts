import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * "What to Expect" page singleton — every text block, photo, and journey
 * step on /visit/what-to-expect is editable here.
 */
export const whatToExpectPage = defineType({
  name: "whatToExpectPage",
  title: "What to Expect Page",
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
        defineField({
          name: "image",
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", type: "string", title: "Alt text" }],
        }),
      ],
    }),
    defineField({
      name: "lede",
      title: "Welcome lede paragraph",
      type: "text",
      rows: 4,
      description:
        'The short paragraph shown directly under the hero. Wrap a phrase in *asterisks* to emphasize it.',
    }),
    defineField({
      name: "steps",
      title: "Visitor journey steps",
      description: 'Numbered steps shown as alternating photo/text rows.',
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "step",
          fields: [
            defineField({
              name: "number",
              title: "Number label",
              type: "string",
              description: 'e.g. "01", "02". Shown big in brand color.',
            }),
            defineField({
              name: "title",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({ name: "body", type: "text", rows: 4 }),
            defineField({
              name: "image",
              type: "image",
              options: { hotspot: true },
              fields: [{ name: "alt", type: "string", title: "Alt text" }],
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "number", media: "image" },
          },
        }),
      ],
    }),
    defineField({
      name: "quickFacts",
      title: "Quick facts strip",
      description:
        "Three small facts shown in a strip below the journey (Service time / Address / How long).",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "serviceTime",
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "value", type: "string" },
            { name: "note", type: "string" },
          ],
        }),
        defineField({
          name: "address",
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "value", type: "string" },
            { name: "note", type: "string" },
          ],
        }),
        defineField({
          name: "duration",
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "value", type: "string" },
            { name: "note", type: "string" },
          ],
        }),
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
  preview: { prepare: () => ({ title: "What to Expect Page" }) },
});

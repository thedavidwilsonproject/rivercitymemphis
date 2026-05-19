import { defineType, defineField } from "sanity";

/**
 * "Who We Are" page singleton — every text block and image on
 * /visit/who-we-are is editable here.
 */
export const whoWeArePage = defineType({
  name: "whoWeArePage",
  title: "Who We Are Page",
  type: "document",
  fields: [
    // HERO
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow label", type: "string" }),
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
          description:
            "Large hero image. Use the hotspot to keep the most important part in frame on different screen sizes.",
          fields: [{ name: "alt", type: "string", title: "Alt text" }],
        }),
      ],
    }),
    // MISSION / VISION / STRATEGY
    defineField({
      name: "mvs",
      title: "Mission, Vision & Strategy section",
      description:
        "The headline section right under the hero. Three cards (Mission, Vision, Strategy) with Strategy's three pillars shown as a sub-grid.",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "intro", type: "text", rows: 4 }),
        defineField({
          name: "mission",
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "statement", type: "text", rows: 3 },
            {
              name: "description",
              title: "Supporting paragraph",
              type: "text",
              rows: 4,
              description: "Optional context shown below the statement.",
            },
          ],
        }),
        defineField({
          name: "vision",
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "statement", type: "text", rows: 3 },
            {
              name: "description",
              title: "Supporting paragraph",
              type: "text",
              rows: 4,
              description: "Optional context shown below the statement.",
            },
          ],
        }),
        defineField({
          name: "strategy",
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "statement", type: "text", rows: 3 },
            {
              name: "description",
              title: "Supporting paragraph",
              type: "text",
              rows: 4,
              description:
                "Optional closing context shown below the three pillars.",
            },
            defineField({
              name: "pillars",
              title: "Strategy pillars (3 recommended)",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "pillar",
                  fields: [
                    { name: "name", type: "string" },
                    { name: "description", type: "string" },
                  ],
                  preview: { select: { title: "name", subtitle: "description" } },
                },
              ],
            }),
          ],
        }),
      ],
    }),

    // CULTURE
    defineField({
      name: "culture",
      title: "Culture section",
      type: "object",
      options: { collapsible: true, collapsed: true },
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
          name: "cta",
          title: "CTA button",
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "href", type: "string" },
          ],
        }),
      ],
    }),
    // WORSHIP BANNER
    defineField({
      name: "worshipBanner",
      title: "Worship banner image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
      description: "Wide image shown between the culture and story sections.",
    }),
    // STORY
    defineField({
      name: "story",
      title: "Our Story section",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "body", type: "blockContent" }),
      ],
    }),
    // BELIEFS
    defineField({
      name: "beliefs",
      title: "What We Believe section",
      type: "object",
      options: { collapsible: true, collapsed: true },
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
          name: "cta",
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "href", type: "string" },
          ],
        }),
      ],
    }),
    // BAPTISM BANNER
    defineField({
      name: "baptismBanner",
      title: "Baptism banner",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "image",
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", type: "string", title: "Alt text" }],
        }),
        defineField({ name: "overlayTitle", type: "string" }),
        defineField({ name: "overlayBody", type: "text", rows: 3 }),
      ],
    }),
    // CTA
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
  preview: { prepare: () => ({ title: "Who We Are Page" }) },
});

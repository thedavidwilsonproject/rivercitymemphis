import { defineType, defineField } from "sanity";

/**
 * Contact page singleton — /contact.
 * Reuses siteSettings for address / phone / email / socials so they
 * stay in sync site-wide. This schema only owns the page-specific
 * copy: hero, intros, reasons (mailto buttons), pastors callout, CTA.
 */
export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
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
      name: "infoIntro",
      title: "Info cards intro",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "intro", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "reasonsSection",
      title: "Reasons for reaching out",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "intro", type: "text", rows: 3 }),
        defineField({
          name: "reasons",
          type: "array",
          validation: (r) => r.min(1).max(10),
          of: [
            {
              type: "object",
              name: "reason",
              fields: [
                defineField({
                  name: "label",
                  type: "string",
                  validation: (r) => r.required(),
                  description: "Button label, e.g. 'I'd like to get baptized'",
                }),
                defineField({
                  name: "subject",
                  type: "string",
                  description:
                    "Email subject line for the mailto link, e.g. 'Baptism inquiry'",
                }),
              ],
              preview: { select: { title: "label", subtitle: "subject" } },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "pastorsCallout",
      title: "Pastors callout",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "body", type: "text", rows: 4 }),
        defineField({
          name: "image",
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", type: "string", title: "Alt text" }],
        }),
        defineField({ name: "ctaLabel", type: "string" }),
        defineField({ name: "ctaHref", type: "string" }),
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
  preview: { prepare: () => ({ title: "Contact Page" }) },
});

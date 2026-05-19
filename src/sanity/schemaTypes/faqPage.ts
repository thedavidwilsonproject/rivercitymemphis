import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * FAQ page singleton.
 *
 * The form mirrors the front-end UX exactly: editors enter a question, then
 * an answer slot. They can add/remove/reorder Q/A pairs at will. The front
 * end renders each item as a clean accordion row.
 */
export const faqPage = defineType({
  name: "faqPage",
  title: "FAQ Page",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow label",
      type: "string",
      description: "Small uppercase label above the headline (e.g. \"Visit\").",
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "intro",
      title: "Intro paragraph",
      type: "text",
      rows: 3,
      description: "Short lead-in paragraph above the questions.",
    }),
    defineField({
      name: "items",
      title: "Questions",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "faqItem",
          title: "Question",
          fields: [
            defineField({
              name: "question",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "answer",
              type: "blockContent",
              description:
                "Rich answer. Supports paragraphs, links, lists, bold/italic.",
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "question" },
            prepare: ({ title }) => ({
              title: title || "(untitled question)",
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "footer",
      title: "Footer note",
      type: "text",
      rows: 2,
      description:
        "Optional closing line below the questions (e.g., \"Still have a question? Email info@…\").",
    }),
  ],
  preview: { prepare: () => ({ title: "FAQ Page" }) },
});

import { defineType, defineField } from "sanity";

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "section",
      title: "Section",
      type: "string",
      options: {
        list: [
          { title: "Visit", value: "visit" },
          { title: "Connect", value: "connect" },
          { title: "Give", value: "give" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({
      name: "heroImage",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description: "Short blurb used in nav cards and SEO description.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "section", media: "heroImage" },
  },
});

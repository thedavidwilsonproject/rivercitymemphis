import { defineType, defineField } from "sanity";

export const ministry = defineType({
  name: "ministry",
  title: "Ministry",
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
    }),
    defineField({
      name: "ageRange",
      title: "Age range",
      type: "string",
      description: "e.g. Ages 6 weeks – Pre-K, 6th–8th grade",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Kids", value: "kids" },
          { title: "Students", value: "students" },
          { title: "Adults", value: "adults" },
          { title: "Outreach", value: "outreach" },
        ],
      },
    }),
    defineField({
      name: "tagline",
      type: "string",
    }),
    defineField({
      name: "description",
      type: "blockContent",
    }),
    defineField({
      name: "coreValues",
      title: "Core values / key messages",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "schedule",
      type: "string",
      description: "e.g. Sundays 10:15 AM",
    }),
    defineField({
      name: "location",
      type: "string",
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook URL",
      type: "url",
    }),
    defineField({
      name: "leaders",
      title: "Leaders",
      type: "array",
      of: [{ type: "reference", to: [{ type: "person" }] }],
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "ageRange", media: "image" },
  },
});

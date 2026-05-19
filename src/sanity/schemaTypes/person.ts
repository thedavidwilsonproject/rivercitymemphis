import { defineType, defineField } from "sanity";

export const person = defineType({
  name: "person",
  title: "Person",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
    }),
    defineField({
      name: "role",
      title: "Role / title",
      type: "string",
      description: "e.g. Lead Pastor, Pastor of Connections & Discipleship",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Pastor", value: "pastor" },
          { title: "Staff", value: "staff" },
          { title: "Elder", value: "elder" },
          { title: "Director", value: "director" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "photo",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
    defineField({
      name: "bio",
      type: "blockContent",
    }),
    defineField({
      name: "email",
      type: "string",
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Lower numbers appear first.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});

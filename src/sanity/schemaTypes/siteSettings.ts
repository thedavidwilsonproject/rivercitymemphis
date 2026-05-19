import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "siteTitle", type: "string" }),
    defineField({
      name: "tagline",
      type: "string",
      description: "Used in the hero / SEO description.",
    }),
    defineField({
      name: "logo",
      type: "image",
      options: { hotspot: false },
    }),
    defineField({
      name: "address",
      type: "object",
      fields: [
        { name: "line1", type: "string" },
        { name: "line2", type: "string" },
        { name: "city", type: "string" },
        { name: "state", type: "string" },
        { name: "zip", type: "string" },
      ],
    }),
    defineField({ name: "phone", type: "string" }),
    defineField({ name: "email", type: "string" }),
    defineField({
      name: "serviceTime",
      title: "Service time",
      type: "string",
      description: "Plain text e.g. 'Sundays at 10:15 AM'",
    }),
    defineField({
      name: "socials",
      type: "object",
      fields: [
        { name: "facebook", type: "url" },
        { name: "instagram", type: "url" },
        { name: "twitter", type: "url" },
        { name: "vimeo", type: "url" },
        { name: "youtube", type: "url" },
      ],
    }),
    defineField({
      name: "mainNav",
      title: "Main navigation",
      type: "array",
      of: [
        {
          type: "object",
          name: "navItem",
          fields: [
            { name: "label", type: "string" },
            { name: "href", type: "string" },
            {
              name: "children",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "label", type: "string" },
                    { name: "href", type: "string" },
                  ],
                  preview: { select: { title: "label", subtitle: "href" } },
                },
              ],
            },
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});

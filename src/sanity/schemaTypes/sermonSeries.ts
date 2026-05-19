import { defineType, defineField } from "sanity";

export const sermonSeries = defineType({
  name: "sermonSeries",
  title: "Sermon Series",
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
    defineField({ name: "startDate", type: "date" }),
    defineField({ name: "endDate", type: "date" }),
    defineField({
      name: "coverImage",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
    defineField({
      name: "description",
      type: "blockContent",
    }),
    defineField({
      name: "sourceUrl",
      title: "Source URL",
      type: "url",
      description: "Original Drupal /watch/<slug> path on the legacy site.",
      readOnly: true,
    }),
    defineField({
      name: "sermons",
      title: "Sermons",
      type: "array",
      of: [
        {
          type: "object",
          name: "sermon",
          fields: [
            { name: "order", type: "number", title: "Order" },
            {
              name: "title",
              type: "string",
              validation: (r) => r.required(),
            },
            { name: "date", type: "date" },
            { name: "speakerName", type: "string", title: "Speaker (name)" },
            {
              name: "speaker",
              type: "reference",
              to: [{ type: "person" }],
              description: "Optional link to a Person record (for staff).",
            },
            { name: "scripture", type: "string" },
            {
              name: "videoPlatform",
              type: "string",
              options: {
                list: [
                  { title: "YouTube", value: "youtube" },
                  { title: "Vimeo", value: "vimeo" },
                ],
                layout: "radio",
              },
            },
            { name: "videoId", type: "string" },
            { name: "videoUrl", type: "url", title: "Video URL" },
            { name: "audioUrl", type: "url", title: "Audio URL" },
            { name: "summary", type: "text", rows: 3 },
            {
              name: "thumbnail",
              type: "image",
              options: { hotspot: false },
              fields: [{ name: "alt", type: "string", title: "Alt text" }],
            },
          ],
          preview: {
            select: {
              title: "title",
              speaker: "speakerName",
              date: "date",
              media: "thumbnail",
            },
            prepare({ title, speaker, date, media }) {
              const d = date
                ? new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";
              const sub = [d, speaker].filter(Boolean).join(" — ");
              return { title, subtitle: sub, media };
            },
          },
        },
      ],
    }),
  ],
  orderings: [
    {
      title: "Date, newest first",
      name: "dateDesc",
      by: [{ field: "startDate", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      startDate: "startDate",
      endDate: "endDate",
      media: "coverImage",
    },
    prepare({ title, startDate, endDate, media }) {
      const fmt = (d?: string) =>
        d
          ? new Date(d).toLocaleString("en-US", {
              month: "short",
              year: "numeric",
            })
          : "";
      const range =
        startDate && endDate && startDate !== endDate
          ? `${fmt(startDate)} – ${fmt(endDate)}`
          : fmt(startDate);
      return { title, subtitle: range, media };
    },
  },
});

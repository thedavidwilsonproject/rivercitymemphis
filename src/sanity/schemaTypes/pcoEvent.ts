import { defineType, defineField } from "sanity";

/**
 * PCO event mirror — one doc per Planning Center "signup", synced via
 * `npm run sync:events`. Editors flip the "Show on website" toggle to
 * decide which events appear publicly on /events.
 *
 * The sync script writes/refreshes the `name`, `pcoId`, and `lastSyncedAt`
 * fields on every run, but never touches `showOnSite` or `displayOrder`
 * — those belong to the editor.
 */
export const pcoEvent = defineType({
  name: "pcoEvent",
  title: "Event (Planning Center)",
  type: "document",
  fields: [
    defineField({
      name: "pcoId",
      title: "Planning Center ID",
      type: "string",
      description: "Pulled from Planning Center — don't edit manually.",
      readOnly: true,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "name",
      title: "Event name",
      type: "string",
      description: "Refreshed on every sync from Planning Center.",
      readOnly: true,
    }),
    defineField({
      name: "showOnSite",
      title: "Show on website",
      type: "boolean",
      description:
        "When on, this event appears on rivercitymemphis.org/events. Defaults to off so newly synced events stay hidden until you publish them.",
      initialValue: false,
    }),
    defineField({
      name: "displayOrder",
      title: "Display order (optional)",
      type: "number",
      description:
        "Lower numbers appear first. Leave blank to sort by event date.",
    }),
    defineField({
      name: "lastSyncedAt",
      title: "Last synced",
      type: "datetime",
      readOnly: true,
    }),
  ],
  preview: {
    select: { name: "name", show: "showOnSite", pcoId: "pcoId" },
    prepare({ name, show, pcoId }) {
      return {
        title: name || `Event ${pcoId}`,
        subtitle: show ? "✓ Showing on site" : "Hidden",
      };
    },
  },
  orderings: [
    {
      title: "Show on site, then name",
      name: "showThenName",
      by: [
        { field: "showOnSite", direction: "desc" },
        { field: "name", direction: "asc" },
      ],
    },
  ],
});

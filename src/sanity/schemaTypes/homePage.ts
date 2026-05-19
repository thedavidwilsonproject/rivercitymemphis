import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * Home page singleton. Every text block, CTA label/link, intro paragraph,
 * and ministry blurb on the homepage edits here.
 *
 * What is NOT here (and why):
 *   - Hero video file — kept as a static asset at /public/brand/hero.mp4
 *     because it's a brand asset that rarely changes. If you want to swap
 *     the video, drop a new file at that path.
 *   - Ministry brand colors + logos — those are designed assets (logo PNGs
 *     at /public/brand/ministries/). Per-ministry "photo" is editable
 *     below so you can place a photo behind the colored overlay.
 */
export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    // -------- HERO --------
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow label",
          type: "string",
          description: 'Small uppercase label above the headline (e.g. "Bartlett, TN").',
        }),
        defineField({
          name: "headline",
          type: "string",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "subhead",
          type: "text",
          rows: 3,
        }),
        defineField({
          name: "posterImage",
          title: "Video poster image",
          description: "Still image shown while the video loads, and as fallback on devices that block autoplay.",
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", type: "string", title: "Alt text" }],
        }),
        defineField({
          name: "primaryCta",
          title: "Primary CTA",
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "href", type: "string" },
          ],
        }),
        defineField({
          name: "secondaryCta",
          title: "Secondary CTA",
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "href", type: "string" },
          ],
        }),
      ],
    }),

    // -------- CURRENT SERIES --------
    defineField({
      name: "currentSeriesSection",
      title: "Current Series section",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "title",
          type: "string",
          description: 'Section heading, e.g. "Current Series".',
        }),
        defineField({
          name: "viewAllLabel",
          type: "string",
          description: 'Link label, e.g. "View All →".',
        }),
        defineField({
          name: "viewAllHref",
          type: "string",
          description: 'Destination for the View All link.',
        }),
        defineField({
          name: "count",
          title: "Number of series to display",
          type: "number",
          description: "Latest-N series shown on the homepage. Defaults to 3.",
          validation: (r) => r.min(1).max(8),
        }),
      ],
    }),

    // -------- KIDS AND STUDENTS --------
    defineField({
      name: "kidsAndStudentsSection",
      title: "Kids and Students section",
      description:
        "The four ministry cards on the homepage (Waumba Land, UpStreet, Transit, All Access). Each card shows a large photo with a small color badge in the corner.",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "title",
          title: "Section heading",
          type: "string",
          description: 'The header shown between the two thin rules, e.g. "Kids and Students".',
        }),
        defineField({
          name: "intro",
          title: "Intro paragraph",
          type: "text",
          rows: 4,
          description:
            "Short welcome paragraph under the heading. Keep it to 2–3 sentences.",
        }),
        defineField({
          name: "ministries",
          title: "Ministry cards",
          description:
            "Add or reorder ministry cards here. Each card renders as a square photo + corner badge + age range + description.",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "ministryCard",
              fields: [
                defineField({
                  name: "name",
                  title: "Ministry name",
                  type: "string",
                  description:
                    'The ministry\'s brand name, e.g. "Waumba Land". Shown in small caps under the age range on the card.',
                  validation: (r) => r.required(),
                }),
                defineField({
                  name: "age",
                  title: "Age range / title",
                  type: "string",
                  description:
                    'The main heading on the card, e.g. "Infants thru Pre-K", "Kindergarten thru 5th", "Middle School", "High School".',
                }),
                defineField({
                  name: "description",
                  title: "Description",
                  type: "text",
                  rows: 4,
                  description:
                    "Short paragraph shown under the title. 2–3 sentences ideal.",
                }),
                defineField({
                  name: "color",
                  title: "Brand color (hex)",
                  type: "string",
                  description:
                    'The ministry\'s accent color (used for the corner badge and small-caps name). Examples: Waumba "#DC5237", UpStreet "#7BAA53", Transit "#4AB5D7", All Access "#D8A33A".',
                }),
                defineField({
                  name: "photo",
                  title: "Photo",
                  type: "image",
                  options: { hotspot: true },
                  description:
                    "Large square photo shown as the card's main image. Use the hotspot tool to mark the most important part of the photo (a child's face, an action) — that point stays in frame when the image is cropped to a square.",
                  fields: [
                    {
                      name: "alt",
                      type: "string",
                      title: "Alt text",
                      description: "Short description for accessibility.",
                    },
                  ],
                }),
                defineField({
                  name: "logo",
                  title: "Ministry logo override (optional)",
                  description:
                    "Optional. Defaults to the bundled brand logo for Waumba/UpStreet/Transit/All Access. Only set this if you've rebranded a ministry. Use a white-on-transparent PNG/SVG so it sits cleanly inside the colored badge.",
                  type: "image",
                }),
                defineField({
                  name: "href",
                  title: "Card link target",
                  type: "string",
                  description:
                    'Where clicking the card takes the visitor. Default: "/connect/families".',
                }),
              ],
              preview: {
                select: { title: "name", subtitle: "age", media: "photo" },
              },
            }),
          ],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Home Page" }) },
});

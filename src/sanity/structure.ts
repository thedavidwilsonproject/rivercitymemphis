import type { StructureResolver } from "sanity/structure";

const SINGLETON_PAGES: { id: string; title: string }[] = [
  { id: "homePage", title: "Home Page" },
  { id: "whoWeArePage", title: "Who We Are Page" },
  { id: "whatToExpectPage", title: "What to Expect Page" },
  { id: "locationPage", title: "Location Page" },
  { id: "faqPage", title: "FAQ Page" },
  { id: "connectPage", title: "Connect Page" },
  { id: "nextPage", title: "Next Page" },
  { id: "familiesPage", title: "Family Ministry Page" },
  { id: "groupsPage", title: "RCC Groups Page" },
  { id: "beRichPage", title: "Be Rich Page" },
  { id: "contactPage", title: "Contact Page" },
  { id: "givePage", title: "Give Page" },
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site Settings")
        .child(
          S.editor()
            .id("siteSettings")
            .schemaType("siteSettings")
            .documentId("siteSettings"),
        ),
      S.divider(),
      ...SINGLETON_PAGES.map(({ id, title }) =>
        S.listItem()
          .id(id)
          .title(title)
          .child(S.editor().id(id).schemaType(id).documentId(id)),
      ),
      S.divider(),
      // Events — pulled from Planning Center via `npm run sync:events`.
      // Three views so editors can quickly see what's public vs. hidden.
      S.listItem()
        .title("Events")
        .child(
          S.list()
            .title("Events (Planning Center)")
            .items([
              S.listItem()
                .title("Showing on site")
                .child(
                  S.documentList()
                    .title("Showing on site")
                    .schemaType("pcoEvent")
                    .filter('_type == "pcoEvent" && showOnSite == true')
                    .defaultOrdering([
                      { field: "displayOrder", direction: "asc" },
                      { field: "name", direction: "asc" },
                    ]),
                ),
              S.listItem()
                .title("Hidden")
                .child(
                  S.documentList()
                    .title("Hidden")
                    .schemaType("pcoEvent")
                    .filter(
                      '_type == "pcoEvent" && (showOnSite == false || !defined(showOnSite))',
                    )
                    .defaultOrdering([
                      { field: "name", direction: "asc" },
                    ]),
                ),
              S.divider(),
              S.listItem()
                .title("All events")
                .child(
                  S.documentTypeList("pcoEvent")
                    .title("All events")
                    .defaultOrdering([
                      { field: "showOnSite", direction: "desc" },
                      { field: "name", direction: "asc" },
                    ]),
                ),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem("page").title("Other Pages (CMS)"),
      S.documentTypeListItem("person").title("Leadership"),
      S.documentTypeListItem("ministry").title("Ministries"),
      S.documentTypeListItem("sermonSeries").title("Sermon Series"),
    ]);

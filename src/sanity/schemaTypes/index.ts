import type { SchemaTypeDefinition } from "sanity";

import { page } from "./page";
import { person } from "./person";
import { ministry } from "./ministry";
import { sermonSeries } from "./sermonSeries";
import { siteSettings } from "./siteSettings";
import { blockContent } from "./blockContent";
import { faqPage } from "./faqPage";
import { homePage } from "./homePage";
import { whoWeArePage } from "./whoWeArePage";
import { whatToExpectPage } from "./whatToExpectPage";
import { locationPage } from "./locationPage";
import { connectPage } from "./connectPage";
import { nextPage } from "./nextPage";
import { familiesPage } from "./familiesPage";
import { groupsPage } from "./groupsPage";
import { beRichPage } from "./beRichPage";
import { contactPage } from "./contactPage";
import { givePage } from "./givePage";
import { pcoEvent } from "./pcoEvent";

export const schemaTypes: SchemaTypeDefinition[] = [
  page,
  person,
  ministry,
  sermonSeries,
  siteSettings,
  blockContent,
  faqPage,
  homePage,
  whoWeArePage,
  whatToExpectPage,
  locationPage,
  connectPage,
  nextPage,
  familiesPage,
  groupsPage,
  beRichPage,
  contactPage,
  givePage,
  pcoEvent,
];

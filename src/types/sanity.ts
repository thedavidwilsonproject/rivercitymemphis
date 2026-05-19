export type SanityImage = {
  asset?: { _ref?: string; _id?: string };
  alt?: string;
  caption?: string;
};

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; external?: boolean }[];
};

export type SiteSettings = {
  siteTitle?: string;
  tagline?: string;
  logo?: SanityImage;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  phone?: string;
  email?: string;
  serviceTime?: string;
  socials?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    vimeo?: string;
    youtube?: string;
  };
  mainNav?: NavItem[];
};

export type PageDoc = {
  title: string;
  summary?: string;
  section?: string;
  heroImage?: SanityImage;
  body?: unknown;
  seoTitle?: string;
};

export type Person = {
  name: string;
  slug?: string;
  role?: string;
  category?: "pastor" | "staff" | "elder" | "director";
  photo?: SanityImage;
  bio?: unknown;
};

export type Ministry = {
  title: string;
  slug?: string;
  ageRange?: string;
  category?: "kids" | "students" | "adults" | "outreach";
  tagline?: string;
  description?: unknown;
  schedule?: string;
  location?: string;
  image?: SanityImage;
  facebookUrl?: string;
  coreValues?: string[];
};

export type Cta = { label?: string; href?: string };

export type SectionWithImage = {
  eyebrow?: string;
  headline?: string;
  body?: unknown;
  image?: SanityImage;
  cta?: Cta;
};

export type MvsPillar = { name?: string; description?: string };

export type ConnectCard = {
  eyebrow?: string;
  title?: string;
  blurb?: string;
  href?: string;
  ctaLabel?: string;
  image?: SanityImage;
  featured?: boolean;
};

export type QuickFact = { label?: string; value?: string; note?: string };

export type FamilyEnvironment = {
  eyebrow?: string;
  name?: string;
  ageRange?: string;
  schedule?: string;
  blurb?: string;
  coreTruths?: string[];
  image?: SanityImage;
  facebookUrl?: string;
};

export type CheckinStep = { title?: string; description?: string };

export type FamiliesPageDoc = {
  hero?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
    image?: SanityImage;
  };
  intro?: {
    eyebrow?: string;
    headline?: string;
    body?: unknown;
  };
  environments?: FamilyEnvironment[];
  checkin?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
    steps?: CheckinStep[];
    footnote?: string;
  };
  cta?: {
    headline?: string;
    body?: string;
    primaryCta?: Cta;
    secondaryCta?: Cta;
  };
};

export type GiveWay = {
  name?: string;
  blurb?: string;
  ctaLabel?: string;
  ctaHref?: string;
  openInChurchCenter?: boolean;
};

export type GivePageDoc = {
  hero?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
    image?: SanityImage;
  };
  verse?: { text?: string; reference?: string };
  intro?: { eyebrow?: string; headline?: string; body?: unknown };
  waysSection?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
    ways?: GiveWay[];
  };
  trustSection?: {
    eyebrow?: string;
    headline?: string;
    body?: unknown;
    dimeBadge?: SanityImage;
  };
  cta?: {
    headline?: string;
    body?: string;
    primaryCta?: Cta & { openInChurchCenter?: boolean };
    secondaryCta?: Cta & { openInChurchCenter?: boolean };
  };
};

export type ContactReason = {
  label?: string;
  subject?: string;
};

export type ContactPageDoc = {
  hero?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
    image?: SanityImage;
  };
  infoIntro?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
  };
  reasonsSection?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
    reasons?: ContactReason[];
  };
  pastorsCallout?: {
    eyebrow?: string;
    headline?: string;
    body?: string;
    image?: SanityImage;
    ctaLabel?: string;
    ctaHref?: string;
  };
  cta?: {
    headline?: string;
    body?: string;
    primaryCta?: Cta;
    secondaryCta?: Cta;
  };
};

export type BeRichPartner = {
  scope?: "local" | "national" | "global";
  name?: string;
  blurb?: string;
  url?: string;
};

export type BeRichPageDoc = {
  hero?: {
    eyebrow?: string;
    headline?: string;
    tagline?: string;
    intro?: string;
    image?: SanityImage;
  };
  intro?: {
    eyebrow?: string;
    headline?: string;
    body?: unknown;
  };
  partnersSection?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
    partners?: BeRichPartner[];
  };
  cta?: {
    eyebrow?: string;
    headline?: string;
    body?: string;
    primaryCta?: Cta;
    secondaryCta?: Cta;
  };
};

export type GroupKind = {
  eyebrow?: string;
  name?: string;
  format?: string;
  schedule?: string;
  blurb?: string;
  highlights?: string[];
  image?: SanityImage;
  ctaLabel?: string;
  ctaHref?: string;
};

export type GroupsPageDoc = {
  hero?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
    image?: SanityImage;
  };
  intro?: {
    eyebrow?: string;
    headline?: string;
    body?: unknown;
  };
  kinds?: GroupKind[];
  join?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
    steps?: CheckinStep[];
    footnote?: string;
  };
  embed?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
  };
  cta?: {
    headline?: string;
    body?: string;
    primaryCta?: Cta;
    secondaryCta?: Cta;
  };
};

export type NextPageItem = { title?: string; description?: string };

export type NextPageDoc = {
  hero?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
    image?: SanityImage;
  };
  intro?: {
    eyebrow?: string;
    headline?: string;
    body?: unknown;
    image?: SanityImage;
    imageCaption?: string;
  };
  whatToExpect?: {
    eyebrow?: string;
    headline?: string;
    items?: NextPageItem[];
  };
  quickFacts?: {
    when?: QuickFact;
    where?: QuickFact;
    duration?: QuickFact;
  };
  cta?: {
    headline?: string;
    body?: string;
    primaryCta?: Cta;
    secondaryCta?: Cta;
  };
};

export type ConnectPageDoc = {
  hero?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
    image?: SanityImage;
  };
  cards?: ConnectCard[];
  cta?: {
    headline?: string;
    body?: string;
    primaryCta?: Cta;
    secondaryCta?: Cta;
  };
};

export type WhoWeArePageDoc = {
  hero?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
    image?: SanityImage;
  };
  mvs?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
    mission?: { label?: string; statement?: string; description?: string };
    vision?: { label?: string; statement?: string; description?: string };
    strategy?: {
      label?: string;
      statement?: string;
      description?: string;
      pillars?: MvsPillar[];
    };
  };
  culture?: SectionWithImage;
  worshipBanner?: SanityImage;
  story?: { eyebrow?: string; headline?: string; body?: unknown };
  beliefs?: SectionWithImage;
  baptismBanner?: {
    image?: SanityImage;
    overlayTitle?: string;
    overlayBody?: string;
  };
  cta?: {
    headline?: string;
    body?: string;
    primaryCta?: Cta;
    secondaryCta?: Cta;
  };
};

export type WhatToExpectStep = {
  number?: string;
  title?: string;
  body?: string;
  image?: SanityImage;
};

export type WhatToExpectPageDoc = {
  hero?: {
    eyebrow?: string;
    headline?: string;
    intro?: string;
    image?: SanityImage;
  };
  lede?: string;
  steps?: WhatToExpectStep[];
  quickFacts?: {
    serviceTime?: { label?: string; value?: string; note?: string };
    address?: { label?: string; value?: string; note?: string };
    duration?: { label?: string; value?: string; note?: string };
  };
  cta?: {
    headline?: string;
    body?: string;
    primaryCta?: Cta;
    secondaryCta?: Cta;
  };
};

export type LocationPageDoc = {
  hero?: { eyebrow?: string; headline?: string; intro?: string };
  serviceNote?: string;
  familyMinistryNote?: string;
  directionsLabel?: string;
  appleMapsLabel?: string;
  communities?: {
    eyebrow?: string;
    headline?: string;
    list?: string[];
    footer?: string;
  };
  cta?: {
    headline?: string;
    body?: string;
    primaryCta?: Cta;
    secondaryCta?: Cta;
  };
};

export type HomePageDoc = {
  hero?: {
    eyebrow?: string;
    headline?: string;
    subhead?: string;
    posterImage?: SanityImage;
    primaryCta?: Cta;
    secondaryCta?: Cta;
  };
  currentSeriesSection?: {
    title?: string;
    viewAllLabel?: string;
    viewAllHref?: string;
    count?: number;
  };
  kidsAndStudentsSection?: {
    title?: string;
    intro?: string;
    ministries?: HomeMinistryCard[];
  };
};

export type HomeMinistryCard = {
  name: string;
  age?: string;
  description?: string;
  color?: string;
  logo?: SanityImage;
  photo?: SanityImage;
  href?: string;
};

export type SermonSeriesSummary = {
  title: string;
  slug?: string;
  startDate?: string;
  endDate?: string;
  coverImage?: SanityImage;
  sermonCount?: number;
};

export type Sermon = {
  order?: number;
  title?: string;
  date?: string;
  speakerName?: string;
  speaker?: { name?: string; role?: string; slug?: string } | null;
  scripture?: string;
  videoPlatform?: "youtube" | "vimeo";
  videoId?: string;
  videoUrl?: string;
  audioUrl?: string;
  summary?: string;
  thumbnail?: SanityImage;
};

export type SermonSeries = SermonSeriesSummary & {
  description?: unknown;
  sourceUrl?: string;
  sermons?: Sermon[];
};

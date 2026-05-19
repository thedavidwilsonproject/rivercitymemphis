import { groq } from "next-sanity";

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{
    siteTitle,
    tagline,
    logo,
    address,
    phone,
    email,
    serviceTime,
    socials,
    mainNav
  }
`;

export const homePageQuery = groq`
  *[_id == "homePage"][0]{
    hero{
      eyebrow,
      headline,
      subhead,
      posterImage,
      primaryCta{ label, href },
      secondaryCta{ label, href }
    },
    currentSeriesSection{
      title,
      viewAllLabel,
      viewAllHref,
      count
    },
    kidsAndStudentsSection{
      title,
      intro,
      ministries[]{
        name,
        age,
        description,
        color,
        logo,
        photo,
        href
      }
    }
  }
`;

export const whoWeArePageQuery = groq`
  *[_id == "whoWeArePage"][0]{
    hero{ eyebrow, headline, intro, image },
    mvs{
      eyebrow, headline, intro,
      mission{ label, statement, description },
      vision{ label, statement, description },
      strategy{ label, statement, description, pillars[]{ name, description } }
    },
    culture{ eyebrow, headline, body, image, cta{ label, href } },
    worshipBanner,
    story{ eyebrow, headline, body },
    beliefs{ eyebrow, headline, body, image, cta{ label, href } },
    baptismBanner{ image, overlayTitle, overlayBody },
    cta{ headline, body, primaryCta{ label, href }, secondaryCta{ label, href } }
  }
`;

export const whatToExpectPageQuery = groq`
  *[_id == "whatToExpectPage"][0]{
    hero{ eyebrow, headline, intro, image },
    lede,
    steps[]{ number, title, body, image },
    quickFacts{
      serviceTime{ label, value, note },
      address{ label, value, note },
      duration{ label, value, note }
    },
    cta{ headline, body, primaryCta{ label, href }, secondaryCta{ label, href } }
  }
`;

export const locationPageQuery = groq`
  *[_id == "locationPage"][0]{
    hero{ eyebrow, headline, intro },
    serviceNote,
    familyMinistryNote,
    directionsLabel,
    appleMapsLabel,
    communities{ eyebrow, headline, list, footer },
    cta{ headline, body, primaryCta{ label, href }, secondaryCta{ label, href } }
  }
`;

export const connectPageQuery = groq`
  *[_id == "connectPage"][0]{
    hero{ eyebrow, headline, intro, image },
    cards[]{ eyebrow, title, blurb, href, ctaLabel, image, featured },
    cta{ headline, body, primaryCta{ label, href }, secondaryCta{ label, href } }
  }
`;

export const familiesPageQuery = groq`
  *[_id == "familiesPage"][0]{
    hero{ eyebrow, headline, intro, image },
    intro{ eyebrow, headline, body },
    environments[]{
      eyebrow, name, ageRange, schedule, blurb,
      coreTruths, image, facebookUrl
    },
    checkin{
      eyebrow, headline, intro,
      steps[]{ title, description },
      footnote
    },
    cta{ headline, body, primaryCta{ label, href }, secondaryCta{ label, href } }
  }
`;

export const publishedEventsQuery = groq`
  *[_type == "pcoEvent" && showOnSite == true]{
    pcoId,
    displayOrder
  }
`;

export const givePageQuery = groq`
  *[_id == "givePage"][0]{
    hero{ eyebrow, headline, intro, image },
    verse{ text, reference },
    intro{ eyebrow, headline, body },
    waysSection{
      eyebrow, headline, intro,
      ways[]{ name, blurb, ctaLabel, ctaHref, openInChurchCenter }
    },
    trustSection{ eyebrow, headline, body, dimeBadge },
    cta{
      headline, body,
      primaryCta{ label, href, openInChurchCenter },
      secondaryCta{ label, href, openInChurchCenter }
    }
  }
`;

export const contactPageQuery = groq`
  *[_id == "contactPage"][0]{
    hero{ eyebrow, headline, intro, image },
    infoIntro{ eyebrow, headline, intro },
    reasonsSection{
      eyebrow, headline, intro,
      reasons[]{ label, subject }
    },
    pastorsCallout{
      eyebrow, headline, body, image, ctaLabel, ctaHref
    },
    cta{
      headline, body,
      primaryCta{ label, href },
      secondaryCta{ label, href }
    }
  }
`;

export const beRichPageQuery = groq`
  *[_id == "beRichPage"][0]{
    hero{ eyebrow, headline, tagline, intro, image },
    intro{ eyebrow, headline, body },
    partnersSection{
      eyebrow, headline, intro,
      partners[]{ scope, name, blurb, url }
    },
    cta{
      eyebrow, headline, body,
      primaryCta{ label, href },
      secondaryCta{ label, href }
    }
  }
`;

export const groupsPageQuery = groq`
  *[_id == "groupsPage"][0]{
    hero{ eyebrow, headline, intro, image },
    intro{ eyebrow, headline, body },
    kinds[]{
      eyebrow, name, format, schedule, blurb,
      highlights, image, ctaLabel, ctaHref
    },
    join{
      eyebrow, headline, intro,
      steps[]{ title, description },
      footnote
    },
    embed{ eyebrow, headline, intro },
    cta{ headline, body, primaryCta{ label, href }, secondaryCta{ label, href } }
  }
`;

export const nextPageQuery = groq`
  *[_id == "nextPage"][0]{
    hero{ eyebrow, headline, intro, image },
    intro{ eyebrow, headline, body, image, imageCaption },
    whatToExpect{ eyebrow, headline, items[]{ title, description } },
    quickFacts{
      when{ label, value, note },
      where{ label, value, note },
      duration{ label, value, note }
    },
    cta{ headline, body, primaryCta{ label, href }, secondaryCta{ label, href } }
  }
`;

export const faqPageQuery = groq`
  *[_id == "faqPage"][0]{
    eyebrow,
    headline,
    intro,
    footer,
    items[]{ question, answer }
  }
`;

export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug][0]{
    title,
    summary,
    section,
    heroImage,
    body,
    seoTitle
  }
`;

export const pagesIndexQuery = groq`
  *[_type == "page"] | order(section asc, title asc){
    title,
    "slug": slug.current,
    section,
    summary
  }
`;

export const leadershipQuery = groq`
  *[_type == "person"] | order(order asc, name asc){
    name,
    "slug": slug.current,
    role,
    category,
    photo,
    bio
  }
`;

export const ministriesQuery = groq`
  *[_type == "ministry"] | order(order asc, title asc){
    title,
    "slug": slug.current,
    ageRange,
    category,
    tagline,
    description,
    schedule,
    location,
    image,
    facebookUrl,
    coreValues
  }
`;

export const ministryBySlugQuery = groq`
  *[_type == "ministry" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    ageRange,
    category,
    tagline,
    description,
    schedule,
    location,
    image,
    facebookUrl,
    coreValues
  }
`;

export const sermonSeriesIndexQuery = groq`
  *[_type == "sermonSeries"] | order(startDate desc){
    title,
    "slug": slug.current,
    startDate,
    endDate,
    coverImage,
    "sermonCount": count(sermons)
  }
`;

/** Recent series only — last 12 months from today, newest first. */
export const recentSermonSeriesQuery = groq`
  *[_type == "sermonSeries" && startDate >= $cutoff] | order(startDate desc){
    title,
    "slug": slug.current,
    startDate,
    endDate,
    coverImage,
    "sermonCount": count(sermons)
  }
`;

/** Distinct years that have at least one series, newest first, with counts. */
export const sermonArchiveYearsQuery = groq`
  *[_type == "sermonSeries" && defined(startDate)]{
    "year": string::split(startDate, "-")[0]
  } | order(year desc)
`;

/** Series within a single year (year is "YYYY"). */
export const sermonSeriesByYearQuery = groq`
  *[_type == "sermonSeries"
    && defined(startDate)
    && string::split(startDate, "-")[0] == $year
  ] | order(startDate desc){
    title,
    "slug": slug.current,
    startDate,
    endDate,
    coverImage,
    "sermonCount": count(sermons)
  }
`;

export const sermonSeriesBySlugQuery = groq`
  *[_type == "sermonSeries" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    startDate,
    endDate,
    coverImage,
    description,
    sourceUrl,
    sermons[]{
      order,
      title,
      date,
      speakerName,
      "speaker": speaker->{ name, role, "slug": slug.current },
      scripture,
      videoPlatform,
      videoId,
      videoUrl,
      audioUrl,
      summary,
      thumbnail
    } | order(order asc)
  }
`;

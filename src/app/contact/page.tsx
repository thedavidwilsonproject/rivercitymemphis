import type { Metadata } from "next";
import {
  Button,
  Container,
  CtaBand,
  PhotoHero,
  Section,
  SectionHeader,
  SplitSection,
} from "@/components/v2/ui";
import { client } from "@/sanity/client";
import { contactPageQuery, siteSettingsQuery } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type {
  ContactPageDoc,
  ContactReason,
  SanityImage,
  SiteSettings,
} from "@/types/sanity";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with River City Church — visit us in Bartlett, give us a call, or send us a note. Real people, real responses.",
};

const F = {
  hero: {
    headline: "We'd love to hear from you.",
    intro:
      "Whether you're new, exploring faith, walking through something hard, or just want to say hi — we'd love to connect. Reach out any of the ways below and a real person will get back to you.",
    image: "/brand/pages/contact/hero.jpg",
    alt: "RCC attendees walking into the building on a Sunday morning",
  },
  infoIntro: {
    headline: "Pick the way that works for you.",
    intro:
      "Stop by on a Sunday, call us during the week, or drop us an email — we're a phone call away.",
  },
  reasonsSection: {
    headline: "Tap a reason — we'll be in touch.",
    intro:
      "Each button opens a pre-filled email to info@rivercitymemphis.org so we can route it to the right person.",
    reasons: [
      { label: "I just accepted Jesus", subject: "I just accepted Jesus" },
      { label: "I need prayer", subject: "Prayer request" },
      { label: "I want to share my story", subject: "I want to share my story" },
      { label: "I'd like to get baptized", subject: "Baptism inquiry" },
      { label: "I'm new at River City", subject: "I'm new at RCC" },
      { label: "General contact", subject: "General contact" },
    ] satisfies ContactReason[],
  },
  pastorsCallout: {
    headline: "There's a real person on the other end.",
    body: "If you'd rather talk with someone directly, our pastors are happy to grab a coffee, hop on a call, or meet up after a service. Just send a note and we'll reach out within a couple business days.",
    image: "/brand/pages/contact/pastors.jpg",
    alt: "RCC pastors Jonathan Dunn and Eddie Davis talking on stage",
    ctaLabel: "Email the pastors",
    ctaHref:
      "mailto:info@rivercitymemphis.org?subject=I'd like to talk with a pastor",
  },
  cta: {
    headline: "First time? Plan your visit.",
    body: "Coming Sunday? Let us know — we'll meet you at the door and walk you in.",
    primaryLabel: "Plan your visit",
    primaryHref: "/visit/what-to-expect",
    secondaryLabel: "Get directions",
    secondaryHref: "/visit/location",
  },
  // Settings fallbacks — only used if Sanity siteSettings is empty
  settings: {
    addressLine1: "3871 Kirby Whitten Pkwy",
    city: "Bartlett",
    state: "TN",
    zip: "38135",
    phone: "(901) 386-4171",
    email: "info@rivercitymemphis.org",
    serviceTime: "Sundays at 10:15 AM",
    facebook: "https://www.facebook.com/RiverCityChurchBartlett/",
    instagram: "https://www.instagram.com/rivercitymemphis/",
    twitter: "https://twitter.com/rivercitymem",
    vimeo: "https://vimeo.com/rivercitychurch",
  },
};

async function safeFetch<T>(q: string): Promise<T | null> {
  try {
    return await client.fetch<T>(q, {}, { next: { revalidate: 0 } });
  } catch {
    return null;
  }
}

function imgSrc(image: SanityImage | undefined, fallback: string, w = 1600) {
  return image?.asset ? urlFor(image).width(w).url() : fallback;
}

function digitsOnly(s: string) {
  return s.replace(/[^\d+]/g, "");
}

function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function mailto(email: string, subject?: string) {
  return subject
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`;
}

type SocialIconProps = {
  href: string;
  label: string;
  children: React.ReactNode;
};

function SocialIcon({ href, label, children }: SocialIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-14 w-14 place-items-center rounded-full border border-white/25 text-white transition hover:border-brand-300 hover:bg-white/10 hover:text-brand-200"
    >
      {children}
    </a>
  );
}

export default async function ContactPage() {
  const [doc, settings] = await Promise.all([
    safeFetch<ContactPageDoc | null>(contactPageQuery),
    safeFetch<SiteSettings | null>(siteSettingsQuery),
  ]);

  const hero = doc?.hero ?? {};
  const heroHeadline = hero.headline ?? F.hero.headline;
  const heroIntro = hero.intro ?? F.hero.intro;
  const heroImageSrc = imgSrc(hero.image, F.hero.image, 2200);
  const heroImageAlt = hero.image?.alt ?? F.hero.alt;

  const infoIntro = doc?.infoIntro;
  const reasonsSection = doc?.reasonsSection;
  const reasons = reasonsSection?.reasons?.length
    ? reasonsSection.reasons
    : F.reasonsSection.reasons;
  const pastors = doc?.pastorsCallout;
  const pastorsImg = imgSrc(pastors?.image, F.pastorsCallout.image, 1400);
  const pastorsAlt = pastors?.image?.alt ?? F.pastorsCallout.alt;
  const cta = doc?.cta;

  // Build address line — prefer Sanity, fall back to constants
  const addr = settings?.address;
  const line1 = addr?.line1 || F.settings.addressLine1;
  const line2 = addr?.line2;
  const city = addr?.city || F.settings.city;
  const state = addr?.state || F.settings.state;
  const zip = addr?.zip || F.settings.zip;
  const fullAddress = [line1, line2, `${city}, ${state} ${zip}`]
    .filter(Boolean)
    .join(", ");

  const phone = settings?.phone || F.settings.phone;
  const email = settings?.email || F.settings.email;
  const serviceTime = settings?.serviceTime || F.settings.serviceTime;

  const socials = settings?.socials ?? {};
  const facebook = socials.facebook || F.settings.facebook;
  const instagram = socials.instagram || F.settings.instagram;
  const twitter = socials.twitter || F.settings.twitter;
  const vimeo = socials.vimeo || F.settings.vimeo;

  return (
    <div>
      {/* HERO */}
      <PhotoHero
        image={heroImageSrc}
        alt={heroImageAlt}
        headline={heroHeadline}
        accent="hear from you."
        intro={heroIntro}
      />

      {/* INFO CARDS — Visit / Call / Email */}
      <Section>
        <Container>
          <SectionHeader
            headline={infoIntro?.headline ?? F.infoIntro.headline}
            intro={infoIntro?.intro ?? F.infoIntro.intro}
          />
          <div className="grid gap-5 md:grid-cols-3">
            <InfoCard
              href={mapsUrl(fullAddress)}
              external
              label="Visit"
              title="Come see us"
              icon={PIN_ICON}
              note={serviceTime}
              cta="Get directions →"
            >
              <address className="not-italic">
                {line1}
                {line2 && (
                  <>
                    <br />
                    {line2}
                  </>
                )}
                <br />
                {city}, {state} {zip}
              </address>
            </InfoCard>
            <InfoCard
              href={`tel:${digitsOnly(phone)}`}
              label="Call"
              title="Give us a ring"
              icon={PHONE_ICON}
              note="Office hours: weekdays"
              cta="Tap to call →"
            >
              {phone}
            </InfoCard>
            <InfoCard
              href={mailto(email)}
              label="Email"
              title="Send a note"
              icon={MAIL_ICON}
              note="We reply within a few business days"
              cta="Open email →"
            >
              <span className="break-words">{email}</span>
            </InfoCard>
          </div>
        </Container>
      </Section>

      {/* REASONS — mailto buttons */}
      <Section tone="dark">
        <Container>
          <SectionHeader
            tone="dark"
            headline={reasonsSection?.headline ?? F.reasonsSection.headline}
            accent="be in touch."
            intro={reasonsSection?.intro ?? F.reasonsSection.intro}
          />
          <ul className="border-t border-white/15">
            {reasons.map((r, i) => (
              <li key={`${r.label}-${i}`} className="border-b border-white/15">
                <a
                  href={mailto(email, r.subject ?? r.label)}
                  className="group flex items-center justify-between gap-6 py-6 transition md:py-8"
                >
                  <span className="text-2xl font-bold tracking-tight transition group-hover:text-brand-300 md:text-4xl">
                    {r.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-serif text-3xl italic text-brand-300 transition group-hover:translate-x-2 md:text-4xl"
                  >
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* PASTORS CALLOUT */}
      <SplitSection
        image={pastorsImg}
        alt={pastorsAlt ?? ""}
        aspect="aspect-[4/3]"
        headline={pastors?.headline ?? F.pastorsCallout.headline}
        accent="other end."
        actions={
          (pastors?.ctaLabel ?? F.pastorsCallout.ctaLabel) &&
          (pastors?.ctaHref ?? F.pastorsCallout.ctaHref) ? (
            <Button
              href={pastors?.ctaHref ?? F.pastorsCallout.ctaHref}
              newTab={false}
            >
              {pastors?.ctaLabel ?? F.pastorsCallout.ctaLabel} →
            </Button>
          ) : undefined
        }
      >
        {(pastors?.body ?? F.pastorsCallout.body) && (
          <p>{pastors?.body ?? F.pastorsCallout.body}</p>
        )}
      </SplitSection>

      {/* SOCIAL */}
      <section className="bg-river-900 py-20 text-white md:py-28">
        <Container>
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              tone="dark"
              align="left"
              className="!mb-0"
              headline="Find us online."
              accent="online."
              intro="Get the latest from RCC — sermons, stories, and what's happening this week."
            />
            <div className="flex flex-wrap gap-3">
            <SocialIcon href={facebook} label="River City Church on Facebook">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
              </svg>
            </SocialIcon>
            <SocialIcon href={instagram} label="River City Church on Instagram">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2 0 1.8.3 2.2.4.6.2 1 .5 1.5 1 .4.4.7.8 1 1.4.1.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c0 1.2-.3 1.8-.4 2.2-.2.6-.5 1-1 1.4-.4.4-.8.7-1.4 1-.4.1-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2 0-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-1a3.7 3.7 0 0 1-1-1.4c-.1-.4-.4-1-.4-2.2-.1-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c0-1.2.3-1.8.4-2.2.2-.6.5-1 1-1.4.4-.4.8-.7 1.4-1 .4-.1 1-.4 2.2-.4 1.2-.1 1.6-.1 4.8-.1Zm0 5.3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 7.4a2.9 2.9 0 1 1 0-5.8 2.9 2.9 0 0 1 0 5.8Zm5.7-7.6a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z" />
              </svg>
            </SocialIcon>
            <SocialIcon href={twitter} label="River City Church on X">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M17.5 3h3l-6.6 7.5L22 21h-6.2l-4.9-6.4L5.4 21H2.4l7-8L2 3h6.3l4.4 5.8L17.5 3Zm-2.2 16h1.7L7.8 5H6L15.3 19Z" />
              </svg>
            </SocialIcon>
            <SocialIcon href={vimeo} label="River City Church on Vimeo">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M22.4 7.3c-.1 2.2-1.6 5.1-4.6 8.8-3 3.9-5.6 5.8-7.7 5.8-1.3 0-2.4-1.2-3.3-3.7-.6-2.2-1.2-4.4-1.8-6.6-.7-2.5-1.4-3.7-2.2-3.7-.2 0-.8.4-2 1.1L0 7.5C1.3 6.4 2.6 5.3 3.9 4.1c1.7-1.5 3-2.2 3.9-2.3 2-.2 3.3 1.2 3.7 4.2.5 3.2.8 5.2 1 6 .6 2.7 1.2 4 1.9 4 .5 0 1.3-.8 2.4-2.5 1.1-1.6 1.6-2.9 1.7-3.7.1-1.2-.4-1.7-1.6-1.7-.5 0-1.1.1-1.7.4 1.1-3.6 3.2-5.4 6.2-5.3 2.3.1 3.3 1.5 3.2 4.2Z" />
              </svg>
            </SocialIcon>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <CtaBand
        headline={cta?.headline ?? F.cta.headline}
        accent="Plan your visit."
        body={cta?.body ?? F.cta.body}
        image={heroImageSrc}
      >
        <Button tone="dark" href={cta?.primaryCta?.href ?? F.cta.primaryHref}>
          {cta?.primaryCta?.label ?? F.cta.primaryLabel}
        </Button>
        <Button
          tone="dark"
          variant="outline"
          href={cta?.secondaryCta?.href ?? F.cta.secondaryHref}
        >
          {cta?.secondaryCta?.label ?? F.cta.secondaryLabel}
        </Button>
      </CtaBand>
    </div>
  );
}

function InfoCard({
  href,
  external,
  label,
  title,
  icon,
  note,
  cta,
  children,
}: {
  href: string;
  external?: boolean;
  label: string;
  title: string;
  icon: React.ReactNode;
  note?: string;
  cta: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex flex-col rounded-2xl border border-ink-900/15 p-7 transition hover:border-brand-500 md:p-8"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
          {label}
        </p>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600">
          {icon}
        </span>
      </div>
      <h3 className="mt-8 text-3xl font-bold tracking-tight">{title}</h3>
      <div className="mt-3 flex-1 text-lg leading-8 text-ink-600">
        {children}
      </div>
      {note && <p className="mt-3 text-sm text-ink-500">{note}</p>}
      <span className="mt-6 text-sm font-semibold text-ink-900 transition group-hover:translate-x-1 group-hover:text-brand-800">
        {cta}
      </span>
    </a>
  );
}

const PIN_ICON = (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                  <path d="M12 2C7.6 2 4 5.6 4 10c0 5.5 7 12 7.3 12.3.4.3 1 .3 1.4 0C13 22 20 15.5 20 10c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                </svg>
);
const PHONE_ICON = (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                  <path d="M6.6 10.8a15.3 15.3 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A18 18 0 0 1 3 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.6a1 1 0 0 1-.25 1l-2.22 2.2Z" />
                </svg>
);
const MAIL_ICON = (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                  <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v.2l8 5 8-5V6H4Zm16 12V8.4l-7.4 4.6a1 1 0 0 1-1.2 0L4 8.4V18h16Z" />
                </svg>
);

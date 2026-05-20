import Link from "next/link";
import Image from "next/image";
import type { SiteSettings } from "@/types/sanity";

const FALLBACK_ADDRESS = {
  line1: "3871 Kirby Whitten Parkway",
  city: "Bartlett",
  state: "TN",
  zip: "38135",
};

const FALLBACK_SOCIALS = {
  facebook: "https://www.facebook.com/RiverCityChurchBartlett",
  instagram: "https://www.instagram.com/rivercitymemphis",
  twitter: "https://twitter.com/rivercitymem",
  vimeo: "https://vimeo.com/rivercitychurch",
};

function httpsOnly(url?: string): string | undefined {
  if (!url) return undefined;
  return url.replace(/^http:\/\//i, "https://");
}

export function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  const address = settings?.address ?? FALLBACK_ADDRESS;
  const rawSocials = settings?.socials ?? FALLBACK_SOCIALS;
  const socials = {
    facebook: httpsOnly(rawSocials.facebook),
    instagram: httpsOnly(rawSocials.instagram),
    twitter: httpsOnly(rawSocials.twitter),
    vimeo: httpsOnly(rawSocials.vimeo),
    youtube: httpsOnly((rawSocials as { youtube?: string }).youtube),
  };
  const serviceTime = settings?.serviceTime ?? "Sundays at 10:15 AM";
  const phone = settings?.phone ?? "(901) 386-4171";
  const email = settings?.email ?? "info@rivercitymemphis.org";

  return (
    <footer className="mt-24 border-t border-cream-200/60 bg-ink-900 text-cream-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <Image
            src="/brand/logo-icon.svg"
            alt="River City Church"
            width={56}
            height={56}
            className="h-12 w-12"
          />
          <p className="mt-4 text-sm leading-6 text-cream-200/80">
            {address.line1}
            <br />
            {address.city}, {address.state} {address.zip}
          </p>
          <p className="mt-3 text-sm text-cream-200/80">{serviceTime}</p>
        </div>
        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-brand-400">
            Visit
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/visit/what-to-expect" className="hover:text-brand-400">
                First Visit
              </Link>
            </li>
            <li>
              <Link href="/visit/leadership" className="hover:text-brand-400">
                Leadership
              </Link>
            </li>
            <li>
              <Link href="/visit/faqs" className="hover:text-brand-400">
                FAQs
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-brand-400">
            Connect
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/connect/families" className="hover:text-brand-400">
                Families
              </Link>
            </li>
            <li>
              <Link href="/connect/rcc-groups" className="hover:text-brand-400">
                RCC Groups
              </Link>
            </li>
            <li>
              <Link href="/give" className="hover:text-brand-400">
                Give
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-brand-400">
            Reach Us
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={`tel:${phone}`} className="hover:text-brand-400">
                {phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${email}`} className="hover:text-brand-400">
                {email}
              </a>
            </li>
          </ul>
          <div className="mt-5 flex gap-4 text-cream-200/80">
            {socials.facebook && (
              <a href={socials.facebook} aria-label="Facebook" className="hover:text-brand-400">
                FB
              </a>
            )}
            {socials.instagram && (
              <a href={socials.instagram} aria-label="Instagram" className="hover:text-brand-400">
                IG
              </a>
            )}
            {socials.twitter && (
              <a href={socials.twitter} aria-label="Twitter" className="hover:text-brand-400">
                TW
              </a>
            )}
            {socials.vimeo && (
              <a href={socials.vimeo} aria-label="Vimeo" className="hover:text-brand-400">
                VM
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-cream-200/50">
        © {new Date().getFullYear()} River City Church. All rights reserved.
      </div>
    </footer>
  );
}

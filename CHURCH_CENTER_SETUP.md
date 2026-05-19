# Church Center brand setup

The new site embeds Planning Center / Church Center widgets so visitors never leave `rivercitymemphis.org` to register, find a group, or browse events. Those embeds inherit their look from Church Center's own admin settings — so the more "on-brand" you make Church Center, the more native the embedded experience feels on the main site.

Spend ~15 minutes in **Church Center admin** at `https://rivercitymemphis.churchcenter.com/platform-admin` (or via `accounts.planningcenteronline.com` → "Church Center") doing the following.

## 1. Branding

Path in admin: **Church Center → Settings → Branding** (exact label varies by year).

| Field | Value |
|---|---|
| Logo | Upload `public/brand/logo.svg` from this repo (or a 180×60 PNG if PCO doesn't accept SVG yet) |
| Primary color | `#2aa5ca` (matches the new site's `brand-500`) |
| Accent / link color | `#2491af` (`brand-600`) |
| Background | warm white — `#fdfbf6` if PCO lets you pick a hex |
| Heading font | "Bebas Neue" or "Barlow Condensed" if PCO offers it; otherwise the closest condensed sans |
| Body font | "Roboto Slab" |

These bind to the embedded widgets too — Groups cards, event tiles, the modal, the calendar.

## 2. Public URLs

Path: **Church Center → Settings → URLs / Domains**.

- **Primary URL**: keep `rivercitymemphis.churchcenter.com` as canonical.
- **Custom domain `fortherivercity.org`**:
  - Option A (recommended) — **retire it**. After the new site is live, set `fortherivercity.org` to a 301 redirect → `https://rivercitymemphis.org/connect`. The DNS provider (e.g. Cloudflare, GoDaddy) handles this. Cancel the custom-domain mapping in PCO once redirected.
  - Option B — keep it as a Church Center custom domain pointing at one campaign page, but stop linking it from anywhere on the main site.

## 3. Featured content on the Church Center home

Path: **Church Center → Home Page**.

What appears on `rivercitymemphis.churchcenter.com` also appears inside the iframe embed at `rivercitymemphis.org/groups`, `/events`, etc. Curate it:

- **Featured Groups**: pin the 2-4 groups you want to highlight this season.
- **Featured Events / Registrations**: pin the upcoming-most-important 2-4.
- **Welcome message / hero**: short paragraph; the embedded pages don't show it (they're scoped lists), but the Church Center home does.

## 4. Notifications + mobile app

Path: **Church Center → Mobile App**.

If you publish to the Church Center mobile app, set the app icon to the new logo (1024×1024 PNG export of `logo.svg`) and the splash background to `#fdfbf6`. Visitors who hit "Open in app" from a modal will land in a consistent-feeling experience.

## 5. Verify it all looks right

Open these on the live dev site and check the embedded widgets match the main-site palette:

- `/groups` — groups card list inside an iframe
- `/events` — registrations list inside an iframe
- `/calendar` — calendar inside an iframe
- `/register` — registrations index inside an iframe
- Any header "Next Step" / homepage CTA button — should open a Church Center modal with the new brand colors

Anything still showing PCO's default purple → revisit step 1 (the primary color setting on Church Center).

## 6. What we did NOT change

- **Giving** — flows still go through PCO Giving (PCI-compliant, hosted by them). The "Give" link in the nav points at our own Sanity page, which in turn deep-links to Church Center Giving via a modal.
- **Forms** — each PCO form keeps its own URL on `churchcenter.com`. The new site uses modal links so the form opens over our page.
- **Check-ins** — these stay in PCO's native flow on Sunday; no embed needed.

## 7. Maintenance

When you publish a new event, group, or form in Planning Center, it shows up automatically in the relevant embed on the main site — no code change needed. The only time this repo needs a tweak is if you want a new page (e.g., "Volunteer at Christmas") that embeds a specific PCO URL — open `src/app/<your-slug>/page.tsx`, drop in a `<ChurchCenterEmbed path="/registrations/123" />`, done.

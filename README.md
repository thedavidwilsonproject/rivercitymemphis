# River City Church — Headless Rebuild

A modern rebuild of [rivercitymemphis.org](https://rivercitymemphis.org/), migrating off Drupal 7 onto headless **Sanity CMS + Next.js 16**.

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router, RSC, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind v4 with brand tokens |
| CMS | Sanity v5 (Studio embedded at `/studio`) |
| Fonts | Bebas Neue (display) + Roboto Slab (body) |
| Deploy | Vercel-ready |

## First-time setup

1. **Install deps** (already done if you cloned post-scaffold):
   ```bash
   npm install
   ```

2. **Create the Sanity project** — opens a browser for OAuth, then writes the projectId/dataset into `.env.local`:
   ```bash
   cp .env.local.example .env.local
   npx sanity@latest init --env=.env.local
   ```
   When prompted:
   - Login / select the same organization as your other Sanity site
   - Create new project → name it **River City Church**
   - Dataset: `production`
   - Output path: hit Enter (we already have schemas wired up)

3. **Create an API write token** for migration:
   - Go to https://www.sanity.io/manage → your project → API → Tokens
   - Add token, role **Editor**, copy the value
   - Paste into `.env.local` as `SANITY_API_WRITE_TOKEN`

4. **Run the Drupal → Sanity migration**:
   ```bash
   npm run migrate
   ```
   This scrapes the live Drupal site, uploads images, and creates documents in Sanity.

5. **Start the dev server**:
   ```bash
   npm run dev
   ```
   - Site: http://localhost:3000
   - Studio: http://localhost:3000/studio

## Project structure

```
src/
  app/
    layout.tsx               # Root layout with brand fonts + header/footer
    page.tsx                 # Homepage (hero + current series + ministries)
    studio/[[...tool]]/      # Embedded Sanity Studio
    (content)/[...slug]/     # Catch-all CMS-driven pages
  components/
    site-header.tsx
    site-footer.tsx
  sanity/
    env.ts
    client.ts                # read client (CDN)
    image.ts                 # image URL builder
    queries.ts               # GROQ queries
    schemaTypes/             # page, person, ministry, sermonSeries, siteSettings
    structure.ts             # Studio left-nav structure
  types/sanity.ts
scripts/
  migrate-from-drupal.ts     # idempotent scraper → Sanity
sanity.config.ts             # Studio config
```

## Brand tokens

Extracted from the existing Drupal theme CSS so the rebuild stays on-brand.

| Token | Hex |
|---|---|
| `brand-500` (turquoise) | `#2aa5ca` |
| `brand-400` (hover) | `#4db9da` |
| `accent-500` (CTA red) | `#e2333e` |
| `cream-100` (warm bg) | `#f5eee2` |
| `ink-800` (heading) | `#262626` |
| `ink-600` (body) | `#4c4c4c` |

## Re-running migration

The script uses `createOrReplace` keyed by stable `_id`s derived from slugs — re-running is idempotent and will overwrite existing docs with the latest scrape. Manual edits made in Studio after a migration run will be lost on the next migration unless you change the script or skip a section.

## Deploying

- **Frontend**: push to GitHub, import into Vercel, set env vars from `.env.local` (omit `SANITY_API_WRITE_TOKEN` — it's only needed for migration).
- **Studio**: optionally `npm run sanity:deploy` to host at `<project>.sanity.studio`, or just use embedded `/studio` on the deployed site.

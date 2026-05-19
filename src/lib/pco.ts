/**
 * Planning Center / Church Center API client.
 *
 * Auth: HTTP Basic with a Personal Access Token from
 *   https://api.planningcenteronline.com/oauth/applications
 * Env:
 *   PCO_APP_ID     — the application id (username)
 *   PCO_SECRET     — the secret (password)
 *
 * All fetches are server-side (these creds never reach the browser)
 * and cached for 5 minutes via Next's fetch cache.
 */

const PCO_BASE = "https://api.planningcenteronline.com";
const REVALIDATE_SECONDS = 300;

function authHeader(): string {
  const id = process.env.PCO_APP_ID;
  const secret = process.env.PCO_SECRET;
  if (!id || !secret) {
    throw new Error(
      "PCO credentials missing — set PCO_APP_ID and PCO_SECRET in .env.local",
    );
  }
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

type JsonApiResource = {
  type: string;
  id: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<
    string,
    { data: { type: string; id: string } | { type: string; id: string }[] | null }
  >;
  links?: Record<string, string>;
};

type JsonApiResponse = {
  data: JsonApiResource | JsonApiResource[];
  included?: JsonApiResource[];
  meta?: Record<string, unknown>;
  links?: Record<string, string>;
};

const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

/**
 * Strip HTML to plain text. Replaces block-level tag boundaries with
 * spaces (so words don't smush together), drops all tags, decodes
 * common entities, and collapses whitespace.
 */
function stripHtml(input: string | undefined): string | undefined {
  if (!input) return input;
  let s = input.replace(/<\s*(br|\/p|\/div|\/li|hr)[^>]*>/gi, " ");
  s = s.replace(/<[^>]+>/g, "");
  s = s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
  s = s.replace(/&[a-z0-9]+;/gi, (m) => HTML_ENTITIES[m.toLowerCase()] ?? " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

async function pcoGet(path: string): Promise<JsonApiResponse> {
  const url = path.startsWith("http") ? path : `${PCO_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: authHeader(),
      Accept: "application/vnd.api+json",
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`PCO ${res.status} ${res.statusText} on ${url}`);
  }
  return res.json();
}

// -----------------------------------------------------------------------------
// Registrations (events you can sign up for)
// -----------------------------------------------------------------------------

export type PcoSignup = {
  id: string;
  name: string;
  /** Cleaned plain-text description, all HTML/entities stripped. */
  description?: string;
  /** Paragraphs split from the original HTML, each cleaned to plain text. */
  descriptionParagraphs?: string[];
  logoUrl?: string;
  registrationUrl: string;
  open: boolean;
  openAt?: string;
  closeAt?: string;
  /** ISO datetime — first occurrence of the event, if scheduled. */
  startsAt?: string;
  endsAt?: string;
  /** Free-form location label if attached to this signup. */
  location?: string;
};

function splitParagraphs(html: string | undefined): string[] | undefined {
  if (!html) return undefined;
  // Split on paragraph or double-line boundaries before stripping
  const chunks = html
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<br[^>]*>\s*<br[^>]*>/gi, "\n\n")
    .split(/\n\n+/);
  const clean = chunks
    .map((c) => stripHtml(c) ?? "")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  return clean.length > 0 ? clean : undefined;
}

function mapSignup(
  d: JsonApiResource,
  includedByKey: Map<string, JsonApiResource>,
): PcoSignup {
  const a = d.attributes ?? {};
  const rawDesc = a.description ? String(a.description) : undefined;

  // Resolve the next scheduled time via the explicit relationship.
  // The `signup_times` (plural) relationship is a to-many — pick the
  // soonest. Never scan the global `included[]` array for an unrelated
  // SignupTime, since list responses contain entries from every signup.
  const timeRel = d.relationships?.next_signup_time?.data;
  const timesRel = d.relationships?.signup_times?.data;
  let timeRefs: { type: string; id: string }[] = [];
  if (timeRel && !Array.isArray(timeRel)) timeRefs = [timeRel];
  else if (Array.isArray(timesRel)) timeRefs = timesRel;

  const candidateTimes = timeRefs
    .map((ref) => includedByKey.get(`${ref.type}:${ref.id}`))
    .filter((t): t is JsonApiResource => Boolean(t));
  const effTime = candidateTimes
    .filter((t) => t.attributes?.starts_at)
    .sort((a, b) =>
      String(a.attributes!.starts_at).localeCompare(
        String(b.attributes!.starts_at),
      ),
    )[0];

  const locRel = d.relationships?.signup_location?.data;
  const locRef = locRel && !Array.isArray(locRel) ? locRel : null;
  const effLoc = locRef
    ? includedByKey.get(`${locRef.type}:${locRef.id}`)
    : undefined;

  const locAttrs = (effLoc?.attributes ?? {}) as Record<string, unknown>;
  return {
    id: d.id,
    name: String(a.name ?? ""),
    description: stripHtml(rawDesc),
    descriptionParagraphs: splitParagraphs(rawDesc),
    logoUrl: a.logo_url ? String(a.logo_url) : undefined,
    registrationUrl: String(a.new_registration_url ?? ""),
    open: Boolean(a.open),
    openAt: a.open_at ? String(a.open_at) : undefined,
    closeAt: a.close_at ? String(a.close_at) : undefined,
    startsAt: effTime?.attributes?.starts_at
      ? String(effTime.attributes.starts_at)
      : undefined,
    endsAt: effTime?.attributes?.ends_at
      ? String(effTime.attributes.ends_at)
      : undefined,
    location:
      (locAttrs.full_formatted_address as string | undefined)?.trim() ||
      (locAttrs.formatted_address as string | undefined)?.trim() ||
      (locAttrs.name as string | undefined)?.trim() ||
      undefined,
  };
}

/**
 * List currently open, unarchived event signups, ordered by next event date.
 */
export async function listOpenSignups(limit = 20): Promise<PcoSignup[]> {
  const qs = new URLSearchParams({
    filter: "unarchived",
    include: "next_signup_time,signup_location",
    per_page: String(limit),
    "where[open]": "true",
  });
  const res = await pcoGet(`/registrations/v2/signups?${qs}`);
  const data = Array.isArray(res.data) ? res.data : [res.data];
  const included = res.included ?? [];

  const includedByKey = new Map<string, JsonApiResource>();
  for (const r of included) includedByKey.set(`${r.type}:${r.id}`, r);

  const signups = data.map((d) => mapSignup(d, includedByKey));

  // Sort: scheduled events with start dates first (soonest), then ongoing
  return signups.sort((a, b) => {
    if (a.startsAt && b.startsAt) return a.startsAt.localeCompare(b.startsAt);
    if (a.startsAt) return -1;
    if (b.startsAt) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Fetch a single signup by id, with all related times and location included.
 * Returns null if not found.
 */
export async function getSignup(id: string): Promise<PcoSignup | null> {
  const qs = new URLSearchParams({
    include: "signup_times,signup_location",
  });
  try {
    const res = await pcoGet(`/registrations/v2/signups/${id}?${qs}`);
    const item = Array.isArray(res.data) ? res.data[0] : res.data;
    if (!item) return null;
    const includedByKey = new Map<string, JsonApiResource>();
    for (const r of res.included ?? []) {
      includedByKey.set(`${r.type}:${r.id}`, r);
    }
    return mapSignup(item, includedByKey);
  } catch {
    return null;
  }
}

/**
 * Format a signup's date for display. Returns a short human-friendly string
 * like "Sat, Jun 14 · 6 PM" or "Ongoing" if no date is attached.
 */
export function formatSignupDate(s: PcoSignup): string {
  if (!s.startsAt) return "Ongoing";
  const start = new Date(s.startsAt);
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: undefined,
  });
  return `${dateFmt.format(start)} · ${timeFmt.format(start)}`;
}

/**
 * Longer, richer date label for the detail page. Handles single-day +
 * multi-day spans, with times when relevant.
 */
export function formatSignupSchedule(s: PcoSignup): string {
  if (!s.startsAt) return "Ongoing registration";
  const start = new Date(s.startsAt);
  const end = s.endsAt ? new Date(s.endsAt) : undefined;
  const sameDay =
    end &&
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCDate() === end.getUTCDate();
  const longDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const shortDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  });

  if (!end) return longDate.format(start);
  if (sameDay) {
    return `${longDate.format(start)} · ${time.format(start)} – ${time.format(end)}`;
  }
  return `${shortDate.format(start)} – ${shortDate.format(end)}, ${end.getFullYear()}`;
}

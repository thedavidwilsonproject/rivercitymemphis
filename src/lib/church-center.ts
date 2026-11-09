/**
 * What River City publishes on Church Center (rivercitymemphis.churchcenter.com),
 * mirrored into the site:
 *   - which registration events are publicly listed there
 *   - calendar events marked "visible in Church Center"
 *   - the public People forms
 *
 * Server-only. Every helper degrades to "nothing" on failure.
 */
import { CHURCH_CENTER_HOST } from "@/components/church-center";

const PCO_BASE = "https://api.planningcenteronline.com";
const REVALIDATE_SECONDS = 300;

export const ccUrl = (path: string) =>
  `https://${CHURCH_CENTER_HOST}${path.startsWith("/") ? "" : "/"}${path}`;

/** Public Church Center forms (People → Forms). */
export const CC_FORMS = {
  connection: {
    label: "Connection card",
    title: "New here? Say hello.",
    body: "Tell us a little about yourself and someone from our team will follow up — no pressure.",
    href: ccUrl("/people/forms/174362"),
  },
  groupsServing: {
    label: "Groups & serving",
    title: "Find a group or a team.",
    body: "Interested in a community group, serving on Sundays, or both? Let us know and we'll help you take the next step.",
    href: ccUrl("/people/forms/1318485"),
  },
  volunteer: {
    label: "Volunteer",
    title: "Join a Sunday team.",
    body: "Family Ministry, Host Team, Parking, Production — there's a place for you to put others first.",
    href: ccUrl("/people/forms/218536"),
  },
} as const;

/**
 * IDs of registration events publicly listed on Church Center's
 * /registrations page. Parsed from the server-rendered HTML; returns null
 * if the page can't be read (callers then fall back to other rules).
 */
export async function getChurchCenterListedSignupIds(): Promise<Set<string> | null> {
  try {
    const res = await fetch(ccUrl("/registrations/events"), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RiverCityChurchSite/1.0)" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const ids = new Set<string>();
    for (const m of html.matchAll(/\/registrations\/events\/(\d+)/g)) ids.add(m[1]);
    return ids;
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// Calendar
// -----------------------------------------------------------------------------

export type CcCalendarEvent = {
  id: string;
  name: string;
  startsAt: string;
  endsAt?: string;
  allDay: boolean;
  location?: string;
  url: string;
  imageUrl?: string;
};

function authHeader(): string | null {
  const id = process.env.PCO_APP_ID;
  const secret = process.env.PCO_SECRET;
  if (!id || !secret) return null;
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

/**
 * Calendar event instances between two ISO dates that are marked
 * "visible in Church Center" (i.e. what the public calendar shows).
 */
export async function listChurchCenterCalendar(
  fromIso: string,
  toIso: string,
): Promise<CcCalendarEvent[]> {
  const auth = authHeader();
  if (!auth) return [];
  const qs = new URLSearchParams({
    "where[starts_at][gte]": fromIso,
    "where[starts_at][lt]": toIso,
    include: "event",
    order: "starts_at",
    per_page: "100",
  });
  try {
    const res = await fetch(`${PCO_BASE}/calendar/v2/event_instances?${qs}`, {
      headers: { Authorization: auth, Accept: "application/vnd.api+json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    type R = {
      id: string;
      type: string;
      attributes: Record<string, unknown>;
      relationships?: { event?: { data?: { id: string } } };
    };
    const json = (await res.json()) as { data: R[]; included?: R[] };
    const events = new Map(
      (json.included ?? []).filter((r) => r.type === "Event").map((r) => [r.id, r.attributes]),
    );
    return json.data.flatMap((i) => {
      const ev = events.get(i.relationships?.event?.data?.id ?? "");
      if (!ev || ev.visible_in_church_center !== true) return [];
      const a = i.attributes;
      return [
        {
          id: i.id,
          name: String(ev.name ?? a.name ?? ""),
          startsAt: String(a.published_starts_at ?? a.starts_at),
          endsAt: a.published_ends_at || a.ends_at ? String(a.published_ends_at ?? a.ends_at) : undefined,
          allDay: Boolean(a.all_day_event),
          location: a.location ? String(a.location) : undefined,
          url: String(a.church_center_url ?? ccUrl(`/calendar/event/${i.id}`)),
          imageUrl: ev.image_url ? String(ev.image_url) : undefined,
        },
      ];
    });
  } catch {
    return [];
  }
}

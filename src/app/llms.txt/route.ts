import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  const body = `# River City Church

> A non-denominational church in Bartlett, TN (Greater Memphis) partnering with God to lead people to refocus their life, home, and church back to God.

## Key facts
- Location: 3871 Kirby Whitten Parkway, Bartlett, TN 38135
- Sunday service: 10:15 AM (coffee from 10:00; service runs ~65–70 minutes)
- Lead Pastor: Jonathan Dunn
- Phone: (901) 386-4171
- Email: info@rivercitymemphis.org
- Family Ministry available for infants through 8th grade during the Sunday service

## What to expect on a first visit
A relaxed, friendly community where people accept you for who you are.
Arrive about 15 minutes early. Park anywhere — host will meet you at the door
and walk you to the Kids/Students building for Check-In if needed. Service is
about 65–70 minutes of worship and teaching, then coffee and conversation in
the lobby.

## Beliefs (summary)
A non-denominational, Bible-centered church. Belief in one God (Father, Son,
Holy Spirit), the inspired Scripture, salvation through faith in Jesus Christ,
the local church as God's chosen instrument, and the call to make disciples.

## Ministries
- Waumba Land — infants through Pre-K
- UpStreet — Kindergarten through 5th grade
- Transit — Middle school (Sunday mornings)
- Student Impact / All Access — High school (Sundays + Wednesday 6:15 PM)
- RCC Groups — Community Groups (twice a month, in homes) and Focus Groups (90-day book studies)

## Important pages
- Home: ${SITE_URL}/
- Who We Are: ${SITE_URL}/visit/who-we-are
- What to Expect (first visit): ${SITE_URL}/visit/what-to-expect
- Location & Service Times: ${SITE_URL}/visit/location
- Leadership: ${SITE_URL}/visit/leadership
- FAQs: ${SITE_URL}/visit/faqs
- Watch Sermons: ${SITE_URL}/watch
- Groups: ${SITE_URL}/groups
- Events: ${SITE_URL}/events
- Give: ${SITE_URL}/give
- Contact: ${SITE_URL}/contact

## Sitemap
${SITE_URL}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

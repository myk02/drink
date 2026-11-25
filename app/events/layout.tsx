import type { Metadata } from "next"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { SITE_NAME, SITE_URL } from "@/lib/site"

export const revalidate = 600

export const metadata: Metadata = {
  title: "Events & Activations",
  description:
    "Free GiGi Energy tastings, gym sessions, office drops and festival activations across Nairobi. Register for a spot.",
  alternates: { canonical: `${SITE_URL}/events` },
  openGraph: {
    title: `Events & Activations | ${SITE_NAME}`,
    description: "Free tastings, gym takeovers and Nairobi activations. Register for a spot.",
    url: `${SITE_URL}/events`,
    type: "website",
  },
}

// Event structured data lets Google surface dates and locations in search.
// Fetched server-side so the JSON-LD is in the initial HTML.
export default async function EventsLayout({ children }: { children: React.ReactNode }) {
  let jsonLd: string | null = null
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (url) {
    try {
      const client = new ConvexHttpClient(url)
      const events = await client.query(api.events.getAll, {})
      const upcoming = events
        .filter((e) => e.status !== "completed")
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .slice(0, 10)

      if (upcoming.length > 0) {
        jsonLd = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: upcoming.map((event, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Event",
              name: event.title,
              description: event.description,
              startDate: event.date,
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              eventStatus: "https://schema.org/EventScheduled",
              location: {
                "@type": "Place",
                name: event.location,
                address: {
                  "@type": "PostalAddress",
                  addressLocality: event.location,
                  addressCountry: "KE",
                },
              },
              image: event.image ? `${SITE_URL}${event.image}` : `${SITE_URL}/images/gigi.jpg`,
              organizer: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "KES",
                availability: "https://schema.org/InStock",
                url: `${SITE_URL}/events`,
              },
            },
          })),
        })
      }
    } catch {
      // SEO extras must never break the page.
    }
  }

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
      {children}
    </>
  )
}

import type { MetadataRoute } from "next"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { SITE_URL } from "@/lib/site"

export const revalidate = 3600

// Static routes stay as a guaranteed baseline; product and event pages are
// added from Convex so new packs and activations appear without a code change.
const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" | "daily" }> = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/flavours", priority: 0.8, changeFrequency: "monthly" },
  { path: "/shop", priority: 0.9, changeFrequency: "weekly" },
  { path: "/subscribe", priority: 0.8, changeFrequency: "monthly" },
  { path: "/events", priority: 0.8, changeFrequency: "weekly" },
  { path: "/events/tasting", priority: 0.7, changeFrequency: "weekly" },
  { path: "/events/gyms", priority: 0.7, changeFrequency: "weekly" },
  { path: "/events/corporate", priority: 0.7, changeFrequency: "weekly" },
  { path: "/events/organizers", priority: 0.7, changeFrequency: "weekly" },
  { path: "/support", priority: 0.7, changeFrequency: "monthly" },
  { path: "/stores", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/distributors", priority: 0.6, changeFrequency: "monthly" },
  { path: "/careers", priority: 0.6, changeFrequency: "monthly" },
  { path: "/careers/field-sales-lead", priority: 0.5, changeFrequency: "monthly" },
  { path: "/careers/operations-logistics-associate", priority: 0.5, changeFrequency: "monthly" },
  { path: "/careers/brand-social-media-intern", priority: 0.5, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/orders/track", priority: 0.4, changeFrequency: "monthly" },
  { path: "/legal/privacy", priority: 0.3, changeFrequency: "monthly" },
  { path: "/legal/terms", priority: 0.3, changeFrequency: "monthly" },
  { path: "/legal/cookies", priority: 0.3, changeFrequency: "monthly" },
]

function convexClient(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) return null
  return new ConvexHttpClient(url)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const client = convexClient()
  if (!client) return entries

  // A dead deployment must not break /sitemap.xml — fall back to static routes.
  const [products, events] = await Promise.all([
    client.query(api.products.getActive, {}).catch(() => []),
    client.query(api.events.getAll, {}).catch(() => []),
  ])

  const seen = new Set(entries.map((e) => e.url))
  const push = (url: string, priority: number, lastModified?: Date) => {
    if (seen.has(url)) return
    seen.add(url)
    entries.push({ url, lastModified: lastModified ?? now, changeFrequency: "weekly", priority })
  }

  for (const product of products) {
    push(`${SITE_URL}/shop/${product.slug}`, 0.8)
  }
  for (const event of events) {
    if (event.status === "completed") continue
    push(`${SITE_URL}/events/${event.category}`, 0.6, new Date(event.date))
  }

  return entries
}

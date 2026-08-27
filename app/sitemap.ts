import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const routes = [
    "",
    "/flavours",
    "/shop",
    "/subscribe",
    "/support",
    "/events",
    "/events/tasting",
    "/events/gyms",
    "/events/corporate",
    "/events/organizers",
    "/distributors",
    "/careers",
    "/careers/field-sales-lead",
    "/careers/operations-logistics-associate",
    "/careers/brand-social-media-intern",
    "/about",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
    "/legal/cookies",
  ]

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : route.startsWith("/legal") ? 0.3 : 0.7,
  }))
}

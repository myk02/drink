import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const routes = [
    "",
    "/flavours",
    "/shop",
    "/shop/taster-6",
    "/shop/mixed-24",
    "/shop/lemon-lime-12",
    "/shop/pineapple-coconut-12",
    "/shop/mango-passion-12",
    "/shop/baobab-berry-12",
    "/shop/tamarind-ginger-12",
    "/shop/watermelon-mint-12",
    "/shop/hibiscus-raspberry-12",
    "/shop/guava-chili-12",
    "/shop/passion-lemonade-12",
    "/shop/blackcurrant-acai-12",
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

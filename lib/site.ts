// Canonicals, OG tags, sitemap entries and email links all derive from this.
// The fallback must be the domain that actually serves the site — gigi.energy
// does not resolve, so defaulting to it published 36 dead sitemap URLs.
// Set NEXT_PUBLIC_SITE_URL to override (e.g. once a custom domain goes live).
const rawSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim()
export const SITE_URL = (rawSiteUrl || "https://giflavours.vercel.app").replace(/\/$/, "")

export const SITE_NAME = "GiGi Energy"

export const SITE_DESCRIPTION =
  "Zero sugar, 75mg caffeine, 100% natural flavors. Kenya's own energy drink — available in Nairobi and across the country."

const rawSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim()
export const SITE_URL = (rawSiteUrl || "https://gigi.energy").replace(/\/$/, "")

export const SITE_NAME = "GiGi Energy"

export const SITE_DESCRIPTION =
  "Zero sugar, 75mg caffeine, 100% natural flavors. Kenya's own energy drink — available in Nairobi and across the country."

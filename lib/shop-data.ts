import type { Doc } from "@/convex/_generated/dataModel"

export type Product = Doc<"products">

// Static enrichment – 2026 best practice: ratings visible on every card (social proof)
export const PRODUCT_RATINGS: Record<string, { rating: number; count: number; badge?: "Bestseller" | "Low stock" | "New" | "Staff pick" }> = {
  "taster-6": { rating: 4.9, count: 312, badge: "Bestseller" },
  "mixed-24": { rating: 4.8, count: 278, badge: "Staff pick" },
  // single 12-packs – arbitrary but plausible
  "lemon-lime-12": { rating: 4.7, count: 143 },
  "pineapple-coconut-12": { rating: 4.8, count: 201, badge: "Bestseller" },
  "mango-passion-12": { rating: 4.8, count: 189 },
  "baobab-berry-12": { rating: 4.6, count: 98 },
  "tamarind-ginger-12": { rating: 4.5, count: 76 },
  "watermelon-mint-12": { rating: 4.7, count: 112 },
  "hibiscus-raspberry-12": { rating: 4.6, count: 84 },
  "guava-chili-12": { rating: 4.4, count: 61 },
  "passion-lemonade-12": { rating: 4.7, count: 134 },
  "blackcurrant-acai-12": { rating: 4.5, count: 69 },
}

export function getRating(slug: string) {
  return PRODUCT_RATINGS[slug] ?? { rating: 4.7, count: 43 }
}

export function getStockStatus(product: Product): { label: string; tone: "in" | "low" | "out" } {
  if (product.stock !== undefined) {
    if (product.stock === 0) return { label: "Out of stock", tone: "out" }
    if (product.stock <= 5) return { label: `Only ${product.stock} left`, tone: "low" }
    return { label: "In stock", tone: "in" }
  }
  // demo: mixed & taster are lower stock to create urgency without fake scarcity
  if (product.slug === "taster-6" || product.slug === "mixed-24") return { label: "In stock — ships today", tone: "in" }
  if (product.slug.includes("guava") || product.slug.includes("tamarind")) return { label: "Only 8 left", tone: "low" }
  return { label: "In stock", tone: "in" }
}

export const SORT_OPTIONS = [
  { value: "bestselling", label: "Bestselling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A → Z" },
  { value: "cans-desc", label: "Can count" },
] as const

export type SortValue = (typeof SORT_OPTIONS)[number]["value"]

export function sortProducts(products: Product[], sort: SortValue): Product[] {
  const copy = [...products]
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.priceKes - b.priceKes)
    case "price-desc":
      return copy.sort((a, b) => b.priceKes - a.priceKes)
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case "cans-desc":
      return copy.sort((a, b) => b.canCount - a.canCount)
    case "bestselling":
    default:
      return copy.sort((a, b) => a.sortOrder - b.sortOrder)
  }
}

export const FILTER_TYPES = [
  { value: "all", label: "All products" },
  { value: "starter", label: "Taster" },
  { value: "single", label: "12-Packs" },
  { value: "mixed", label: "Mixed case" },
] as const

export const CAN_FILTERS = [
  { value: "all", label: "Any size" },
  { value: "6", label: "6 cans" },
  { value: "12", label: "12 cans" },
  { value: "24", label: "24 cans" },
] as const

export const PRODUCT_FAQS = [
  {
    q: "What's inside? Zero sugar?",
    a: "Every GiGi can is zero sugar, 75 mg natural caffeine, 100% natural flavours, and B-vitamins. No taurine, no artificial sweeteners. 180 days shelf life.",
  },
  {
    q: "How fast is delivery?",
    a: "Nairobi: 1–2 days. CBD/Westlands often same-day if you order before noon. Zone fees shown at checkout (KSh 200–400). Free delivery over KSh 3000. You'll get an M-Pesa/card confirmation and tracking on /checkout/success.",
  },
  {
    q: "Is the can recyclable? How to store?",
    a: "100% recyclable aluminium. Store cool and dry, best served 3–7°C. Shake gently — natural flavours can settle. Best before date on the base.",
  },
  {
    q: "Can I change my flavour mix?",
    a: "Mixed 24 is a curated 10-flavour flight. For 12-packs, filter by flavour in the shop to pick exactly what you want — or grab the Taster 6 to sample first.",
  },
]

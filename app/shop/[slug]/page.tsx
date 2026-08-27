import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"
import ShopSlugClient from "./client"

const SLUGS = [
  "taster-6",
  "mixed-24",
  "lemon-lime-12",
  "pineapple-coconut-12",
  "mango-passion-12",
  "baobab-berry-12",
  "tamarind-ginger-12",
  "watermelon-mint-12",
  "hibiscus-raspberry-12",
  "guava-chili-12",
  "passion-lemonade-12",
  "blackcurrant-acai-12",
]

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const pretty = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  const title = `${pretty} — GiGi Energy | Shop Cases & Packs`
  const description = `Buy ${pretty} — zero sugar, 75mg caffeine, natural flavours. 1–2 day Nairobi delivery. M-Pesa or card.`
  const url = `${SITE_URL}/shop/${slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  }
}

export default function Page() {
  return <ShopSlugClient />
}

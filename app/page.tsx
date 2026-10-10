import type { Metadata } from "next"
import { HeroSection } from "@/components/hero-section"
import { FlavorCarousel } from "@/components/flavor-carousel"
import { BentoGrid } from "@/components/bento-grid"
import { DynamicSections } from "@/components/dynamic-sections"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "GiGi Energy — Zero Sugar Energy Drink Kenya",
  description:
    "Zero sugar, 75mg natural caffeine, 100% natural flavours. Kenya's own energy drink — shop cases & packs, join GiGi Club, find stockists in Nairobi and upcountry.",
  alternates: { canonical: SITE_URL },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FlavorCarousel />
      <BentoGrid />
      <DynamicSections />
    </main>
  )
}

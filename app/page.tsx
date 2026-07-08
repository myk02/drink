import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { FlavorCarousel } from "@/components/flavor-carousel"
import { BentoGrid } from "@/components/bento-grid"
import { DynamicSections } from "@/components/dynamic-sections"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FlavorCarousel />
      <BentoGrid />
      <DynamicSections />
    </main>
  )
}

"use client"

import dynamic from "next/dynamic"

const ActivationsSection = dynamic(() => import("@/components/activations-section").then(mod => mod.ActivationsSection), { ssr: false })
const Footer = dynamic(() => import("@/components/footer").then(mod => mod.Footer), { ssr: false })

export function DynamicSections() {
  return (
    <>
      <ActivationsSection />
      <Footer />
    </>
  )
}

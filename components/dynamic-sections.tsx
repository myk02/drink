"use client"

import dynamic from "next/dynamic"

const ActivationsSection = dynamic(() => import("@/components/activations-section").then(mod => mod.ActivationsSection), {
  ssr: false,
  loading: () => <div className="h-64 bg-white/[0.02] border-y border-white/5" aria-hidden="true" />,
})

export function DynamicSections() {
  return <ActivationsSection />
}

"use client"

import { useState, useEffect, type ReactNode } from "react"
import dynamic from "next/dynamic"

const ConvexProviderWithAuth = dynamic(
  () => import("./convex-provider-inner"),
  { ssr: false }
)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR/prerendering, render children without Convex wrapper
  // The useQuery-dependent pages are dynamically imported with ssr:false
  if (!mounted) {
    return <>{children}</>
  }

  return <ConvexProviderWithAuth>{children}</ConvexProviderWithAuth>
}

"use client"

import type { ReactNode } from "react"
import dynamic from "next/dynamic"
import { useSyncExternalStore } from "react"

const ConvexProviderWithAuth = dynamic(() => import("./convex-provider-inner"), { ssr: false })

// No-op subscribe: the value never changes after hydration.
const emptySubscribe = () => () => {}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // useSyncExternalStore avoids the setState-in-effect render cascade while
  // still only mounting Convex (which reads browser-only auth state) client-side.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false // server snapshot: render children without Convex wrapper
  )

  // During SSR/prerendering, render children without Convex wrapper
  // The useQuery-dependent pages are dynamically imported with ssr:false
  if (!mounted) {
    return <>{children}</>
  }

  return <ConvexProviderWithAuth>{children}</ConvexProviderWithAuth>
}

"use client"

import { useSyncExternalStore, type ReactNode } from "react"

// No-op subscribe: the value never changes after hydration.
const emptySubscribe = () => () => {}

export function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  // useSyncExternalStore is the React-recommended way to gate client-only
  // rendering: no setState-in-effect cascade, SSR-safe, hydration-friendly.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot: rendered on the client
    () => false // server snapshot: not yet mounted
  )

  if (!mounted) {
    return fallback ?? null
  }

  return <>{children}</>
}

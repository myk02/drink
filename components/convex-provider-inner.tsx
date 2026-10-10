"use client"

import { ConvexReactClient } from "convex/react"
import { useAuth } from "@clerk/nextjs"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import type { ReactNode } from "react"
import { useMemo } from "react"

export default function ConvexProviderInner({ children }: { children: ReactNode }) {
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL
    if (!url) return null
    return new ConvexReactClient(url)
  }, [])

  if (!convex) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[convex] NEXT_PUBLIC_CONVEX_URL is missing — running without backend data.")
    }
    // Never render useQuery trees without a client — that throws
    // "Could not find Convex client". Show an explicit offline state.
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center px-6">
        <div className="max-w-md text-center bg-white/5 border border-white/10 p-8">
          <p className="text-white font-black text-lg">STORE OFFLINE</p>
          <p className="text-white/50 font-mono text-sm mt-2">
            The shop backend isn&apos;t configured. Set NEXT_PUBLIC_CONVEX_URL and redeploy.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}

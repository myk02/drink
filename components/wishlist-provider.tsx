"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

interface WishlistContextValue {
  ids: Set<string>
  count: number
  hydrated: boolean
  isWishlisted: (id: string) => boolean
  toggle: (id: string) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)
const STORAGE_KEY = "gigi-wishlist-v1"

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setIds(new Set(JSON.parse(raw) as string[]))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
    } catch {}
  }, [ids, hydrated])

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const isWishlisted = useCallback((id: string) => ids.has(id), [ids])

  const value = useMemo(
    () => ({ ids, count: ids.size, hydrated, isWishlisted, toggle }),
    [ids, hydrated, isWishlisted, toggle]
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be inside <WishlistProvider>")
  return ctx
}

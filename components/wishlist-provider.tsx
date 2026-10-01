"use client"

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react"
import { createLocalStorageStore } from "@/lib/local-storage-store"

interface WishlistContextValue {
  ids: Set<string>
  count: number
  hydrated: boolean
  isWishlisted: (id: string) => boolean
  toggle: (id: string) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)
const STORAGE_KEY = "gigi-wishlist-v1"

function parseStoredWishlist(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null
  const ids = raw.filter((id): id is string => typeof id === "string")
  return ids
}

const wishlistStore = createLocalStorageStore<string[]>(
  STORAGE_KEY,
  parseStoredWishlist,
  []
)

const emptySubscribe = () => () => {}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const storedIds = useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    wishlistStore.getServerSnapshot
  )
  const hydrated = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const ids = useMemo(() => new Set(storedIds), [storedIds])

  const toggle = useCallback((id: string) => {
    const current = wishlistStore.get()
    const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id]
    wishlistStore.set(next)
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

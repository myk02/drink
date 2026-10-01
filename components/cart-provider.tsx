"use client"

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react"
import { createLocalStorageStore } from "@/lib/local-storage-store"

export interface CartItem {
  productId: string
  slug: string
  name: string
  image: string
  canCount: number
  priceKes: number
  compareAtKes?: number
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  totalCount: number
  subtotalKes: number
  isOpen: boolean
  hydrated: boolean
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "gigi-cart-v1"
const MAX_QTY_PER_ITEM = 20

function parseStoredCart(raw: unknown): CartItem[] | null {
  if (!Array.isArray(raw)) return null
  const items: CartItem[] = []
  for (const it of raw) {
    if (typeof it !== "object" || it === null) continue
    const c = it as Partial<CartItem>
    if (
      typeof c.productId !== "string" ||
      typeof c.slug !== "string" ||
      typeof c.name !== "string" ||
      typeof c.image !== "string" ||
      typeof c.priceKes !== "number" ||
      typeof c.quantity !== "number" ||
      typeof c.canCount !== "number"
    ) {
      continue
    }
    if (!Number.isFinite(c.priceKes) || !Number.isFinite(c.quantity) || !Number.isFinite(c.canCount)) continue
    const quantity = Math.max(1, Math.min(Math.floor(c.quantity), MAX_QTY_PER_ITEM))
    items.push({
      productId: c.productId,
      slug: c.slug,
      name: c.name,
      image: c.image,
      canCount: Math.max(1, Math.floor(c.canCount)),
      priceKes: Math.max(0, Math.round(c.priceKes)),
      compareAtKes: typeof c.compareAtKes === "number" && Number.isFinite(c.compareAtKes) ? c.compareAtKes : undefined,
      quantity,
    })
  }
  return items
}

// The localStorage store is the source of truth for cart items; the drawer's
// open/closed state stays plain React state (session-only, not persisted).
const cartStore = createLocalStorageStore<CartItem[]>(STORAGE_KEY, parseStoredCart, [])

function useCartItems(): CartItem[] {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot)
}

const emptySubscribe = () => () => {}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useCartItems()
  const [isOpen, setIsOpen] = useState(false)
  // Hydration flag without a setState-in-effect: server snapshot false,
  // client snapshot true — matches the old `hydrated` contract.
  const hydrated = useSyncExternalStore(emptySubscribe, () => true, () => false)

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    const next = cartStore
      .get()
      .map((i) => i)
    const existing = next.find((i) => i.productId === item.productId)
    const updated = existing
      ? next.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_QTY_PER_ITEM) }
            : i
        )
      : [...next, { ...item, quantity: Math.min(quantity, MAX_QTY_PER_ITEM) }]
    cartStore.set(updated)
  }, [])

  const removeItem = useCallback((productId: string) => {
    cartStore.set(cartStore.get().filter((i) => i.productId !== productId))
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const prev = cartStore.get()
    const next =
      quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(quantity, MAX_QTY_PER_ITEM) } : i))
    cartStore.set(next)
  }, [])

  const clearCart = useCallback(() => cartStore.set([]), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartContextValue>(() => {
    const totalCount = items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotalKes = items.reduce((sum, i) => sum + i.priceKes * i.quantity, 0)
    return {
      items,
      totalCount,
      subtotalKes,
      isOpen,
      // True only after client hydration — lets pages show a loader instead of
      // flashing an empty cart on first paint (SSR snapshot is always []).
      hydrated,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      openCart,
      closeCart,
    }
  }, [items, isOpen, hydrated, addItem, removeItem, setQuantity, clearCart, openCart, closeCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>")
  return ctx
}

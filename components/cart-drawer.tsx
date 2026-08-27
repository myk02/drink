"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/components/cart-provider"
import { formatKes, FREE_DELIVERY_THRESHOLD_KES } from "@/lib/delivery"

export function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, removeItem, subtotalKes, totalCount } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-[80] h-full w-full max-w-md bg-[#121212] border-l border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#AFFF00]" />
                Your Cart {totalCount > 0 && <span className="text-white/40 font-mono text-sm">({totalCount})</span>}
              </h2>
              <button
                onClick={closeCart}
                className="p-2 text-white/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-7 h-7 text-[#AFFF00]/60" />
                </div>
                <p className="text-white/60 font-mono text-sm mb-1">Your cart is empty.</p>
                <p className="text-white/30 font-mono text-xs mb-6">Time to fuel up.</p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity"
                >
                  Shop Cases
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="flex gap-4 bg-white/5 border border-white/10 p-3"
                      >
                        <Link href="/shop" onClick={closeCart} className="shrink-0">
                          <div className="relative w-16 h-20 bg-white/5 overflow-hidden">
                            <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-white font-bold text-sm leading-snug">{item.name}</h3>
                              <p className="text-white/40 font-mono text-xs mt-0.5">{item.canCount} cans</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="p-1 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-2 py-1">
                              <button
                                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                                className="text-white/60 hover:text-[#AFFF00] transition-colors cursor-pointer p-1"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-white font-mono text-sm w-5 text-center">{item.quantity}</span>
                              <button
                                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                                className="text-white/60 hover:text-[#AFFF00] transition-colors cursor-pointer p-1"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[#AFFF00] font-bold text-sm">
                              {formatKes(item.priceKes * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="border-t border-white/10 px-6 py-5 space-y-4">
                  {(() => {
                    const threshold = FREE_DELIVERY_THRESHOLD_KES
                    const remaining = Math.max(0, threshold - subtotalKes)
                    const pct = Math.min(100, Math.round((subtotalKes / threshold) * 100))
                    return (
                      <div className="bg-white/5 border border-white/10 p-3">
                        <div className="flex justify-between text-white/60 font-mono text-xs">
                          <span>{remaining === 0 ? "Free delivery unlocked ✓" : `Add ${formatKes(remaining)} for free delivery`}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-white/10 overflow-hidden">
                          <div className="h-full bg-[#AFFF00] transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })()}
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 font-mono text-sm">Subtotal</span>
                    <span className="text-white font-bold text-lg">{formatKes(subtotalKes)}</span>
                  </div>
                  <p className="text-white/30 font-mono text-xs">Delivery by zone at checkout (KSh 200–400). Fresh sealed batches.</p>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="block w-full bg-[#AFFF00] text-[#121212] py-4 text-center font-bold text-sm tracking-wide relative overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    Checkout — {formatKes(subtotalKes)}
                  </Link>
                  <p className="text-white/20 font-mono text-[11px] text-center">M-Pesa or card via Paystack • 1–2 day Nairobi</p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export function AddToCartButton({
  product,
  className = "",
  label,
}: {
  product: {
    _id: string
    name: string
    slug: string
    image: string
    canCount: number
    priceKes: number
    compareAtKes?: number
  }
  className?: string
  label?: string
}) {
  const { addItem, openCart } = useCart()

  const handleAdd = () => {
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      canCount: product.canCount,
      priceKes: product.priceKes,
      compareAtKes: product.compareAtKes,
    })
    toast.success(`${product.name} added to cart`, {
      action: { label: "View Cart", onClick: openCart },
    })
  }

  return (
    <button
      onClick={handleAdd}
      className={
        className ||
        "w-full bg-[#AFFF00] text-[#121212] px-4 py-3 font-bold text-sm tracking-wide relative overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
      }
    >
      {label ?? `Add to Cart · ${formatKes(product.priceKes)}`}
    </button>
  )
}

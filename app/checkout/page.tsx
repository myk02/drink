"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Lock, Loader2, ChevronDown, Minus, Plus, Trash2 } from "lucide-react"
import { useAction, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { useCart } from "@/components/cart-provider"
import { ClientOnly } from "@/components/client-only"
import { DELIVERY_ZONES, formatKes, computeDeliveryFeeKes, FREE_DELIVERY_THRESHOLD_KES } from "@/lib/delivery"

const inputClass =
  "w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"

function CheckoutContent() {
  const cart = useCart()
  const createCheckout = useAction(api.payments.createCheckoutSession)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Restore contact info if the user paid here before — lazy init reads
  // localStorage once (client-only component), no hydration effect needed.
  const [form, setForm] = useState(() => {
    const base = { name: "", email: "", phone: "", zone: "", address: "", notes: "" }
    try {
      const last = typeof window !== "undefined" ? window.localStorage.getItem("gigi-last-order") : null
      if (last) {
        const parsed = JSON.parse(last) as { email?: string; name?: string; phone?: string; address?: string; zone?: string }
        return {
          ...base,
          email: parsed.email ?? base.email,
          name: parsed.name ?? base.name,
          phone: parsed.phone ?? base.phone,
          address: parsed.address ?? base.address,
          zone: parsed.zone ?? base.zone,
        }
      }
    } catch {
      // ignore
    }
    return base
  })
  const [redirecting, setRedirecting] = useState(false)

  // Only reveal a member discount when this email belongs to the signed-in
  // account. The server independently repeats this check when creating checkout.
  const emailTrimmed = form.email.trim().toLowerCase()
  const membership = useQuery(
    api.subscriptions.getMyShopDiscount,
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed) ? { email: emailTrimmed } : "skip"
  )

  // Same computation the backend charges — keeps UI total == charged total.
  // Delivery/free-delivery threshold is judged on the PRE-discount subtotal
  // ("spend KSh 3,000 → free delivery"), matching createCheckoutSession.
  const discountPct = membership?.discountPct ?? null
  const memberDiscountKes = discountPct ? Math.round((cart.subtotalKes * discountPct) / 100) : 0
  const deliveryFeeKes = form.zone ? computeDeliveryFeeKes(form.zone, cart.subtotalKes) : null
  const totalKes = deliveryFeeKes !== null ? cart.subtotalKes - memberDiscountKes + deliveryFeeKes : null
  const freeDeliveryUnlocked = cart.subtotalKes >= FREE_DELIVERY_THRESHOLD_KES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    if (!form.zone) {
      toast.error("Please choose a delivery zone")
      return
    }
    if (form.phone.replace(/\D/g, "").length < 9) {
      toast.error("Please enter a valid phone number")
      return
    }
    if (form.address.trim().length < 5) {
      toast.error("Please enter a full delivery address")
      return
    }
    setIsSubmitting(true)
    try {
      const result = await createCheckout({
        items: cart.items.map((i) => ({ productId: i.productId as import("@/convex/_generated/dataModel").Id<"products">, quantity: i.quantity })),
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          zone: form.zone,
          notes: form.notes || undefined,
        },
        origin: window.location.origin,
      })
      try {
        window.localStorage.setItem("gigi-last-order", JSON.stringify({ reference: result.reference, email: form.email.trim().toLowerCase(), name: form.name, phone: form.phone, address: form.address, zone: form.zone }))
      } catch {
        // ignore storage errors
      }
      setRedirecting(true)
      window.location.assign(result.authorizationUrl)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#AFFF00] animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-mono text-sm">Redirecting to secure payment…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <Link href="/shop" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
          CHECK<span className="text-[#AFFF00]">OUT</span>
        </h1>

        {!cart.hydrated ? (
          <div className="flex items-center justify-center py-20" role="status" aria-label="Loading cart">
            <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
            <span className="sr-only">Loading your cart…</span>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="mt-16 bg-white/5 border border-white/10 p-12 text-center">
            <p className="text-white/60 font-mono text-lg mb-2">Your cart is empty.</p>
            <p className="text-white/30 font-mono text-sm mb-6">Add some fuel before checking out.</p>
            <Link href="/shop" className="inline-block bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
              Shop Cases
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <section className="bg-white/5 border border-white/10 p-6 space-y-4">
                <h2 className="text-white font-bold tracking-tight mb-4">Contact</h2>
                <label className="block space-y-1.5">
                  <span className="text-white/50 font-mono text-xs">Full name</span>
                  <input required autoComplete="name" aria-label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Wanjiku" className={inputClass} />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-white/50 font-mono text-xs">Email</span>
                  <input required type="email" autoComplete="email" aria-label="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" className={inputClass} />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-white/50 font-mono text-xs">Phone (M-Pesa)</span>
                  <input required type="tel" autoComplete="tel" inputMode="tel" aria-label="Phone number for M-Pesa" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07XX XXX XXX" className={inputClass} />
                </label>
              </section>

              <section className="bg-white/5 border border-white/10 p-6 space-y-4">
                <h2 className="text-white font-bold tracking-tight mb-4">Delivery</h2>
                <label className="block space-y-1.5">
                  <span className="text-white/50 font-mono text-xs">Zone</span>
                  <div className="relative">
                    <select
                      required
                      aria-label="Delivery zone"
                      value={form.zone}
                      onChange={(e) => setForm({ ...form, zone: e.target.value })}
                      className={`${inputClass} appearance-none cursor-pointer pr-10 ${!form.zone ? "text-white/40" : ""}`}
                    >
                      <option value="" disabled className="bg-[#121212]">Choose a delivery zone</option>
                      {DELIVERY_ZONES.map((z) => (
                        <option key={z.name} value={z.name} className="bg-[#121212] text-white">
                          {z.name} — {formatKes(z.feeKes)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-white/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  </div>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-white/50 font-mono text-xs">Address</span>
                  <textarea required aria-label="Delivery address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Building, street, landmark" rows={2} className={`${inputClass} resize-none`} />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-white/50 font-mono text-xs">Notes (optional)</span>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} aria-label="Delivery notes (optional)" placeholder="Gate code, best time to deliver…" rows={2} className={`${inputClass} resize-none`} />
                </label>
              </section>

              <p className="text-white/30 font-mono text-xs flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                You&apos;ll pay securely on the next step via M-Pesa or card. We never see your card details.
              </p>
            </motion.div>

            {/* Summary */}
            <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 p-6 lg:sticky lg:top-24 space-y-4">
              <h2 className="text-white font-bold tracking-tight">Order Summary</h2>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex gap-3 items-start">
                    <Link href={`/shop/${item.slug}`} className="relative w-12 h-14 shrink-0 bg-white/5">
                      <Image src={item.image} alt={item.name} fill sizes="48px" className="object-contain p-0.5" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">{item.name}</p>
                      <p className="text-white/40 font-mono text-[11px] mt-0.5">{formatKes(item.priceKes)} each</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-1.5 py-0.5">
                          <button
                            type="button"
                            onClick={() => cart.setQuantity(item.productId, item.quantity - 1)}
                            className="text-white/60 hover:text-[#AFFF00] p-1 cursor-pointer"
                            aria-label={`Decrease ${item.name}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-white font-mono text-xs w-4 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity >= 20) return
                              cart.setQuantity(item.productId, item.quantity + 1)
                            }}
                            className="text-white/60 hover:text-[#AFFF00] p-1 cursor-pointer"
                            aria-label={`Increase ${item.name}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => cart.removeItem(item.productId)}
                          className="text-white/30 hover:text-red-400 p-1 cursor-pointer"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="text-white/70 font-mono text-xs pt-0.5">{formatKes(item.priceKes * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 space-y-2 font-mono text-sm">
                <div className="flex justify-between text-white/50">
                  <span>Subtotal</span>
                  <span>{formatKes(cart.subtotalKes)}</span>
                </div>
                {memberDiscountKes > 0 && (
                  <div className="flex justify-between text-[#AFFF00]">
                    <span>
                      GiGi Club · {membership?.planName ?? "Member"} (−{discountPct}%)
                    </span>
                    <span>−{formatKes(memberDiscountKes)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/50">
                  <span>Delivery{form.zone ? ` · ${form.zone}` : ""}</span>
                  <span>
                    {deliveryFeeKes !== null
                      ? deliveryFeeKes === 0
                        ? "FREE ✓"
                        : formatKes(deliveryFeeKes)
                      : "—"}
                  </span>
                </div>
                {form.zone && !freeDeliveryUnlocked && (
                  <p className="text-white/30 font-mono text-[11px]">
                    Add {formatKes(FREE_DELIVERY_THRESHOLD_KES - cart.subtotalKes)} more for free delivery
                  </p>
                )}
                <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-[#AFFF00]">{totalKes !== null ? formatKes(totalKes) : "—"}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={cart.items.length === 0 || isSubmitting || !form.zone}
                aria-describedby={!form.zone ? "zone-hint" : undefined}
                className="w-full bg-[#AFFF00] disabled:bg-white/10 disabled:text-white/40 text-[#121212] py-4 font-bold text-sm tracking-wide hover:opacity-90 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Starting…
                  </>
                ) : (
                  <>Pay with M-Pesa or Card</>
                )}
              </button>
              {!form.zone && (
                <p id="zone-hint" className="text-white/50 font-mono text-[11px] text-center">
                  Select a delivery zone above to continue
                </p>
              )}
            </motion.aside>
          </form>
        )}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </ClientOnly>
  )
}

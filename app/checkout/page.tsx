"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Lock, Loader2 } from "lucide-react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { useCart } from "@/components/cart-provider"
import { ClientOnly } from "@/components/client-only"
import { DELIVERY_ZONES, formatKes, getZoneFee } from "@/lib/delivery"

const inputClass =
  "w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"

function CheckoutContent() {
  const cart = useCart()
  const createCheckout = useAction(api.payments.createCheckoutSession)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", zone: "", address: "", notes: "" })
  const [redirecting, setRedirecting] = useState(false)

  // Restore contact info if the user paid here before
  useEffect(() => {
    try {
      const last = window.localStorage.getItem("gigi-last-order")
      if (last) {
        const { email } = JSON.parse(last) as { email?: string }
        if (email) setForm((f) => ({ ...f, email }))
      }
    } catch {
      // ignore
    }
  }, [])

  const deliveryFeeKes = form.zone ? getZoneFee(form.zone) : null
  const totalKes = deliveryFeeKes !== null ? cart.subtotalKes + deliveryFeeKes : null
  const canSubmit =
    cart.items.length > 0 &&
    form.name.trim().length > 1 &&
    /.+@.+\..+/.test(form.email) &&
    form.phone.trim().length > 6 &&
    !!form.zone &&
    form.address.trim().length >= 5

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !canSubmit || !form.zone) return
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
        window.localStorage.setItem("gigi-last-order", JSON.stringify({ reference: result.reference, email: form.email.trim().toLowerCase() }))
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
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
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
                <h2 className="text-white font-bold tracking-tight mb-2">Contact</h2>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name *" className={inputClass} />
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email Address *" className={inputClass} />
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone Number (M-Pesa) *" className={inputClass} />
              </section>

              <section className="bg-white/5 border border-white/10 p-6 space-y-4">
                <h2 className="text-white font-bold tracking-tight mb-2">Delivery</h2>
                <select
                  required
                  value={form.zone}
                  onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  className={`${inputClass} appearance-none cursor-pointer ${!form.zone ? "text-white/40" : ""}`}
                >
                  <option value="" disabled className="bg-[#121212]">Delivery Zone *</option>
                  {DELIVERY_ZONES.map((z) => (
                    <option key={z.name} value={z.name} className="bg-[#121212] text-white">
                      {z.name} — {formatKes(z.feeKes)}
                    </option>
                  ))}
                </select>
                <textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Delivery Address * (building, street, landmark)" rows={2} className={`${inputClass} resize-none`} />
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Delivery Notes (optional — gate code, best time...)" rows={2} className={`${inputClass} resize-none`} />
              </section>

              <p className="text-white/30 font-mono text-xs flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                You&apos;ll pay securely on the next step via M-Pesa or card. We never see your card details.
              </p>
            </motion.div>

            {/* Summary */}
            <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 p-6 lg:sticky lg:top-24 space-y-4">
              <h2 className="text-white font-bold tracking-tight">Order Summary</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex gap-3 items-center">
                    <div className="relative w-10 h-12 shrink-0 bg-white/5">
                      <Image src={item.image} alt={item.name} fill sizes="40px" className="object-contain p-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">{item.name}</p>
                      <p className="text-white/40 font-mono text-xs">×{item.quantity}</p>
                    </div>
                    <span className="text-white/70 font-mono text-xs">{formatKes(item.priceKes * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 space-y-2 font-mono text-sm">
                <div className="flex justify-between text-white/50">
                  <span>Subtotal</span>
                  <span>{formatKes(cart.subtotalKes)}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Delivery{form.zone ? ` · ${form.zone}` : ""}</span>
                  <span>{deliveryFeeKes !== null ? formatKes(deliveryFeeKes) : "—"}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-[#AFFF00]">{totalKes !== null ? formatKes(totalKes) : "—"}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
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

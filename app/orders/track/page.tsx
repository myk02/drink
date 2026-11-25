"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useQuery } from "convex/react"
import { motion } from "framer-motion"
import { ArrowLeft, Search, Package, Truck, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { formatKes } from "@/lib/delivery"

const STATUS_STEPS = ["paid", "packing", "out_for_delivery", "delivered"] as const

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: "Awaiting payment", className: "text-white/50 border-white/20" },
  paid: { label: "Payment received", className: "text-[#AFFF00] border-[#AFFF00]/30" },
  packing: { label: "Packing", className: "text-sky-300 border-sky-400/30" },
  out_for_delivery: { label: "Out for delivery", className: "text-amber-300 border-amber-400/30" },
  delivered: { label: "Delivered", className: "text-emerald-300 border-emerald-400/30" },
  cancelled: { label: "Cancelled", className: "text-red-400 border-red-400/30" },
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })
}

function TrackInner() {
  const params = useSearchParams()
  const [reference, setReference] = useState(params.get("reference") ?? "")
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState<{ reference: string; email: string } | null>(
    params.get("reference") ? null : null
  )

  const order = useQuery(
    api.orders.getForCustomer,
    submitted ? { reference: submitted.reference.trim(), email: submitted.email.trim().toLowerCase() } : "skip"
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted({ reference, email })
  }

  const meta = order ? STATUS_META[order.status] ?? { label: order.status, className: "border-white/20 text-white/50" } : null
  const activeStep = order ? STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]) : -1

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="bg-white/5 border border-white/10 p-6 space-y-4">
        <label className="block space-y-1.5">
          <span className="text-white/50 font-mono text-xs">Order reference</span>
          <input
            required
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="GG…"
            className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"
          />
          <span className="block text-white/25 font-mono text-[11px]">
            It&apos;s in your receipt email, and looks like <span className="text-white/40">GGABC123-K9X2</span>.
          </span>
        </label>
        <label className="block space-y-1.5">
          <span className="text-white/50 font-mono text-xs">Email used at checkout</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-[#AFFF00] text-[#121212] py-3 flex items-center justify-center gap-2 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Search className="w-4 h-4" /> Track order
        </button>
      </form>

      {submitted && order === undefined && (
        <div className="mt-8 flex items-center justify-center gap-3 text-white/50 font-mono text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-[#AFFF00]" /> Looking up your order…
        </div>
      )}

      {submitted && order === null && (
        <div className="mt-8 bg-white/5 border border-white/10 p-8 text-center">
          <XCircle className="w-7 h-7 text-red-400 mx-auto mb-3" />
          <p className="text-white/60 font-mono text-sm">
            We couldn&apos;t find an order with that reference and email. Check both and try again.
          </p>
        </div>
      )}

      {order && meta && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-white/5 border border-white/10 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white/30 font-mono text-xs">Order</p>
              <p className="text-white font-mono text-sm mt-1">{order.orderNumber}</p>
              <p className="text-white/30 font-mono text-[11px] mt-1">Placed {formatDate(order.createdAt)}</p>
            </div>
            <span className={`text-[10px] font-mono uppercase px-2 py-1 border ${meta.className}`}>{meta.label}</span>
          </div>

          {order.status !== "cancelled" && (
            <ol className="mt-6 grid grid-cols-4 gap-2">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= activeStep
                const Icon = step === "paid" ? CheckCircle2 : step === "packing" ? Package : step === "out_for_delivery" ? Truck : CheckCircle2
                return (
                  <li key={step} className="text-center">
                    <div className={`mx-auto w-8 h-8 flex items-center justify-center border ${done ? "border-[#AFFF00] text-[#AFFF00]" : "border-white/15 text-white/25"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className={`mt-2 font-mono text-[10px] leading-tight ${done ? "text-white/70" : "text-white/25"}`}>
                      {STATUS_META[step]?.label ?? step}
                    </p>
                  </li>
                )
              })}
            </ol>
          )}

          <ul className="mt-6 divide-y divide-white/5">
            {order.items.map((i, idx) => (
              <li key={`${i.name}-${idx}`} className="py-2 flex items-center justify-between font-mono text-xs gap-4">
                <span className="text-white/70 min-w-0 break-words">
                  {i.name} <span className="text-white/30">× {i.quantity}</span>
                </span>
                <span className="text-white/30 shrink-0">{i.canCount * i.quantity} cans</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 pt-4 border-t border-white/10 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between"><dt className="text-white/40">Subtotal</dt><dd className="text-white/70">{formatKes(order.subtotalKes)}</dd></div>
            {order.memberDiscountKes ? (
              <div className="flex justify-between"><dt className="text-white/40">Member discount</dt><dd className="text-[#AFFF00]">− {formatKes(order.memberDiscountKes)}</dd></div>
            ) : null}
            <div className="flex justify-between"><dt className="text-white/40">Delivery</dt><dd className="text-white/70">{order.deliveryFeeKes === 0 ? "Free" : formatKes(order.deliveryFeeKes)}</dd></div>
            <div className="flex justify-between pt-1.5 border-t border-white/10"><dt className="text-white/60">Total</dt><dd className="text-white font-bold">{formatKes(order.totalKes)}</dd></div>
          </dl>

          <p className="mt-4 text-white/30 font-mono text-[11px] leading-relaxed">
            Delivering to {order.deliveryAddress} · {order.deliveryZone}
          </p>

          {order.status === "pending" && (
            <p className="mt-4 flex items-start gap-2 text-amber-300/80 font-mono text-[11px] leading-relaxed">
              <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              If you completed payment, this updates within a minute — refresh shortly.
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <Link href="/shop" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
        <span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">DELIVERY STATUS</span>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2 mb-10">
          TRACK YOUR <span className="text-[#AFFF00]">ORDER</span>
        </h1>
        <Suspense fallback={<div className="h-40" />}>
          <TrackInner />
        </Suspense>
      </div>
    </div>
  )
}

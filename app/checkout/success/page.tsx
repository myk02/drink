"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { formatKes } from "@/lib/delivery"

function SuccessContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference") ?? searchParams.get("trxref")
  const verifyPayment = useAction(api.payments.verifyPayment)
  const [email, setEmail] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const attemptedRef = useRef<string | null>(null)

  useEffect(() => {
    try {
      const last = window.localStorage.getItem("gigi-last-order")
      if (last) {
        const parsed = JSON.parse(last) as { reference?: string; email?: string }
        setEmail(parsed.email ?? null)
      }
    } catch {
      // ignore
    }
  }, [])

  const order = useQuery(
    api.orders.getForCustomer,
    reference && email ? { reference, email } : "skip"
  )

  // One automatic verification attempt while the webhook may still be in flight
  useEffect(() => {
    if (!reference || !order || order.status !== "pending") return
    if (attemptedRef.current === reference) return
    attemptedRef.current = reference
    setVerifying(true)
    verifyPayment({ reference })
      .catch(() => {
        // Webhook will land eventually; user can retry manually
      })
      .finally(() => setVerifying(false))
  }, [reference, order, verifyPayment])

  if (!reference) {
    return (
      <StateCard icon={<AlertTriangle className="w-10 h-10 text-[#f59e0b]" />} title="No order found" message="Start a new order from the shop.">
        <Link href="/shop" className="inline-block bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
          Shop Cases
        </Link>
      </StateCard>
    )
  }

  if (order === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (order === null) {
    return (
      <StateCard icon={<AlertTriangle className="w-10 h-10 text-[#f59e0b]" />} title="Order not found" message="We couldn't match this payment reference. If you were charged, contact us with your confirmation message.">
        <div className="flex gap-3 justify-center">
          <Link href="/contact" className="inline-block bg-white/10 text-white px-6 py-3 font-bold text-sm tracking-wide hover:bg-white/20 transition-colors">
            Contact Support
          </Link>
          <Link href="/shop" className="inline-block bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
            Shop Cases
          </Link>
        </div>
      </StateCard>
    )
  }

  if (order.status === "paid") {
    return (
      <div className="text-center max-w-md mx-auto">
        <CheckCircle2 className="w-14 h-14 text-[#AFFF00] mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">ORDER CONFIRMED</h1>
        <p className="text-white/50 font-mono text-sm mt-2">
          Order <span className="text-[#AFFF00]">{order.orderNumber}</span> — thank you! We&apos;re getting your GiGi ready for delivery to {order.deliveryZone}.
        </p>
        <div className="mt-8 bg-white/5 border border-white/10 p-6 text-left space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between font-mono text-sm">
              <span className="text-white/70">{item.name} ×{item.quantity}</span>
              <span className="text-white/40">{item.canCount * item.quantity} cans</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-3 flex justify-between font-mono text-sm text-white/50">
            <span>Delivery · {order.deliveryZone}</span>
            <span>{formatKes(order.deliveryFeeKes)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-white">Total Paid</span>
            <span className="text-[#AFFF00]">{formatKes(order.totalKes)}</span>
          </div>
        </div>
        <Link href="/shop" className="inline-block mt-8 bg-[#AFFF00] text-[#121212] px-8 py-4 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
          Continue Shopping
        </Link>
      </div>
    )
  }

  if (order.status === "cancelled") {
    return (
      <StateCard icon={<AlertTriangle className="w-10 h-10 text-[#f59e0b]" />} title="Payment not completed" message="This order was cancelled or abandoned before payment went through. Your card/M-Pesa was not charged." >
        <Link href="/shop" className="inline-block bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
          Try Again
        </Link>
      </StateCard>
    )
  }

  // pending
  return (
    <StateCard
      icon={verifying ? <Loader2 className="w-10 h-10 text-[#AFFF00] animate-spin" /> : <Clock className="w-10 h-10 text-[#f59e0b]" />}
      title="AWAITING CONFIRMATION"
      message="Your payment is processing — M-Pesa confirmations can take a moment. This page updates automatically once confirmed."
    >
      <button
        onClick={() => {
          setVerifying(true)
          verifyPayment({ reference })
            .catch(() => {})
            .finally(() => setVerifying(false))
        }}
        disabled={verifying}
        className="inline-block bg-[#AFFF00] disabled:opacity-60 text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity cursor-pointer"
      >
        {verifying ? "Checking…" : "I've Paid — Refresh Status"}
      </button>
    </StateCard>
  )
}

function StateCard({
  icon,
  title,
  message,
  children,
}: {
  icon: React.ReactNode
  title: string
  message: string
  children?: React.ReactNode
}) {
  return (
    <div className="max-w-md mx-auto text-center py-10">
      <div className="flex justify-center mb-4">{icon}</div>
      <h1 className="text-3xl font-black text-white tracking-tighter">{title}</h1>
      <p className="text-white/50 font-mono text-sm mt-3 mb-8 leading-relaxed">{message}</p>
      {children}
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#AFFF00] animate-spin" />
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  )
}

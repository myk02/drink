"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatKes } from "@/lib/delivery"
import { useCart } from "@/components/cart-provider"
import { FUNNEL, trackEvent } from "@/lib/analytics"

function SuccessContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference") ?? searchParams.get("trxref")
  const verifyPayment = useAction(api.payments.verifyPayment)
  const { clearCart } = useCart()
  const [email, setEmail] = useState<string | null>(null)
  const [emailInput, setEmailInput] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verifyCount, setVerifyCount] = useState(0)
  const [failedStatus, setFailedStatus] = useState<"failed" | "review" | null>(null)
  const attemptedRef = useRef<string | null>(null)
  const clearedRef = useRef<string | null>(null)

  useEffect(() => {
    try {
      const last = window.localStorage.getItem("gigi-last-order")
      if (last) {
        const parsed = JSON.parse(last) as { reference?: string; email?: string }
        // Intentional one-time client hydration (SSR can't read localStorage)
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // One automatic verification attempt while the webhook may still be in flight,
  // plus a couple of timed retries for slow M-Pesa confirmations.
  useEffect(() => {
    if (!reference || !order || order.status !== "pending") return
    if (attemptedRef.current === reference) return
    attemptedRef.current = reference
    setVerifying(true)
    verifyPayment({ reference })
      .then((res) => {
        if (res.orderStatus === "failed") setFailedStatus("failed")
        else if (res.orderStatus === "review") setFailedStatus("review")
      })
      .catch(() => {
        // Webhook will land eventually; user can retry manually
      })
      .finally(() => setVerifying(false))
  }, [reference, order, verifyPayment])

  useEffect(() => {
    if (!reference || !order || order.status !== "pending" || failedStatus) return
    if (verifyCount >= 3) return
    const t = setTimeout(() => {
      setVerifying(true)
      verifyPayment({ reference })
        .then((res) => {
          if (res.orderStatus === "failed") setFailedStatus("failed")
          else if (res.orderStatus === "review") setFailedStatus("review")
          else setVerifyCount((c) => c + 1)
        })
        .catch(() => setVerifyCount((c) => c + 1))
        .finally(() => setVerifying(false))
    }, 8000)
    return () => clearTimeout(t)
  }, [reference, order, verifyPayment, verifyCount, failedStatus])

  // Empty the cart once THIS reference is confirmed paid. Clears regardless of
  // localStorage state (cross-device safe) — guarded per-reference so a stray
  // deep-link visit can't wipe the cart twice.
  useEffect(() => {
    if (!reference || !order || order.status !== "paid") return
    if (clearedRef.current === reference) return
    clearedRef.current = reference
    clearCart()
    trackEvent(FUNNEL.purchase, { order_number: order.orderNumber, value: order.totalKes, currency: "KES" })
    try {
      window.localStorage.removeItem("gigi-last-order")
    } catch {
      // ignore
    }
  }, [reference, order, clearCart])

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
    // Email not yet restored (cleared storage / different device) — ask for it
    // instead of spinning forever.
    if (!email) {
      return (
        <StateCard icon={<AlertTriangle className="w-10 h-10 text-[#f59e0b]" />} title="Confirm your email" message="Enter the email you used at checkout so we can find your order.">
          <form
            className="flex gap-2 justify-center"
            onSubmit={(e) => {
              e.preventDefault()
              const v = emailInput.trim().toLowerCase()
              if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
                setEmail(v)
                try {
                  const last = window.localStorage.getItem("gigi-last-order")
                  const parsed = last ? (JSON.parse(last) as Record<string, unknown>) : {}
                  window.localStorage.setItem("gigi-last-order", JSON.stringify({ ...parsed, email: v, reference }))
                } catch {
                  // ignore
                }
              } else {
                toast.error("Enter a valid email address")
              }
            }}
          >
            <input
              type="email"
              required
              aria-label="Email used at checkout"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              className="bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
            />
            <button type="submit" className="bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm cursor-pointer">
              Find order
            </button>
          </form>
        </StateCard>
      )
    }
    return (
      <div className="flex items-center justify-center py-16" role="status" aria-label="Loading order">
        <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading your order…</span>
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
          {order.items.map((item: { name: string; quantity: number; canCount: number }, i: number) => (
            <div key={i} className="flex justify-between font-mono text-sm">
              <span className="text-white/70">{item.name} ×{item.quantity}</span>
              <span className="text-white/40">{item.canCount * item.quantity} cans</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-3 space-y-2 font-mono text-sm">
            {order.memberDiscountKes ? (
              <div className="flex justify-between text-[#AFFF00]">
                <span>Member discount</span>
                <span>−{formatKes(order.memberDiscountKes)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-white/50">
              <span>Delivery · {order.deliveryZone}</span>
              <span>{formatKes(order.deliveryFeeKes)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-white/10">
              <span className="text-white">Total Paid</span>
              <span className="text-[#AFFF00]">{formatKes(order.totalKes)}</span>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop" className="inline-block bg-[#AFFF00] text-[#121212] px-8 py-4 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
            Continue Shopping
          </Link>
          <Link
            href={`/orders/track?reference=${encodeURIComponent(reference)}`}
            className="inline-block bg-white/10 text-white px-8 py-4 font-bold text-sm tracking-wide hover:bg-white/20 transition-colors"
          >
            Track This Order
          </Link>
        </div>
      </div>
    )
  }

  if (order.status === "cancelled" || failedStatus === "failed") {
    return (
      <StateCard icon={<AlertTriangle className="w-10 h-10 text-[#f59e0b]" />} title="Payment not completed" message="This order was cancelled or the payment failed before it went through. Your card/M-Pesa was not charged." >
        <Link href="/shop" className="inline-block bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
          Try Again
        </Link>
      </StateCard>
    )
  }

  if (failedStatus === "review") {
    return (
      <StateCard icon={<AlertTriangle className="w-10 h-10 text-[#f59e0b]" />} title="Payment under review" message="Your payment needs a manual check (e.g. amount mismatch). Contact support with your reference and we'll sort it out.">
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
            .then((res) => {
              if (res.orderStatus === "failed") setFailedStatus("failed")
              else if (res.orderStatus === "review") setFailedStatus("review")
            })
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

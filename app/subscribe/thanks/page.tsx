"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { CheckCircle2, Clock, Loader2 } from "lucide-react"

function ThanksContent() {
  const searchParams = useSearchParams()
  const urlReference = searchParams.get("reference") ?? searchParams.get("trxref")
  // One-time localStorage read during lazy state init — no setState-in-effect
  // cascade. This component only renders client-side (inside ClientOnly).
  // Falls back to ?reference= from Paystack when storage is cleared.
  const [stored] = useState<{ email: string | null; reference: string | null }>(() => {
    try {
      const last = window.localStorage.getItem("gigi-last-sub")
      if (last) {
        const parsed = JSON.parse(last) as { email?: string; reference?: string }
        return { email: parsed.email ?? null, reference: parsed.reference ?? null }
      }
    } catch {
      // ignore
    }
    return { email: null, reference: null }
  })
  const [emailInput, setEmailInput] = useState("")
  const [emailOverride, setEmailOverride] = useState<string | null>(null)
  const email = stored.email ?? emailOverride
  const reference = stored.reference ?? urlReference
  const [checking, setChecking] = useState(false)
  const [checkoutFailed, setCheckoutFailed] = useState(false)
  const attemptedRef = useRef<string | null>(null)
  const verify = useAction(api.payments.verifySubscriptionPayment)

  const recent = useQuery(
    api.subscriptions.getRecentForEmail,
    email ? { email } : "skip"
  )

  // One automatic direct-verification attempt while the webhook may still be
  // in flight (same pattern as the order success page).
  const pending = !recent || recent.status === "pending"
  useEffect(() => {
    if (!pending || !reference || attemptedRef.current === reference) return
    attemptedRef.current = reference
    setChecking(true)
    verify({ reference })
      .catch(() => {
        // Webhook will land eventually; user can retry manually
      })
      .finally(() => setChecking(false))
  }, [pending, reference, verify])

  if (!email || !recent || recent.status === "pending") {
    // No email at all (cleared storage, no Paystack ref) — ask for it.
    if (!email && !checking) {
      return (
        <div className="text-center max-w-md mx-auto py-10">
          <Clock className="w-12 h-12 text-[#f59e0b] mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white tracking-tighter">FIND YOUR MEMBERSHIP</h1>
          <p className="text-white/50 font-mono text-sm mt-3 leading-relaxed">
            Enter the email you used to join so we can check your membership status.
          </p>
          <form
            className="flex gap-2 justify-center mt-6"
            onSubmit={(e) => {
              e.preventDefault()
              const v = emailInput.trim().toLowerCase()
              if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) setEmailOverride(v)
            }}
          >
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              className="bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
            />
            <button type="submit" className="bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm cursor-pointer">
              Check
            </button>
          </form>
          <Link href="/account" className="inline-flex items-center justify-center bg-white/10 text-white px-6 py-3 font-bold text-sm tracking-wide hover:bg-white/20 transition-colors mt-4">
            Go to My Account
          </Link>
        </div>
      )
    }
    return (
      <div className="text-center max-w-md mx-auto py-10">
        <Clock className="w-12 h-12 text-[#f59e0b] mx-auto mb-4" />
        <h1 className="text-2xl font-black text-white tracking-tighter">CONFIRMING YOUR MEMBERSHIP</h1>
        <p className="text-white/50 font-mono text-sm mt-3 leading-relaxed">
          Payment confirmation usually lands within a minute. This page updates automatically — or head to your account to check status.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          {reference && (
            <button
              onClick={() => {
                setChecking(true)
                verify({ reference })
                  .then((r) => {
                    if (r.status === "failed") setCheckoutFailed(true)
                  })
                  .catch(() => {})
                  .finally(() => setChecking(false))
              }}
              disabled={checking}
              className="inline-flex items-center justify-center gap-2 bg-[#AFFF00] disabled:opacity-60 text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity cursor-pointer"
            >
              {checking && <Loader2 className="w-4 h-4 animate-spin" />}
              {checking ? "Checking…" : "I've Paid — Refresh Status"}
            </button>
          )}
          <Link href="/account" className="inline-flex items-center justify-center bg-white/10 text-white px-6 py-3 font-bold text-sm tracking-wide hover:bg-white/20 transition-colors">
            Go to My Account
          </Link>
        </div>
        {checkoutFailed && (
          <p className="text-orange-400 font-mono text-xs mt-4">
            The payment didn&apos;t complete. You can try joining again from the membership page.
          </p>
        )}
      </div>
    )
  }

  if (recent.status === "active") {
    return (
      <div className="text-center max-w-md mx-auto py-10">
        <CheckCircle2 className="w-14 h-14 text-[#AFFF00] mx-auto mb-4" />
        <h1 className="text-3xl font-black text-white tracking-tighter">WELCOME TO THE CLUB</h1>
        <p className="text-white/50 font-mono text-sm mt-3">
          Your membership is active. Manage it anytime from your account — pause, resume or cancel in one tap.
        </p>
        <Link href="/account" className="inline-block mt-8 bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
          Open My Account
        </Link>
      </div>
    )
  }

  // past_due / paused / cancelled need honest messaging, not a spinner.
  if (recent.status === "past_due") {
    return (
      <div className="text-center max-w-md mx-auto py-10">
        <Clock className="w-12 h-12 text-[#f59e0b] mx-auto mb-4" />
        <h1 className="text-2xl font-black text-white tracking-tighter">PAYMENT DIDN&apos;T GO THROUGH</h1>
        <p className="text-white/50 font-mono text-sm mt-3 leading-relaxed">
          Your membership is reserved but the charge failed. Complete the renewal from your account.
        </p>
        <Link href="/account" className="inline-block mt-8 bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
          Open My Account
        </Link>
      </div>
    )
  }

  if (recent.status === "paused" || recent.status === "cancelled") {
    return (
      <div className="text-center max-w-md mx-auto py-10">
        <Clock className="w-12 h-12 text-white/40 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-white tracking-tighter">MEMBERSHIP {recent.status === "paused" ? "PAUSED" : "CANCELLED"}</h1>
        <p className="text-white/50 font-mono text-sm mt-3 leading-relaxed">
          This membership is {recent.status}. You can rejoin anytime from the membership page.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Link href="/subscribe" className="inline-block bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
            Rejoin the Club
          </Link>
          <Link href="/account" className="inline-flex items-center justify-center bg-white/10 text-white px-6 py-3 font-bold text-sm tracking-wide hover:bg-white/20 transition-colors">
            My Account
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center max-w-md mx-auto py-10">
      <Loader2 className="w-10 h-10 text-[#AFFF00] animate-spin mx-auto mb-4" />
      <h1 className="text-2xl font-black text-white tracking-tighter">ALMOST THERE…</h1>
      <p className="text-white/50 font-mono text-sm mt-3 leading-relaxed">
        Your payment needs one more confirmation. We&apos;ll activate your membership automatically.
      </p>
    </div>
  )
}

export default function SubscribeThanksPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#AFFF00] animate-spin" />
          </div>
        }>
          <ThanksContent />
        </Suspense>
      </div>
    </div>
  )
}

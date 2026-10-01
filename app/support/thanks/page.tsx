"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { CheckCircle2, Clock, Loader2 } from "lucide-react"
import { formatKes } from "@/lib/delivery"

function ThanksContent() {
  const searchParams = useSearchParams()
  const urlReference = searchParams.get("reference") ?? searchParams.get("trxref")
  // One-time localStorage read during lazy state init — no setState-in-effect
  // cascade. This component only renders client-side (inside ClientOnly).
  // Falls back to ?reference= from Paystack when storage is cleared.
  const [storedCreds] = useState<{ reference: string; email: string } | null>(() => {
    try {
      const last = window.localStorage.getItem("gigi-last-donation")
      if (last) {
        const parsed = JSON.parse(last) as { reference?: string; email?: string }
        if (parsed.reference && parsed.email) {
          return { reference: parsed.reference, email: parsed.email }
        }
      }
    } catch {
      // ignore
    }
    return null
  })
  const [emailInput, setEmailInput] = useState("")
  const [emailOverride, setEmailOverride] = useState<string | null>(null)
  const effectiveCreds = useMemo(() => {
    const base = storedCreds ?? (urlReference ? { reference: urlReference, email: "" } : null)
    if (base && !base.email && emailOverride) return { reference: base.reference, email: emailOverride }
    return base
  }, [storedCreds, urlReference, emailOverride])
  const [checking, setChecking] = useState(false)
  const [failed, setFailed] = useState(false)
  const attemptedRef = useRef<string | null>(null)
  const verify = useAction(api.payments.verifyDonationPayment)

  const donation = useQuery(api.donations.getByReferenceForSupporter, effectiveCreds && effectiveCreds.email ? effectiveCreds : "skip")

  // One automatic direct-verification attempt while the webhook may still be
  // in flight (same pattern as the order success page).
  const pending = !donation || donation.status === "pending"
  useEffect(() => {
    if (!pending || !effectiveCreds || attemptedRef.current === effectiveCreds.reference) return
    attemptedRef.current = effectiveCreds.reference
    setChecking(true)
    verify({ reference: effectiveCreds.reference })
      .catch(() => {
        // Webhook will land eventually; user can retry manually
      })
      .finally(() => setChecking(false))
  }, [pending, effectiveCreds, verify])

  // Paystack returned but storage was cleared — ask for the receipt email.
  if (effectiveCreds && !effectiveCreds.email && !emailOverride) {
    return (
      <div className="text-center max-w-md mx-auto py-10">
        <Clock className="w-12 h-12 text-[#f59e0b] mx-auto mb-4" />
        <h1 className="text-2xl font-black text-white tracking-tighter">CONFIRM YOUR EMAIL</h1>
        <p className="text-white/50 font-mono text-sm mt-3 leading-relaxed">
          Enter the email you used when supporting so we can find your donation.
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
            Find donation
          </button>
        </form>
      </div>
    )
  }

  if (!donation) {
    return (
      <div className="text-center max-w-md mx-auto py-10">
        <Clock className="w-12 h-12 text-[#f59e0b] mx-auto mb-4" />
        <h1 className="text-2xl font-black text-white tracking-tighter">CONFIRMING YOUR SUPPORT</h1>
        <p className="text-white/50 font-mono text-sm mt-3 leading-relaxed">
          Payment confirmation usually lands within a minute. Thank you for backing Nairobi-made energy.
        </p>
        {effectiveCreds && (
          <button
            onClick={() => {
              setChecking(true)
              verify({ reference: effectiveCreds.reference })
                .then((r) => {
                  if (r.status === "failed") setFailed(true)
                })
                .catch(() => {})
                .finally(() => setChecking(false))
            }}
            disabled={checking}
            className="mt-8 inline-flex items-center justify-center gap-2 bg-[#AFFF00] disabled:opacity-60 text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity cursor-pointer"
          >
            {checking && <Loader2 className="w-4 h-4 animate-spin" />}
            {checking ? "Checking…" : "I've Paid — Refresh Status"}
          </button>
        )}
        {failed && (
          <p className="text-orange-400 font-mono text-xs mt-4">
            The payment didn&apos;t complete. You can try again from the support page.
          </p>
        )}
      </div>
    )
  }

  if (donation.status === "success") {
    return (
      <div className="text-center max-w-md mx-auto py-10">
        <CheckCircle2 className="w-14 h-14 text-[#AFFF00] mx-auto mb-4" />
        <h1 className="text-3xl font-black text-white tracking-tighter">ASANTE SANA!</h1>
        <p className="text-white/50 font-mono text-sm mt-3">
          Your {formatKes(donation.amountKes)} support landed. The team felt that.
        </p>
        <Link
          href="/support"
          className="inline-block mt-8 bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity"
        >
          See the Supporters Wall
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center max-w-md mx-auto py-10">
      <Loader2 className="w-10 h-10 text-[#AFFF00] animate-spin mx-auto mb-4" />
      <h1 className="text-2xl font-black text-white tracking-tighter">ALMOST THERE</h1>
      <p className="text-white/50 font-mono text-sm mt-3 leading-relaxed">
        We&apos;re waiting on the final confirmation from your payment provider.
      </p>
    </div>
  )
}

export default function SupportThanksPage() {
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
          <ThanksContent />
        </Suspense>
      </div>
    </div>
  )
}

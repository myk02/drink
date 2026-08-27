"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ClientOnly } from "@/components/client-only"
import { formatKes } from "@/lib/delivery"

type Plan = Doc<"plans">

const inputClass =
  "w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"

function SubscribeContent() {
  const plans = useQuery(api.plans.getActive)
  const startSubscription = useAction(api.payments.startSubscription)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", email: "", phone: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const sorted = useMemo(() => {
    if (!plans) return undefined
    return [...plans].sort((a, b) => a.sortOrder - b.sortOrder)
  }, [plans])

  const selected = sorted?.find((p) => p.slug === (selectedSlug ?? sorted[0]?.slug))

  const handleSubscribe = async () => {
    if (!selected || isSubmitting) return
    setIsSubmitting(true)
    try {
      const result = await startSubscription({
        planSlug: selected.slug,
        email: form.email,
        name: form.name || undefined,
        phone: form.phone || undefined,
        origin: window.location.origin,
      })
      try {
        window.localStorage.setItem(
          "gigi-last-sub",
          JSON.stringify({ reference: result.reference, email: form.email.trim().toLowerCase() })
        )
      } catch {
        // ignore
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
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#AFFF00] animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-mono text-sm">Taking you to secure checkout…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {!sorted && (
          <div className="col-span-2 flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {sorted?.map((plan, i) => {
          const isSelected = selected?.slug === plan.slug
          return (
            <motion.button
              key={plan.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedSlug(plan.slug)}
              className={`relative text-left bg-white/5 backdrop-blur-sm rounded-2xl border p-8 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "border-[#AFFF00] shadow-[0_0_30px_rgba(175,255,0,0.15)]"
                  : "border-white/10 hover:border-[#AFFF00]/40"
              }`}
            >
              {isSelected && (
                <span className="absolute top-4 right-4 w-6 h-6 bg-[#AFFF00] flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#121212]" />
                </span>
              )}
              <h3 className="text-2xl font-black text-white tracking-tight">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-4xl font-black text-[#AFFF00]">{formatKes(plan.amountKes)}</span>
                <span className="text-white/40 font-mono text-sm">/month</span>
              </div>
              <p className="text-white/50 font-mono text-sm mt-4 leading-relaxed">{plan.description}</p>
            </motion.button>
          )
        })}
      </div>

      {selected && (
        <motion.div
          key={selected.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 p-8 max-w-2xl mx-auto"
        >
          <h2 className="font-mono text-[#AFFF00] text-xs tracking-widest mb-4">
            WHAT YOU GET · {selected.name.toUpperCase()}
          </h2>
          <ul className="space-y-3 mb-8">
            {selected.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-white/70 font-mono text-sm">
                <Check className="w-4 h-4 text-[#AFFF00] shrink-0 mt-0.5" />
                {perk}
              </li>
            ))}
          </ul>

          <h2 className="font-mono text-[#AFFF00] text-xs tracking-widest mb-4">YOUR DETAILS</h2>
          <div className="space-y-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name (optional)" disabled={isSubmitting} className={inputClass} />
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email Address *" disabled={isSubmitting} className={inputClass} />
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number (for M-Pesa renewals)" disabled={isSubmitting} className={inputClass} />
          </div>

          <button
            onClick={() => void handleSubscribe()}
            disabled={!/.+@.+\..+/.test(form.email) || isSubmitting}
            className="mt-6 w-full bg-[#AFFF00] disabled:bg-white/10 disabled:text-white/40 text-[#121212] py-4 font-bold text-sm tracking-wide hover:opacity-90 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSubmitting ? "Starting…" : `Subscribe — ${formatKes(selected.amountKes)}/month`}
          </button>
          <p className="text-white/30 font-mono text-xs mt-3 text-center">
            Billed monthly. Cancel or pause anytime from your account.
          </p>
        </motion.div>
      )}

      {/* Cross-sell */}
      <div className="mt-16 max-w-2xl mx-auto bg-gradient-to-r from-[#AFFF00]/10 to-transparent border border-[#AFFF00]/20 p-6 flex items-center gap-4">
        <div className="relative w-14 h-16 shrink-0 hidden sm:block">
          <Image src="/images/drink2.png" alt="GiGi cans" fill sizes="56px" className="object-contain" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Just want a one-off case instead?</p>
          <p className="text-white/40 font-mono text-xs mt-1">Shop cases and packs — delivered across Nairobi.</p>
        </div>
        <Link href="/shop" className="shrink-0 bg-[#AFFF00] text-[#121212] px-4 py-2 font-bold text-xs tracking-wide hover:opacity-90 transition-opacity">
          Shop
        </Link>
      </div>
    </>
  )
}

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">MEMBERSHIP</span>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2">
          JOIN THE{" "}
          <span className="text-[#AFFF00]">CLUB</span>
        </h1>
        <p className="text-white/60 font-mono text-sm mt-4 max-w-xl mb-12">
          Fuel the movement and get rewarded for it. Pick your club below.
        </p>
        <ClientOnly fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <SubscribeContent />
        </ClientOnly>
      </div>
    </div>
  )
}

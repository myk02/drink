"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ArrowLeft, Coffee, Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ClientOnly } from "@/components/client-only"
import { formatKes } from "@/lib/delivery"

const PRESETS = [100, 250, 500, 1000]

const inputClass =
  "w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"

function SupportWidget() {
  const startDonation = useAction(api.payments.startDonation)
  const [amount, setAmount] = useState<number>(250)
  const [customAmount, setCustomAmount] = useState("")
  const [form, setForm] = useState({ name: "", email: "", message: "", anonymous: false })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const effectiveAmount = customAmount ? Number(customAmount) : amount

  const handleDonate = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const result = await startDonation({
        amountKes: effectiveAmount,
        email: form.email,
        name: form.anonymous ? undefined : form.name || undefined,
        message: form.message || undefined,
        isAnonymous: form.anonymous,
        origin: window.location.origin,
      })
      try {
        window.localStorage.setItem(
          "gigi-last-donation",
          JSON.stringify({ reference: result.reference, email: form.email.trim().toLowerCase() })
        )
      } catch {
        // ignore
      }
      window.location.assign(result.authorizationUrl)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 p-8 max-w-xl mx-auto">
      <div className="text-center mb-6">
        <Coffee className="w-10 h-10 text-[#AFFF00] mx-auto mb-3" />
        <h2 className="text-2xl font-black text-white tracking-tight">Buy the team a coffee</h2>
        <p className="text-white/50 font-mono text-xs mt-2">
          Every can, event and flavour test runs on supporters like you.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => {
              setAmount(preset)
              setCustomAmount("")
            }}
            disabled={isSubmitting}
            className={`py-3 font-mono text-sm font-bold border transition-all cursor-pointer ${
              !customAmount && amount === preset
                ? "bg-[#AFFF00] text-[#121212] border-[#AFFF00]"
                : "border-white/10 text-white/60 hover:border-[#AFFF00]/40 hover:text-[#AFFF00]"
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
      <input
        type="number"
        min={50}
        max={500000}
        value={customAmount}
        onChange={(e) => setCustomAmount(e.target.value)}
        placeholder="Custom amount (KSh)"
        disabled={isSubmitting}
        className={`${inputClass} mb-4`}
      />

      <div className="space-y-3 mb-4">
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email Address *"
          disabled={isSubmitting}
          className={inputClass}
        />
        {!form.anonymous && (
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name (shows on the wall)"
            disabled={isSubmitting}
            className={inputClass}
          />
        )}
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Say something to the team (optional)"
          rows={2}
          disabled={isSubmitting}
          className={`${inputClass} resize-none`}
        />
        <label className="flex items-center gap-2 text-white/40 font-mono text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={form.anonymous}
            onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
            className="accent-[#AFFF00]"
            disabled={isSubmitting}
          />
          Give anonymously
        </label>
      </div>

      <button
        onClick={() => void handleDonate()}
        disabled={!/.+@.+\..+/.test(form.email) || !(effectiveAmount >= 50) || isSubmitting}
        className="w-full bg-[#AFFF00] disabled:bg-white/10 disabled:text-white/40 text-[#121212] py-4 font-bold text-sm tracking-wide hover:opacity-90 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coffee className="w-4 h-4" />}
        {isSubmitting ? "Starting…" : `Support ${formatKes(Number.isFinite(effectiveAmount) ? effectiveAmount : 0)} · M-Pesa or Card`}
      </button>
    </div>
  )
}

function SupportersWall() {
  const wall = useQuery(api.donations.getWall)

  if (wall !== undefined && wall.length === 0) {
    return (
      <p className="text-white/30 font-mono text-sm text-center py-8">
        Be the first on the wall — the team reads every message.
      </p>
    )
  }
  if (!wall) return null

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mt-8">
      {wall.map((entry, i) => (
        <motion.div
          key={entry._id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.06, 0.4) }}
          className="bg-white/5 border border-white/10 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-white font-bold text-sm">
              <Heart className="w-3.5 h-3.5 text-[#AFFF00]" />
              {entry.name}
            </span>
            <span className="text-[#AFFF00] font-mono text-xs">{formatKes(entry.amountKes)}</span>
          </div>
          {entry.message && (
            <p className="text-white/50 font-mono text-xs leading-relaxed">&ldquo;{entry.message}&rdquo;</p>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">SUPPORT THE MOVEMENT</span>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2">
          FUEL THE{" "}
          <span className="text-[#AFFF00]">TEAM</span>
        </h1>
        <p className="text-white/60 font-mono text-sm mt-4 max-w-xl mb-12">
          GiGi is built by a small Nairobi crew. One-off support keeps the lights on and the flavours coming.
        </p>

        <ClientOnly fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <SupportWidget />

          {/* Club cross-sell */}
          <div className="mt-10 max-w-xl mx-auto bg-gradient-to-r from-[#AFFF00]/10 to-transparent border border-[#AFFF00]/20 p-6 flex items-center gap-4">
            <div className="relative w-14 h-16 shrink-0 hidden sm:block">
              <Image src="/images/drink1.png" alt="GiGi" fill sizes="56px" className="object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Support every month instead?</p>
              <p className="text-white/40 font-mono text-xs mt-1">Join GiGi Club from KSh 300/month with real perks.</p>
            </div>
            <Link href="/subscribe" className="shrink-0 bg-[#AFFF00] text-[#121212] px-4 py-2 font-bold text-xs tracking-wide hover:opacity-90 transition-opacity">
              Join Club
            </Link>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight text-center mt-20 mb-8">
            SUPPORTERS <span className="text-[#AFFF00]">WALL</span>
          </h2>
          <SupportersWall />
        </ClientOnly>
      </div>
    </div>
  )
}

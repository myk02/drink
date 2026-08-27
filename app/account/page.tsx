"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth, UserButton } from "@clerk/nextjs"
import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  ArrowLeft,
  BadgeCheck,
  PauseCircle,
  PlayCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Loader2,
  CreditCard,
  Smartphone,
} from "lucide-react"
import { toast } from "sonner"
import { ClientOnly } from "@/components/client-only"
import { formatKes } from "@/lib/delivery"

function formatDate(ms: number | null | undefined): string {
  if (!ms) return "—"
  return new Date(ms).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#AFFF00]/10 text-[#AFFF00] border-[#AFFF00]/30",
  past_due: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  paused: "bg-white/5 text-white/50 border-white/20",
}

const EVENT_LABELS: Record<string, string> = {
  activated: "Membership activated",
  renewed: "Renewed",
  charge_failed: "Charge attempt failed",
  renewal_link_sent: "Renewal link sent",
  paused: "Paused",
  resumed: "Resumed",
  cancelled: "Cancelled",
}

function PortalContent() {
  const { isSignedIn, isLoaded } = useAuth()
  const data = useQuery(api.subscriptions.getMySubscription)
  const pause = useAction(api.payments.pauseMySubscription)
  const resume = useAction(api.payments.resumeMySubscription)
  const cancel = useAction(api.payments.cancelMySubscription)
  const [busy, setBusy] = useState<string | null>(null)
  const [showCancelPanel, setShowCancelPanel] = useState(false)

  if (!isLoaded) {
    return <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin mx-auto my-16" />
  }

  if (!isSignedIn) {
    return (
      <div className="text-center max-w-md mx-auto py-12">
        <h2 className="text-2xl font-black text-white tracking-tighter mb-3">Sign in to manage your membership</h2>
        <p className="text-white/50 font-mono text-sm mb-8">Your GiGi Club status, billing history and controls live here.</p>
        <SignInButtons />
      </div>
    )
  }

  if (data === undefined) {
    return <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin mx-auto my-16" />
  }

  if (data === null) {
    return (
      <div className="bg-white/5 border border-white/10 p-10 text-center max-w-lg mx-auto">
        <AlertTriangle className="w-8 h-8 text-[#f59e0b] mx-auto mb-4" />
        <p className="text-white/60 font-mono text-sm leading-relaxed">
          We couldn&apos;t find an account record linked to your sign-in yet. If you just created this account,
          give it a minute and reload — membership records sync automatically.
        </p>
      </div>
    )
  }

  const { subscription, plan, history } = data

  if (!subscription) {
    return (
      <div className="text-center max-w-md mx-auto py-8">
        <p className="text-white/60 font-mono text-sm mb-6">You&apos;re not in the club yet.</p>
        <Link href="/subscribe" className="inline-block bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
          Join GiGi Club
        </Link>
      </div>
    )
  }

  const run = async (label: string, fn: () => Promise<{ status: string }>) => {
    setBusy(label)
    try {
      await fn()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Status card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">{plan?.name ?? "GiGi Membership"}</h2>
            <p className="text-white/40 font-mono text-xs mt-1">
              {plan ? `${formatKes(plan.amountKes)}/month` : ""}
            </p>
          </div>
          <span className={`text-[10px] font-mono uppercase px-2 py-1 border ${STATUS_STYLES[subscription.status] ?? "border-white/20 text-white/50"}`}>
            {subscription.status.replace("_", " ")}
          </span>
        </div>

        {subscription.status === "past_due" && (
          <div className="mb-6 bg-orange-500/10 border border-orange-500/30 p-4">
            <p className="text-orange-400 font-mono text-xs leading-relaxed">
              Your last payment didn&apos;t go through. Complete a renewal to keep your perks —
              we&apos;ve sent a secure link{subscription.paymentChannel !== "card" ? "" : " to your card issuer"}.
            </p>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt className="text-white/30 font-mono text-xs">Next billing date</dt>
            <dd className="text-white font-mono mt-1">{formatDate(subscription.nextBillingDate)}</dd>
          </div>
          <div>
            <dt className="text-white/30 font-mono text-xs">Payment method</dt>
            <dd className="text-white font-mono mt-1 flex items-center gap-1.5">
              {subscription.paymentChannel === "card" ? <CreditCard className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
              {subscription.paymentChannel === "card" ? "Card (auto-renews)" : subscription.paymentChannel === "mobile_money" ? "M-Pesa" : "Pending first payment"}
            </dd>
          </div>
          <div>
            <dt className="text-white/30 font-mono text-xs">Member since</dt>
            <dd className="text-white font-mono mt-1">{formatDate(subscription.startedAt)}</dd>
          </div>
        </dl>

        {/* Renewal link for M-Pesa path */}
        {subscription.lastRenewalCheckoutUrl && subscription.paymentChannel !== "card" && subscription.status !== "paused" && (
          <a
            href={subscription.lastRenewalCheckoutUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 w-full bg-[#AFFF00] text-[#121212] py-3 flex items-center justify-center gap-2 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Complete renewal · M-Pesa <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {/* Controls */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-3">
          {(subscription.status === "active" || subscription.status === "past_due") && (
            <button
              onClick={() => void run("pause", pause)}
              disabled={busy !== null}
              className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/30 px-4 py-2.5 font-mono text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {busy === "pause" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PauseCircle className="w-3.5 h-3.5" />}
              Pause membership
            </button>
          )}
          {subscription.status === "paused" && (
            <button
              onClick={() => void run("resume", resume)}
              disabled={busy !== null}
              className="flex items-center gap-2 bg-[#AFFF00] text-[#121212] px-4 py-2.5 font-bold text-xs tracking-wide hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {busy === "resume" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
              Resume membership
            </button>
          )}
          {subscription.status !== "paused" && !showCancelPanel && (
            <button
              onClick={() => setShowCancelPanel(true)}
              disabled={busy !== null}
              className="ml-auto flex items-center gap-2 text-red-400/70 hover:text-red-400 font-mono text-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel
            </button>
          )}
        </div>

        {/* Pause-before-cancel save flow */}
        {showCancelPanel && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
            <div className="mt-4 bg-white/5 border border-white/10 p-5">
              <p className="text-white font-bold text-sm mb-1">Before you go…</p>
              <p className="text-white/50 font-mono text-xs leading-relaxed mb-4">
                Need a break? Pausing keeps your perks history and member streak — you can resume anytime.
                Cancelling ends billing and all perks immediately.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    setShowCancelPanel(false)
                    await run("pause", pause)
                  }}
                  disabled={busy !== null}
                  className="flex items-center gap-2 bg-[#AFFF00] text-[#121212] px-4 py-2.5 font-bold text-xs tracking-wide hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {busy === "pause" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PauseCircle className="w-3.5 h-3.5" />}
                  Pause instead
                </button>
                <button
                  onClick={async () => {
                    await run("cancel", cancel)
                    setShowCancelPanel(false)
                    toast.info("Membership cancelled. You're welcome back anytime.")
                  }}
                  disabled={busy !== null}
                  className="px-4 py-2.5 text-red-400/80 hover:text-red-400 font-mono text-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  No — cancel for real
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Perks reminder */}
      {plan && subscription.status === "active" && (
        <div className="bg-gradient-to-r from-[#AFFF00]/10 to-transparent border border-[#AFFF00]/20 p-6">
          <p className="flex items-center gap-2 text-[#AFFF00] font-mono text-xs tracking-widest mb-3">
            <BadgeCheck className="w-4 h-4" /> ACTIVE PERKS
          </p>
          <ul className="space-y-2">
            {plan.perks.slice(0, 3).map((perk) => (
              <li key={perk} className="text-white/60 font-mono text-xs">{perk}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Billing history */}
      <div className="bg-white/5 border border-white/10 p-6">
        <h3 className="text-white font-bold text-sm mb-4">Billing history</h3>
        {history.length === 0 ? (
          <p className="text-white/30 font-mono text-xs">Nothing here yet.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((e) => (
              <li key={e._id} className="flex items-center justify-between font-mono text-xs">
                <span className="text-white/60">{EVENT_LABELS[e.type] ?? e.type}{e.detail ? ` · ${e.detail}` : ""}</span>
                <span className="text-white/30 whitespace-nowrap ml-4">
                  {e.amountKes ? formatKes(e.amountKes) : formatDate(e.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function SignInButtons() {
  // Rendered only when signed out; Clerk modals keep corners square via provider theme.
  return (
    <Link href="/" className="inline-block bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
      Back to Home to Sign In
    </Link>
  )
}

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <UserButton />
        </div>
        <span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">YOUR MEMBERSHIP</span>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mt-2 mb-12">
          MY <span className="text-[#AFFF00]">ACCOUNT</span>
        </h1>
        <ClientOnly fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <PortalContent />
        </ClientOnly>
      </div>
    </div>
  )
}

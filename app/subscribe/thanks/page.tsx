"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { CheckCircle2, Clock, Loader2 } from "lucide-react"

function ThanksContent() {
  const searchParams = useSearchParams()
  void searchParams // reference is tracked via localStorage; kept for future deep-links
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    try {
      const last = window.localStorage.getItem("gigi-last-sub")
      if (last) {
        const parsed = JSON.parse(last) as { email?: string }
        setEmail(parsed.email ?? null)
      }
    } catch {
      // ignore
    }
  }, [])

  const recent = useQuery(
    api.subscriptions.getRecentForEmail,
    email ? { email } : "skip"
  )

  if (!email || !recent || recent.status === "pending") {
    return (
      <div className="text-center max-w-md mx-auto py-10">
        <Clock className="w-12 h-12 text-[#f59e0b] mx-auto mb-4" />
        <h1 className="text-2xl font-black text-white tracking-tighter">CONFIRMING YOUR MEMBERSHIP</h1>
        <p className="text-white/50 font-mono text-sm mt-3 leading-relaxed">
          Payment confirmation usually lands within a minute. This page updates automatically — or head to your account to check status.
        </p>
        <Link href="/account" className="inline-block mt-8 bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
          Go to My Account
        </Link>
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

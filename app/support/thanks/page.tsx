"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { CheckCircle2, Clock, Loader2 } from "lucide-react"
import { formatKes } from "@/lib/delivery"

function ThanksContent() {
  const searchParams = useSearchParams()
  void searchParams
  const [creds, setCreds] = useState<{ reference: string; email: string } | null>(null)

  useEffect(() => {
    try {
      const last = window.localStorage.getItem("gigi-last-donation")
      if (last) {
        const parsed = JSON.parse(last) as { reference?: string; email?: string }
        if (parsed.reference && parsed.email) {
          setCreds({ reference: parsed.reference, email: parsed.email })
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const donation = useQuery(api.donations.getByReferenceForSupporter, creds ? creds : "skip")

  if (!donation) {
    return (
      <div className="text-center max-w-md mx-auto py-10">
        <Clock className="w-12 h-12 text-[#f59e0b] mx-auto mb-4" />
        <h1 className="text-2xl font-black text-white tracking-tighter">CONFIRMING YOUR SUPPORT</h1>
        <p className="text-white/50 font-mono text-sm mt-3 leading-relaxed">
          Payment confirmation usually lands within a minute. Thank you for backing Nairobi-made energy.
        </p>
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

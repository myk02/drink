"use client"

import { useEffect } from "react"
import Link from "next/link"
import { reportError } from "@/lib/observability"

// Route-level error boundary: keeps the site chrome and offers a retry.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(error, "route-error-boundary")
  }, [error])

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 p-10 text-center">
        <p className="font-mono text-[#AFFF00] text-[11px] tracking-widest">GIGI ENERGY</p>
        <h1 className="text-2xl font-black text-white tracking-tight mt-3">Something broke on our end</h1>
        <p className="text-white/50 font-mono text-sm leading-relaxed mt-3">
          We&apos;ve logged it. Try again — if it keeps happening, email hello@gigi.energy.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={reset}
            className="bg-[#AFFF00] text-[#121212] py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity cursor-pointer"
          >
            Try again
          </button>
          <Link href="/" className="text-white/40 hover:text-white font-mono text-xs transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

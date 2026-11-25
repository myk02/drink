import Link from "next/link"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { CheckCircle2, AlertTriangle, Mail } from "lucide-react"

export const dynamic = "force-dynamic"

type Outcome = "confirmed" | "already" | "invalid" | "error"

async function confirmSubscription(token: string | undefined): Promise<Outcome> {
  if (!token) return "invalid"
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) return "error"
  try {
    const client = new ConvexHttpClient(url)
    const res = await client.mutation(api.newsletter.confirm, { token })
    return res.status
  } catch {
    return "error"
  }
}

const COPY: Record<Outcome, { title: string; body: string; ok: boolean }> = {
  confirmed: {
    title: "You're confirmed",
    body: "You're on the GiGi list — new flavour drops, Nairobi activations and member offers. Nothing else, and you can leave any time.",
    ok: true,
  },
  already: {
    title: "Already confirmed",
    body: "This email is already on the list. Nothing else to do.",
    ok: true,
  },
  invalid: {
    title: "That link doesn't work",
    body: "The confirmation link is invalid or has expired. Enter your email in the site footer to get a fresh one.",
    ok: false,
  },
  error: {
    title: "We couldn't confirm that",
    body: "Something went wrong on our side. Try the link again in a moment, or email hello@gigi.energy.",
    ok: false,
  },
}

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const outcome = await confirmSubscription(token)
  const copy = COPY[outcome]

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 p-10 text-center">
        {copy.ok ? (
          <CheckCircle2 className="w-10 h-10 text-[#AFFF00] mx-auto mb-5" />
        ) : (
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-5" />
        )}
        <h1 className="text-2xl font-black text-white tracking-tight">{copy.title}</h1>
        <p className="text-white/50 font-mono text-sm leading-relaxed mt-3">{copy.body}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/shop" className="bg-[#AFFF00] text-[#121212] py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
            Shop GiGi
          </Link>
          <Link href="/" className="inline-flex items-center justify-center gap-2 text-white/40 hover:text-white font-mono text-xs transition-colors">
            <Mail className="w-3.5 h-3.5" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

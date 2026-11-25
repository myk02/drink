import Link from "next/link"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { CheckCircle2, AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic"

type Outcome = "unsubscribed" | "already" | "invalid" | "error"

async function unsubscribe(token: string | undefined): Promise<Outcome> {
  if (!token) return "invalid"
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) return "error"
  try {
    const client = new ConvexHttpClient(url)
    const res = await client.mutation(api.newsletter.unsubscribe, { token })
    return res.status
  } catch {
    return "error"
  }
}

const COPY: Record<Outcome, { title: string; body: string; ok: boolean }> = {
  unsubscribed: {
    title: "You're off the list",
    body: "We've removed you from the GiGi newsletter. Order receipts and membership emails still reach you, since those aren't marketing.",
    ok: true,
  },
  already: {
    title: "Already unsubscribed",
    body: "This address isn't receiving the newsletter.",
    ok: true,
  },
  invalid: {
    title: "That link doesn't work",
    body: "The unsubscribe link is invalid or has expired. Email hello@gigi.energy and we'll remove you manually.",
    ok: false,
  },
  error: {
    title: "We couldn't update that",
    body: "Something went wrong on our side. Try the link again in a moment, or email hello@gigi.energy.",
    ok: false,
  },
}

export default async function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const outcome = await unsubscribe(token)
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
        <Link href="/" className="mt-8 inline-block text-white/40 hover:text-white font-mono text-xs transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  )
}

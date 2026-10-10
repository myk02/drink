"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Star, Loader2 } from "lucide-react"
import { toast } from "sonner"

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(value) ? "text-[#AFFF00] fill-[#AFFF00]" : "text-white/20"}`}
        />
      ))}
    </span>
  )
}

export function ProductReviews({ productId, productName }: { productId: Id<"products">; productName: string }) {
  const summary = useQuery(api.reviews.getSummary, { productId })
  const reviews = useQuery(api.reviews.getForProduct, { productId })
  const submit = useMutation(api.reviews.submit)
  const [name, setName] = useState("")
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    try {
      await submit({ productId, name, rating, title: title || undefined, body })
      setTitle("")
      setBody("")
      toast.success("Thanks — your review is live.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't post your review. Try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <section aria-label={`Reviews for ${productName}`} className="bg-white/5 border border-white/10 p-5">
      <h2 className="text-white font-black text-sm">REVIEWS</h2>
      <div className="mt-2 flex items-center gap-3">
        {summary === undefined ? (
          <span className="text-white/40 font-mono text-xs">Loading reviews…</span>
        ) : summary.count === 0 ? (
          <span className="text-white/40 font-mono text-xs">No reviews yet — be the first.</span>
        ) : (
          <>
            <Stars value={summary.average} />
            <span className="text-white font-mono text-xs">
              {summary.average} · {summary.count} review{summary.count === 1 ? "" : "s"}
            </span>
          </>
        )}
      </div>

      {reviews && reviews.length > 0 && (
        <ul className="mt-4 space-y-3">
          {reviews.slice(0, 5).map((r) => (
            <li key={r._id} className="bg-[#121212] border border-white/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <Stars value={r.rating} />
                <span className="text-white/30 font-mono text-[11px]">
                  {new Date(r.createdAt).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-white font-bold text-xs mt-2">
                {r.title || "Verified sip"} <span className="text-white/40 font-mono font-normal">· {r.name}</span>
              </p>
              <p className="text-white/55 font-mono text-xs mt-1 leading-relaxed">{r.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={rating === i}
              aria-label={`${i} star${i === 1 ? "" : "s"}`}
              onClick={() => setRating(i)}
              className="p-1 cursor-pointer"
            >
              <Star className={`w-5 h-5 ${i <= rating ? "text-[#AFFF00] fill-[#AFFF00]" : "text-white/20"}`} />
            </button>
          ))}
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          className="w-full bg-[#121212] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline (optional)"
          aria-label="Review headline"
          className="w-full bg-[#121212] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did it taste like? How was delivery?"
          aria-label="Your review"
          rows={3}
          className="w-full bg-[#121212] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-[#AFFF00] text-[#121212] px-5 py-2.5 font-bold text-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {sending ? "Posting…" : "Post review"}
        </button>
      </form>
    </section>
  )
}

"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { ClientOnly } from "@/components/client-only"

const inputClass =
  "w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"

export function TalentPoolForm() {
  return (
    <ClientOnly
      fallback={
        <div className="flex items-center justify-center py-6">
          <div className="w-6 h-6 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TalentInner />
    </ClientOnly>
  )
}

function TalentInner() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [interests, setInterests] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const join = useMutation(api.careerApplications.joinTalentPool)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const r = await join({ email, name: name || undefined, interests: interests || undefined })
      if (r.alreadySubscribed) toast.info("You’re already in the talent pool — we’ll be in touch!")
      else toast.success("You’re in the pool! We’ll ping you when new roles drop.")
      setEmail("")
      setName("")
      setInterests("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handle} className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-white/50 font-mono text-xs">Name (optional)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Wanjiku" autoComplete="name" className={inputClass} disabled={isSubmitting} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-white/50 font-mono text-xs">Email *</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className={inputClass} disabled={isSubmitting} />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-white/50 font-mono text-xs">Interests (optional)</span>
        <input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Sales, operations, brand…" className={inputClass} disabled={isSubmitting} />
      </label>
      <p className="text-white/30 font-mono text-[11px]">By joining you consent to GiGi emailing you about future roles. Unsubscribe anytime. We never share your data.</p>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full md:w-auto bg-white text-[#121212] px-6 py-3 font-bold text-sm hover:bg-white/90 transition-colors disabled:opacity-60 cursor-pointer"
      >
        {isSubmitting ? "Joining..." : "Join talent pool →"}
      </button>
    </form>
  )
}

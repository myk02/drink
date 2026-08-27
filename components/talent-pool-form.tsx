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
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" className={inputClass} disabled={isSubmitting} />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email *" className={inputClass} disabled={isSubmitting} />
      </div>
      <input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Interests — e.g. Sales, Ops, Brand (optional)" className={inputClass} disabled={isSubmitting} />
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

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import type { Doc } from "@/convex/_generated/dataModel"
import { ClientOnly } from "@/components/client-only"

type Category = Doc<"inquiries">["category"]

interface InquiryFormProps {
  category: Category
  messagePlaceholder?: string
  showCompanyField?: boolean
}

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"

const formFallback = (
  <div className="flex items-center justify-center py-10">
    <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
  </div>
)

export function InquiryForm(props: InquiryFormProps) {
  // Convex hooks must run client-side only (see convex-client-provider SSR setup)
  return (
    <ClientOnly fallback={formFallback}>
      <InquiryFormInner {...props} />
    </ClientOnly>
  )
}

function InquiryFormInner({ category, messagePlaceholder = "Your message...", showCompanyField = true }: InquiryFormProps) {
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const submit = useMutation(api.inquiries.submit)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await submit({
        name,
        email,
        phone: phone || undefined,
        company: company || undefined,
        category,
        message,
      })
      setSubmitted(true)
      toast.success("Message sent! Our team in Nairobi will get back to you within 24 hours.")
      setName("")
      setCompany("")
      setEmail("")
      setPhone("")
      setMessage("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 mx-auto mb-4 bg-[#AFFF00]/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-[#AFFF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Request received!</h3>
        <p className="text-white/60 font-mono text-sm mb-6">We&apos;ll get back to you within 24 hours.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-[#AFFF00] font-mono text-sm hover:underline cursor-pointer"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name *"
          disabled={isSubmitting}
          className={inputClass}
        />
        {showCompanyField && (
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder={category === "organizer" ? "Organization / Event Name" : "Company Name"}
            disabled={isSubmitting}
            className={inputClass}
          />
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address *"
          disabled={isSubmitting}
          className={inputClass}
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          disabled={isSubmitting}
          className={inputClass}
        />
      </div>
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={messagePlaceholder}
        rows={3}
        disabled={isSubmitting}
        className={`${inputClass} resize-none`}
      />
      <motion.button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#AFFF00] disabled:opacity-60 text-[#121212] px-6 py-3 rounded-xl font-bold text-sm tracking-wide cursor-pointer"
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
      >
        <motion.span
          animate={isSubmitting ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 0.8, repeat: isSubmitting ? Number.POSITIVE_INFINITY : 0 }}
        >
          {isSubmitting ? "Sending..." : "Submit"}
        </motion.span>
      </motion.button>
    </form>
  )
}

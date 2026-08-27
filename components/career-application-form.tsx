"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { Upload, FileText, Check, Loader2 } from "lucide-react"
import { ClientOnly } from "@/components/client-only"
import { ROLES } from "@/lib/careers-data"

const inputClass =
  "w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"

export function CareerApplicationForm({
  defaultRoleSlug,
  compact = false,
}: {
  defaultRoleSlug?: string
  compact?: boolean
}) {
  return (
    <ClientOnly
      fallback={
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CareerFormInner defaultRoleSlug={defaultRoleSlug} compact={compact} />
    </ClientOnly>
  )
}

function CareerFormInner({
  defaultRoleSlug,
  compact,
}: {
  defaultRoleSlug?: string
  compact?: boolean
}) {
  const [roleSlug, setRoleSlug] = useState(defaultRoleSlug ?? "")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [linkedInUrl, setLinkedInUrl] = useState("")
  const [consent, setConsent] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [progress, setProgress] = useState<"idle" | "uploading" | "submitting">("idle")

  const submit = useMutation(api.careerApplications.submit)
  const generateUploadUrl = useMutation(api.careerApplications.generateUploadUrl)

  const selectedRole = ROLES.find((r) => r.slug === roleSlug)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File too large — max 5 MB (PDF, DOC, DOCX)")
      return
    }
    if (!/\.(pdf|doc|docx)$/i.test(f.name) && !["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(f.type)) {
      // allow anyway but warn
      if (f.type && !f.type.includes("pdf") && !f.type.includes("word")) {
        toast.error("Please upload PDF, DOC or DOCX")
        return
      }
    }
    setResumeFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    if (!consent) {
      toast.error("Please consent to us storing your application data")
      return
    }
    if (!roleSlug) {
      toast.error("Please select a role")
      return
    }
    setIsSubmitting(true)
    setProgress("uploading")
    try {
      let resumeStorageId: string | undefined
      if (resumeFile) {
        const uploadUrl = await generateUploadUrl({})
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": resumeFile.type || "application/octet-stream" },
          body: resumeFile,
        })
        if (!res.ok) throw new Error("Resume upload failed — please try again")
        const json = await res.json()
        resumeStorageId = json.storageId
      }
      setProgress("submitting")
      await submit({
        name,
        email,
        phone: phone || undefined,
        roleSlug,
        roleTitle: selectedRole?.title ?? roleSlug,
        coverLetter,
        portfolioUrl: portfolioUrl || undefined,
        linkedInUrl: linkedInUrl || undefined,
        resumeStorageId: resumeStorageId as unknown as import("@/convex/_generated/dataModel").Id<"_storage"> | undefined,
        resumeFileName: resumeFile?.name || undefined,
      })
      setSubmitted(true)
      toast.success("Application sent! We’ll reply within 48 hours.")
      // reset
      setName("")
      setEmail("")
      setPhone("")
      setCoverLetter("")
      setPortfolioUrl("")
      setLinkedInUrl("")
      setResumeFile(null)
      setConsent(false)
      if (!defaultRoleSlug) setRoleSlug("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
      setProgress("idle")
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 mx-auto mb-4 bg-[#AFFF00]/10 flex items-center justify-center">
          <Check className="w-6 h-6 text-[#AFFF00]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Application received!</h3>
        <p className="text-white/60 font-mono text-sm mb-1">Thanks for applying to {selectedRole?.title ?? "GiGi"}.</p>
        <p className="text-white/40 font-mono text-xs mb-6">We reply to every application within 48 hours — check your email (and spam).</p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-[#AFFF00] font-mono text-sm hover:underline cursor-pointer"
        >
          Send another application
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Time budget + trust */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
        <span className="px-2 py-1 bg-[#AFFF00] text-[#121212] font-bold tracking-wide">5-MIN APPLY</span>
        <span className="text-white/40">No account required • We reply within 48h • Encrypted & GDPR-aligned</span>
      </div>

      {/* Role selector */}
      <div>
        <label className="text-white/60 font-mono text-xs mb-1.5 block">Role *</label>
        <select
          required
          value={roleSlug}
          onChange={(e) => setRoleSlug(e.target.value)}
          disabled={isSubmitting}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="" className="bg-[#121212]">Select a role</option>
          {ROLES.map((r) => (
            <option key={r.slug} value={r.slug} className="bg-[#121212]">
              {r.title} — {r.type} • {r.location}
            </option>
          ))}
          <option value="general" className="bg-[#121212]">General application — I don’t see my fit</option>
        </select>
        {selectedRole && (
          <p className="text-[#AFFF00] font-mono text-xs mt-2">{selectedRole.salary} • {selectedRole.workModel}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-white/60 font-mono text-xs mb-1.5 block">Full name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            disabled={isSubmitting}
            autoComplete="name"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-white/60 font-mono text-xs mb-1.5 block">Email *</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@email.com"
            disabled={isSubmitting}
            autoComplete="email"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-white/60 font-mono text-xs mb-1.5 block">Phone <span className="text-white/30">(optional)</span></label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254 7... "
            disabled={isSubmitting}
            autoComplete="tel"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-white/60 font-mono text-xs mb-1.5 block">LinkedIn <span className="text-white/30">(optional)</span></label>
          <input
            type="url"
            value={linkedInUrl}
            onChange={(e) => setLinkedInUrl(e.target.value)}
            placeholder="https://linkedin.com/in/..."
            disabled={isSubmitting}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="text-white/60 font-mono text-xs mb-1.5 block">Portfolio / work link <span className="text-white/30">(optional but recommended)</span></label>
        <input
          type="url"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          placeholder="https://... (TikTok, Behance, GitHub, Drive)"
          disabled={isSubmitting}
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-white/60 font-mono text-xs mb-1.5 block">Tell us about you * <span className="text-white/30">— why GiGi, biggest win, links to work</span></label>
        <textarea
          required
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder={selectedRole?.department === "Brand" ? "Which role? Paste 2–3 links to reels/TikToks you made, your favourite GiGi flavour idea, why you..." : "Which role? 3–4 sentences: why this role, your most relevant win, availability..."}
          rows={compact ? 3 : 4}
          disabled={isSubmitting}
          className={`${inputClass} resize-none`}
        />
        <p className="text-white/30 font-mono text-[11px] mt-1">{coverLetter.length}/20 min • Keep it concise, links {" > "} paragraphs</p>
      </div>

      {/* Resume upload */}
      <div>
        <label className="text-white/60 font-mono text-xs mb-1.5 block">Resume/CV <span className="text-white/30">(PDF/DOC, max 5MB — optional but helps)</span></label>
        <label className={`flex items-center gap-3 w-full bg-white/5 border ${resumeFile ? "border-[#AFFF00]/50" : "border-white/10"} px-4 py-3 cursor-pointer hover:border-[#AFFF00]/30 transition-colors group`}>
          <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${resumeFile ? "bg-[#AFFF00] text-[#121212]" : "bg-white/5 text-white/40 group-hover:text-[#AFFF00]"}`}>
            {resumeFile ? <FileText className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-mono text-sm truncate">{resumeFile ? resumeFile.name : "Click to upload resume"}</p>
            <p className="text-white/40 font-mono text-xs">{resumeFile ? `${(resumeFile.size / 1024).toFixed(0)} KB • Click to replace` : "PDF, DOC, DOCX — also works from phone cloud storage"}</p>
          </div>
          {resumeFile && <Check className="w-4 h-4 text-[#AFFF00] shrink-0" />}
          <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFile} className="hidden" disabled={isSubmitting} />
        </label>
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer group py-1">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-[#AFFF00] w-4 h-4 shrink-0"
          required
        />
        <span className="text-white/40 font-mono text-xs leading-relaxed group-hover:text-white/60 transition-colors">
          I consent to GiGi storing my application for recruitment purposes and contacting me about this role. I can request deletion anytime. *
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#AFFF00] disabled:opacity-60 text-[#121212] px-8 py-3.5 font-black text-sm tracking-wide cursor-pointer inline-flex items-center gap-2"
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {progress === "uploading" ? "Uploading..." : progress === "submitting" ? "Sending..." : "Submit application — 5 min"}
        </motion.button>
        <span className="text-white/30 font-mono text-xs">Avg. completion 2m 40s • Need help? <a href="mailto:careers@gigi.energy" className="text-[#AFFF00] hover:underline">careers@gigi.energy</a></span>
      </div>
    </form>
  )
}

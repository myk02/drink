import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { InquiryForm } from "@/components/inquiry-form"
import { ClientOnly } from "@/components/client-only"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with GiGi Energy in Nairobi, Kenya — questions about orders, partnerships, corporate supply, or anything else.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">SAY HELLO</span>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2">
          GET IN <span className="text-[#AFFF00]">TOUCH</span>
        </h1>
        <p className="text-white/60 font-mono text-sm mt-4 max-w-xl">
          Questions about orders, partnerships, or stocking GiGi? Send us a message — we reply within 24 hours.
        </p>
        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <ClientOnly
            fallback={
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <InquiryForm category="general" messagePlaceholder="How can we help?" showCompanyField={false} />
          </ClientOnly>
        </div>
      </div>
    </div>
  )
}

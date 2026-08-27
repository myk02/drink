import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How GiGi Energy collects, uses, and protects your personal data.",
}

const sections = [
  {
    title: "1. Information We Collect",
    body: [
      "When you use this website we may collect: your name, email address, phone number, delivery address, and any messages you send us through our forms.",
      "If you create an account, we also store your account profile details provided by our authentication provider (Clerk).",
      "Payment details are processed by our payment provider (Paystack) and are never stored on our servers. We only retain a transaction reference and status.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "To fulfil orders and event registrations you request.",
      "To respond to enquiries about partnerships, corporate supply, and events.",
      "To send you marketing updates (such as flavour drops and offers) if you subscribe to our newsletter. You can opt out at any time by contacting us.",
      "To improve the website and understand how visitors use it (aggregate analytics).",
    ],
  },
  {
    title: "3. Data Sharing",
    body: [
      "We share data only with service providers necessary to operate: Clerk (authentication), Convex (data hosting), Paystack (payment processing), Vercel (website hosting), and delivery partners fulfilling your orders.",
      "We never sell your personal information.",
    ],
  },
  {
    title: "4. Data Retention & Security",
    body: [
      "We keep personal data only as long as needed for the purposes above or as required by Kenyan law, including the Data Protection Act, 2019.",
      "All traffic to and from this site is encrypted in transit (HTTPS).",
    ],
  },
  {
    title: "5. Your Rights",
    body: [
      "You may request access to, correction of, or deletion of your personal data at any time by reaching us through our contact form.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">LEGAL</span>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mt-2 mb-2">Privacy Policy</h1>
        <p className="text-white/30 font-mono text-xs mb-10">Last updated: August 2026</p>
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold text-[#AFFF00] mb-3">{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="text-white/60 font-mono text-sm leading-relaxed mb-3">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <p className="text-white/40 font-mono text-xs pt-4 border-t border-white/10">
            Questions about this policy? Reach us via the{" "}
            <Link href="/contact" className="text-[#AFFF00] hover:underline">contact form</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

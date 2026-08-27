import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of the GiGi Energy website and purchases.",
}

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By accessing or using this website, you agree to these Terms of Service. If you do not agree, please do not use the site.",
    ],
  },
  {
    title: "2. Products & Orders",
    body: [
      "GiGi Energy products are sold in Kenya and priced in Kenyan Shillings (KES). All prices include applicable taxes unless stated otherwise.",
      "An order is confirmed only after payment has been successfully processed by our payment provider. We reserve the right to refuse or cancel orders in cases of suspected fraud, stock unavailability, or pricing errors.",
    ],
  },
  {
    title: "3. Subscriptions",
    body: [
      "Where subscription plans are offered, your subscription renews automatically at the interval shown at checkout until cancelled.",
      "You may pause, skip, or cancel your subscription at any time from your account page before the next billing date.",
    ],
  },
  {
    title: "4. Deliveries",
    body: [
      "Delivery timelines vary by location within Nairobi and greater Kenya. Risk of loss passes to you upon delivery to the address provided.",
      "Please provide accurate delivery details; we are not liable for failed deliveries caused by incorrect addresses.",
    ],
  },
  {
    title: "5. Health Notice",
    body: [
      "GiGi Energy contains caffeine (75mg per can). Not recommended for children, pregnant or breastfeeding women, or persons sensitive to caffeine. Enjoy responsibly — max 2 cans per day.",
    ],
  },
  {
    title: "6. Intellectual Property",
    body: [
      "All content on this site — including the GiGi name, logo, designs, and imagery — is owned by GiGi Energy and may not be used without written permission.",
    ],
  },
  {
    title: "7. Limitation of Liability",
    body: [
      "To the maximum extent permitted by Kenyan law, GiGi Energy shall not be liable for indirect or consequential damages arising from use of this website or our products.",
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">LEGAL</span>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mt-2 mb-2">Terms of Service</h1>
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
            Questions about these terms? Reach us via the{" "}
            <Link href="/contact" className="text-[#AFFF00] hover:underline">contact form</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

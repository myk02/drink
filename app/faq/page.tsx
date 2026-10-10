import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SITE_URL } from "@/lib/site"
import { PRODUCT_FAQS } from "@/lib/shop-data"

export const metadata: Metadata = {
  title: "FAQ — Orders, Delivery, Subscriptions",
  description:
    "GiGi Energy FAQ: delivery zones across Kenya, M-Pesa & card payments, subscriptions, caffeine & ingredients, and returns.",
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: "GiGi Energy FAQ",
    description: "Delivery, payments, subscriptions, ingredients and returns.",
    url: `${SITE_URL}/faq`,
    type: "website",
  },
}

const SECTIONS: { heading: string; faqs: { q: string; a: string }[] }[] = [
  {
    heading: "ORDERS & DELIVERY",
    faqs: [
      { q: "Where do you deliver?", a: "We deliver across Nairobi (CBD, Westlands, Kilimani, Eastlands, Lavington/Kileleshwa, South B/C, Karen/Langata) plus upcountry shipping. Orders over KSh 3,000 get free delivery." },
      { q: "How fast is delivery?", a: "Nairobi orders arrive in 1–2 working days; upcountry takes 2–4 working days. We dispatch Monday–Saturday, 10am–4pm." },
      { q: "How do I track my order?", a: "Use your Paystack reference on the checkout success page, or check your account. For help within 48h of delivery, contact us with your order number." },
    ],
  },
  {
    heading: "PAYMENTS",
    faqs: [
      { q: "Which payment methods do you accept?", a: "M-Pesa, cards and bank transfer via Paystack secure checkout. We never store card details." },
      { q: "Is my payment secure?", a: "Yes — payments run on Paystack's hosted checkout with signature-verified webhooks before any order is marked paid." },
    ],
  },
  {
    heading: "SUBSCRIPTIONS (GIGI CLUB)",
    faqs: [
      { q: "How does GiGi Club billing work?", a: "Monthly billing via card or M-Pesa. Renewal links are sent before each charge, and you can pause, resume or cancel anytime from your account." },
      { q: "Do members get shop discounts?", a: "Active members get their plan's insider discount applied automatically at checkout when signed in with the same email." },
    ],
  },
  {
    heading: "PRODUCT",
    faqs: PRODUCT_FAQS.map((f) => ({ q: f.q, a: f.a })),
  },
  {
    heading: "RETURNS",
    faqs: [
      { q: "What if my delivery arrives damaged?", a: "Contact us within 48h with photos — we swap damaged cans or refund. Opened chilled stock can't be returned unless faulty." },
    ],
  },
]

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SECTIONS.flatMap((s) =>
      s.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
    ),
  }
  return (
    <div className="min-h-screen bg-[#121212]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <span className="font-mono text-[#AFFF00] text-xs tracking-widest">HELP</span>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2">FAQ</h1>
        <p className="text-white/60 font-mono text-sm mt-4 mb-12">Orders, delivery, payments, Club and product — answered.</p>
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.heading}>
              <h2 className="font-mono text-[#AFFF00] text-xs tracking-widest mb-3">{s.heading}</h2>
              <Accordion type="single" collapsible className="bg-white/5 border border-white/10 px-5">
                {s.faqs.map((f) => (
                  <AccordionItem key={f.q} value={f.q} className="border-white/10">
                    <AccordionTrigger className="text-white font-bold text-sm text-left">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-white/55 font-mono text-sm leading-relaxed">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-white/40 font-mono text-sm">Still stuck?</p>
          <Link href="/contact" className="inline-block mt-3 bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  )
}

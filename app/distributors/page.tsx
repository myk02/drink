"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Truck,
  Megaphone,
  Package,
  ShieldCheck,
  Handshake,
  Store,
  Utensils,
  Dumbbell,
  Building2,
  ShoppingCart,
  Beer,
  MapPin,
  Clock,
  BadgeCheck,
  Phone,
  Mail,
  MessageCircle,
  Download,
  Calculator,
  Check,
  X,
  Star,
  Zap,
  Eye,
  Thermometer,
  GraduationCap,
  Users,
  FileText,
  Search,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ClientOnly } from "@/components/client-only"
import { SITE_URL } from "@/lib/site"

// --- Static data ---

const benefits = [
  {
    icon: TrendingUp,
    title: "Strong Margins",
    description: "Up to 40% wholesale margin. At KSh 150 retail and KSh 90 wholesale, you keep KSh 60 per can.",
    stat: "40% margin",
  },
  {
    icon: Truck,
    title: "Fast Restocking",
    description: "Order today, restocked within 48 hours anywhere in Nairobi. Weekly trunk runs to Mombasa, Kisumu, Nakuru.",
    stat: "48h SLA",
  },
  {
    icon: Megaphone,
    title: "Marketing Support",
    description: "Branded fridges on loan, POS posters, wobblers, sampling teams and social features for launch week.",
    stat: "Free on 25+ cases",
  },
  {
    icon: Package,
    title: "Low Minimums",
    description: "Start with 5 cases. No contracts, no penalties. Scale as your sell-through grows.",
    stat: "5 cases MOQ",
  },
  {
    icon: ShieldCheck,
    title: "KEBS Certified",
    description: "Fresh batches, cold-chain stored, full traceability. Buy direct — never grey-market or expired.",
    stat: "Authentic",
  },
  {
    icon: Handshake,
    title: "Dedicated Rep",
    description: "A real Nairobi rep who knows your outlet — orders, swaps slow flavours, trains your staff.",
    stat: "WhatsApp direct",
  },
]

const idealPartners = [
  { icon: Store, title: "Shops & Mini-marts", desc: "Dukas, general stores, mini-supermarkets in estates", bullets: ["High footfall", "Impulse fridge placement"] },
  { icon: Building2, title: "Supermarkets", desc: "Naivas, Quickmart, Carrefour satellites & independents", bullets: ["Pallet pricing", "Promo support"] },
  { icon: Beer, title: "Bars & Restaurants", desc: "Chill + energy pairing, cocktail mixers", bullets: ["Nightlife margin", "Menu feature"] },
  { icon: Dumbbell, title: "Gyms & Studios", desc: "Our core — paid sampling, member discounts, activations", bullets: ["Partner gym seal", "PT referrals"] },
  { icon: Utensils, title: "Hotels & Cafes", desc: "Premium placement, room service & meetings", bullets: ["Premium crown", "Bulk credit 7 days"] },
  { icon: ShoppingCart, title: "Wholesalers", desc: "County distributors covering 20+ outlets", bullets: ["Territory exclusivity", "Truck-load pricing"] },
]

const starterPacks = [
  {
    name: "Starter",
    cases: 5,
    cans: 120,
    wholesale: 10800,
    retailValue: 18000,
    perCan: 90,
    badge: "Most tried",
    accent: "border-white/10",
    cta: "Start with Starter",
  },
  {
    name: "Growth",
    cases: 12,
    cans: 288,
    wholesale: 24200,
    retailValue: 43200,
    perCan: 84,
    badge: "Best value",
    accent: "border-[#AFFF00] bg-[#AFFF00]/5",
    cta: "Scale with Growth",
    popular: true,
  },
  {
    name: "Pro Distributor",
    cases: 25,
    cans: 600,
    wholesale: 48000,
    retailValue: 90000,
    perCan: 80,
    badge: "Max margin",
    accent: "border-white/10",
    cta: "Go Pro",
  },
]

const requirements = [
  { title: "Valid business", desc: "KRA PIN + business permit / ID. No registration fee.", ok: true },
  { title: "Clean storage", desc: "Cool, dry space out of direct sun. No chiller required to start.", ok: true },
  { title: "Phone & M-Pesa", desc: "Safaricom paybill / till for restock; orders via WhatsApp.", ok: true },
  { title: "5-case cash upfront", desc: "Prepaid starter; 7-day credit after 3rd order (vetted).", ok: true },
  { title: "Not exclusive", desc: "You can stock other soft drinks. No lock-in.", ok: true },
  { title: "Min 2 restocks/month", desc: "Keeps your listing fresh & featured on site.", ok: false },
]

const coverage = [
  { zone: "CBD / Town", fee: "200", sla: "24h" },
  { zone: "Westlands / Kilimani / Parklands", fee: "250", sla: "24h" },
  { zone: "Eastlands / South B/C", fee: "250–300", sla: "48h" },
  { zone: "Lavington / Karen / Langata", fee: "300–400", sla: "48h" },
  { zone: "Thika / Kiambu / Rongai", fee: "350–500", sla: "72h" },
  { zone: "Mombasa / Kisumu / Nakuru / Eldoret", fee: "Pallet freight", sla: "3–5 days" },
]

const testimonials = [
  {
    name: "Achieng, QuickMeds Westlands",
    role: "Stocks 12 cases/week",
    quote: "GiGi moves faster than the imports. Rep swaps slow flavours without question and the fridge brought new walk-ins.",
    initials: "AW",
  },
  {
    name: "Brian, Iron Haven Gym",
    role: "Partner gym since 2024",
    quote: "Members actually ask for it by name now. Sampling Saturday sold 4 cases in 2 hours — clean energy, no crash complaints.",
    initials: "BI",
  },
  {
    name: "Fatma, Naivas-style mini-mart, Eastlands",
    role: "8 cases/week",
    quote: "M-Pesa till, WhatsApp order, delivery next morning. Margin is real and the mixed case means I never get stuck with one flavour.",
    initials: "FM",
  },
]

const steps = [
  { n: "01", title: "Apply (2 min)", desc: "Tell us your outlet, location and volume. No documents upfront.", time: "Today" },
  { n: "02", title: "Call & Quote", desc: "We call within 24h with exact wholesale, retail and your starter pack.", time: "Within 24h" },
  { n: "03", title: "Pay & Load", desc: "M-Pesa or bank, invoice instantly. We pick, pack & dispatch.", time: "Day 2" },
  { n: "04", title: "Sell & Restock", desc: "WhatsApp restock, swap slow movers, get POS and social shout-out.", time: "Day 3+" },
]

const faqs = [
  {
    q: "What's the real margin and wholesale price?",
    a: "Suggested retail is KSh 150/can. Wholesale is KSh 80–90/can depending on pack (5 cases @90, 12 @84, 25 @80). At 90 vs 150 you keep 60 per can = 40% margin. No hidden fees — delivery is zone-based KSh 200–500 in Nairobi, pallet freight upcountry.",
  },
  {
    q: "Do I need a fridge or large warehouse?",
    a: "No. Start with a cool shelf or existing fridge. Branded GiGi fridges are free on loan from 25 cases/month with photo proof of placement. Warehouse only needed for wholesalers (50+ cases).",
  },
  {
    q: "Can I mix flavours or am I stuck with one?",
    a: "All packs are mixed by default, and single-flavour 12-packs are available at the same wholesale. Your rep will swap any slow flavour for free on your next restock.",
  },
  {
    q: "Payment terms — is there credit?",
    a: "First 3 orders are prepaid (M-Pesa Paybill / Till or bank). Vetted partners get 7-day credit from order 4. No cheques.",
  },
  {
    q: "Territory exclusivity?",
    a: "Shops/bars: no exclusivity, first-come restock. Wholesalers covering 20+ outlets can request a ward-level soft exclusivity — reviewed case-by-case based on your volume commitment.",
  },
  {
    q: "What about KEBS, expiry and returns?",
    a: "Every batch is KEBS certified, best-before 12 months, stored cold-chain. If you receive near-expiry (<3 months) or damage in transit, we replace it free within 48h — photo on WhatsApp is enough.",
  },
]

const comparison = [
  { label: "Sugar", gigi: "0g", other: "11–14g" },
  { label: "Caffeine", gigi: "75mg natural", other: "80mg synthetic" },
  { label: "Flavours", gigi: "10 + Kenyan fruits", other: "2–3 imported" },
  { label: "Made in", gigi: "Nairobi, Kenya", other: "Imported" },
  { label: "Wholesale (24 cans)", gigi: "KSh 2,160", other: "KSh 2,800+" },
]

const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Machakos", "Kajiado", "Uasin Gishu (Eldoret)", "Other"]
const businessTypes = [
  { value: "shop", label: "Shop / Duka / Mini-mart" },
  { value: "supermarket", label: "Supermarket" },
  { value: "bar_restaurant", label: "Bar / Restaurant / Cafe" },
  { value: "gym", label: "Gym / Studio" },
  { value: "hotel", label: "Hotel / Catering" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "distributor", label: "County Distributor" },
  { value: "other", label: "Other" },
] as const

const distributorsJsonLd = {
  "@context": "https://schema.org",
  "@type": "WholesaleStore",
  name: "GiGi Energy Distribution",
  url: `${SITE_URL}/distributors`,
  description: "Stock GiGi Energy in your shop, bar, gym or supermarket. Wholesale KSh 80-90/can, 40% margin, 5-case MOQ, 48h Nairobi restock.",
  address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
  priceRange: "KSh 80-90 per can wholesale",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "GiGi Wholesale Packs",
    itemListElement: starterPacks.map((p) => ({
      "@type": "Offer",
      name: p.name,
      price: p.wholesale,
      priceCurrency: "KES",
      availability: "https://schema.org/InStock",
    })),
  },
}

function DistributorsContent() {
  const [casesPerWeek, setCasesPerWeek] = useState(8)
  const [retailPrice, setRetailPrice] = useState(150)
  const wholesalePerCan = 90

  const calc = useMemo(() => {
    const cans = casesPerWeek * 24
    const wholesaleCost = cans * wholesalePerCan
    const retailRevenue = cans * retailPrice
    const profit = retailRevenue - wholesaleCost
    const margin = retailPrice > 0 ? ((retailPrice - wholesalePerCan) / retailPrice) * 100 : 0
    return { cans, wholesaleCost, retailRevenue, profit, monthly: profit * 4, margin }
  }, [casesPerWeek, retailPrice])

  const [form, setForm] = useState({
    contactName: "",
    businessName: "",
    businessType: "shop" as (typeof businessTypes)[number]["value"],
    county: "Nairobi",
    location: "",
    outletCount: "",
    weeklyVolume: "5-10 cases",
    hasFridge: false,
    experience: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const submit = useMutation(api.distributors.submitApplication)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await submit({
        contactName: form.contactName,
        businessName: form.businessName,
        businessType: form.businessType as any,
        county: form.county,
        location: form.location,
        outletCount: form.outletCount || undefined,
        weeklyVolume: form.weeklyVolume,
        hasFridge: form.hasFridge,
        experience: form.experience || undefined,
        email: form.email,
        phone: form.phone,
        message: form.message || undefined,
      })
      setSubmitted(true)
      toast.success("Application sent! Distribution team replies within 24h (often same day).")
      setForm({
        contactName: "",
        businessName: "",
        businessType: "shop",
        county: "Nairobi",
        location: "",
        outletCount: "",
        weeklyVolume: "5-10 cases",
        hasFridge: false,
        experience: "",
        email: "",
        phone: "",
        message: "",
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Try again or WhatsApp us.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadDeck = () => {
    const content = `GIGI ENERGY - TRADE DECK 2026
Wholesale price KSh 80-90/can | Retail KSh 150 | Margin 40%
Starter 5 cases KSh 10,800 | Growth 12 KSh 24,200 | Pro 25 KSh 48,000
MOQ 5 cases | Restock 48h Nairobi | KEBS certified | 10 flavours
Contact: distribution@gigi.energy | WhatsApp +254 700 000 000
Learn more: ${SITE_URL}/distributors`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "GiGi-Trade-Deck-2026.txt"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Trade deck downloaded — full PDF coming soon. Check your downloads.")
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(distributorsJsonLd) }} />

      {/* Sticky mobile apply */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur border-t border-white/10 p-3 flex items-center justify-between md:hidden">
        <span className="text-white font-mono text-xs">5-case MOQ • 40% margin • 24h reply</span>
        <a href="#apply" className="bg-[#AFFF00] text-[#121212] px-5 py-2 font-black text-sm">
          Apply now
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 md:py-16 pb-20 md:pb-16">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>

        {/* HERO — CPG wholesale best practice: value prop + visual + dual CTA + trust */}
        <div className="grid lg:grid-cols-12 gap-8 mb-10 items-start">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 bg-[#AFFF00] text-[#121212] px-3 py-1 font-mono text-xs font-bold tracking-widest">
              <span className="w-2 h-2 bg-[#121212] animate-pulse" /> WHOLESALE & DISTRIBUTION — Nairobi + Upcountry
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-4 leading-[0.9]">
              SELL <span className="text-[#AFFF00]">GIGI</span>
              <br />
              <span className="text-white/90 text-3xl md:text-5xl">AND KEEP 40%</span>
            </h1>
            <p className="text-white/60 font-mono text-sm mt-4 max-w-xl leading-relaxed">
              Kenya&apos;s energy drink — zero sugar, 10 flavours made in Nairobi. Stock it in your shop, bar, gym, restaurant or supermarket. 5-case minimum, 48h restock, no contracts.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a href="#apply" className="bg-[#AFFF00] text-[#121212] px-6 py-3.5 font-black text-sm inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
                Apply to stock — 2 min <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/254700000000?text=Hi%20GiGi%20team%2C%20I%20want%20to%20stock%20GiGi%20at%20my%20outlet"
                target="_blank"
                className="bg-white text-[#121212] px-6 py-3.5 font-bold text-sm inline-flex items-center gap-2 hover:bg-white/90 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp rep
              </a>
              <button onClick={downloadDeck} className="border border-white/10 text-white px-6 py-3.5 font-bold text-sm inline-flex items-center gap-2 hover:border-[#AFFF00]/50 transition-colors cursor-pointer">
                <Download className="w-4 h-4" /> Trade deck
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {["KEBS certified", "KSh 90/can wholesale", "No exclusivity", "Swap slow flavours free"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-[#AFFF00] border border-[#AFFF00]/20 bg-[#AFFF00]/5 px-2.5 py-1 font-mono text-[11px]">
                  <Check className="w-3 h-3" /> {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Hero visual / stats card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-5">
            <div className="bg-white/[0.04] border border-white/10 p-5">
              <div className="relative aspect-[4/3] bg-[#0e0e0e] border border-white/5 overflow-hidden flex items-center justify-center">
                <Image src="/images/flavours/lemon-lime.png" alt="GiGi cans" width={600} height={600} className="object-contain p-6" />
                <div className="absolute bottom-3 left-3 right-3 bg-[#121212]/90 border border-white/10 p-3 flex items-center justify-between backdrop-blur">
                  <span className="text-white font-mono text-xs">10 flavours • 250ml • 75mg caffeine</span>
                  <span className="bg-[#AFFF00] text-[#121212] font-black text-xs px-2 py-1">KSh 150 SRP</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                {[
                  { k: "40%", l: "Margin" },
                  { k: "5", l: "Case MOQ" },
                  { k: "48h", l: "Restock" },
                ].map((s) => (
                  <div key={s.l} className="bg-[#121212] border border-white/5 p-3">
                    <p className="text-xl font-black text-[#AFFF00]">{s.k}</p>
                    <p className="text-white/40 font-mono text-[11px] mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-[11px] font-mono">
                <div className="flex items-center gap-2 text-white/60">
                  <Phone className="w-3.5 h-3.5 text-[#AFFF00]" /> +254 700 000 000 (Mon–Sat 8a–6p)
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Mail className="w-3.5 h-3.5 text-[#AFFF00]" /> distribution@gigi.energy — 24h reply
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <MapPin className="w-3.5 h-3.5 text-[#AFFF00]" /> Industrial Area, Nairobi — cold-chain storage
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { value: "40%", label: "Max wholesale margin", sub: "90 vs 150" },
            { value: "5", label: "Cases minimum", sub: "120 cans to start" },
            { value: "48hrs", label: "Nairobi restock", sub: "Upcountry 3–5 days" },
            { value: "10", label: "Flavours", sub: "Mix & match" },
          ].map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white/5 border border-white/10 p-6 text-center">
              <p className="text-3xl font-black text-[#AFFF00]">{stat.value}</p>
              <p className="text-white font-mono text-xs mt-1">{stat.label}</p>
              <p className="text-white/30 font-mono text-[11px]">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Who should apply */}
        <div className="mb-14">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">WHO SHOULD APPLY</h2>
            <span className="font-mono text-white/40 text-xs">If customers walk in, you qualify — we cover 6 channels</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {idealPartners.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 p-6 hover:border-[#AFFF00]/30 transition-colors group"
              >
                <p.icon className="w-7 h-7 text-[#AFFF00] mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-sm">{p.title}</h3>
                <p className="text-white/50 font-mono text-xs mt-1 leading-relaxed">{p.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.bullets.map((b) => (
                    <span key={b} className="bg-[#121212] border border-white/10 text-white/50 font-mono text-[11px] px-2 py-1">
                      {b}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing packs + calculator */}
        <div className="grid lg:grid-cols-12 gap-6 mb-14">
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">WHOLESALE PACKS</h2>
            <p className="text-white/40 font-mono text-xs mb-6">Tax-inclusive. Price per can drops as you scale. Mixed flavours by default.</p>
            <div className="grid md:grid-cols-3 gap-4">
              {starterPacks.map((p) => (
                <div key={p.name} className={`border p-5 flex flex-col ${p.accent} ${p.popular ? "relative" : ""}`}>
                  {p.popular && <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#AFFF00] text-[#121212] font-black text-[10px] px-2 py-1">MOST POPULAR</span>}
                  <span className="bg-white/5 border border-white/10 text-[#AFFF00] font-mono text-[11px] px-2 py-1 self-start">{p.badge}</span>
                  <h3 className="text-white font-black text-lg mt-3">{p.name}</h3>
                  <p className="text-white/50 font-mono text-xs">{p.cases} cases • {p.cans} cans</p>
                  <p className="text-[#AFFF00] font-black text-2xl mt-3">KSh {p.wholesale.toLocaleString("en-KE")}</p>
                  <p className="text-white/30 font-mono text-xs line-through">Retail value KSh {p.retailValue.toLocaleString("en-KE")}</p>
                  <p className="text-white/60 font-mono text-xs mt-1">KSh {p.perCan}/can • You keep KSh {150 - p.perCan}</p>
                  <div className="mt-3 bg-[#121212] border border-white/5 p-2 text-center">
                    <p className="text-white/40 font-mono text-[11px]">Margin {Math.round(((150 - p.perCan) / 150) * 100)}% • Save KSh {(p.retailValue - p.wholesale).toLocaleString("en-KE")}</p>
                  </div>
                  <a href="#apply" className={`mt-4 text-center font-black text-xs py-3 ${p.popular ? "bg-[#AFFF00] text-[#121212]" : "bg-white text-[#121212]"} hover:opacity-90 transition-opacity`}>
                    {p.cta}
                  </a>
                  <p className="text-white/20 font-mono text-[11px] mt-2 text-center">Moq • No contract</p>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-[#AFFF00] text-[#121212] p-4 flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xs font-bold">Need 50+ cases or pallet? Custom pallet quote in 3 hours.</span>
              <a href="https://wa.me/254700000000?text=Need%20pallet%20quote%20for%20GiGi" target="_blank" className="bg-[#121212] text-[#AFFF00] px-4 py-2 font-black text-xs inline-flex items-center gap-2">
                <Truck className="w-3.5 h-3.5" /> Get pallet price
              </a>
            </div>
          </div>

          {/* Calculator */}
          <div className="lg:col-span-5">
            <div className="bg-white/5 border border-white/10 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-[#AFFF00]" />
                <h3 className="text-white font-black">MARGIN CALCULATOR</h3>
                <span className="ml-auto bg-[#AFFF00] text-[#121212] font-mono text-[11px] font-bold px-2 py-1">Live</span>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/60 font-mono text-xs">Cases per week</label>
                    <span className="bg-[#121212] border border-white/10 text-[#AFFF00] font-black text-sm px-2 py-1">{casesPerWeek} cases</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={casesPerWeek}
                    onChange={(e) => setCasesPerWeek(parseInt(e.target.value))}
                    className="w-full accent-[#AFFF00]"
                  />
                  <div className="flex justify-between text-white/30 font-mono text-[11px] mt-1">
                    <span>1 case (24 cans)</span>
                    <span>50 cases</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/60 font-mono text-xs">Your retail price (KSh)</label>
                    <span className="bg-[#121212] border border-white/10 text-white font-mono text-sm px-2 py-1">KSh {retailPrice}</span>
                  </div>
                  <input
                    type="range"
                    min={120}
                    max={200}
                    step={5}
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(parseInt(e.target.value))}
                    className="w-full accent-[#AFFF00]"
                  />
                  <div className="flex justify-between text-white/30 font-mono text-[11px] mt-1">
                    <span>Suggested 150</span>
                    <span>Premium 200</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#121212] border border-white/10 p-4">
                    <p className="text-white/40 font-mono text-[11px]">Cans / week</p>
                    <p className="text-white font-black text-lg">{calc.cans}</p>
                    <p className="text-white/30 font-mono text-[11px]">Wholesale KSh {calc.wholesaleCost.toLocaleString("en-KE")}</p>
                  </div>
                  <div className="bg-[#121212] border border-white/10 p-4">
                    <p className="text-white/40 font-mono text-[11px]">Retail revenue</p>
                    <p className="text-[#AFFF00] font-black text-lg">KSh {calc.retailRevenue.toLocaleString("en-KE")}</p>
                    <p className="text-white/30 font-mono text-[11px]">Margin {calc.margin.toFixed(0)}%</p>
                  </div>
                </div>
                <div className="bg-[#AFFF00] p-4">
                  <p className="text-[#121212] font-mono text-xs font-bold">Weekly profit</p>
                  <p className="text-[#121212] font-black text-3xl">KSh {calc.profit.toLocaleString("en-KE")}</p>
                  <p className="text-[#121212]/60 font-mono text-xs">Monthly ~ KSh {calc.monthly.toLocaleString("en-KE")} • Payback on Starter in {calc.profit > 0 ? Math.ceil(10800 / calc.profit) : "–"} weeks</p>
                </div>
                <p className="text-white/20 font-mono text-[11px] text-center">Assumes wholesale KSh 90/can. Growth/Pro packs lower to 84/80 — use table above.</p>
                <a href="#apply" className="block text-center bg-white text-[#121212] font-black text-sm py-3 hover:bg-white/90 transition-colors">
                  Lock this margin — apply
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits (expanded) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="bg-white/5 border border-white/10 p-6 hover:border-[#AFFF00]/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <b.icon className="w-7 h-7 text-[#AFFF00]" />
                <span className="bg-[#AFFF00]/10 border border-[#AFFF00]/20 text-[#AFFF00] font-mono text-[11px] px-2 py-1">{b.stat}</span>
              </div>
              <h3 className="text-white font-bold text-sm">{b.title}</h3>
              <p className="text-white/50 font-mono text-xs mt-2 leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Requirements */}
        <div className="grid lg:grid-cols-12 gap-6 mb-14">
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-black text-white tracking-tight">YOU NEED</h2>
            <p className="text-white/40 font-mono text-xs mt-2">No hidden fees. 5 checks, 2 minutes.</p>
            <div className="mt-6 space-y-3">
              {requirements.map((r) => (
                <div key={r.title} className="flex gap-3 bg-white/5 border border-white/10 p-4">
                  <div className={`w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 ${r.ok ? "bg-[#AFFF00] text-[#121212]" : "bg-white/10 text-white/40"}`}>
                    {r.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{r.title}</p>
                    <p className="text-white/50 font-mono text-xs leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7">
            {/* Coverage */}
            <h2 className="text-2xl font-black text-white tracking-tight">COVERAGE & LOGISTICS</h2>
            <p className="text-white/40 font-mono text-xs mt-2">Cold-chain, zone pricing, no surprises.</p>
            <div className="mt-6 bg-white/5 border border-white/10 overflow-hidden">
              <div className="grid grid-cols-3 gap-0 bg-[#121212] border-b border-white/10 p-3 font-mono text-[11px] text-white/40">
                <span>Zone</span>
                <span>Delivery fee</span>
                <span>Restock SLA</span>
              </div>
              {coverage.map((c) => (
                <div key={c.zone} className="grid grid-cols-3 gap-0 p-3 border-b border-white/5 last:border-0 font-mono text-xs">
                  <span className="text-white/80 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#AFFF00]" /> {c.zone}
                  </span>
                  <span className="text-white/60">KSh {c.fee}</span>
                  <span className="text-[#AFFF00]">{c.sla}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: Thermometer, title: "Cold chain", desc: "Refrigerated trunk, tracer" },
                { icon: FileText, title: "Invoice", desc: "VAT compliant, instant" },
                { icon: Truck, title: "Mixed pallets", desc: "Flavours split free" },
              ].map((x) => (
                <div key={x.title} className="bg-[#AFFF00] p-4">
                  <x.icon className="w-5 h-5 text-[#121212] mb-2" />
                  <p className="text-[#121212] font-black text-xs">{x.title}</p>
                  <p className="text-[#121212]/60 font-mono text-[11px]">{x.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What you get */}
        <div className="mb-14 bg-white/5 border border-white/10 p-6 md:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">WHAT YOU GET</h2>
            <span className="font-mono text-[#AFFF00] text-xs border border-[#AFFF00]/20 bg-[#AFFF00]/5 px-2 py-1">On top of cans</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Store, title: "Fridge on loan", desc: "Glass-door cooler free at 25+ cases/month. We install, you keep it filled with GiGi-facing." },
              { icon: Eye, title: "POS that sells", desc: "Posters, wobblers, price strips, shelf talkers. Swap kit each quarter, no charge." },
              { icon: Megaphone, title: "Launch buzz", desc: "Instagram feature, Google Maps push, sampling team on your opening Saturday." },
              { icon: GraduationCap, title: "Staff training", desc: "30-min pitch training: story, flavours, cross-sell. Certificate + trial cans." },
              { icon: Users, title: "Rep on WhatsApp", desc: "Same rep every time — knows your par levels, sorts swaps in one message." },
              { icon: BadgeCheck, title: "Featured listing", desc: "Appear on gigi.energy/stockists + events pages. Customers find you." },
            ].map((s) => (
              <div key={s.title} className="flex gap-3">
                <s.icon className="w-5 h-5 text-[#AFFF00] shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-bold text-sm">{s.title}</h3>
                  <p className="text-white/50 font-mono text-xs mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison */}
        <div className="mb-14">
          <h2 className="text-2xl font-black text-white tracking-tight mb-6">WHY GIGI vs IMPORTS</h2>
          <div className="bg-white/5 border border-white/10 overflow-hidden">
            <div className="grid grid-cols-3 gap-0 bg-[#121212] border-b border-white/10 p-4 font-mono text-xs">
              <span className="text-white/40">Feature</span>
              <span className="text-[#AFFF00] font-black">GiGi</span>
              <span className="text-white/40">Typical import</span>
            </div>
            {comparison.map((c) => (
              <div key={c.label} className="grid grid-cols-3 gap-0 p-4 border-b border-white/5 last:border-0 font-mono text-sm">
                <span className="text-white/50 text-xs">{c.label}</span>
                <span className="text-white font-bold">{c.gigi}</span>
                <span className="text-white/30">{c.other}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-14">
          <h2 className="text-2xl font-black text-white tracking-tight mb-6">STOCKISTS SAY</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#AFFF00] text-[#121212] flex items-center justify-center font-black text-sm">{t.initials}</div>
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-white/40 font-mono text-xs">{t.role}</p>
                  </div>
                  <Star className="w-4 h-4 text-[#AFFF00] ml-auto" />
                </div>
                <p className="text-white/60 font-mono text-sm leading-relaxed">“{t.quote}”</p>
              </div>
            ))}
          </div>
          <p className="text-white/20 font-mono text-xs mt-3 text-center">Real outlets, real reorders — phone numbers on file, visits welcome.</p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-4 mb-14">
          {steps.map((s) => (
            <div key={s.n} className="bg-white/5 border border-white/10 p-6 text-center relative overflow-hidden">
              <span className="font-mono text-[#AFFF00]/20 text-4xl font-black">{s.n}</span>
              <h3 className="text-white font-bold text-sm mt-2">{s.title}</h3>
              <p className="text-white/50 font-mono text-xs mt-1 leading-relaxed">{s.desc}</p>
              <span className="inline-block mt-3 bg-[#121212] border border-white/10 text-[#AFFF00] font-mono text-[11px] px-2 py-1">{s.time}</span>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mb-14 max-w-4xl">
          <h2 className="text-2xl font-black text-white tracking-tight mb-6">FAQ — WHOLESALE</h2>
          <Accordion type="single" collapsible className="bg-white/5 border border-white/10 px-6">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-white/10">
                <AccordionTrigger className="text-white font-bold text-sm text-left hover:text-[#AFFF00] data-[state=open]:text-[#AFFF00]">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-white/60 font-mono text-sm leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="text-white/30 font-mono text-xs mt-3">
            Still unsure? <a href="https://wa.me/254700000000" target="_blank" className="text-[#AFFF00] hover:underline">Chat on WhatsApp</a> or <Link href="/contact" className="text-[#AFFF00] hover:underline">email distribution@gigi.energy</Link>
          </p>
        </div>

        {/* Enhanced form */}
        <motion.div
          id="apply"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 border border-white/10 p-6 md:p-8 max-w-5xl mx-auto scroll-mt-24"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">APPLY TO STOCK GIGI — 2 MIN</h2>
              <p className="text-white/50 font-mono text-sm mt-2">We reply within 24h with wholesale, retail and your best starter pack. No documents needed now.</p>
            </div>
            <span className="font-mono text-white/30 text-xs border border-white/10 px-3 py-1.5">Avg. completion 1m 48s • No account</span>
          </div>

          {submitted ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-4 bg-[#AFFF00] flex items-center justify-center">
                <Check className="w-7 h-7 text-[#121212]" />
              </div>
              <h3 className="text-2xl font-black text-white">Application received!</h3>
              <p className="text-white/60 font-mono text-sm mt-2">Distribution team will call/WhatsApp within 24h with your quote. Check your email & SMS.</p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setSubmitted(false)}
                  className="border border-white/10 text-white px-6 py-3 font-bold text-sm hover:border-[#AFFF00]/30 cursor-pointer"
                >
                  Send another
                </button>
                <Link href="/shop" className="bg-[#AFFF00] text-[#121212] px-6 py-3 font-black text-sm inline-flex items-center gap-2">
                  Browse retail shop <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 font-mono text-xs mb-1.5 block">Contact name *</label>
                  <input
                    required
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    placeholder="Your full name"
                    className="w-full bg-[#121212] border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
                  />
                </div>
                <div>
                  <label className="text-white/60 font-mono text-xs mb-1.5 block">Business / outlet name *</label>
                  <input
                    required
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    placeholder="e.g. QuickMeds Westlands"
                    className="w-full bg-[#121212] border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 font-mono text-xs mb-1.5 block">Business type *</label>
                  <select
                    value={form.businessType}
                    onChange={(e) => setForm({ ...form, businessType: e.target.value as any })}
                    className="w-full bg-[#121212] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
                  >
                    {businessTypes.map((t) => (
                      <option key={t.value} value={t.value} className="bg-[#121212]">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white/60 font-mono text-xs mb-1.5 block">County / Area *</label>
                  <select
                    value={form.county}
                    onChange={(e) => setForm({ ...form, county: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
                  >
                    {counties.map((c) => (
                      <option key={c} value={c} className="bg-[#121212]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 font-mono text-xs mb-1.5 block">Specific location *</label>
                  <input
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Estate / street / building"
                    className="w-full bg-[#121212] border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
                  />
                </div>
                <div>
                  <label className="text-white/60 font-mono text-xs mb-1.5 block">How many outlets / fridges?</label>
                  <input
                    value={form.outletCount}
                    onChange={(e) => setForm({ ...form, outletCount: e.target.value })}
                    placeholder="e.g. 1 shop, 2 fridges"
                    className="w-full bg-[#121212] border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 font-mono text-xs mb-1.5 block">Expected weekly volume *</label>
                  <select
                    value={form.weeklyVolume}
                    onChange={(e) => setForm({ ...form, weeklyVolume: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
                  >
                    <option value="5-10 cases">5–10 cases (starter)</option>
                    <option value="11-25 cases">11–25 cases (growth)</option>
                    <option value="26-50 cases">26–50 cases (hot)</option>
                    <option value="50+ cases">50+ cases (distributor)</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 bg-[#121212] border border-white/10 px-4 py-3 cursor-pointer hover:border-[#AFFF00]/30">
                    <input
                      type="checkbox"
                      checked={form.hasFridge}
                      onChange={(e) => setForm({ ...form, hasFridge: e.target.checked })}
                      className="accent-[#AFFF00]"
                    />
                    <span className="text-white font-mono text-xs">I have a fridge / cooler</span>
                    <Thermometer className="w-4 h-4 text-[#AFFF00] ml-auto" />
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 font-mono text-xs mb-1.5 block">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@business.co.ke"
                    className="w-full bg-[#121212] border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
                  />
                </div>
                <div>
                  <label className="text-white/60 font-mono text-xs mb-1.5 block">Phone (M-Pesa) *</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="07xx xxx xxx"
                    className="w-full bg-[#121212] border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 font-mono text-xs mb-1.5 block">Experience (optional)</label>
                <input
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  placeholder="Have you distributed drinks before? Which brands?"
                  className="w-full bg-[#121212] border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
                />
              </div>

              <div>
                <label className="text-white/60 font-mono text-xs mb-1.5 block">Anything else?</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your outlet — location, opening hours, why GiGi fits..."
                  rows={3}
                  className="w-full bg-[#121212] border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#AFFF00] disabled:opacity-60 text-[#121212] px-8 py-3.5 font-black text-sm inline-flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {isSubmitting ? "Sending..." : "Submit application"}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>
                <a
                  href="https://wa.me/254700000000?text=Hi%20GiGi%20distribution%20team"
                  target="_blank"
                  className="border border-white/10 text-white px-6 py-3.5 font-bold text-sm inline-flex items-center gap-2 hover:border-[#AFFF00]/30"
                >
                  <MessageCircle className="w-4 h-4" /> Or WhatsApp
                </a>
              </div>
              <p className="text-white/20 font-mono text-[11px]">By applying you agree we can call/WhatsApp on the number you gave. No spam.</p>
            </form>
          )}
        </motion.div>

        {/* Contact strip */}
        <div className="max-w-5xl mx-auto mt-6 grid md:grid-cols-3 gap-3">
          {[
            { icon: Phone, t: "Call", d: "+254 700 000 000", a: "tel:+254700000000" },
            { icon: MessageCircle, t: "WhatsApp", d: "Chat in 2 min", a: "https://wa.me/254700000000" },
            { icon: Mail, t: "Email", d: "distribution@gigi.energy", a: "mailto:distribution@gigi.energy" },
          ].map((x) => (
            <a key={x.t} href={x.a} target={x.a.startsWith("http") ? "_blank" : undefined} className="bg-white/5 border border-white/10 p-4 flex items-center gap-3 hover:border-[#AFFF00]/30 transition-colors">
              <x.icon className="w-5 h-5 text-[#AFFF00]" />
              <div>
                <p className="text-white font-bold text-xs">{x.t}</p>
                <p className="text-white/60 font-mono text-xs">{x.d}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/20 ml-auto" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DistributorsPage() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-[#121212]">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
      }
    >
      <DistributorsContent />
    </ClientOnly>
  )
}

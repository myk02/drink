"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  Share2,
  Check,
  Users,
  TrendingUp,
  Heart,
  GraduationCap,
  Home as HomeIcon,
  Rocket,
  Package,
  Zap,
  Eye,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CareerApplicationForm } from "@/components/career-application-form"
import { TalentPoolForm } from "@/components/talent-pool-form"
import { SITE_URL } from "@/lib/site"
import { ROLES, BENEFITS, TESTIMONIALS, HIRING_STEPS, FAQS, DEPARTMENTS, formatPosted } from "@/lib/careers-data"
import { toast } from "sonner"

const values = [
  { title: "Ownership", desc: "You build it, you own it. No bystanders. Early-stage = your work hits shelves in weeks." },
  { title: "Energy", desc: "We make an energy drink. The team should run on one — fast, optimistic, biased to action." },
  { title: "Craft", desc: "Details matter — in the liquid, the can, the copy. We obsess over the last 10%." },
  { title: "Kenya First", desc: "We're proving a world-class brand can be born in Nairobi — and stay rooted here." },
]

const benefitIcons: Record<string, any> = {
  TrendingUp,
  Heart,
  GraduationCap,
  House: HomeIcon,
  Rocket,
  Package,
}

export default function CareersPage() {
  const [dept, setDept] = useState<(typeof DEPARTMENTS)[number]>("All")
  const [q, setQ] = useState("")
  const [activeRole, setActiveRole] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return ROLES.filter((r) => {
      if (dept !== "All" && r.department !== dept) return false
      if (q) {
        const hay = `${r.title} ${r.blurb} ${r.summary} ${r.location} ${r.type}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [dept, q])

  const validThrough = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: ROLES.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "JobPosting",
        title: r.title,
        description: `${r.summary}\n\nResponsibilities:\n${r.responsibilities.join("\n")}`,
        datePosted: r.postedAt,
        validThrough,
        employmentType: r.employmentType,
        hiringOrganization: {
          "@type": "Organization",
          name: "GiGi Energy",
          sameAs: SITE_URL,
          logo: `${SITE_URL}/apple-icon.png`,
        },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Nairobi",
            addressCountry: "KE",
          },
        },
        baseSalary: {
          "@type": "MonetaryAmount",
          currency: "KES",
          value: {
            "@type": "QuantitativeValue",
            minValue: r.salaryMinKes,
            maxValue: r.salaryMaxKes,
            unitText: "MONTH",
          },
        },
        url: `${SITE_URL}/careers/${r.slug}`,
      },
    })),
  }

  const share = async (slug: string, title: string) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : SITE_URL}/careers/${slug}`
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} at GiGi Energy`, url })
        return
      } catch {}
    }
    await navigator.clipboard.writeText(url)
    toast.success("Link copied")
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Sticky apply bar (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur border-t border-white/10 p-3 flex items-center justify-between md:hidden">
        <span className="text-white font-mono text-xs">{ROLES.length} open roles • 48h reply</span>
        <a href="#open-roles" className="bg-[#AFFF00] text-[#121212] px-5 py-2 font-black text-sm">
          View roles
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

        {/* HERO */}
        <div className="grid lg:grid-cols-12 gap-8 mb-10 items-start">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 bg-[#AFFF00] text-[#121212] px-3 py-1 font-mono text-xs font-bold tracking-widest">
              <span className="w-2 h-2 bg-[#121212] animate-pulse" /> WE&apos;RE HIRING — {ROLES.length} OPEN ROLES
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-4 leading-[0.9]">
              WORK AT <span className="text-[#AFFF00]">GIGI</span>
            </h1>
            <p className="text-white/60 font-mono text-sm mt-4 max-w-xl leading-relaxed">
              Small team, big shelves. We&apos;re building Kenya&apos;s own energy drink in Nairobi — zero sugar, natural flavours, clean fuel for ambitious people. Early-stage means real ownership: your work ships.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a href="#open-roles" className="bg-[#AFFF00] text-[#121212] px-6 py-3 font-black text-sm inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
                View open roles <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#talent-pool" className="border border-white/10 text-white px-6 py-3 font-bold text-sm hover:border-[#AFFF00]/50 transition-colors">
                Join talent pool
              </a>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {[
                "We reply within 48 hours",
                "No account required",
                "5-minute apply",
                "Transparent pay",
              ].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-[#AFFF00] border border-[#AFFF00]/20 bg-[#AFFF00]/5 px-2.5 py-1 font-mono text-[11px]">
                  <Check className="w-3 h-3" /> {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Hero stats card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 lg:sticky lg:top-24"
          >
            <div className="bg-white/[0.04] border border-white/10 p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { k: "12", l: "Team members" },
                  { k: "4", l: "Flavours live" },
                  { k: "48h", l: "Restock SLA" },
                ].map((s) => (
                  <div key={s.l} className="bg-[#121212] border border-white/5 p-4">
                    <p className="text-2xl font-black text-[#AFFF00]">{s.k}</p>
                    <p className="text-white/40 font-mono text-xs mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3 text-white/60 font-mono text-xs">
                  <MapPin className="w-4 h-4 text-[#AFFF00]" /> HQ: Nairobi, Kenya — Industrial Area
                </div>
                <div className="flex items-center gap-3 text-white/60 font-mono text-xs">
                  <Clock className="w-4 h-4 text-[#AFFF00]" /> Updated {formatPosted(ROLES[0].postedAt)} • 3 roles live
                </div>
                <div className="flex items-center gap-3 text-white/60 font-mono text-xs">
                  <Users className="w-4 h-4 text-[#AFFF00]" /> 83% say they&apos;d recommend GiGi as a workplace
                </div>
              </div>
              <div className="mt-6 bg-[#AFFF00] text-[#121212] p-4">
                <p className="font-black text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Response-time promise
                </p>
                <p className="font-mono text-xs mt-1 leading-relaxed">
                  We reply to every application within <b>48 hours</b>. No ghosting. If you haven&apos;t heard, email careers@gigi.energy — it&apos;s monitored daily.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="bg-white/5 border border-white/10 p-5"
            >
              <h3 className="text-[#AFFF00] font-bold text-sm">{v.title}</h3>
              <p className="text-white/40 font-mono text-xs mt-2 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mb-14">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">WHY GIGI</h2>
            <span className="font-mono text-white/40 text-xs">Benefits are real — not just a Notion page</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => {
              const Icon = benefitIcons[b.icon] ?? Sparkles
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 border border-white/10 p-6 hover:border-[#AFFF00]/20 transition-colors"
                >
                  <Icon className="w-7 h-7 text-[#AFFF00] mb-3" />
                  <h3 className="text-white font-bold text-sm">{b.title}</h3>
                  <p className="text-white/50 font-mono text-xs mt-2 leading-relaxed">{b.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Culture / life */}
        <div className="grid lg:grid-cols-3 gap-4 mb-14">
          {[
            {
              k: "Ship fast",
              d: "Ideas to shelves in weeks. Field test on Monday, feedback by Friday, restock tweak the next Monday.",
            },
            {
              k: "No bystanders",
              d: "You own a metric. Weekly demos to the whole team — numbers on screen, learnings out loud.",
            },
            {
              k: "Celebrate the outlet",
              d: "Every new stockist gets a photo in #wins. Top opener each month picks the Friday flavour.",
            },
          ].map((c) => (
            <div key={c.k} className="bg-[#AFFF00] text-[#121212] p-6">
              <h3 className="font-black text-lg">{c.k}</h3>
              <p className="font-mono text-xs mt-2 leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-14">
          <h2 className="text-2xl font-black text-white tracking-tight mb-6">MEET THE CREW</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#AFFF00] text-[#121212] flex items-center justify-center font-black text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-white/40 font-mono text-xs">{t.role}</p>
                  </div>
                </div>
                <p className="text-white/60 font-mono text-sm leading-relaxed">“{t.quote}”</p>
              </div>
            ))}
          </div>
          <p className="text-white/30 font-mono text-xs mt-3">Real teammates, real quotes. No stock photos — we’ll add faces when the crew says yes.</p>
        </div>

        {/* OPEN ROLES */}
        <div id="open-roles" className="scroll-mt-24 mb-14">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">OPEN ROLES</h2>
              <p className="text-white/40 font-mono text-xs mt-1">
                {filtered.length} position{filtered.length !== 1 ? "s" : ""} • Updated {formatPosted(ROLES[0].postedAt)} • <span className="text-[#AFFF00]">All roles include salary band</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-white/30 font-mono text-xs">
              <Eye className="w-3.5 h-3.5" /> Avg. time to apply 2m 40s
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/5 border border-white/10 p-4 mb-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDept(d)}
                  className={`px-3 py-1.5 font-mono text-xs font-bold border cursor-pointer transition-colors ${
                    dept === d ? "bg-[#AFFF00] text-[#121212] border-[#AFFF00]" : "bg-white/5 text-white/60 border-white/10 hover:border-[#AFFF00]/30 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search roles, skills, location..." className="w-full bg-[#121212] border border-white/10 pl-9 pr-3 py-2 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]" />
            </div>
          </div>

          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="bg-white/5 border border-white/10 p-10 text-center">
                <p className="text-white font-bold">No roles match that filter</p>
                <p className="text-white/40 font-mono text-sm mt-1">Try “All” or clear search — or join the talent pool below.</p>
                <button onClick={() => { setDept("All"); setQ("") }} className="mt-4 text-[#AFFF00] font-mono text-sm hover:underline cursor-pointer">Clear filters</button>
              </div>
            ) : (
              filtered.map((role, i) => (
                <motion.div
                  key={role.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className={`bg-white/5 border ${activeRole === role.slug ? "border-[#AFFF00]/40" : "border-white/10 hover:border-[#AFFF00]/25"} transition-colors overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="bg-[#AFFF00] text-[#121212] font-mono text-[11px] font-black px-2 py-1">{role.department}</span>
                          <span className="text-white/30 font-mono text-xs">{formatPosted(role.postedAt)} • {role.workModel}</span>
                          {activeRole === role.slug && <span className="text-[#AFFF00] font-mono text-xs">● Expanded</span>}
                        </div>
                        <Link href={`/careers/${role.slug}`} className="group/title">
                          <h3 className="text-lg md:text-xl font-black text-white group-hover/title:text-[#AFFF00] transition-colors">{role.title}</h3>
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-white/40 font-mono text-xs">
                          <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{role.type}</span>
                          <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{role.location}</span>
                          <span className="inline-flex items-center gap-1 text-[#AFFF00]"><TrendingUp className="w-3.5 h-3.5" />{role.salary}</span>
                        </div>
                        <p className="text-white/55 font-mono text-sm mt-3 leading-relaxed">{role.blurb}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {role.perks.slice(0, 3).map((p) => (
                            <span key={p} className="bg-white/5 border border-white/10 text-white/50 font-mono text-[11px] px-2 py-1">{p}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                        <Link
                          href={`/careers/${role.slug}`}
                          className="bg-white text-[#121212] px-4 py-2.5 font-black text-xs inline-flex items-center justify-center gap-1 hover:bg-white/90 transition-colors"
                        >
                          View details
                        </Link>
                        <a
                          href={`#apply-${role.slug}`}
                          onClick={(e) => {
                            e.preventDefault()
                            setActiveRole(role.slug)
                            document.getElementById(`apply-${role.slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
                          }}
                          className="bg-[#AFFF00] text-[#121212] px-4 py-2.5 font-black text-xs inline-flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
                        >
                          Quick apply
                        </a>
                        <button
                          onClick={() => share(role.slug, role.title)}
                          className="w-10 h-10 lg:w-auto lg:px-3 lg:py-2 bg-white/5 border border-white/10 text-white/60 hover:text-[#AFFF00] hover:border-[#AFFF00]/30 font-mono text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          aria-label={`Share ${role.title}`}
                          title="Copy link"
                        >
                          <Share2 className="w-4 h-4" /> <span className="hidden lg:inline">Share</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setActiveRole(activeRole === role.slug ? null : role.slug)}
                        className="text-[#AFFF00] font-mono text-xs hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {activeRole === role.slug ? "Hide details" : "Show responsibilities & requirements"} <ArrowRight className={`w-3 h-3 transition-transform ${activeRole === role.slug ? "rotate-90" : "-rotate-45"}`} />
                      </button>
                      <span className="text-white/20 font-mono text-xs">•</span>
                      <Link href={`/careers/${role.slug}`} className="text-white/40 hover:text-white font-mono text-xs">
                        Full page & JSON-LD →
                      </Link>
                    </div>

                    <AnimatePresence>
                      {activeRole === role.slug && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/10">
                            <div>
                              <h4 className="text-white font-bold text-sm flex items-center gap-2"><Rocket className="w-4 h-4 text-[#AFFF00]" /> What you&apos;ll own</h4>
                              <ul className="mt-3 space-y-2">
                                {role.responsibilities.slice(0, 5).map((r) => (
                                  <li key={r} className="flex gap-2 text-white/55 font-mono text-xs leading-relaxed">
                                    <span className="text-[#AFFF00] mt-1">—</span> {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#AFFF00]" /> Must-haves (3–5)</h4>
                              <ul className="mt-3 space-y-2">
                                {role.requirements.map((r) => (
                                  <li key={r} className="flex gap-2 text-white/55 font-mono text-xs leading-relaxed">
                                    <span className="text-[#AFFF00] mt-1">•</span> {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-sm">Nice to have</h4>
                              <ul className="mt-3 space-y-2">
                                {role.niceToHave.map((r) => (
                                  <li key={r} className="flex gap-2 text-white/40 font-mono text-xs leading-relaxed">
                                    <span className="text-white/20 mt-1">•</span> {r}
                                  </li>
                                ))}
                              </ul>
                              <div id={`apply-${role.slug}`} className="scroll-mt-28" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          <p className="text-white/30 font-mono text-xs mt-4">
            Don&apos;t see your fit?{" "}
            <a href="#apply" className="text-[#AFFF00] hover:underline">
              Send a general application
            </a>{" "}
            — we keep great people on file and reach out first.
          </p>
        </div>

        {/* Hiring process */}
        <div className="mb-14 bg-white/5 border border-white/10 p-6 md:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">HOW WE HIRE</h2>
            <span className="font-mono text-[#AFFF00] text-xs border border-[#AFFF00]/20 bg-[#AFFF00]/5 px-2 py-1">Total loop 1–2 weeks • No ghosting</span>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {HIRING_STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="font-mono text-[#AFFF00]/30 text-4xl font-black">{s.n}</div>
                <h3 className="text-white font-bold text-sm mt-1">{s.title}</h3>
                <p className="text-white/50 font-mono text-xs mt-2 leading-relaxed">{s.desc}</p>
                <span className="inline-block mt-3 bg-[#121212] border border-white/10 text-white/40 font-mono text-[11px] px-2 py-1">{s.time}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-white/30 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5"><Check className="w-3 h-3 text-[#AFFF00]" /> No take-home essays longer than 60 min</span>
            <span className="inline-flex items-center gap-1.5"><Check className="w-3 h-3 text-[#AFFF00]" /> References only at offer stage</span>
            <span className="inline-flex items-center gap-1.5"><Check className="w-3 h-3 text-[#AFFF00]" /> Feedback if you ask</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-14 max-w-3xl">
          <h2 className="text-2xl font-black text-white tracking-tight mb-6">FAQ</h2>
          <Accordion type="single" collapsible className="bg-white/5 border border-white/10 px-6">
            {FAQS.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-white/10">
                <AccordionTrigger className="text-white font-bold text-sm text-left hover:text-[#AFFF00] data-[state=open]:text-[#AFFF00]">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-white/55 font-mono text-sm leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Talent pool */}
        <div id="talent-pool" className="scroll-mt-24 mb-14 bg-[#AFFF00] text-[#121212] p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight">NOT READY TO APPLY?</h2>
              <p className="font-mono text-sm mt-2 max-w-xl leading-relaxed">
                Join the talent pool — we&apos;ll ping you when a role matching your interests opens. Re-engaged candidates are hired ~2× faster.
              </p>
            </div>
            <span className="bg-[#121212] text-[#AFFF00] font-mono text-xs font-bold px-3 py-1.5">85% of visitors leave without applying — don&apos;t disappear</span>
          </div>
          <div className="bg-[#121212] p-6 border border-black/10">
            <TalentPoolForm />
          </div>
        </div>

        {/* APPLY */}
        <motion.div
          id="apply"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 border border-white/10 p-6 md:p-8 max-w-4xl mx-auto scroll-mt-24"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Apply in 5 minutes</h2>
              <p className="text-white/60 font-mono text-sm mt-2 max-w-xl">Pick a role, add a short note + optional resume/portfolio. No account, no re-typing your CV.</p>
            </div>
            <span className="font-mono text-white/30 text-xs border border-white/10 px-2 py-1">Encrypted • GDPR-aligned • Auto-ack email</span>
          </div>
          <CareerApplicationForm />
          <p className="text-white/20 font-mono text-[11px] mt-6 text-center">
            Alternative: email your CV to <a href="mailto:careers@gigi.energy" className="text-[#AFFF00] hover:underline">careers@gigi.energy</a> with the role in the subject. You&apos;ll still be tracked — but the form is faster.
          </p>
        </motion.div>

        {/* Final trust */}
        <div className="max-w-4xl mx-auto mt-8 grid md:grid-cols-3 gap-3">
          {[
            { t: "Equal opportunity", d: "We hire for energy and skill. Nairobi is our HQ — all backgrounds welcome." },
            { t: "Your data", d: "We keep applications 12 months max. Ask to delete anytime: privacy@gigi.energy" },
            { t: "Need help?", d: "WhatsApp +254 7... or careers@gigi.energy — checked daily by a human." },
          ].map((x) => (
            <div key={x.t} className="bg-white/5 border border-white/10 p-4">
              <p className="text-white font-bold text-xs">{x.t}</p>
              <p className="text-white/40 font-mono text-xs mt-1 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

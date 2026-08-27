"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { ClientOnly } from "@/components/client-only"
import { SITE_URL } from "@/lib/site"
import { MOCK_EVENTS, type GiGiEvent, AREAS, googleCalendarUrl } from "@/lib/events-data"
import {
  ArrowLeft,
  ArrowRight,
  Wine,
  Dumbbell,
  Building2,
  CalendarCheck,
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  Grid3X3,
  List,
  Map,
  Bookmark,
  BookmarkCheck,
  Share2,
  Star,
  Zap,
  Eye,
  Check,
  X,
  Thermometer,
  Megaphone,
  PartyPopper,
  Sparkles,
  ChevronDown,
  CalendarPlus,
  Timer,
  Award,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// --- Config ---

const categories = [
  { value: "all", label: "All", icon: Sparkles, href: "/events", color: "#AFFF00" },
  { value: "tasting", label: "Tastings", icon: Wine, href: "/events/tasting", color: "#AFFF00" },
  { value: "gym", label: "Gyms", icon: Dumbbell, href: "/events/gyms", color: "#84cc16" },
  { value: "corporate", label: "Corporate", icon: Building2, href: "/events/corporate", color: "#f59e0b" },
  { value: "organizer", label: "Organizers", icon: CalendarCheck, href: "/events/organizers", color: "#a855f7" },
] as const

const dateFilters = [
  { value: "all", label: "Any date" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
] as const

const faqs = [
  {
    q: "Are tasting events really free?",
    a: "Yes — 100% free. Walk in, sample all 10 flavours, get 25% off your first shop order. No catch, no spam. We just want you to taste Kenya’s energy drink.",
  },
  {
    q: "Do I need to register or can I walk in?",
    a: "Walk-ins welcome, but registering saves your spot and gets you a fast-track QR. Capacities are real — CBD pop-ups fill up by 2pm. Register in 30 seconds.",
  },
  {
    q: "Can I bring friends or team?",
    a: "Absolutely. Tastings are social — bring friends. Corporate groups: use the Corporate page for bulk fridge drops. Gym partners: show your membership for extra samples.",
  },
  {
    q: "What about gym and corporate events?",
    a: "Gyms: Find your area (Westlands, Kilimani, Lavington, Karen) — partner gyms have GiGi fridges daily. Corporate: We deliver to offices for team perks — monthly subscription, 48h SLA.",
  },
  {
    q: "How do I get my event sponsored?",
    a: "Use Event Organizers → apply as partner. We sponsor 5–10 events/month with coolers, sampling crew, and social promo. Tell us attendance, date, location.",
  },
  {
    q: "Can I add events to my calendar?",
    a: "Yes — every card has Add to Google Calendar. After registering you’ll also get email + SMS reminder 24h before.",
  },
]

function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  useEffect(() => {
    try {
      const raw = localStorage.getItem("gigi-event-bookmarks")
      if (raw) setBookmarks(new Set(JSON.parse(raw)))
    } catch {}
  }, [])
  const toggle = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem("gigi-event-bookmarks", JSON.stringify([...next]))
      return next
    })
  }
  return { bookmarks, toggle }
}

function EventsContent() {
  const convexEvents = useQuery(api.events.getAll)
  const registerMutation = useMutation(api.events.register)
  const { bookmarks, toggle: toggleBookmark } = useBookmarks()

  const [q, setQ] = useState("")
  const [cat, setCat] = useState<(typeof categories)[number]["value"]>("all")
  const [area, setArea] = useState<(typeof AREAS)[number]>("All Areas")
  const [dateFilter, setDateFilter] = useState<(typeof dateFilters)[number]["value"]>("all")
  const [view, setView] = useState<"grid" | "list" | "map">("grid")
  const [sort, setSort] = useState<"soonest" | "popular">("soonest")
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set())
  const [activeModal, setActiveModal] = useState<GiGiEvent | null>(null)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Merge: prefer convex if has data, else mock
  const allEvents: GiGiEvent[] = useMemo(() => {
    if (convexEvents && convexEvents.length > 0) {
      return convexEvents.map((e: any) => ({
        _id: e._id,
        title: e.title,
        description: e.description,
        date: e.date,
        time: e.time,
        location: e.location,
        area: (e.location.split(",").pop()?.trim() ?? "CBD") as GiGiEvent["area"],
        category: e.category,
        status: e.status,
        capacity: e.capacity,
        registered: e.registered,
        image: e.image ?? "/images/flavours/lemon-lime.png",
        price: e.status === "completed" ? "Past" : "Free",
      }))
    }
    return MOCK_EVENTS
  }, [convexEvents])

  const filtered = useMemo(() => {
    let out = [...allEvents]
    if (cat !== "all") out = out.filter((e) => e.category === cat)
    if (area !== "All Areas") out = out.filter((e) => e.area === area || e.location.includes(area))
    if (q) {
      const qq = q.toLowerCase()
      out = out.filter((e) => `${e.title} ${e.description} ${e.location}`.toLowerCase().includes(qq))
    }
    if (dateFilter === "upcoming") out = out.filter((e) => e.status === "upcoming" || e.status === "ongoing")
    if (dateFilter === "past") out = out.filter((e) => e.status === "completed")
    if (dateFilter === "week") {
      const now = new Date()
      const week = new Date(now.getTime() + 7 * 86400000)
      out = out.filter((e) => {
        const d = new Date(e.date)
        return d >= now && d <= week
      })
    }
    if (dateFilter === "month") {
      const now = new Date()
      const month = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      out = out.filter((e) => {
        const d = new Date(e.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    }
    if (showBookmarkedOnly) out = out.filter((e) => bookmarks.has(e._id))
    if (sort === "soonest") out.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    if (sort === "popular") out.sort((a, b) => b.registered - a.registered)
    return out
  }, [allEvents, cat, area, q, dateFilter, showBookmarkedOnly, sort, bookmarks])

  const featured = useMemo(() => filtered.find((e) => e.featured && e.status === "upcoming") ?? filtered.find((e) => e.status === "upcoming"), [filtered])
  const upcoming = filtered.filter((e) => e.status === "upcoming" || e.status === "ongoing")
  const past = filtered.filter((e) => e.status === "completed")

  const share = async (ev: GiGiEvent) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : SITE_URL}/events#${ev._id}`
    const text = `${ev.title} — ${ev.date} at ${ev.location}`
    if (navigator.share) {
      try {
        await navigator.share({ title: ev.title, text, url })
        return
      } catch {}
    }
    await navigator.clipboard.writeText(url)
    toast.success("Link copied")
  }

  const handleRegister = async (ev: GiGiEvent) => {
    if (isSubmitting) return
    if (!formName.trim() || !formEmail.trim()) {
      toast.error("Name and email required")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail.trim())) {
      toast.error("Valid email required")
      return
    }
    setIsSubmitting(true)
    try {
      // If mock id, simulate; if convex id, call mutation
      if (ev._id.startsWith("evt_")) {
        await new Promise((r) => setTimeout(r, 600))
      } else {
        await registerMutation({ eventId: ev._id as any, name: formName.trim(), email: formEmail.trim().toLowerCase(), phone: formPhone.trim() || undefined })
      }
      setRegisteredIds((s) => new Set(s).add(ev._id))
      toast.success("You're in! QR + reminder coming via email.")
      setActiveModal(null)
      setFormName("")
      setFormEmail("")
      setFormPhone("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    name: "GiGi Energy Activations",
    url: `${SITE_URL}/events`,
    description: "Free tastings, gym activations, corporate drops and organizer collabs across Nairobi, Kenya.",
    organizer: { "@type": "Organization", name: "GiGi Energy", url: SITE_URL },
    event: filtered.slice(0, 5).map((e) => ({
      "@type": "Event",
      name: e.title,
      startDate: e.date,
      location: { "@type": "Place", name: e.location, address: e.location },
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: e.status === "upcoming" ? "https://schema.org/EventScheduled" : "https://schema.org/EventCancelled",
      offers: { "@type": "Offer", price: e.price === "Free" ? "0" : e.price, priceCurrency: "KES", availability: "https://schema.org/InStock" },
    })),
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur border-t border-white/10 p-3 flex items-center justify-between md:hidden">
        <span className="text-white font-mono text-xs">{upcoming.length} upcoming • Free tastings</span>
        <a href="#upcoming" className="bg-[#AFFF00] text-[#121212] px-5 py-2 font-black text-sm">
          Browse
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
        <div className="grid lg:grid-cols-12 gap-8 mb-8 items-start">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 bg-[#AFFF00] text-[#121212] px-3 py-1 font-mono text-xs font-bold tracking-widest">
              <span className="w-2 h-2 bg-[#121212] animate-pulse" /> ACTIVATIONS — Nairobi, Kenya
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-4 leading-[0.9]">
              EXPERIENCE <span className="text-[#AFFF00]">GIGI</span>
            </h1>
            <p className="text-white/60 font-mono text-sm mt-4 max-w-xl leading-relaxed">
              Free tastings, gym takeovers, corporate drops and festival collabs. Zero sugar, 10 flavours, 100% Nairobi-made. Walk in or register in 30s.
            </p>
            <div className="mt-6 relative max-w-xl">
              <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tastings, gyms, area, flavour..."
                className="w-full bg-white/[0.06] border border-white/10 pl-10 pr-4 py-3.5 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
              />
              {q && (
                <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                "Free tastings weekly",
                "No ticket needed",
                "QR fast-track",
                "25% off first order",
              ].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-[#AFFF00] border border-[#AFFF00]/20 bg-[#AFFF00]/5 px-2.5 py-1 font-mono text-[11px]">
                  <Check className="w-3 h-3" /> {t}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="lg:col-span-5">
            <div className="bg-white/[0.04] border border-white/10 p-5">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#0e0e0e] border border-white/5">
                <Image src="/images/flavours/pineapple-coconut.png" alt="GiGi event" width={600} height={600} className="object-contain p-6" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 bg-[#121212]/90 border border-white/10 p-3 flex items-center justify-between backdrop-blur">
                  <span className="text-white font-mono text-xs flex items-center gap-2"><CalendarDays className="w-3 h-3 text-[#AFFF00]" /> Weekly across Nairobi</span>
                  <span className="bg-[#AFFF00] text-[#121212] font-black text-xs px-2 py-1">{allEvents.length} events</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                {[
                  { k: String(upcoming.length), l: "Upcoming" },
                  { k: String(allEvents.filter((e) => e.category === "tasting").length), l: "Tastings" },
                  { k: "4.9", l: "Avg rating" },
                ].map((s) => (
                  <div key={s.l} className="bg-[#121212] border border-white/5 p-3">
                    <p className="text-xl font-black text-[#AFFF00]">{s.k}</p>
                    <p className="text-white/40 font-mono text-[11px] mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-[11px] font-mono">
                <div className="flex items-center gap-2 text-white/60">
                  <Timer className="w-3.5 h-3.5 text-[#AFFF00]" /> Next tasting in ~2 days — CBD City Market
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Award className="w-3.5 h-3.5 text-[#AFFF00]" /> 2,400+ tasters in August
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category cards (keep original navigation but upgraded) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {categories.slice(1).map((cat, i) => (
            <Link key={cat.value} href={cat.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group relative bg-white/5 border border-white/10 p-6 hover:border-[#AFFF00]/30 transition-colors h-full overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: `radial-gradient(circle at center, ${cat.color} 0%, transparent 70%)` }} />
                <cat.icon className="w-8 h-8 mb-3" style={{ color: cat.color }} />
                <h3 className="text-white font-bold">{cat.label}</h3>
                <p className="text-white/40 font-mono text-xs mt-1">
                  {cat.value === "tasting" && "Free samples across Nairobi"}
                  {cat.value === "gym" && "Partner studios & gyms"}
                  {cat.value === "corporate" && "Office fridge drops"}
                  {cat.value === "organizer" && "Sponsor your event"}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs" style={{ color: cat.color }}>
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Filter bar — best practice: search + pills + dropdowns + view toggle */}
        <div className="bg-white/5 border border-white/10 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCat(c.value as any)}
                  className={`px-3 py-1.5 font-mono text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                    cat === c.value ? "bg-[#AFFF00] text-[#121212] border-[#AFFF00]" : "bg-[#121212] text-white/60 border-white/10 hover:border-[#AFFF00]/30 hover:text-white"
                  }`}
                >
                  <c.icon className="w-3 h-3" /> {c.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as any)}
                  className="bg-[#121212] border border-white/10 text-white font-mono text-xs pl-3 pr-8 py-2 focus:outline-none focus:border-[#AFFF00] appearance-none"
                >
                  {AREAS.map((a) => (
                    <option key={a} value={a} className="bg-[#121212]">
                      {a}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-white/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="bg-[#121212] border border-white/10 text-white font-mono text-xs pl-3 pr-8 py-2 focus:outline-none focus:border-[#AFFF00] appearance-none"
                >
                  {dateFilters.map((d) => (
                    <option key={d.value} value={d.value} className="bg-[#121212]">
                      {d.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-white/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="bg-[#121212] border border-white/10 text-white font-mono text-xs pl-3 pr-8 py-2 focus:outline-none focus:border-[#AFFF00] appearance-none"
                >
                  <option value="soonest" className="bg-[#121212]">
                    Soonest first
                  </option>
                  <option value="popular" className="bg-[#121212]">
                    Most popular
                  </option>
                </select>
                <ChevronDown className="w-3 h-3 text-white/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="flex items-center gap-1 bg-[#121212] border border-white/10 p-1">
                <button onClick={() => setView("grid")} className={`p-1.5 ${view === "grid" ? "bg-[#AFFF00] text-[#121212]" : "text-white/40 hover:text-white"}`}>
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button onClick={() => setView("list")} className={`p-1.5 ${view === "list" ? "bg-[#AFFF00] text-[#121212]" : "text-white/40 hover:text-white"}`}>
                  <List className="w-4 h-4" />
                </button>
                <button onClick={() => setView("map")} className={`p-1.5 ${view === "map" ? "bg-[#AFFF00] text-[#121212]" : "text-white/40 hover:text-white"}`}>
                  <Map className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
            <span className="text-white/30 font-mono text-xs">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} • {bookmarks.size} saved
            </span>
            <button
              onClick={() => setShowBookmarkedOnly((v) => !v)}
              className={`ml-2 inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 border ${showBookmarkedOnly ? "bg-[#AFFF00] text-[#121212] border-[#AFFF00]" : "bg-white/5 text-white/60 border-white/10 hover:border-[#AFFF00]/30"}`}
            >
              <BookmarkCheck className="w-3 h-3" /> Saved only
            </button>
            {(q || cat !== "all" || area !== "All Areas" || dateFilter !== "all" || showBookmarkedOnly) && (
              <button
                onClick={() => {
                  setQ("")
                  setCat("all")
                  setArea("All Areas")
                  setDateFilter("all")
                  setShowBookmarkedOnly(false)
                }}
                className="text-[#AFFF00] font-mono text-xs hover:underline"
              >
                Clear filters
              </button>
            )}
            <span className="ml-auto text-white/20 font-mono text-[11px] hidden md:inline">Tip: bookmark events, add to calendar, share with crew</span>
          </div>
        </div>

        {/* Featured */}
        {featured && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 bg-[#AFFF00] text-[#121212] p-1">
            <div className="bg-[#121212] grid md:grid-cols-12 gap-0">
              <div className="md:col-span-5 relative aspect-[4/3] md:aspect-square bg-[#0e0e0e] overflow-hidden">
                <Image src={featured.image} alt={featured.title} fill className="object-contain p-8" />
                <span className="absolute top-3 left-3 bg-[#AFFF00] text-[#121212] font-black text-xs px-2 py-1">FEATURED • {featured.category.toUpperCase()}</span>
                <span className="absolute top-3 right-3 bg-white/90 text-[#121212] font-mono text-xs px-2 py-1">{featured.price}</span>
              </div>
              <div className="md:col-span-7 p-6 flex flex-col">
                <span className="text-[#AFFF00] font-mono text-xs tracking-widest">{featured.area} • {featured.status.toUpperCase()}</span>
                <h3 className="text-2xl md:text-3xl font-black text-white mt-2 leading-tight">{featured.title}</h3>
                <p className="text-white/60 font-mono text-sm mt-3 leading-relaxed">{featured.description}</p>
                <div className="mt-4 space-y-2 font-mono text-xs text-white/50">
                  <p className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[#AFFF00]" /> {featured.date} • {featured.time}</p>
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#AFFF00]" /> {featured.location}</p>
                  <p className="flex items-center gap-2"><Users className="w-4 h-4 text-[#AFFF00]" /> {featured.registered}/{featured.capacity} registered • {featured.capacity - featured.registered} spots left</p>
                </div>
                <div className="w-full bg-white/10 h-1.5 mt-4">
                  <div className="bg-[#AFFF00] h-1.5" style={{ width: `${Math.min(100, (featured.registered / featured.capacity) * 100)}%` }} />
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveModal(featured)}
                    className="bg-[#AFFF00] text-[#121212] px-5 py-3 font-black text-sm inline-flex items-center gap-2 hover:opacity-90"
                  >
                    Register free <ArrowRight className="w-4 h-4" />
                  </button>
                  <a href={googleCalendarUrl(featured)} target="_blank" className="border border-white/10 text-white px-4 py-3 font-bold text-sm inline-flex items-center gap-2 hover:border-[#AFFF00]/50">
                    <CalendarPlus className="w-4 h-4" /> Add to calendar
                  </a>
                  <button onClick={() => share(featured)} className="border border-white/10 text-white/60 px-3 py-3 hover:text-white hover:border-white/20">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Events grid / list / map */}
        <div id="upcoming" className="scroll-mt-24 mb-10">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {dateFilter === "past" ? "PAST" : "UPCOMING"} <span className="text-[#AFFF00]">EVENTS</span> <span className="text-white/20 font-mono text-sm ml-2">{filtered.length} total</span>
            </h2>
            <span className="font-mono text-white/30 text-xs hidden md:inline">Grid • List • Map — try Map for Nairobi</span>
          </div>

          {view === "map" ? (
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-auto pr-2">
                {filtered.map((ev) => (
                  <div key={ev._id} className="bg-white/5 border border-white/10 p-4 flex gap-4 hover:border-[#AFFF00]/30">
                    <Image src={ev.image} alt={ev.title} width={80} height={80} className="object-contain bg-[#121212] p-2 border border-white/5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm leading-tight truncate">{ev.title}</p>
                      <p className="text-white/40 font-mono text-xs flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {ev.location}</p>
                      <p className="text-[#AFFF00] font-mono text-xs mt-1">{ev.date} • {ev.time}</p>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <p className="text-white/40 font-mono text-sm text-center py-10">No events for these filters.</p>}
              </div>
              <div className="lg:col-span-7 bg-white/5 border border-white/10 p-4">
                <div className="aspect-[16/10] bg-[#0e0e0e] border border-white/5 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 40%, #AFFF00 0%, transparent 60%)" }} />
                  <div className="text-center">
                    <MapPin className="w-10 h-10 text-[#AFFF00] mx-auto mb-3" />
                    <p className="text-white font-bold">Nairobi Activation Map</p>
                    <p className="text-white/40 font-mono text-xs mt-1">CBD • Westlands • Kilimani • Lavington • Karen • Eastlands</p>
                    <p className="text-white/20 font-mono text-[11px] mt-3">Interactive map with pins — plug Mapbox/Google Maps here. List → map sync on hover.</p>
                  </div>
                  {/* Fake pins */}
                  {filtered.slice(0, 5).map((ev, i) => (
                    <div key={ev._id} className="absolute w-3 h-3 bg-[#AFFF00] border-2 border-[#121212] rounded-full animate-pulse" style={{ left: `${18 + i * 14}%`, top: `${28 + (i % 2) * 22}%` }} />
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
                  {AREAS.slice(1).map((a) => {
                    const count = allEvents.filter((e) => e.area === a).length
                    return (
                      <div key={a} className="bg-[#121212] border border-white/5 p-2 flex justify-between">
                        <span className="text-white/60">{a}</span>
                        <span className="text-[#AFFF00]">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className={view === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
              {filtered.map((ev, i) => {
                const full = ev.registered >= ev.capacity
                const isRegistered = registeredIds.has(ev._id)
                const isBookmarked = bookmarks.has(ev._id)
                const pct = Math.min(100, Math.round((ev.registered / ev.capacity) * 100))
                return (
                  <motion.div
                    key={ev._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className={`group bg-white/5 border ${ev.status === "ongoing" ? "border-[#AFFF00]/40" : "border-white/10 hover:border-[#AFFF00]/30"} overflow-hidden transition-all duration-300 ${view === "list" ? "flex gap-0 p-0" : "p-0 flex flex-col"}`}
                    id={ev._id}
                  >
                    {view === "grid" ? (
                      <>
                        <div className="relative aspect-[16/10] bg-[#0e0e0e] overflow-hidden">
                          <Image src={ev.image} alt={ev.title} fill className="object-contain p-6 group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase bg-[#121212] border border-white/10 text-white px-2 py-1">{ev.category}</span>
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-1 ${ev.status === "upcoming" ? "bg-[#AFFF00] text-[#121212]" : ev.status === "ongoing" ? "bg-orange-400 text-[#121212]" : "bg-white/10 text-white/60"}`}>{ev.status}</span>
                          </div>
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button onClick={() => toggleBookmark(ev._id)} className={`w-8 h-8 flex items-center justify-center ${isBookmarked ? "bg-[#AFFF00] text-[#121212]" : "bg-[#121212]/80 text-white/60 hover:text-[#AFFF00]"}`}>
                              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            </button>
                            <button onClick={() => share(ev)} className="w-8 h-8 bg-[#121212]/80 text-white/60 hover:text-white flex items-center justify-center">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-[#121212]/90 border-t border-white/10 p-2 flex items-center justify-between backdrop-blur">
                            <span className="text-white font-mono text-xs flex items-center gap-1"><Eye className="w-3 h-3 text-[#AFFF00]" /> {ev.registered} going</span>
                            <span className={`font-mono text-xs px-2 py-1 ${ev.price === "Free" ? "bg-[#AFFF00] text-[#121212] font-black" : "bg-white/10 text-white/60"}`}>{ev.price}</span>
                          </div>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="text-white font-bold leading-snug line-clamp-2">{ev.title}</h3>
                          <p className="text-white/50 font-mono text-xs mt-2 line-clamp-2 leading-relaxed">{ev.description}</p>
                          <div className="space-y-1.5 mt-4 text-white/40 font-mono text-xs">
                            <p className="flex items-center gap-2"><CalendarDays className="w-3 h-3 text-[#AFFF00]" /> {ev.date} • {ev.time}</p>
                            <p className="flex items-center gap-2"><MapPin className="w-3 h-3 text-[#AFFF00]" /> {ev.location}</p>
                            <p className="flex items-center gap-2"><Users className="w-3 h-3" /> {ev.registered}/{ev.capacity} • {ev.capacity - ev.registered} left</p>
                          </div>
                          <div className="w-full bg-[#121212] h-1.5 mt-4">
                            <div className="bg-[#AFFF00] h-1.5" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="mt-4 flex gap-2">
                            {isRegistered ? (
                              <div className="flex-1 bg-[#AFFF00]/10 text-[#AFFF00] font-mono text-xs text-center py-2.5 border border-[#AFFF00]/20">✓ Registered</div>
                            ) : full ? (
                              <div className="flex-1 bg-white/5 text-white/40 font-mono text-xs text-center py-2.5">Fully booked</div>
                            ) : (
                              <button onClick={() => setActiveModal(ev)} className="flex-1 bg-[#AFFF00] text-[#121212] font-black text-xs py-2.5 hover:opacity-90">Register free</button>
                            )}
                            <a href={googleCalendarUrl(ev)} target="_blank" className="px-3 py-2.5 bg-white/5 border border-white/10 text-white/60 hover:text-[#AFFF00] hover:border-[#AFFF00]/30 flex items-center justify-center">
                              <CalendarPlus className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex gap-4 p-4 w-full">
                        <Image src={ev.image} alt={ev.title} width={96} height={96} className="object-contain bg-[#121212] p-2 border border-white/5 w-24 h-24 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono bg-white/5 border border-white/10 text-white/50 px-1.5 py-1 uppercase">{ev.category}</span>
                            <span className={`w-2 h-2 rounded-full ${ev.status === "upcoming" ? "bg-[#AFFF00]" : ev.status === "ongoing" ? "bg-orange-400" : "bg-white/20"}`} />
                            <span className="text-white/30 font-mono text-xs">{ev.date}</span>
                          </div>
                          <h3 className="text-white font-bold text-sm mt-1 truncate">{ev.title}</h3>
                          <p className="text-white/40 font-mono text-xs flex items-center gap-2 mt-1"><MapPin className="w-3 h-3" /> {ev.location} • {ev.time}</p>
                          <div className="mt-2 flex items-center gap-2">
                            {isRegistered ? <span className="text-[#AFFF00] font-mono text-xs">✓ Registered</span> : full ? <span className="text-white/30 font-mono text-xs">Full</span> : <button onClick={() => setActiveModal(ev)} className="text-[#AFFF00] font-mono text-xs hover:underline">Register →</button>}
                            <button onClick={() => toggleBookmark(ev._id)} className="ml-auto text-white/30 hover:text-[#AFFF00]"><Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-[#AFFF00] text-[#AFFF00]" : ""}`} /></button>
                            <button onClick={() => share(ev)} className="text-white/30 hover:text-white"><Share2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="bg-white/5 border border-dashed border-white/10 p-10 text-center">
              <Search className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-white font-bold">No events match</p>
              <p className="text-white/40 font-mono text-sm mt-1">Try clearing filters or search for &quot;Nairobi&quot;.</p>
              <button
                onClick={() => {
                  setQ("")
                  setCat("all")
                  setArea("All Areas")
                  setDateFilter("all")
                  setShowBookmarkedOnly(false)
                }}
                className="mt-4 text-[#AFFF00] font-mono text-sm hover:underline"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>

        {/* Past gallery */}
        {past.length > 0 && dateFilter !== "upcoming" && (
          <div className="mb-14">
            <h2 className="text-2xl font-black text-white tracking-tight mb-6">PAST <span className="text-white/30">HIGHLIGHTS</span></h2>
            <div className="grid md:grid-cols-3 gap-4 opacity-60 hover:opacity-100 transition-opacity">
              {past.slice(0, 3).map((ev) => (
                <div key={ev._id} className="bg-white/5 border border-white/10 p-5">
                  <span className="text-[10px] font-mono bg-white/5 border border-white/10 text-white/40 px-2 py-1 uppercase">Completed • {ev.registered} attended</span>
                  <h3 className="text-white font-bold mt-3">{ev.title}</h3>
                  <p className="text-white/30 font-mono text-xs mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.location}</p>
                  <p className="text-white/40 font-mono text-xs mt-2 line-clamp-2">{ev.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Host CTA */}
        <div className="grid lg:grid-cols-12 gap-6 mb-14">
          <div className="lg:col-span-8 bg-[#AFFF00] p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-black text-[#121212] tracking-tight">HOST A TASTING? SPONSOR YOUR EVENT?</h2>
            <p className="text-[#121212]/70 font-mono text-sm mt-3 max-w-xl">We bring coolers, crew and cans. You bring people. 5–10 events/month — tell us date, location, attendance.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/events/organizers" className="bg-[#121212] text-[#AFFF00] px-6 py-3 font-black text-sm inline-flex items-center gap-2">
                Apply as organizer <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/events/corporate" className="bg-white text-[#121212] px-6 py-3 font-bold text-sm">
                Corporate drop
              </Link>
            </div>
          </div>
          <div className="lg:col-span-4 bg-white/5 border border-white/10 p-6">
            <h3 className="text-white font-black">BY THE NUMBERS</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#121212] border border-white/5 p-4">
                <p className="text-2xl font-black text-[#AFFF00]">2.4K</p>
                <p className="text-white/40 font-mono text-xs">Tasters / month</p>
              </div>
              <div className="bg-[#121212] border border-white/5 p-4">
                <p className="text-2xl font-black text-[#AFFF00]">12</p>
                <p className="text-white/40 font-mono text-xs">Gym partners</p>
              </div>
              <div className="bg-[#121212] border border-white/5 p-4">
                <p className="text-2xl font-black text-[#AFFF00]">48h</p>
                <p className="text-white/40 font-mono text-xs">Avg reply</p>
              </div>
              <div className="bg-[#121212] border border-white/5 p-4">
                <p className="text-2xl font-black text-[#AFFF00]">4.9★</p>
                <p className="text-white/40 font-mono text-xs">Event rating</p>
              </div>
            </div>
            <p className="text-white/20 font-mono text-[11px] mt-3 text-center">Data from Convex + manual — update weekly.</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mb-14">
          <h2 className="text-2xl font-black text-white tracking-tight mb-6">FAQ — ACTIVATIONS</h2>
          <Accordion type="single" collapsible className="bg-white/5 border border-white/10 px-6">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-white/10">
                <AccordionTrigger className="text-white font-bold text-sm text-left hover:text-[#AFFF00] data-[state=open]:text-[#AFFF00]">{f.q}</AccordionTrigger>
                <AccordionContent className="text-white/60 font-mono text-sm leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Register modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#121212]/90 backdrop-blur flex items-center justify-center p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-[#1a1a1a] border border-white/10 w-full max-w-lg p-6 relative max-h-[90vh] overflow-auto">
              <button onClick={() => setActiveModal(null)} className="absolute top-3 right-3 text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <span className="text-[#AFFF00] font-mono text-xs tracking-widest">{activeModal.category.toUpperCase()} • {activeModal.area}</span>
              <h3 className="text-xl font-black text-white mt-2">{activeModal.title}</h3>
              <p className="text-white/50 font-mono text-sm mt-2">{activeModal.description}</p>
              <div className="mt-4 space-y-1.5 text-white/40 font-mono text-xs">
                <p className="flex items-center gap-2"><CalendarDays className="w-3 h-3 text-[#AFFF00]" /> {activeModal.date} • {activeModal.time}</p>
                <p className="flex items-center gap-2"><MapPin className="w-3 h-3 text-[#AFFF00]" /> {activeModal.location}</p>
                <p className="flex items-center gap-2"><Users className="w-3 h-3" /> {activeModal.registered}/{activeModal.capacity} • {activeModal.capacity - activeModal.registered} left</p>
              </div>
              <div className="mt-6 space-y-3">
                <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Full Name *" className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]" />
                <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="Email *" type="email" className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]" />
                <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="Phone (optional)" className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]" />
                <button onClick={() => handleRegister(activeModal)} disabled={isSubmitting} className="w-full bg-[#AFFF00] text-[#121212] font-black py-3 hover:opacity-90 disabled:opacity-60">
                  {isSubmitting ? "Registering..." : "Confirm free registration"}
                </button>
                <div className="flex gap-2">
                  <a href={googleCalendarUrl(activeModal)} target="_blank" className="flex-1 text-center border border-white/10 text-white/60 font-mono text-xs py-2.5 hover:text-[#AFFF00] hover:border-[#AFFF00]/30">
                    Add to calendar
                  </a>
                  <button onClick={() => share(activeModal)} className="flex-1 border border-white/10 text-white/60 font-mono text-xs py-2.5 hover:text-white">Share</button>
                </div>
                <p className="text-white/20 font-mono text-[11px] text-center">QR sent to email • 25% off code after check-in</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function EventsPage() {
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
      <EventsContent />
    </ClientOnly>
  )
}

"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Wine, Dumbbell, Building2, CalendarCheck, CalendarDays, MapPin, ArrowRight } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ClientOnly } from "@/components/client-only"

const categories = [
  {
    title: "Free Tasting Events",
    description: "Sample GiGi Energy at locations across Nairobi. Meet the team and find your favourite flavour.",
    icon: Wine,
    href: "/events/tasting",
    color: "#AFFF00",
  },
  {
    title: "Gyms & Studios",
    description: "Partnered fitness centres where GiGi fuels your workout. Find a gym near you.",
    icon: Dumbbell,
    href: "/events/gyms",
    color: "#84cc16",
  },
  {
    title: "Corporate Offices",
    description: "Bring GiGi to your workplace. Perfect for office breaks, meetings, and team energy boosts.",
    icon: Building2,
    href: "/events/corporate",
    color: "#f59e0b",
  },
  {
    title: "Event Organizers",
    description: "Partner with GiGi for your next event. Sponsorships, catering, and brand activations.",
    icon: CalendarCheck,
    href: "/events/organizers",
    color: "#a855f7",
  },
]

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <motion.span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">
            ACTIVATIONS
          </motion.span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2">
            EXPERIENCE{" "}
            <span className="text-[#AFFF00]">GIGI</span>
          </h1>
          <p className="text-white/60 font-mono text-sm mt-4 max-w-xl">
            From tasting events to corporate partnerships, bring GiGi into your world. Available across Nairobi, Kenya.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={cat.href}>
                <div
                  className="relative group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 overflow-hidden hover:border-[#AFFF00]/30 transition-all duration-500 h-full"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at center, ${cat.color} 0%, transparent 70%)` }}
                  />
                  <cat.icon className="w-10 h-10 mb-4" style={{ color: cat.color }} />
                  <h3 className="text-2xl font-bold text-white mb-3">{cat.title}</h3>
                  <p className="text-white/60 font-mono text-sm leading-relaxed">{cat.description}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-mono group-hover:gap-3 transition-all" style={{ color: cat.color }}>
                    Learn more
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <UpcomingEvents />
      </div>
    </div>
  )
}

const CATEGORY_HREF: Record<string, string> = {
  tasting: "/events/tasting",
  gym: "/events/gyms",
  corporate: "/events/corporate",
  organizer: "/events/organizers",
}

function UpcomingEvents() {
  return (
    <ClientOnly fallback={null}>
      <UpcomingEventsContent />
    </ClientOnly>
  )
}

function UpcomingEventsContent() {
  const upcoming = useQuery(api.events.getUpcoming)
  const next = upcoming?.slice(0, 3) ?? []

  if (upcoming !== undefined && next.length === 0) return null

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-black text-white tracking-tight mb-6">
        UPCOMING <span className="text-[#AFFF00]">EVENTS</span>
      </h2>
      {upcoming === undefined ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {next.map((event, i) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={CATEGORY_HREF[event.category] ?? "/events/tasting"}>
                <div className="bg-white/5 border border-white/10 p-5 hover:border-[#AFFF00]/40 transition-all duration-300 h-full">
                  <span className="text-[10px] font-mono uppercase text-[#AFFF00] bg-[#AFFF00]/10 px-2 py-1 inline-block">
                    {event.category}
                  </span>
                  <h3 className="text-white font-bold mt-3 leading-snug">{event.title}</h3>
                  <div className="space-y-1.5 mt-3 text-white/40 font-mono text-xs">
                    <p className="flex items-center gap-2"><CalendarDays className="w-3 h-3" />{event.date} · {event.time}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-3 h-3" />{event.location}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          <Link href="/events/tasting" className="flex items-center justify-center gap-2 bg-transparent border border-dashed border-white/20 hover:border-[#AFFF00]/60 text-white/40 hover:text-[#AFFF00] p-5 font-mono text-sm transition-all duration-300">
            See all tasting events
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}

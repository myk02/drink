"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Wine, Dumbbell, Building2, CalendarCheck } from "lucide-react"

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
      </div>
    </div>
  )
}

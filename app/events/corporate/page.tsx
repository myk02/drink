"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Coffee, Zap, Users, TrendingUp } from "lucide-react"
import { InquiryForm } from "@/components/inquiry-form"

const benefits = [
  {
    icon: Zap,
    title: "Boost Productivity",
    description: "Keep your team energized throughout the day with clean, sugar-free energy.",
  },
  {
    icon: Users,
    title: "Team Morale",
    description: "A simple perk that shows you care about your team's energy and well-being.",
  },
  {
    icon: TrendingUp,
    title: "Brand Partnership",
    description: "Feature your company as a GiGi-powered workplace on our social channels.",
  },
  {
    icon: Coffee,
    title: "Office Supply",
    description: "Monthly subscription delivered to your office in Nairobi. Never run out.",
  },
]

export default function CorporatePage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/events" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            All Activations
          </Link>
          <motion.span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">
            CORPORATE OFFICES
          </motion.span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2">
            POWER YOUR{" "}
            <span className="text-[#AFFF00]">WORKPLACE</span>
          </h1>
          <p className="text-white/60 font-mono text-sm mt-4 max-w-xl">
            Bring GiGi Energy to your office. The healthier energy drink for productive teams in Nairobi.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-[#AFFF00]/30 transition-all duration-500"
            >
              <benefit.icon className="w-8 h-8 text-[#AFFF00] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
              <p className="text-white/60 font-mono text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Get a Corporate Quote</h2>
          <p className="text-white/60 font-mono text-sm mb-6">
            Fill in the form below and our team in Nairobi will get back to you within 24 hours.
          </p>
          <InquiryForm
            category="corporate"
            messagePlaceholder="How many employees? Any specific requirements?"
          />
        </motion.div>
      </div>
    </div>
  )
}

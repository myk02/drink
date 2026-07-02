"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, CalendarCheck, Megaphone, Handshake, PartyPopper } from "lucide-react"

const services = [
  {
    icon: PartyPopper,
    title: "Event Sponsorship",
    description: "We sponsor events of all sizes — from campus fests to corporate galas. Get branded coolers, sampling, and social media promotion.",
  },
  {
    icon: Megaphone,
    title: "Brand Activations",
    description: "Set up a GiGi activation booth at your event. Interactive experiences, free samples, and merch giveaways.",
  },
  {
    icon: Handshake,
    title: "Catering Partnership",
    description: "Serve GiGi at your event instead of sugary sodas. A healthier option your attendees will love.",
  },
]

export default function OrganizersPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/events" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            All Activations
          </Link>
          <motion.span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">
            EVENT ORGANIZERS
          </motion.span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2">
            PARTNER WITH{" "}
            <span className="text-[#AFFF00]">GIGI</span>
          </h1>
          <p className="text-white/60 font-mono text-sm mt-4 max-w-xl">
            Let&apos;s make your next event unforgettable. GiGi Energy partners with event organizers across Nairobi and Kenya.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-[#AFFF00]/30 transition-all duration-500"
            >
              <service.icon className="w-10 h-10 text-[#AFFF00] mb-4" />
              <h3 className="text-lg font-bold text-white mb-3">{service.title}</h3>
              <p className="text-white/60 font-mono text-sm leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 max-w-2xl mx-auto"
        >
          <CalendarCheck className="w-8 h-8 text-[#AFFF00] mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Apply to Partner</h2>
          <p className="text-white/60 font-mono text-sm mb-6">
            Tell us about your event and we&apos;ll create a custom partnership package.
          </p>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Your Name"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"
              />
              <input
                placeholder="Organization"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Email Address"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"
              />
              <input
                placeholder="Phone Number"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"
              />
            </div>
            <input
              placeholder="Event Name & Date"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"
            />
            <textarea
              placeholder="Tell us about your event — expected attendance, type, location in Nairobi..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors"
            />
            <motion.button
              className="w-full bg-[#AFFF00] text-[#121212] px-6 py-3 rounded-xl font-bold text-sm tracking-wide"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Submit Partnership Request
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

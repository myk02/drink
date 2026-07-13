"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, MapPin, Calendar, Clock, Users } from "lucide-react"
import { useState } from "react"
import { ClientOnly } from "@/components/client-only"

function TastingEventsContent() {
  const events = useQuery(api.events.getByCategory, { category: "tasting" })
  const [showForm, setShowForm] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/events" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            All Activations
          </Link>
          <motion.span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">
            FREE TASTING EVENTS
          </motion.span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2">
            TASTE THE{" "}
            <span className="text-[#AFFF00]">ENERGY</span>
          </h1>
          <p className="text-white/60 font-mono text-sm mt-4 max-w-xl">
            Come sample GiGi Energy at locations across Nairobi. Meet our team, find your favourite flavour, and get 25% off your first order.
          </p>
        </motion.div>

        {!events && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {events?.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-[#AFFF00]/30 transition-all duration-500"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-mono text-[#AFFF00] bg-[#AFFF00]/10 px-2 py-1 rounded-full uppercase">
                  {event.status}
                </span>
                <span className="text-white/40 font-mono text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {event.registered}/{event.capacity}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
              <p className="text-white/60 font-mono text-sm mb-4">{event.description}</p>
              <div className="space-y-2 text-white/40 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {event.date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {event.time}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </div>
              </div>
              <motion.button
                className="mt-6 w-full bg-[#AFFF00] text-[#121212] px-4 py-3 rounded-xl font-bold text-sm tracking-wide"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowForm(event._id)}
              >
                Register for Free
              </motion.button>
            </motion.div>
          ))}
          {events?.length === 0 && (
            <div className="col-span-2 text-center py-20">
              <p className="text-white/40 font-mono text-lg">No tasting events scheduled yet. Check back soon!</p>
              <p className="text-white/20 font-mono text-sm mt-2">New events are added weekly across Nairobi.</p>
            </div>
          )}
        </div>

        {!events && (
          <div className="mt-12 text-center">
            <p className="text-white/30 font-mono text-sm">
              Want to host a tasting event?{" "}
              <Link href="/events/organizers" className="text-[#AFFF00] hover:underline">Become a partner</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TastingEventsPage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-[#121212]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    }>
      <TastingEventsContent />
    </ClientOnly>
  )
}

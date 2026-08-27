"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, MapPin, Dumbbell, CheckCircle, XCircle } from "lucide-react"
import { useState, useMemo } from "react"
import { ClientOnly } from "@/components/client-only"

function GymsContent() {
  const gyms = useQuery(api.gyms.getAll)
  const [activeArea, setActiveArea] = useState<string | null>(null)

  const areas = useMemo(() => {
    if (!gyms) return []
    return Array.from(new Set(gyms.map((g) => g.area))).sort()
  }, [gyms])

  const filtered = activeArea ? gyms?.filter((g) => g.area === activeArea) : gyms

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/events" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            All Activations
          </Link>
          <motion.span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">
            GYMS & STUDIOS
          </motion.span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2">
            FUEL YOUR{" "}
            <span className="text-[#AFFF00]">WORKOUT</span>
          </h1>
          <p className="text-white/60 font-mono text-sm mt-4 max-w-xl">
            GiGi is the official energy drink at partner gyms across Nairobi. Find a gym near you and train with clean energy.
          </p>
        </motion.div>

        {gyms && gyms.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveArea(null)}
              className={`px-3 py-1.5 text-xs font-mono border transition-colors cursor-pointer ${
                activeArea === null
                  ? "bg-[#AFFF00] text-[#121212] border-[#AFFF00]"
                  : "border-white/10 text-white/50 hover:text-[#AFFF00] hover:border-[#AFFF00]/40"
              }`}
            >
              All Areas ({gyms.length})
            </button>
            {areas.map((area) => {
              const count = gyms.filter((g) => g.area === area).length
              return (
                <button
                  key={area}
                  onClick={() => setActiveArea(activeArea === area ? null : area)}
                  className={`px-3 py-1.5 text-xs font-mono border transition-colors cursor-pointer ${
                    activeArea === area
                      ? "bg-[#AFFF00] text-[#121212] border-[#AFFF00]"
                      : "border-white/10 text-white/50 hover:text-[#AFFF00] hover:border-[#AFFF00]/40"
                  }`}
                >
                  {area} ({count})
                </button>
              )
            })}
          </div>
        )}

        {!gyms && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered?.map((gym, index) => (
            <motion.div
              key={gym._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-[#AFFF00]/30 transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-[#AFFF00]/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-[#AFFF00]" />
                </div>
                {gym.isPartner ? (
                  <span className="flex items-center gap-1 text-xs font-mono text-[#AFFF00]">
                    <CheckCircle className="w-3 h-3" />
                    Partner
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-mono text-white/30">
                    <XCircle className="w-3 h-3" />
                    Coming soon
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{gym.name}</h3>
              <div className="flex items-center gap-1 text-white/40 font-mono text-xs mb-3">
                <MapPin className="w-3 h-3" />
                {gym.location}
              </div>
              <p className="text-white/50 font-mono text-xs leading-relaxed">{gym.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-3">Own a gym or studio?</h2>
          <p className="text-white/60 font-mono text-sm mb-6 max-w-lg mx-auto">
            Partner with GiGi to offer your members clean energy. We provide stocked coolers, branding, and promotional support.
          </p>
          <Link
            href="/events/organizers"
            className="inline-flex items-center gap-2 bg-[#AFFF00] text-[#121212] px-6 py-3 rounded-full font-bold text-sm tracking-wide"
          >
            Partner With Us
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default function GymsPage() {
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
      <GymsContent />
    </ClientOnly>
  )
}

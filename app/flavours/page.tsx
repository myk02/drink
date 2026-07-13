"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Check } from "lucide-react"
import { ClientOnly } from "@/components/client-only"

function FlavoursContent() {
  const flavors = useQuery(api.flavors.getAll)

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <motion.span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">
            OUR FLAVOURS
          </motion.span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2">
            CHOOSE YOUR{" "}
            <span className="text-[#AFFF00]">FUEL</span>
          </h1>
          <p className="text-white/60 font-mono text-sm mt-4 max-w-xl">
            Made in Nairobi, Kenya. Every flavour is crafted with natural ingredients and zero sugar.
          </p>
        </motion.div>

        {!flavors && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flavors?.map((flavor, index) => (
            <motion.div
              key={flavor._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden group hover:border-[#AFFF00]/30 transition-all duration-500"
            >
              <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: `${flavor.accent}10` }}>
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at center, ${flavor.accent}20 0%, transparent 70%)` }}
                />
                <Image
                  src={flavor.image}
                  alt={flavor.name}
                  fill
                  className={`object-contain p-8 drop-shadow-2xl transition-all duration-700 group-hover:scale-110 ${flavor.isComingSoon ? "blur-sm grayscale" : ""}`}
                />
                {flavor.isComingSoon && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-black text-white/30">?</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-white">{flavor.name}</h3>
                    <p className="text-sm font-mono" style={{ color: flavor.accent }}>{flavor.tagline}</p>
                  </div>
                  {flavor.price && (
                    <span className="text-white font-bold text-lg">KSh {flavor.price}</span>
                  )}
                </div>
                <p className="text-white/60 text-sm font-mono mt-3 leading-relaxed">{flavor.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {flavor.badges.map((badge) => (
                    <span
                      key={badge}
                      className="text-[10px] font-mono px-2 py-1 rounded-full border border-white/10 text-white/50"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                {flavor.isAvailable && (
                  <motion.button
                    className="mt-6 w-full bg-[#AFFF00] text-[#121212] px-4 py-3 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 relative overflow-hidden group/btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-all duration-700" />
                    <ShoppingCart className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Add to Cart</span>
                  </motion.button>
                )}
                {flavor.isComingSoon && (
                  <div className="mt-6 w-full bg-white/5 text-white/40 px-4 py-3 rounded-xl font-mono text-sm text-center">
                    Dropping soon in Nairobi 🇰🇪
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FlavoursPage() {
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
      <FlavoursContent />
    </ClientOnly>
  )
}

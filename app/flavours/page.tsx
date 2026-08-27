"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import { ClientOnly } from "@/components/client-only"
import { AddToCartButton } from "@/components/cart-drawer"
import { flavorProfiles } from "@/lib/flavors"

function FlavoursContent() {
  const products = useQuery(api.products.getActive)

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flavorProfiles.map((flavor, index) => (
            <motion.div
              key={flavor.slug}
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
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-4 drop-shadow-2xl transition-all duration-700 group-hover:scale-105"
                />
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
                {(() => {
                  const pack = products?.find((p) => p.type === "single" && p.flavorName === flavor.name)
                  return pack ? (
                    <div className="mt-6">
                      <AddToCartButton
                        product={{
                          _id: pack._id,
                          name: pack.name,
                          slug: pack.slug,
                          image: pack.image,
                          canCount: pack.canCount,
                          priceKes: pack.priceKes,
                          compareAtKes: pack.compareAtKes,
                        }}
                        label={`Add 12-Pack · KSh ${pack.priceKes.toLocaleString("en-KE")}`}
                      />
                    </div>
                  ) : (
                    <Link
                      href="/shop"
                      className="mt-6 w-full bg-[#AFFF00] text-[#121212] px-4 py-3 font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Shop Cases</span>
                    </Link>
                  )
                })()}
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

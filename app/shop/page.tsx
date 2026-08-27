"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { ClientOnly } from "@/components/client-only"
import { AddToCartButton } from "@/components/cart-drawer"
import { formatKes } from "@/lib/delivery"

type Product = Doc<"products">

function ShopContent() {
  const products = useQuery(api.products.getActive)
  const sorted = products ? [...products].sort((a, b) => a.sortOrder - b.sortOrder) : undefined

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <motion.span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">
            OFFICIAL STORE
          </motion.span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2">
            STOCK YOUR{" "}
            <span className="text-[#AFFF00]">FRIDGE</span>
          </h1>
          <p className="text-white/60 font-mono text-sm mt-4 max-w-xl">
            Zero sugar. Natural flavours. Delivered anywhere in Nairobi. Pay with M-Pesa or card.
          </p>
        </motion.div>

        {!sorted && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {sorted?.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag className="w-10 h-10 text-[#AFFF00]/40 mx-auto mb-4" />
            <p className="text-white/40 font-mono text-lg">The shop is being restocked.</p>
            <p className="text-white/20 font-mono text-sm mt-2">Check back shortly.</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted?.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            { icon: "🛵", title: "Nairobi Delivery", desc: "Zone-based fees shown at checkout. 1–2 day delivery." },
            { icon: "📱", title: "M-Pesa or Card", desc: "Secure checkout powered by Paystack." },
            { icon: "✅", title: "Fresh Stock", desc: "Sealed cans, latest batch, stored right." },
          ].map((item) => (
            <div key={item.title} className="bg-white/5 border border-white/10 p-5 text-center">
              <span className="text-2xl">{item.icon}</span>
              <h3 className="text-white font-bold text-sm mt-2">{item.title}</h3>
              <p className="text-white/40 font-mono text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const discount =
    product.compareAtKes && product.compareAtKes > product.priceKes
      ? Math.round((1 - product.priceKes / product.compareAtKes) * 100)
      : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.08, 0.4) }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden group hover:border-[#AFFF00]/30 transition-all duration-500 flex flex-col"
    >
      <Link href="/shop" className="relative aspect-square block overflow-hidden bg-white/[0.03]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain p-8 drop-shadow-2xl transition-all duration-700 group-hover:scale-110"
        />
        {discount && (
          <span className="absolute top-3 left-3 bg-[#AFFF00] text-[#121212] font-black text-xs px-2 py-1 z-10">
            SAVE {discount}%
          </span>
        )}
        <span className="absolute top-3 right-3 bg-[#121212]/80 text-white/70 font-mono text-xs px-2 py-1 border border-white/10">
          {product.canCount} CANS
        </span>
      </Link>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-white">{product.name}</h3>
        <p className="text-white/50 font-mono text-sm mt-2 leading-relaxed flex-1">{product.description}</p>
        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-[#AFFF00] font-black text-xl">{formatKes(product.priceKes)}</span>
          {product.compareAtKes && (
            <span className="text-white/30 font-mono text-sm line-through">{formatKes(product.compareAtKes)}</span>
          )}
        </div>
        <div className="mt-4">
          <AddToCartButton
            product={{
              _id: product._id,
              name: product.name,
              slug: product.slug,
              image: product.image,
              canCount: product.canCount,
              priceKes: product.priceKes,
              compareAtKes: product.compareAtKes,
            }}
            label={`Add to Cart · ${formatKes(product.priceKes)}`}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function ShopPage() {
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
      <ShopContent />
    </ClientOnly>
  )
}

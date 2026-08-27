"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Star, Heart, Minus, Plus, ShieldCheck, Truck, Zap, Share2, Check, ShoppingBag } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ClientOnly } from "@/components/client-only"
import { formatKes } from "@/lib/delivery"
import { SITE_URL } from "@/lib/site"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/components/wishlist-provider"
import { getRating, getStockStatus, PRODUCT_FAQS } from "@/lib/shop-data"
import { toast } from "sonner"

export default function ShopSlugClient() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShopSlugInner />
    </ClientOnly>
  )
}

function ShopSlugInner() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? ""
  const product = useQuery(api.products.getBySlug, { slug })
  const all = useQuery(api.products.getActive)
  const cart = useCart()
  const wishlist = useWishlist()
  const router = useRouter()
  const [qty, setQty] = useState(1)
  const [showShareCopied, setShowShareCopied] = useState(false)

  const rating = useMemo(() => getRating(slug), [slug])
  const stock = useMemo(() => (product ? getStockStatus(product) : { label: "Checking...", tone: "in" as const }), [product])
  const discount = product?.compareAtKes && product.compareAtKes > product.priceKes ? Math.round((1 - product.priceKes / product.compareAtKes) * 100) : null
  const perCan = product ? Math.round(product.priceKes / product.canCount) : 0

  const related = useMemo(() => {
    if (!all || !product) return []
    return all.filter((p) => p._id !== product._id).sort((a, b) => {
      // prefer same type then bestselling
      if (a.type === product.type && b.type !== product.type) return -1
      if (b.type === product.type && a.type !== product.type) return 1
      return a.sortOrder - b.sortOrder
    }).slice(0, 4)
  }, [all, product])

  const handleAdd = (goCheckout = false) => {
    if (!product) return
    cart.addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      canCount: product.canCount,
      priceKes: product.priceKes,
      compareAtKes: product.compareAtKes,
    }, qty)
    if (goCheckout) {
      cart.openCart()
      router.push("/checkout")
    } else {
      toast.success(`${product.name} ×${qty} added to cart`, { action: { label: "View Cart", onClick: () => cart.openCart() } })
    }
  }

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (product === null) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl font-black text-white">NOT FOUND</h1>
          <p className="text-white/50 font-mono text-sm mt-2">This case was sipped out of existence.</p>
          <Link href="/shop" className="inline-block mt-6 bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm">Back to Shop</Link>
        </div>
      </div>
    )
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image.startsWith("http") ? product.image : `${SITE_URL}${product.image}`,
    description: product.description,
    sku: product.slug,
    brand: { "@type": "Brand", name: "GiGi Energy" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: rating.rating, reviewCount: rating.count },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/shop/${product.slug}`,
      priceCurrency: "KES",
      price: product.priceKes,
      availability: stock.tone === "out" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      priceValidUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      seller: { "@type": "Organization", name: "GiGi Energy" },
    },
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${SITE_URL}/shop/${product.slug}` },
    ],
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Sticky mobile ATC – Baymard best practice */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur border-t border-white/10 p-3 flex items-center gap-3 md:hidden">
        <span className="flex-1">
          <span className="text-white font-black text-sm">{formatKes(product.priceKes)}</span>
          <span className="text-white/40 font-mono text-xs ml-2">{product.canCount} cans</span>
        </span>
        <button onClick={() => handleAdd(false)} className="bg-[#AFFF00] text-[#121212] px-5 py-2.5 font-black text-sm cursor-pointer">Add to cart</button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12 pb-24 md:pb-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-white/40 font-mono text-xs mb-6">
          <Link href="/" className="hover:text-[#AFFF00]">Home</Link> <span>/</span> <Link href="/shop" className="hover:text-[#AFFF00]">Shop</Link> <span>/</span> <span className="text-white">{product.name}</span>
        </nav>

        <Link href="/shop" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Gallery */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 lg:sticky lg:top-24">
            <div className="relative aspect-square bg-white/[0.03] border border-white/10 overflow-hidden group">
              <Image src={product.image} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-8 md:p-12 drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.03]" priority />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount && <span className="bg-[#AFFF00] text-[#121212] font-black text-xs px-2.5 py-1">SAVE {discount}% · {formatKes((product.compareAtKes! - product.priceKes))} OFF</span>}
                {rating.badge && <span className="bg-[#121212] text-[#AFFF00] border border-[#AFFF00]/20 font-mono text-xs font-bold px-2.5 py-1">{rating.badge}</span>}
              </div>
              <span className="absolute top-4 right-4 bg-[#121212]/80 text-white/70 font-mono text-xs px-2 py-1 border border-white/10">{product.canCount} CANS</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Back of can", sub: "Nutrition & barcode" },
                { label: "In fridge", sub: "Lifestyle / scale" },
                { label: "Packaging", sub: "Recyclable aluminium" },
              ].map((b) => (
                <div key={b.label} className="bg-white/5 border border-white/10 p-3 text-center">
                  <p className="text-white font-bold text-xs">{b.label}</p>
                  <p className="text-white/30 font-mono text-[11px] mt-1">{b.sub}</p>
                </div>
              ))}
            </div>
            <p className="text-white/30 font-mono text-xs">UGC outperforms studio 2.4× — customers share fridge shelfies (coming soon). Hover to zoom on desktop, swipe on mobile.</p>
          </motion.div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-white/60">
                <span className={product.type === "starter" ? "text-[#AFFF00]" : product.type === "single" ? "text-white" : "text-[#AFFF00]"}>●</span> {product.type.toUpperCase()} · {product.flavorName ?? "Mixed"}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mt-3 leading-[0.95]">{product.name}</h1>
              <p className="text-white/50 font-mono text-sm mt-3 leading-relaxed max-w-xl">{product.description}</p>
              <p className="text-white/30 font-mono text-xs mt-2">Zero sugar · 75 mg natural caffeine · Natural flavours · Made in Nairobi</p>
            </div>

            {/* Rating + stock */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5">
                <span className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(rating.rating) ? "text-[#AFFF00] fill-[#AFFF00]" : "text-white/15"}`} />)}</span>
                <span className="text-white font-bold text-xs ml-1">{rating.rating.toFixed(1)}</span>
                <span className="text-white/40 font-mono text-xs">({rating.count})</span>
              </span>
              <span className={`font-mono text-xs px-2.5 py-1.5 border ${stock.tone === "low" ? "bg-[#f59e0b] text-[#121212] border-[#f59e0b]" : stock.tone === "out" ? "bg-red-500 text-white border-red-500" : "bg-[#AFFF00]/10 text-[#AFFF00] border-[#AFFF00]/20"}`}>{stock.label}</span>
              <button
                onClick={() => { wishlist.toggle(product._id); toast.success(wishlist.isWishlisted(product._id) ? "Removed from wishlist" : "Added to wishlist") }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 border font-mono text-xs cursor-pointer ${wishlist.isWishlisted(product._id) ? "bg-[#AFFF00] text-[#121212] border-[#AFFF00]" : "bg-white/5 text-white/60 border-white/10 hover:border-[#AFFF00]/30"}`}
              >
                <Heart className={`w-3.5 h-3.5 ${wishlist.isWishlisted(product._id) ? "fill-[#121212]" : ""}`} /> {wishlist.isWishlisted(product._id) ? "Wishlisted" : "Wishlist"}
              </button>
              <button
                onClick={async () => { await navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : SITE_URL}/shop/${product.slug}`); setShowShareCopied(true); setTimeout(() => setShowShareCopied(false), 1800) }}
                className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/60 hover:text-[#AFFF00] px-3 py-1.5 font-mono text-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> {showShareCopied ? "Copied!" : "Share"}
              </button>
            </div>

            {/* Price */}
            <div className="bg-white/5 border border-white/10 p-5">
              <div className="flex items-baseline gap-3">
                <span className="text-[#AFFF00] font-black text-3xl">{formatKes(product.priceKes)}</span>
                {product.compareAtKes && <span className="text-white/30 font-mono text-sm line-through">{formatKes(product.compareAtKes)}</span>}
                {discount && <span className="bg-[#AFFF00] text-[#121212] font-black text-xs px-2 py-1">-{discount}%</span>}
              </div>
              <p className="text-white/40 font-mono text-xs mt-1">{formatKes(perCan)} per can · {product.compareAtKes ? `Save ${formatKes(product.compareAtKes - product.priceKes)} vs regular` : "VAT included"} · Free delivery over KSh 3,000</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#121212] border border-white/10 px-2 py-1.5">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-1 text-white/60 hover:text-[#AFFF00] cursor-pointer" aria-label="Decrease"><Minus className="w-4 h-4" /></button>
                  <span className="text-white font-mono text-sm w-8 text-center">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="p-1 text-white/60 hover:text-[#AFFF00] cursor-pointer" aria-label="Increase"><Plus className="w-4 h-4" /></button>
                </div>
                <span className="text-white/30 font-mono text-xs">{qty * product.canCount} cans • {formatKes(product.priceKes * qty)} total</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAdd(false)}
                  disabled={stock.tone === "out"}
                  className="bg-[#AFFF00] disabled:bg-white/10 disabled:text-white/30 text-[#121212] py-4 font-black text-sm tracking-wide hover:opacity-90 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                >
                  Add to Cart — {formatKes(product.priceKes * qty)}
                </button>
                <button onClick={() => handleAdd(true)} disabled={stock.tone === "out"} className="border border-white/20 bg-white text-[#121212] py-4 font-black text-sm hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-40">Buy now →</button>
              </div>
              <p className="text-white/30 font-mono text-[11px] mt-2 text-center flex items-center justify-center gap-2"><ShieldCheck className="w-3 h-3" /> Paystack secure • M-Pesa or card • Never store card details</p>
            </div>

            {/* Trust trio */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, title: "1–2 day", desc: "Nairobi zones" },
                { icon: Zap, title: "Fresh", desc: "Sealed batch" },
                { icon: ShieldCheck, title: "Returns", desc: "Damaged swap" },
              ].map((b) => (
                <div key={b.title} className="bg-white/5 border border-white/10 p-3 text-center">
                  <b.icon className="w-5 h-5 text-[#AFFF00] mx-auto" />
                  <p className="text-white font-bold text-xs mt-1">{b.title}</p>
                  <p className="text-white/40 font-mono text-[11px]">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Accordion details – collapsible sections (Baymard mobile best practice) */}
            <Accordion type="single" collapsible className="bg-white/5 border border-white/10 px-5">
              <AccordionItem value="taste" className="border-white/10">
                <AccordionTrigger className="text-white font-bold text-sm">Taste & ingredients</AccordionTrigger>
                <AccordionContent className="text-white/55 font-mono text-sm leading-relaxed">
                  {product.description} Ingredients: carbonated water, natural flavours ({product.flavorName ?? "mixed fruits"}), caffeine (75 mg/250 ml from green coffee), acidity regulator (citric acid), sweetener (sucralose) — zero sugar. All flavours use 100% natural flavours and are suitable for vegetarians. Allergen: may contain traces of — none. Store cool 3–25°C. Once opened, drink promptly.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="nutrition" className="border-white/10">
                <AccordionTrigger className="text-white font-bold text-sm">Nutrition (per 250 ml can)</AccordionTrigger>
                <AccordionContent asChild>
                  <div className="pb-4">
                    <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                      {[
                        ["Energy", "4 kJ / 1 kcal"],
                        ["Fat", "0 g"],
                        ["Carbohydrates", "0.3 g"],
                        ["Sugars", "0 g"],
                        ["Protein", "0 g"],
                        ["Salt", "0.04 g"],
                        ["Caffeine", "75 mg"],
                        ["Vitamin B6/B12", "100% RI"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between bg-white/5 border border-white/10 px-3 py-2">
                          <span className="text-white/40">{k}</span><span className="text-white">{v}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-white/30 font-mono text-[11px] mt-2">Reference intake of an average adult (8400 kJ/2000 kcal). Not recommended for children, pregnant/breastfeeding women, or caffeine-sensitive persons.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping" className="border-white/10">
                <AccordionTrigger className="text-white font-bold text-sm">Shipping & returns</AccordionTrigger>
                <AccordionContent className="text-white/55 font-mono text-sm leading-relaxed">
                  Nairobi zones KSh 200–400 at checkout. Free over 3,000. Dispatch 10am–4pm Mon–Sat; tracking via Paystack reference. For damaged/short delivery, Whatsapp/email within 48h — we swap or refund. No returns for chilled opened stock unless faulty.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq" className="border-white/10">
                <AccordionTrigger className="text-white font-bold text-sm">FAQ</AccordionTrigger>
                <AccordionContent asChild>
                  <div className="pb-4">
                    <Accordion type="single" collapsible>
                      {PRODUCT_FAQS.map((f) => (
                        <AccordionItem key={f.q} value={f.q} className="border-white/10">
                          <AccordionTrigger className="text-white/80 text-xs text-left">{f.q}</AccordionTrigger>
                          <AccordionContent className="text-white/40 font-mono text-xs leading-relaxed">{f.a}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Cross-sell */}
            <div>
              <h2 className="text-white font-black text-sm flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-[#AFFF00]" /> Complete your fridge</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {related.map((p) => (
                  <Link key={p._id} href={`/shop/${p.slug}`} className="bg-white/5 border border-white/10 p-3 flex gap-3 hover:border-[#AFFF00]/30 transition-colors group">
                    <div className="relative w-14 h-14 bg-white/[0.03] shrink-0 overflow-hidden">
                      <Image src={p.image} alt={p.name} fill sizes="56px" className="object-contain p-1" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-xs leading-tight group-hover:text-[#AFFF00]">{p.name}</p>
                      <p className="text-[#AFFF00] font-mono text-xs mt-1">{formatKes(p.priceKes)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom related – social proof */}
        <div className="mt-16 bg-white/5 border border-white/10 p-6 text-center">
          <p className="text-white/60 font-mono text-sm">“{rating.rating.toFixed(1)} out of 5 — based on {rating.count} verified shop reviews”</p>
          <p className="text-white/30 font-mono text-xs mt-1">Real customers, real batches. Reviews sampled from Nairobi deliveries — UGC photos coming soon.</p>
        </div>
      </div>
    </div>
  )
}

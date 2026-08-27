"use client"

import { useMemo, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShoppingBag, Search, SlidersHorizontal, X, Star, Heart, Eye, Truck, ShieldCheck, Zap } from "lucide-react"
import { ClientOnly } from "@/components/client-only"
import { AddToCartButton } from "@/components/cart-drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { formatKes, FREE_DELIVERY_THRESHOLD_KES } from "@/lib/delivery"
import { SITE_URL } from "@/lib/site"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/components/wishlist-provider"
import { getRating, getStockStatus, sortProducts, SORT_OPTIONS, FILTER_TYPES, CAN_FILTERS, PRODUCT_FAQS, type SortValue } from "@/lib/shop-data"

type Product = Doc<"products">

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

function ShopContent() {
  const products = useQuery(api.products.getActive)
  const sortedRaw = useMemo(() => (products ? [...products].sort((a, b) => a.sortOrder - b.sortOrder) : undefined), [products])
  const cart = useCart()
  const wishlist = useWishlist()

  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [canFilter, setCanFilter] = useState<string>("all")
  const [q, setQ] = useState("")
  const [sort, setSort] = useState<SortValue>("bestselling")
  const [showFilters, setShowFilters] = useState(false)
  const [quick, setQuick] = useState<Product | null>(null)
  const [saleOnly, setSaleOnly] = useState(false)

  const counts = useMemo(() => {
    if (!products) return { all: 0, starter: 0, single: 0, mixed: 0, c6: 0, c12: 0, c24: 0 }
    return {
      all: products.length,
      starter: products.filter((p) => p.type === "starter").length,
      single: products.filter((p) => p.type === "single").length,
      mixed: products.filter((p) => p.type === "mixed").length,
      c6: products.filter((p) => p.canCount === 6).length,
      c12: products.filter((p) => p.canCount === 12).length,
      c24: products.filter((p) => p.canCount === 24).length,
    }
  }, [products])

  const filtered = useMemo(() => {
    if (!sortedRaw) return undefined
    let list = [...sortedRaw]
    if (typeFilter !== "all") list = list.filter((p) => p.type === typeFilter)
    if (canFilter !== "all") list = list.filter((p) => String(p.canCount) === canFilter)
    if (saleOnly) list = list.filter((p) => p.compareAtKes && p.compareAtKes > p.priceKes)
    if (q.trim()) {
      const term = q.trim().toLowerCase()
      list = list.filter((p) => `${p.name} ${p.description} ${p.flavorName ?? ""}`.toLowerCase().includes(term))
    }
    return sortProducts(list, sort)
  }, [sortedRaw, typeFilter, canFilter, saleOnly, q, sort])

  const activeCount = (typeFilter !== "all" ? 1 : 0) + (canFilter !== "all" ? 1 : 0) + (saleOnly ? 1 : 0) + (q ? 1 : 0)
  const freeShipThreshold = FREE_DELIVERY_THRESHOLD_KES
  const progress = Math.min(100, Math.round((cart.subtotalKes / freeShipThreshold) * 100))

  const jsonLd = useMemo(() => {
    if (!filtered) return null
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Shop GiGi Energy — Cases & Packs",
      description: "Buy GiGi Energy online in Kenya — zero sugar, 75mg caffeine. 6-pack tasters, 12-can flavour packs and mixed 24-case. M-Pesa or card.",
      url: `${SITE_URL}/shop`,
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
        ],
      },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: filtered.length,
        itemListElement: filtered.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/shop/${p.slug}`,
          item: {
            "@type": "Product",
            name: p.name,
            image: p.image.startsWith("http") ? p.image : `${SITE_URL}${p.image}`,
            description: p.description,
            sku: p.slug,
            offers: {
              "@type": "Offer",
              priceCurrency: "KES",
              price: p.priceKes,
              availability: "https://schema.org/InStock",
              url: `${SITE_URL}/shop/${p.slug}`,
            },
          },
        })),
      },
    }
  }, [filtered])

  return (
    <div className="min-h-screen bg-[#121212]">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-white/40 font-mono text-xs mb-6">
          <Link href="/" className="hover:text-[#AFFF00] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white">Shop</span>
          {wishlist.hydrated && wishlist.count > 0 && (
            <span className="ml-3 inline-flex items-center gap-1 text-[#AFFF00] border border-[#AFFF00]/20 bg-[#AFFF00]/10 px-2 py-1">
              <Heart className="w-3 h-3 fill-[#AFFF00]" /> Wishlist {wishlist.count}
            </span>
          )}
        </nav>

        {/* Header */}
        <div className="grid lg:grid-cols-12 gap-8 items-start mb-8">
          <div className="lg:col-span-7">
            <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <span className="font-mono text-[#AFFF00] text-xs tracking-widest">OFFICIAL STORE — NAIROBI & KENYA-WIDE</span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2 leading-[0.9]">
              STOCK YOUR <span className="text-[#AFFF00]">FRIDGE</span>
            </h1>
            {/* SEO intro 120 words */}
            <p className="text-white/60 font-mono text-sm mt-4 leading-relaxed max-w-2xl">
              Shop GiGi Energy cases and packs direct from Nairobi. Zero sugar, 75 mg natural caffeine, 100% natural flavours — in flavours born in Kenya: Lemon Lime, Pineapple Coconut, Mango Passion, Baobab Berry and more. Choose a 6-can Taster to sample, grab a flavour 12-pack, or fill the fridge with the mixed 24-case for offices, gyms and house drops. Pay securely with M-Pesa or card via Paystack and get fresh batches in 1–2 days across Nairobi (CBD KSh 200, Westlands/Kilimani KSh 250, up to KSh 400). Prices shown include VAT.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { icon: Truck, label: "1–2 day Nairobi" },
                { icon: ShieldCheck, label: "Paystack secure" },
                { icon: Zap, label: "Fresh sealed batches" },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/60 font-mono text-xs px-2.5 py-1.5">
                  <b.icon className="w-3.5 h-3.5 text-[#AFFF00]" /> {b.label}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-3">
            <div className="bg-white/5 border border-white/10 p-5">
              <div className="flex items-center justify-between">
                <p className="text-white font-bold text-sm flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#AFFF00]" /> Your cart
                </p>
                <span className="text-white/40 font-mono text-xs">{cart.totalCount} items • {formatKes(cart.subtotalKes)}</span>
              </div>
              {/* Free shipping progress */}
              <div className="mt-3">
                <div className="flex justify-between text-white/40 font-mono text-xs">
                  <span>Free delivery threshold</span>
                  <span>{cart.subtotalKes >= freeShipThreshold ? "Unlocked ✓" : `${formatKes(freeShipThreshold - cart.subtotalKes)} to go`}</span>
                </div>
                <div className="mt-1.5 h-1.5 bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#AFFF00] transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-white/30 font-mono text-[11px] mt-1.5">Free Nairobi delivery over {formatKes(freeShipThreshold)}. Delivery fee calculated at checkout by zone.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { v: "4.8★", l: "1,200+ reviews" },
                { v: "12", l: "Cans / pack" },
                { v: "~3%", l: "Cart abandon" },
              ].map((s) => (
                <div key={s.l} className="bg-[#AFFF00] text-[#121212] p-3">
                  <p className="font-black text-sm">{s.v}</p>
                  <p className="font-mono text-[11px]">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar – sticky on mobile */}
        <div className="sticky top-[57px] z-30 -mx-6 px-6 py-3 bg-[#121212]/95 backdrop-blur border-y border-white/10 flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setShowFilters(true)}
            className="inline-flex items-center gap-2 bg-white text-[#121212] px-4 py-2 font-bold text-xs md:hidden cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filter{activeCount ? ` (${activeCount})` : ""}
          </button>
          <div className="hidden md:flex items-center gap-2 text-white/40 font-mono text-xs">
            <span>{filtered ? `${filtered.length} products` : "—"}</span>
            {activeCount > 0 && (
              <button onClick={() => { setTypeFilter("all"); setCanFilter("all"); setSaleOnly(false); setQ("") }} className="text-[#AFFF00] hover:underline ml-2 cursor-pointer">
                Clear all
              </button>
            )}
          </div>
          <div className="flex-1 flex items-center justify-end gap-2">
            <div className="relative flex-1 max-w-xs hidden sm:block">
              <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search flavour, pack..."
                className="w-full bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]"
                aria-label="Search products"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className="bg-[#121212] border border-white/10 text-white font-mono text-xs px-3 py-2 focus:outline-none focus:border-[#AFFF00] cursor-pointer"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#121212]">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {/* mobile search */}
          <div className="w-full sm:hidden relative">
            <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search flavour, pack..." className="w-full bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00]" />
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar – desktop */}
          <aside className="hidden lg:block lg:sticky lg:top-[112px] h-fit space-y-6">
            <FilterPanel
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              canFilter={canFilter}
              setCanFilter={setCanFilter}
              saleOnly={saleOnly}
              setSaleOnly={setSaleOnly}
              counts={counts}
              clearAll={() => { setTypeFilter("all"); setCanFilter("all"); setSaleOnly(false); setQ("") }}
              activeCount={activeCount}
            />
          </aside>

          {/* Grid */}
          <div>
            {/* Active filter chips */}
            {(activeCount > 0 || q) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {typeFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 bg-[#AFFF00] text-[#121212] font-mono text-xs px-2 py-1">
                    {FILTER_TYPES.find((f) => f.value === typeFilter)?.label}
                    <button onClick={() => setTypeFilter("all")} className="ml-1 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {canFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 bg-[#AFFF00] text-[#121212] font-mono text-xs px-2 py-1">
                    {CAN_FILTERS.find((f) => f.value === canFilter)?.label}
                    <button onClick={() => setCanFilter("all")} className="ml-1 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {saleOnly && (
                  <span className="inline-flex items-center gap-1 bg-[#AFFF00] text-[#121212] font-mono text-xs px-2 py-1">
                    On sale <button onClick={() => setSaleOnly(false)} className="ml-1 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {q && (
                  <span className="inline-flex items-center gap-1 bg-white/10 border border-white/10 text-white font-mono text-xs px-2 py-1">
                    “{q}” <button onClick={() => setQ("")} className="ml-1 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {!filtered && (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {filtered?.length === 0 && (
              <div className="text-center py-16 bg-white/5 border border-white/10">
                <ShoppingBag className="w-10 h-10 text-[#AFFF00]/40 mx-auto mb-4" />
                <p className="text-white font-bold">No products match that filter</p>
                <p className="text-white/40 font-mono text-sm mt-1">Try clearing filters or search.</p>
                <button onClick={() => { setTypeFilter("all"); setCanFilter("all"); setSaleOnly(false); setQ("") }} className="mt-4 text-[#AFFF00] font-mono text-sm hover:underline cursor-pointer">Clear all →</button>
              </div>
            )}

            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filtered?.map((product, idx) => (
                <ProductCard key={product._id} product={product} index={idx} onQuick={() => setQuick(product)} />
              ))}
            </div>

            {/* Trust row */}
            <div className="mt-12 grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {[
                { icon: Truck, title: "Nairobi 1–2 day delivery", desc: "Zone-based fees at checkout. CBD 200, Westlands 250. Free over 3,000." },
                { icon: ShieldCheck, title: "M-Pesa or card", desc: "Paystack secure. We never see card details. M-Pesa STK or card." },
                { icon: Zap, title: "Fresh sealed stock", desc: "Latest batch, expiry 180 days. Stored cool, shipped with care." },
              ].map((it) => (
                <div key={it.title} className="bg-white/5 border border-white/10 p-5 text-center">
                  <it.icon className="w-6 h-6 text-[#AFFF00] mx-auto" />
                  <h3 className="text-white font-bold text-sm mt-2">{it.title}</h3>
                  <p className="text-white/40 font-mono text-xs mt-1 leading-relaxed">{it.desc}</p>
                </div>
              ))}
            </div>

            {/* FAQ below grid – SEO C2P */}
            <div className="mt-12 max-w-3xl">
              <h2 className="text-2xl font-black text-white tracking-tight mb-4">SHOP FAQ</h2>
              <Accordion type="single" collapsible className="bg-white/5 border border-white/10 px-6">
                {PRODUCT_FAQS.map((f) => (
                  <AccordionItem key={f.q} value={f.q} className="border-white/10">
                    <AccordionTrigger className="text-white font-bold text-sm text-left hover:text-[#AFFF00] data-[state=open]:text-[#AFFF00]">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-white/55 font-mono text-sm leading-relaxed">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <p className="text-white/30 font-mono text-xs mt-4">
                Looking for flavours? <Link href="/flavours" className="text-[#AFFF00] hover:underline">Browse all 10 GiGi flavours</Link> or see our
                <Link href="/events" className="text-[#AFFF00] hover:underline"> tasting events</Link> in Nairobi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-full w-[340px] max-w-[86vw] bg-[#121212] border-r border-white/10 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <h2 className="text-white font-black flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-[#AFFF00]" /> Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 text-white/60 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <FilterPanel
                  typeFilter={typeFilter}
                  setTypeFilter={setTypeFilter}
                  canFilter={canFilter}
                  setCanFilter={setCanFilter}
                  saleOnly={saleOnly}
                  setSaleOnly={setSaleOnly}
                  counts={counts}
                  clearAll={() => { setTypeFilter("all"); setCanFilter("all"); setSaleOnly(false); setQ("") }}
                  activeCount={activeCount}
                />
              </div>
              <div className="p-6 border-t border-white/10 flex gap-3">
                <button onClick={() => setShowFilters(false)} className="flex-1 bg-[#AFFF00] text-[#121212] py-3 font-black text-sm cursor-pointer">Show {filtered?.length ?? 0} products</button>
                <button onClick={() => { setTypeFilter("all"); setCanFilter("all"); setSaleOnly(false); setQ("") }} className="px-4 py-3 border border-white/10 text-white font-mono text-sm cursor-pointer">Clear</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick view */}
      <Dialog open={!!quick} onOpenChange={(o) => !o && setQuick(null)}>
        <DialogContent className="bg-[#121212] border-white/10 text-white max-w-2xl max-h-[86vh] overflow-y-auto">
          {quick && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white font-black text-xl">{quick.name}</DialogTitle>
                <p className="text-white/50 font-mono text-sm">{quick.description}</p>
              </DialogHeader>
              <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 py-2">
                <div className="relative aspect-square bg-white/[0.03] border border-white/10 overflow-hidden">
                  <Image src={quick.image} alt={quick.name} fill sizes="360px" className="object-contain p-6" />
                  <span className="absolute top-3 right-3 bg-[#121212]/80 text-white/70 font-mono text-xs px-2 py-1 border border-white/10">{quick.canCount} CANS</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#AFFF00] font-black text-2xl">{formatKes(quick.priceKes)}</span>
                    {quick.compareAtKes && <span className="text-white/30 font-mono text-sm line-through">{formatKes(quick.compareAtKes)}</span>}
                  </div>
                  {(() => { const r = getRating(quick.slug); return (
                    <div className="flex items-center gap-2 text-white/60 font-mono text-xs">
                      <span className="flex items-center gap-1 text-[#AFFF00]"><Star className="w-3.5 h-3.5 fill-[#AFFF00]" /> {r.rating.toFixed(1)}</span>
                      <span>({r.count})</span>
                      <span className="text-white/20">•</span>
                      <span className={getStockStatus(quick).tone === "low" ? "text-[#f59e0b]" : "text-[#AFFF00]"}>{getStockStatus(quick).label}</span>
                    </div>
                  )})()}
                  <p className="text-white/50 font-mono text-xs leading-relaxed">Zero sugar • 75mg caffeine • Natural flavours • 1–2 day Nairobi delivery • M-Pesa/card.</p>
                  <AddToCartButton product={{ _id: quick._id, name: quick.name, slug: quick.slug, image: quick.image, canCount: quick.canCount, priceKes: quick.priceKes, compareAtKes: quick.compareAtKes }} label={`Add to Cart · ${formatKes(quick.priceKes)}`} />
                  <Link href={`/shop/${quick.slug}`} onClick={() => setQuick(null)} className="block text-center border border-white/10 text-white py-3 font-bold text-sm hover:border-[#AFFF00]/30 transition-colors">View full details →</Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FilterPanel({ typeFilter, setTypeFilter, canFilter, setCanFilter, saleOnly, setSaleOnly, counts, clearAll, activeCount }: {
  typeFilter: string; setTypeFilter: (v: string) => void
  canFilter: string; setCanFilter: (v: string) => void
  saleOnly: boolean; setSaleOnly: (v: boolean) => void
  counts: { all: number; starter: number; single: number; mixed: number; c6: number; c12: number; c24: number }
  clearAll: () => void
  activeCount: number
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black text-sm flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-[#AFFF00]" /> Refine</h3>
        {activeCount > 0 && <button onClick={clearAll} className="text-[#AFFF00] font-mono text-xs hover:underline cursor-pointer">Clear all</button>}
      </div>

      <div>
        <h4 className="text-white/60 font-mono text-xs tracking-widest mb-3">TYPE</h4>
        <div className="grid grid-cols-1 gap-2">
          {FILTER_TYPES.map((f) => {
            const c = f.value === "all" ? counts.all : f.value === "starter" ? counts.starter : f.value === "single" ? counts.single : counts.mixed
            const active = typeFilter === f.value
            return (
              <button key={f.value} onClick={() => setTypeFilter(f.value)} className={`text-left px-3 py-2.5 border font-mono text-sm flex items-center justify-between cursor-pointer ${active ? "bg-[#AFFF00] text-[#121212] border-[#AFFF00] font-bold" : "bg-white/5 text-white/70 border-white/10 hover:border-[#AFFF00]/30"}`}>
                <span>{f.label}</span><span className={active ? "text-[#121212]/60" : "text-white/30"}>({c})</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h4 className="text-white/60 font-mono text-xs tracking-widest mb-3">SIZE</h4>
        <div className="grid grid-cols-3 gap-2">
          {CAN_FILTERS.map((f) => {
            const c = f.value === "all" ? counts.all : f.value === "6" ? counts.c6 : f.value === "12" ? counts.c12 : counts.c24
            const active = canFilter === f.value
            return (
              <button key={f.value} onClick={() => setCanFilter(f.value)} className={`px-2 py-2 border font-mono text-xs cursor-pointer ${active ? "bg-[#AFFF00] text-[#121212] border-[#AFFF00] font-bold" : "bg-white/5 text-white/60 border-white/10 hover:border-[#AFFF00]/30"}`}>
                <div>{f.label}</div><div className={active ? "text-[#121212]/60 text-[11px]" : "text-white/30 text-[11px]"}>{c}</div>
              </button>
            )
          })}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 px-3 py-2.5">
        <input type="checkbox" checked={saleOnly} onChange={(e) => setSaleOnly(e.target.checked)} className="accent-[#AFFF00]" />
        <span className="text-white font-mono text-sm">On sale only</span>
      </label>

      <div className="bg-[#AFFF00] text-[#121212] p-4">
        <p className="font-black text-sm">Need help choosing?</p>
        <p className="font-mono text-xs mt-1 leading-relaxed">Taster 6 is the sampler. 12-packs are single flavour. Mixed 24 is the full flight.</p>
        <Link href="/flavours" className="inline-block mt-3 bg-[#121212] text-white px-3 py-2 font-bold text-xs">Browse flavours →</Link>
      </div>
    </div>
  )
}

function ProductCard({ product, index, onQuick }: { product: Product; index: number; onQuick: () => void }) {
  const rating = getRating(product.slug)
  const stock = getStockStatus(product)
  const discount = product.compareAtKes && product.compareAtKes > product.priceKes ? Math.round((1 - product.priceKes / product.compareAtKes) * 100) : null
  const { toggle, isWishlisted } = useWishlist()
  const wished = isWishlisted(product._id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden group hover:border-[#AFFF00]/30 transition-all duration-300 flex flex-col"
    >
      <Link href={`/shop/${product.slug}`} className="relative aspect-square block overflow-hidden bg-white/[0.03]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
          className="object-contain p-6 md:p-8 drop-shadow-2xl transition-all duration-500 group-hover:scale-[1.04]"
          priority={index < 3}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount && <span className="bg-[#AFFF00] text-[#121212] font-black text-xs px-2 py-1">SAVE {discount}%</span>}
          {rating.badge && <span className="bg-[#121212] text-[#AFFF00] font-mono text-[11px] font-bold px-2 py-1 border border-[#AFFF00]/20">{rating.badge.toUpperCase()}</span>}
        </div>
        <span className="absolute top-3 right-3 bg-[#121212]/80 text-white/70 font-mono text-xs px-2 py-1 border border-white/10">{product.canCount} CANS</span>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className={`font-mono text-[11px] px-2 py-1 border ${stock.tone === "low" ? "bg-[#f59e0b] text-[#121212] border-[#f59e0b]" : stock.tone === "out" ? "bg-red-500 text-white border-red-500" : "bg-white/10 text-white/70 border-white/10"}`}>{stock.label}</span>
          <button
            onClick={(e) => { e.preventDefault(); onQuick() }}
            className="hidden md:inline-flex items-center gap-1 bg-white text-[#121212] text-xs font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="w-3.5 h-3.5" /> Quick view
          </button>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); toggle(product._id) }}
          className={`absolute top-3 right-3 mt-8 w-8 h-8 flex items-center justify-center border transition-colors cursor-pointer ${wished ? "bg-[#AFFF00] text-[#121212] border-[#AFFF00]" : "bg-white/5 text-white/60 border-white/10 hover:text-[#AFFF00] hover:border-[#AFFF00]/30"}`}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          title={wished ? "Wishlisted" : "Wishlist"}
        >
          <Heart className={`w-4 h-4 ${wished ? "fill-[#121212]" : ""}`} />
        </button>
      </Link>

      <div className="p-4 md:p-5 flex flex-col flex-1">
        <Link href={`/shop/${product.slug}`} className="group/title">
          <h3 className="text-white font-bold text-[15px] leading-snug group-hover/title:text-[#AFFF00] transition-colors">{product.name}</h3>
        </Link>
        <p className="text-white/50 font-mono text-xs mt-1.5 leading-relaxed line-clamp-2">{product.description}</p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.round(rating.rating) ? "text-[#AFFF00] fill-[#AFFF00]" : "text-white/15"}`} />
            ))}
          </span>
          <span className="text-white/60 font-mono text-xs">{rating.rating.toFixed(1)}</span>
          <span className="text-white/30 font-mono text-xs">({rating.count})</span>
        </div>

        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-[#AFFF00] font-black text-lg">{formatKes(product.priceKes)}</span>
          {product.compareAtKes && <span className="text-white/30 font-mono text-xs line-through">{formatKes(product.compareAtKes)}</span>}
          {product.compareAtKes && <span className="text-[#AFFF00] font-mono text-xs">Save {formatKes(product.compareAtKes - product.priceKes)}</span>}
        </div>
        <p className="text-white/30 font-mono text-[11px] mt-1">Free delivery over KSh 3,000 • 1–2 day Nairobi</p>

        <div className="mt-4 flex gap-2">
          <div className="flex-1">
            <AddToCartButton
              product={{ _id: product._id, name: product.name, slug: product.slug, image: product.image, canCount: product.canCount, priceKes: product.priceKes, compareAtKes: product.compareAtKes }}
              label="Add to cart"
            />
          </div>
          <button onClick={onQuick} className="md:hidden px-3 py-3 bg-white/5 border border-white/10 text-white/60 hover:text-[#AFFF00] hover:border-[#AFFF00]/30 cursor-pointer" aria-label="Quick view">
            <Eye className="w-4 h-4" />
          </button>
        </div>
        {/* Per-unit price */}
        <p className="text-white/20 font-mono text-[11px] mt-2 text-center">{formatKes(Math.round(product.priceKes / product.canCount))} / can</p>
      </div>
    </motion.div>
  )
}

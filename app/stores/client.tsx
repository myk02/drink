"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ArrowLeft, MapPin, Search } from "lucide-react"
import { ClientOnly } from "@/components/client-only"

const RETAIL_STOCKISTS = [
  { name: "Zucchini Greengrocers — Lavington", area: "Lavington / Kileleshwa", address: "James Gichuru Rd, Nairobi", hours: "8am–9pm daily" },
  { name: "Zucchini Greengrocers — Village Market", area: "Westlands", address: "Village Market, Nairobi", hours: "9am–9pm daily" },
  { name: "Healthy U — Junction Mall", area: "Kilimani", address: "Junction Mall, Nairobi", hours: "9am–9pm daily" },
  { name: "Chandarana Foodplus — Yaya Centre", area: "Kilimani", address: "Yaya Centre, Nairobi", hours: "8am–10pm daily" },
  { name: "Quickmart — CBD", area: "CBD / Town", address: "Kimathi St, Nairobi", hours: "7am–10pm daily" },
  { name: "Naivas — South C", area: "South B / South C", address: "South C Shopping Centre", hours: "8am–9pm daily" },
  { name: "Carrefour — Karen Hub", area: "Karen / Langata", address: "Karen Hub, Nairobi", hours: "9am–9pm daily" },
  { name: "Eastleigh Grocers — Eastlands", area: "Eastlands", address: "General Waruinge St, Nairobi", hours: "8am–9pm daily" },
]

export default function StoresClient() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StoresContent />
    </ClientOnly>
  )
}

function StoresContent() {
  const gyms = useQuery(api.gyms.getPartners)
  const [q, setQ] = useState("")

  const retail = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return RETAIL_STOCKISTS
    return RETAIL_STOCKISTS.filter((s) =>
      `${s.name} ${s.area} ${s.address}`.toLowerCase().includes(term)
    )
  }, [q])

  const partners = useMemo(() => {
    if (!gyms) return undefined
    const term = q.trim().toLowerCase()
    if (!term) return gyms
    return gyms.filter((g) =>
      `${g.name} ${g.area} ${g.location}`.toLowerCase().includes(term)
    )
  }, [gyms, q])

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <span className="font-mono text-[#AFFF00] text-xs tracking-widest">FIND GIGI</span>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2">
          STOCKISTS <span className="text-[#AFFF00]">& GYMS</span>
        </h1>
        <p className="text-white/60 font-mono text-sm mt-4 max-w-xl">
          Grab a cold can near you, or order online for 1–2 day Nairobi delivery and upcountry shipping.
        </p>

        <label className="mt-8 flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-3 max-w-xl">
          <Search className="w-4 h-4 text-white/40" />
          <span className="sr-only">Search stockists and gyms</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by area — e.g. Westlands, Kilimani…"
            className="flex-1 bg-transparent text-white placeholder:text-white/30 font-mono text-sm focus:outline-none"
          />
        </label>

        <h2 className="text-white font-black text-sm mt-12 mb-4">RETAIL STOCKISTS</h2>
        {retail.length === 0 ? (
          <div className="bg-white/5 border border-white/10 p-6 text-center">
            <p className="text-white font-bold text-sm">No stockists match “{q}”</p>
            <p className="text-white/40 font-mono text-xs mt-1">Try another area — or order online and we&apos;ll deliver.</p>
            <Link href="/shop" className="inline-block mt-4 bg-[#AFFF00] text-[#121212] px-5 py-2.5 font-bold text-xs">
              Shop online
            </Link>
          </div>
        ) : (
          <ul className="grid md:grid-cols-2 gap-3">
            {retail.map((s) => (
              <li key={s.name} className="bg-white/5 border border-white/10 p-5">
                <p className="text-white font-bold text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#AFFF00]" /> {s.name}
                </p>
                <p className="text-white/50 font-mono text-xs mt-2">{s.address}</p>
                <p className="text-white/30 font-mono text-xs mt-1">{s.area} · {s.hours}</p>
              </li>
            ))}
          </ul>
        )}

        <h2 className="text-white font-black text-sm mt-12 mb-4">PARTNER GYMS</h2>
        {partners === undefined ? (
          <div className="flex items-center gap-3 text-white/40 font-mono text-sm" role="status">
            <div className="w-5 h-5 border-2 border-[#AFFF00] border-t-transparent rounded-full animate-spin" /> Loading gyms…
          </div>
        ) : partners.length === 0 ? (
          <p className="text-white/40 font-mono text-sm">No partner gyms match your search yet.</p>
        ) : (
          <ul className="grid md:grid-cols-2 gap-3">
            {partners.map((g) => (
              <li key={g._id} className="bg-white/5 border border-white/10 p-5">
                <p className="text-white font-bold text-sm">{g.name}</p>
                <p className="text-white/50 font-mono text-xs mt-2">{g.location} · {g.area}</p>
                {g.description ? <p className="text-white/30 font-mono text-xs mt-1">{g.description}</p> : null}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 bg-gradient-to-r from-[#AFFF00]/10 to-transparent border border-[#AFFF00]/20 p-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-52">
            <p className="text-white font-bold text-sm">No store nearby?</p>
            <p className="text-white/40 font-mono text-xs mt-1">Order online — Nairobi 1–2 days, upcountry 2–4 days.</p>
          </div>
          <Link href="/shop" className="bg-[#AFFF00] text-[#121212] px-5 py-2.5 font-bold text-xs">
            Shop cases
          </Link>
        </div>
      </div>
    </div>
  )
}

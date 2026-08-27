"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, MapPin, Calendar, Clock, Users } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { Id } from "@/convex/_generated/dataModel"
import { ClientOnly } from "@/components/client-only"

function TastingEventsContent() {
  const events = useQuery(api.events.getByCategory, { category: "tasting" })
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set())

  const markRegistered = (eventId: string) => setRegisteredIds((prev) => new Set(prev).add(eventId))

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
            <TastingEventCard
              key={event._id}
              event={event}
              index={index}
              isRegistered={registeredIds.has(event._id)}
              onRegistered={() => markRegistered(event._id)}
            />
          ))}
          {events?.length === 0 && (
            <div className="col-span-2 text-center py-20">
              <p className="text-white/40 font-mono text-lg">No tasting events scheduled yet. Check back soon!</p>
              <p className="text-white/20 font-mono text-sm mt-2">New events are added weekly across Nairobi.</p>
            </div>
          )}
        </div>

        {events !== undefined && (
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

function TastingEventCard({ event, index, isRegistered, onRegistered }: { event: { _id: Id<"events">; title: string; description: string; date: string; time: string; location: string; status: string; registered: number; capacity: number }; index: number; isRegistered: boolean; onRegistered: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const register = useMutation(api.events.register)
  const full = event.registered >= event.capacity

  const handleRegister = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await register({ eventId: event._id, name, email, phone: phone || undefined })
      onRegistered()
      setOpen(false)
      setName("")
      setEmail("")
      setPhone("")
      toast.success("You're registered! See you there — bring your energy.")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again."
      if (msg.includes("already registered")) {
        onRegistered()
        setOpen(false)
      }
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-[#AFFF00]/30 transition-all duration-500"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-mono text-[#AFFF00] bg-[#AFFF00]/10 px-2 py-1 rounded-full uppercase">{event.status}</span>
        <span className={`font-mono text-xs flex items-center gap-1 ${full ? "text-red-400" : "text-white/40"}`}>
          <Users className="w-3 h-3" />{event.registered}/{event.capacity}
        </span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
      <p className="text-white/60 font-mono text-sm mb-4">{event.description}</p>
      <div className="space-y-2 text-white/40 font-mono text-xs">
        <div className="flex items-center gap-2"><Calendar className="w-3 h-3" />{event.date}</div>
        <div className="flex items-center gap-2"><Clock className="w-3 h-3" />{event.time}</div>
        <div className="flex items-center gap-2"><MapPin className="w-3 h-3" />{event.location}</div>
      </div>
      {!isRegistered && !full && (
        <motion.button className="mt-6 w-full bg-[#AFFF00] text-[#121212] px-4 py-3 rounded-xl font-bold text-sm tracking-wide cursor-pointer" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setOpen(!open)}>
          {open ? "Close Form" : "Register for Free"}
        </motion.button>
      )}
      {isRegistered && <div className="mt-6 w-full bg-[#AFFF00]/10 text-[#AFFF00] px-4 py-3 rounded-xl font-mono text-sm text-center border border-[#AFFF00]/20">✓ You&apos;re registered!</div>}
      {full && !isRegistered && <div className="mt-6 w-full bg-white/5 text-white/40 px-4 py-3 rounded-xl font-mono text-sm text-center">Event fully booked</div>}
      <AnimatePresence>
        {open && !isRegistered && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" onSubmit={(e) => { e.preventDefault(); void handleRegister() }}>
            <div className="pt-4 space-y-3">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name *" disabled={isSubmitting} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address *" disabled={isSubmitting} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" disabled={isSubmitting} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-[#AFFF00] transition-colors" />
              <button type="submit" disabled={isSubmitting || !name.trim() || !email.trim()} className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-colors cursor-pointer">{isSubmitting ? "Registering..." : "Confirm Registration"}</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
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

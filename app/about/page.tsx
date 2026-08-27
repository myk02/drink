import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "GiGi Energy is crafted in Nairobi, Kenya — zero sugar, natural flavours, clean energy. Learn the story behind Kenya's own energy drink.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">OUR STORY</span>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-2">
          MADE IN <span className="text-[#AFFF00]">NAIROBI</span>
        </h1>

        <div className="mt-10 space-y-6 text-white/60 font-mono text-sm leading-relaxed">
          <p>
            GiGi Energy started with a simple question: why should Kenya import its energy? We set out to build a
            better-for-you energy drink in Nairobi — one that fuels ambition without the sugar crash.
          </p>
          <p>
            Every can is zero sugar, carries 75mg of caffeine from natural sources, and uses 100% natural flavours.
            No jitters, no crash — just clean fuel for students grinding late, creators shipping work, athletes
            chasing PRs, and entrepreneurs building something bigger than themselves.
          </p>
          <p>
            We&apos;re proudly Kenyan. Our flavours draw from what grows here — Kenyan citrus, coastal pineapple,
            mangoes and passion fruit, and the ancient baobab superfruit. When you crack open a GiGi, you taste
            Kenya.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-12">
          {[
            { value: "0g", label: "Sugar" },
            { value: "75mg", label: "Natural Caffeine" },
            { value: "100%", label: "Natural Flavours" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 p-6 text-center">
              <p className="text-3xl font-black text-[#AFFF00]">{stat.value}</p>
              <p className="text-white/40 font-mono text-xs mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white/5 border border-white/10 p-8">
          <h2 className="text-xl font-bold text-white mb-3">Fuel your ambition</h2>
          <p className="text-white/60 font-mono text-sm mb-4">
            Want GiGi at your gym, office, or event? Let&apos;s talk.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  )
}

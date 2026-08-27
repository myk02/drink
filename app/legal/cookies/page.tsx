import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How GiGi Energy uses cookies and similar technologies on this website.",
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#AFFF00] font-mono text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <span className="font-mono text-[#AFFF00] text-xs tracking-widest inline-block">LEGAL</span>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mt-2 mb-2">Cookie Policy</h1>
        <p className="text-white/30 font-mono text-xs mb-10">Last updated: August 2026</p>
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-bold text-[#AFFF00] mb-3">1. What Are Cookies</h2>
            <p className="text-white/60 font-mono text-sm leading-relaxed mb-3">
              Cookies are small files stored on your device that help websites function, remember preferences, and
              understand usage.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#AFFF00] mb-3">2. Cookies We Use</h2>
            <ul className="list-disc pl-6 space-y-2 text-white/60 font-mono text-sm leading-relaxed">
              <li><strong className="text-white">Essential cookies</strong> — required for sign-in sessions, security, and checkout to work.</li>
              <li><strong className="text-white">Analytics cookies</strong> — aggregate, anonymised statistics about how visitors use the site (e.g. Vercel Analytics).</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#AFFF00] mb-3">3. Managing Cookies</h2>
            <p className="text-white/60 font-mono text-sm leading-relaxed mb-3">
              You can control or delete cookies through your browser settings. Disabling essential cookies may break
              sign-in and purchasing functionality.
            </p>
          </section>
          <p className="text-white/40 font-mono text-xs pt-4 border-t border-white/10">
            Questions? Reach us via the <Link href="/contact" className="text-[#AFFF00] hover:underline">contact form</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import { ArrowLeft, PackageSearch, ShoppingBag } from "lucide-react"

// Branded 404 — rendered inside the root layout, so nav, cart and footer stay
// available. Without this file Next served its default black-on-white 404.
export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-[#121212] flex items-center">
      <div className="max-w-3xl mx-auto px-6 py-24 w-full">
        <span className="font-mono text-[#AFFF00] text-xs tracking-widest">ERROR 404</span>
        <p className="font-black text-[#AFFF00]/15 text-[7rem] md:text-[10rem] leading-none tracking-tighter mt-2 select-none">
          404
        </p>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter -mt-4">
          THIS PAGE RAN <span className="text-[#AFFF00]">OUT OF ENERGY</span>
        </h1>
        <p className="text-white/50 font-mono text-sm mt-4 max-w-xl leading-relaxed">
          The link is broken or the page has moved. The fridge is still stocked though — pick a path below.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-[#AFFF00] text-[#121212] px-6 py-3.5 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            <ShoppingBag className="w-4 h-4" /> Shop Cases
          </Link>
          <Link
            href="/orders/track"
            className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3.5 font-bold text-sm tracking-wide hover:bg-white/20 transition-colors"
          >
            <PackageSearch className="w-4 h-4" /> Track an Order
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-white/15 text-white/70 px-6 py-3.5 font-bold text-sm tracking-wide hover:text-[#AFFF00] hover:border-[#AFFF00]/40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back Home
          </Link>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 grid sm:grid-cols-3 gap-4 font-mono text-xs">
          {[
            { label: "Flavours", href: "/flavours" },
            { label: "Find in Stores", href: "/stores" },
            { label: "FAQ", href: "/faq" },
            { label: "Events", href: "/events" },
            { label: "Become a Distributor", href: "/distributors" },
            { label: "Contact Us", href: "/contact" },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="text-white/40 hover:text-[#AFFF00] transition-colors">
              {link.label} →
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

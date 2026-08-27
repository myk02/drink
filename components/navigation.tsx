"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLenis } from "lenis/react"
import { Menu, X, ShoppingCart } from "lucide-react"
import { UserButton, useAuth, useClerk } from "@clerk/nextjs"
import { useCart } from "@/components/cart-provider"

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const lenis = useLenis()
  const isHome = pathname === "/"
  const { isSignedIn } = useAuth()
  const { openSignIn, openSignUp } = useClerk()
  const cart = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToHash = (hash: string) => {
    const element = document.querySelector<HTMLElement>(hash)
    if (element && lenis) {
      lenis.scrollTo(element, { offset: -100 })
    }
    setMobileMenuOpen(false)
  }

  // Shared cubic-bezier easing tuple (framer-motion needs the tuple type)
  const EASE: [number, number, number, number] = [0.25, 0.4, 0.25, 1]

  // Distributors & Careers are real pages now; Flavours/Events smooth-scroll
  // to home sections when already on the home page.
  const navLinks = [
    { label: "Home", href: "/", hash: isHome ? "#hero" : null },
    { label: "Flavours", href: isHome ? null : "/flavours", hash: isHome ? "#flavours" : null },
    { label: "Shop", href: "/shop", hash: null },
    { label: "Events", href: isHome ? null : "/events", hash: isHome ? "#creators" : null },
    { label: "Distributors", href: "/distributors", hash: null },
    { label: "Careers", href: "/careers", hash: null },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome ? "bg-[#121212]/95 backdrop-blur-md border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <motion.span
            className="text-2xl font-black tracking-tighter"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span className={scrolled || !isHome ? "text-white" : "text-[#121212]"}>Gi</span>
            <motion.span
              className="text-[#AFFF00]"
              animate={scrolled || !isHome ? {
                textShadow: ["0 0 10px rgba(175,255,0,0.5)", "0 0 20px rgba(175,255,0,0.8)", "0 0 10px rgba(175,255,0,0.5)"],
              } : { textShadow: "none" }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              Gi
            </motion.span>
          </motion.span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item, i) => (
            <Link
              key={item.label}
              href={item.href ?? "/"}
              onClick={(e) => {
                if (item.hash) {
                  e.preventDefault()
                  scrollToHash(item.hash)
                } else {
                  setMobileMenuOpen(false)
                }
              }}
            >
              <motion.span
                className={`text-sm font-medium tracking-wide transition-colors relative cursor-pointer ${
                  scrolled || !isHome ? "text-white/80 hover:text-[#AFFF00]" : "text-[#121212]/80 hover:text-[#121212]"
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#AFFF00] origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3, ease: EASE }}
                />
              </motion.span>
            </Link>
          ))}
          <button
            onClick={cart.openCart}
            className="relative p-2 cursor-pointer"
            aria-label={`Open cart${cart.totalCount > 0 ? ` (${cart.totalCount} items)` : ""}`}
          >
            <ShoppingCart className={scrolled || !isHome ? "text-white/80 hover:text-[#AFFF00]" : "text-[#121212]/80"} />
            {cart.hydrated && cart.totalCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] px-1 bg-[#AFFF00] text-[#121212] text-[10px] font-black flex items-center justify-center"
              >
                {cart.totalCount}
              </motion.span>
            )}
          </button>
          {!isSignedIn ? (
            <>
              <motion.button
                onClick={() => openSignIn()}
                className="bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium tracking-wide hover:bg-white/20 transition-all"
                whileHover={{ scale: 1.05 }}
              >
                Sign In
              </motion.button>
              <motion.button
                onClick={() => openSignUp()}
                className="bg-[#AFFF00] text-[#121212] px-4 py-2 rounded-full font-bold text-sm tracking-wide relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Sign Up</span>
              </motion.button>
            </>
          ) : (
            <UserButton />
          )}
        </div>

        <div className="md:hidden flex items-center gap-1">
          <button
            onClick={cart.openCart}
            className="relative p-2 cursor-pointer"
            aria-label={`Open cart${cart.totalCount > 0 ? ` (${cart.totalCount} items)` : ""}`}
          >
            <ShoppingCart className={scrolled || !isHome ? "text-white/80" : "text-[#121212]/80"} />
            {cart.hydrated && cart.totalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] min-h-[18px] px-1 bg-[#AFFF00] text-[#121212] text-[10px] font-black flex items-center justify-center">
                {cart.totalCount}
              </span>
            )}
          </button>
          <motion.button
            className="p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className={scrolled || !isHome ? "text-white" : "text-[#121212]"} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className={scrolled || !isHome ? "text-white" : "text-[#121212]"} />
              </motion.div>
            )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="md:hidden bg-[#121212]/95 backdrop-blur-md border-t border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-4">
              {navLinks.map((item, i) => (
                <Link
                  key={item.label}
                  href={item.href ?? "/"}
                  onClick={(e) => {
                    if (item.hash) {
                      e.preventDefault()
                      scrollToHash(item.hash)
                    } else {
                      setMobileMenuOpen(false)
                    }
                  }}
                >
                  <motion.span
                    className="block text-white/80 hover:text-[#AFFF00] text-lg font-medium py-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {item.label}
                  </motion.span>
                </Link>
              ))}
              {!isSignedIn ? (
                <>
                  <motion.button
                    onClick={() => openSignIn()}
                    className="w-full bg-white/10 text-white px-6 py-3 rounded-full font-bold text-sm tracking-wide"
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    onClick={() => openSignUp()}
                    className="w-full bg-[#AFFF00] text-[#121212] px-6 py-3 rounded-full font-bold text-sm tracking-wide"
                  >
                    Sign Up
                  </motion.button>
                </>
              ) : (
                <div className="flex items-center justify-center py-2">
                  <UserButton />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

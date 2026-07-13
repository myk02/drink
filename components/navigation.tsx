"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLenis } from "lenis/react"
import { Menu, X } from "lucide-react"
import { UserButton, useAuth, useClerk } from "@clerk/nextjs"

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const lenis = useLenis()
  const isHome = pathname === "/"
  const { isSignedIn } = useAuth()
  const { openSignIn, openSignUp } = useClerk()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    if (!isHome) return
    const element = document.querySelector(id)
    if (element && lenis) {
      lenis.scrollTo(element, { offset: -100 })
    }
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { label: "Home", href: "/", scrollTo: "#hero" },
    { label: "Flavours", href: "/flavours", scrollTo: "#flavours" },
    { label: "Events", href: "/events", scrollTo: "#creators" },
    { label: "Distributors", href: "#distributors", scrollTo: "#distributors" },
    { label: "Careers", href: "#careers", scrollTo: "#careers" },
  ]

  const handleNavClick = (item: typeof navLinks[0]) => {
    if (isHome && item.scrollTo) {
      scrollToSection(item.scrollTo)
    }
    setMobileMenuOpen(false)
  }

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
            item.href.startsWith("#") ? (
              <motion.button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className={`text-sm font-medium tracking-wide transition-colors relative ${
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
                  transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                />
              </motion.button>
            ) : (
              <Link key={item.label} href={item.href}>
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
                    transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                  />
                </motion.span>
              </Link>
            )
          ))}
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
            <UserButton afterSignOutUrl="/" />
          )}
        </div>

        <motion.button
          className="md:hidden p-2"
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
                item.href.startsWith("#") ? (
                  <motion.button
                    key={item.label}
                    onClick={() => handleNavClick(item)}
                    className="block w-full text-left text-white/80 hover:text-[#AFFF00] text-lg font-medium py-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {item.label}
                  </motion.button>
                ) : (
                  <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <motion.span
                      className="block text-white/80 hover:text-[#AFFF00] text-lg font-medium py-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                )
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
                  <UserButton afterSignOutUrl="/" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

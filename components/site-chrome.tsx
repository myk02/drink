"use client"

import { useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useCart } from "@/components/cart-provider"
import { ClientOnly } from "@/components/client-only"

function CartCatalogSync() {
  const products = useQuery(api.products.getActive)
  const { hydrated, reconcile } = useCart()

  useEffect(() => {
    if (!hydrated || !products) return
    reconcile(products)
  }, [hydrated, products, reconcile])

  return null
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-[#AFFF00] focus:text-[#121212] focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
      >
        Skip to content
      </a>
      <Navigation />
      <ClientOnly>
        <CartCatalogSync />
      </ClientOnly>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

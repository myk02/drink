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
      <Navigation />
      <ClientOnly>
        <CartCatalogSync />
      </ClientOnly>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}

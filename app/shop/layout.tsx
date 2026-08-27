import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shop Cases & Packs",
  description:
    "Buy GiGi Energy online in Kenya — 6-pack tasters, flavour 12-packs and mixed 24-can cases. Pay with M-Pesa or card, delivered across Nairobi.",
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}

import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Shop GiGi Energy — Cases & Packs | Zero Sugar 75mg Caffeine",
  description:
    "Buy GiGi Energy online in Kenya — 6-pack tasters (KSh 850), flavour 12-packs (KSh 1600) and mixed 24-case (KSh 3000). Zero sugar, natural flavours. M-Pesa/card via Paystack. 1–2 day Nairobi delivery.",
  keywords: ["GiGi shop", "buy energy drink Nairobi", "GiGi cases", "M-Pesa energy drink", "Kenya energy drink"],
  openGraph: {
    title: "Shop GiGi Energy — Cases & Packs",
    description: "6-pack tasters, 12-packs and mixed 24-case. Zero sugar, 75mg. M-Pesa/card. 1–2 day Nairobi.",
    url: `${SITE_URL}/shop`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/shop` },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}

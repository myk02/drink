import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"
import StoresClient from "./client"

export const metadata: Metadata = {
  title: "Find GiGi Near You — Stockists & Gyms",
  description:
    "Find GiGi Energy near you: Nairobi stockists, partner gyms and upcountry delivery. Search by area, or order online for 1–2 day delivery.",
  alternates: { canonical: `${SITE_URL}/stores` },
  openGraph: {
    title: "Find GiGi Near You",
    description: "Nairobi stockists, partner gyms and upcountry delivery.",
    url: `${SITE_URL}/stores`,
    type: "website",
  },
}

export default function StoresPage() {
  return <StoresClient />
}

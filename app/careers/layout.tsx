import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Careers at GiGi Energy — Nairobi",
  description:
    "Join GiGi Energy in Nairobi — 3 open roles with transparent pay, 5-minute apply, and 48-hour reply. Sales, Operations & Brand. Hybrid and on-site.",
  keywords: ["GiGi careers", "jobs Nairobi", "energy drink jobs Kenya", "sales jobs Nairobi", "operations jobs Nairobi"],
  openGraph: {
    title: "Careers at GiGi Energy — Nairobi",
    description: "3 open roles. Transparent salary bands. 5-minute apply. We reply within 48 hours.",
    url: `${SITE_URL}/careers`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/careers` },
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children
}

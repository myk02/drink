import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Join the Club",
  description:
    "Join GiGi Club — Kenya's energy drink community. Monthly membership with early flavour drops, members events and insider perks. From KSh 300/month.",
  alternates: { canonical: `${SITE_URL}/subscribe` },
  openGraph: {
    title: "Join GiGi Club",
    description:
      "Monthly membership with early flavour drops, members events and insider perks. From KSh 300/month.",
    url: `${SITE_URL}/subscribe`,
    type: "website",
  },
}

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return children
}

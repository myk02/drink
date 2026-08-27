import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Join the Club",
  description:
    "Join GiGi Club — Kenya's energy drink community. Monthly membership with early flavour drops, members events and insider perks. From KSh 300/month.",
}

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return children
}

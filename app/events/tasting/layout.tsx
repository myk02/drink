import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free Tasting Events",
  description:
    "Sample GiGi Energy for free at tasting events across Nairobi. Register online and get 25% off your first order.",
}

export default function TastingLayout({ children }: { children: React.ReactNode }) {
  return children
}

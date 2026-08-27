import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Corporate Orders",
  description:
    "Bring GiGi Energy to your workplace — corporate supply and monthly office subscriptions delivered across Nairobi.",
}

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
  return children
}

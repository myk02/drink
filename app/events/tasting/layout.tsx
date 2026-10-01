import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free Tasting Events",
  description:
    "Browse scheduled GiGi Energy tasting events across Nairobi and reserve a place when registration is open.",
}

export default function TastingLayout({ children }: { children: React.ReactNode }) {
  return children
}

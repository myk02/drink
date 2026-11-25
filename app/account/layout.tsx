import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your GiGi membership, orders and profile.",
  robots: { index: false, follow: false },
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children
}

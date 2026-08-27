import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Support GiGi",
  description:
    "Buy the GiGi team a coffee — one-time support in any amount, or join the club monthly. Powered by M-Pesa and card via Paystack.",
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children
}

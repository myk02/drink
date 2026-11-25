import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout — pay with M-Pesa or card via Paystack.",
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}

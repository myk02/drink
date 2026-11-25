import type { Metadata } from "next"

// Admin is never static: it reads live Convex data and is behind auth.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Operations Desk",
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}

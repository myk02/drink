"use client"

import { useQuery } from "convex/react"
import Link from "next/link"
import { api } from "@/convex/_generated/api"
import { formatKes } from "@/lib/delivery"

const STATUS_STYLES: Record<string, string> = {
  pending: "text-white/50 border-white/20",
  paid: "text-[#AFFF00] border-[#AFFF00]/30",
  packing: "text-sky-300 border-sky-400/30",
  out_for_delivery: "text-amber-300 border-amber-400/30",
  delivered: "text-emerald-300 border-emerald-400/30",
  cancelled: "text-red-400 border-red-400/30",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  packing: "Packing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })
}

// Signed-in order history. Backed by orders.getMyOrders, which matches the
// account's verified email server-side — no email is sent from the browser.
export function OrderHistory() {
  const orders = useQuery(api.orders.getMyOrders)

  return (
    <div className="bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-white font-bold text-sm">Your orders</h3>
        <Link href="/orders/track" className="text-white/40 hover:text-[#AFFF00] font-mono text-xs transition-colors">
          Track by reference →
        </Link>
      </div>
      {orders === undefined ? (
        <p className="text-white/30 font-mono text-xs">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-white/30 font-mono text-xs">
          No orders on this account yet.{" "}
          <Link href="/shop" className="text-[#AFFF00] hover:underline">
            Shop cases
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-white/5">
          {orders.map((o) => (
            <li key={o.reference} className="py-3 flex items-center gap-4 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-white font-mono text-xs truncate">{o.orderNumber}</p>
                <p className="text-white/30 font-mono text-[11px] mt-0.5">
                  {formatDate(o.createdAt)} · {o.itemCount} {o.itemCount === 1 ? "case" : "cases"}
                </p>
              </div>
              <span className={`shrink-0 text-[10px] font-mono uppercase px-2 py-1 border ${STATUS_STYLES[o.status] ?? "border-white/20 text-white/50"}`}>
                {STATUS_LABELS[o.status] ?? o.status}
              </span>
              <span className="shrink-0 text-white/60 font-mono text-xs">{formatKes(o.totalKes)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

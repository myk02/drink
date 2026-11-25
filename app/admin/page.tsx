"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation, useQuery } from "convex/react"
import { SignInButton } from "@clerk/nextjs"
import { api } from "@/convex/_generated/api"
import { formatKes } from "@/lib/delivery"
import type { Id } from "@/convex/_generated/dataModel"
import {
  ArrowLeft,
  Package,
  Inbox,
  Building2,
  CalendarDays,
  Star,
  Boxes,
  Users,
  LayoutDashboard,
  Loader2,
  RefreshCw,
} from "lucide-react"

type TabId = "overview" | "orders" | "inbox" | "applications" | "events" | "reviews" | "catalog" | "members"

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: Package },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "applications", label: "Applications", icon: Building2 },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "catalog", label: "Catalog", icon: Boxes },
  { id: "members", label: "Members", icon: Users },
]

const ORDER_STATUSES = ["pending", "paid", "packing", "out_for_delivery", "delivered", "cancelled"] as const

function date(ms: number): string {
  return new Date(ms).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "2-digit" })
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "good" | "warn" | "bad" | "neutral" }) {
  const tones = {
    good: "border-[#AFFF00]/30 text-[#AFFF00]",
    warn: "border-amber-400/30 text-amber-300",
    bad: "border-red-400/30 text-red-400",
    neutral: "border-white/20 text-white/50",
  }
  return <span className={`inline-block text-[10px] font-mono uppercase px-2 py-0.5 border ${tones[tone]}`}>{children}</span>
}

function Panel({ title, actions, children }: { title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white/5 border border-white/10">
      <header className="flex items-center justify-between gap-4 px-5 py-3 border-b border-white/10">
        <h2 className="text-white font-bold text-sm">{title}</h2>
        {actions}
      </header>
      <div className="p-5 overflow-x-auto">{children}</div>
    </section>
  )
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full text-left font-mono text-xs whitespace-nowrap">
      <thead>
        <tr className="text-white/30">
          {head.map((h) => (
            <th key={h} className="font-normal py-2 pr-6">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="text-white/70">{children}</tbody>
    </table>
  )
}

function Empty({ children }: { children: string }) {
  return <p className="text-white/30 font-mono text-xs py-4">{children}</p>
}

// ---------- Overview ----------

function Overview({ goTo }: { goTo: (t: TabId) => void }) {
  const stats = useQuery(api.admin.stats)
  if (!stats) return <Spinner />
  const cards: Array<{ label: string; value: string | number; tab?: TabId; note?: string }> = [
    { label: "Revenue (paid)", value: formatKes(stats.revenueKes), note: `${stats.paidOrderCount} orders` },
    { label: "Open orders", value: stats.openOrders, tab: "orders", note: "paid → out for delivery" },
    { label: "Awaiting payment", value: stats.awaitingPayment, tab: "orders" },
    { label: "New enquiries", value: stats.unresolvedInquiries, tab: "inbox" },
    { label: "Distributor leads", value: stats.newDistributors, tab: "applications" },
    { label: "Career applications", value: stats.newCareers, tab: "applications" },
    { label: "Active members", value: stats.activeMembers, tab: "members", note: stats.pastDueMembers ? `${stats.pastDueMembers} past due` : undefined },
    { label: "Newsletter (confirmed)", value: stats.confirmedSubscribers, tab: "members" },
    { label: "Reviews to approve", value: stats.pendingReviews, tab: "reviews" },
    { label: "Event registrations", value: stats.registrations, tab: "events" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => c.tab && goTo(c.tab)}
            className={`text-left bg-white/5 border border-white/10 p-4 ${c.tab ? "hover:border-[#AFFF00]/40 transition-colors cursor-pointer" : ""}`}
          >
            <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">{c.label}</p>
            <p className="text-white text-2xl font-black tracking-tight mt-2">{c.value}</p>
            {c.note && <p className="text-white/30 font-mono text-[10px] mt-1">{c.note}</p>}
          </button>
        ))}
      </div>

      {stats.lowStock.length > 0 && (
        <Panel title="Low stock">
          <ul className="space-y-1.5">
            {stats.lowStock.map((p) => (
              <li key={p._id} className="flex items-center justify-between font-mono text-xs gap-4">
                <span className="text-white/70">{p.name}</span>
                <Badge tone={p.stock === 0 ? "bad" : "warn"}>{p.stock === 0 ? "out of stock" : `${p.stock} left`}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  )
}

// ---------- Orders ----------

function Orders() {
  const [status, setStatus] = useState<(typeof ORDER_STATUSES)[number] | "all">("all")
  const orders = useQuery(api.admin.listOrders, status === "all" ? {} : { status })
  const update = useMutation(api.admin.updateOrderStatus)
  const [busy, setBusy] = useState<string | null>(null)

  const change = async (orderId: Id<"orders">, next: (typeof ORDER_STATUSES)[number]) => {
    setBusy(orderId)
    try {
      await update({ orderId, status: next })
    } finally {
      setBusy(null)
    }
  }

  return (
    <Panel
      title="Orders"
      actions={
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="bg-[#121212] border border-white/15 text-white/70 font-mono text-xs px-2 py-1"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      }
    >
      {!orders ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <Empty>No orders yet.</Empty>
      ) : (
        <Table head={["Order", "Customer", "Zone", "Total", "Placed", "Status", "Set status"]}>
          {orders.map((o) => (
            <tr key={o._id} className="border-t border-white/5">
              <td className="py-2.5 pr-6 text-white">{o.orderNumber}</td>
              <td className="py-2.5 pr-6">
                <span className="text-white/80">{o.customerName}</span>
                <span className="block text-white/30">{o.email}</span>
              </td>
              <td className="py-2.5 pr-6">{o.deliveryZone}</td>
              <td className="py-2.5 pr-6">{formatKes(o.totalKes)}</td>
              <td className="py-2.5 pr-6">{date(o.createdAt)}</td>
              <td className="py-2.5 pr-6">
                <Badge tone={o.status === "delivered" ? "good" : o.status === "cancelled" ? "bad" : o.status === "pending" ? "warn" : "neutral"}>
                  {o.status.replace(/_/g, " ")}
                </Badge>
              </td>
              <td className="py-2.5">
                <select
                  value={o.status}
                  disabled={busy === o._id}
                  onChange={(e) => void change(o._id, e.target.value as (typeof ORDER_STATUSES)[number])}
                  className="bg-[#121212] border border-white/15 text-white/70 text-xs px-2 py-1 disabled:opacity-40"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </Panel>
  )
}

// ---------- Inbox ----------

function InboxTab() {
  const inquiries = useQuery(api.admin.listInquiries)
  const resolve = useMutation(api.admin.resolveInquiry)
  const [open, setOpen] = useState(false)

  return (
    <Panel
      title="Enquiries"
      actions={
        <button onClick={() => setOpen((v) => !v)} className="text-white/40 hover:text-white font-mono text-xs cursor-pointer">
          {open ? "Hide resolved" : "Show all"}
        </button>
      }
    >
      {!inquiries ? (
        <Spinner />
      ) : (
        <ul className="space-y-3">
          {inquiries
            .filter((i) => open || !i.resolved)
            .map((i) => (
              <li key={i._id} className="border border-white/10 p-4">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge>{i.category}</Badge>
                    <span className="text-white text-xs font-mono truncate">{i.name}</span>
                    <span className="text-white/30 text-[11px] font-mono truncate">{i.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/25 font-mono text-[10px]">{date(i.createdAt)}</span>
                    <button
                      onClick={() => void resolve({ inquiryId: i._id, resolved: !i.resolved })}
                      className={`font-mono text-[10px] uppercase px-2 py-1 border cursor-pointer ${i.resolved ? "border-white/15 text-white/40" : "border-[#AFFF00]/40 text-[#AFFF00] hover:bg-[#AFFF00]/10"}`}
                    >
                      {i.resolved ? "resolved" : "mark resolved"}
                    </button>
                  </div>
                </div>
                <p className="text-white/60 font-mono text-xs leading-relaxed mt-3 whitespace-pre-wrap">{i.message}</p>
                {i.phone && <p className="text-white/30 font-mono text-[11px] mt-2">{i.phone}</p>}
              </li>
            ))}
          {inquiries.filter((i) => open || !i.resolved).length === 0 && <Empty>Inbox is clear.</Empty>}
        </ul>
      )}
    </Panel>
  )
}

// ---------- Applications ----------

function Applications() {
  const distributors = useQuery(api.admin.listDistributorApplications)
  const careers = useQuery(api.admin.listCareerApplications)
  const setDistributor = useMutation(api.admin.setDistributorStatus)
  const setCareer = useMutation(api.admin.setCareerStatus)

  return (
    <div className="space-y-6">
      <Panel title="Distributor applications">
        {!distributors ? (
          <Spinner />
        ) : distributors.length === 0 ? (
          <Empty>No applications yet.</Empty>
        ) : (
          <Table head={["Business", "Contact", "Type", "County", "Volume", "Status"]}>
            {distributors.map((d) => (
              <tr key={d._id} className="border-t border-white/5 align-top">
                <td className="py-2.5 pr-6 text-white">
                  {d.businessName}
                  {d.message && <span className="block text-white/30 max-w-[280px] whitespace-normal">{d.message}</span>}
                </td>
                <td className="py-2.5 pr-6">
                  {d.contactName}
                  <span className="block text-white/30">{d.email}</span>
                  <span className="block text-white/30">{d.phone}</span>
                </td>
                <td className="py-2.5 pr-6">{d.businessType.replace(/_/g, " ")}</td>
                <td className="py-2.5 pr-6">{d.county}</td>
                <td className="py-2.5 pr-6">{d.weeklyVolume}</td>
                <td className="py-2.5">
                  <select
                    value={d.status}
                    onChange={(e) => void setDistributor({ applicationId: d._id, status: e.target.value as "new" | "reviewing" | "approved" | "rejected" })}
                    className="bg-[#121212] border border-white/15 text-white/70 text-xs px-2 py-1"
                  >
                    {["new", "reviewing", "approved", "rejected"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel title="Career applications">
        {!careers ? (
          <Spinner />
        ) : careers.length === 0 ? (
          <Empty>No applications yet.</Empty>
        ) : (
          <Table head={["Role", "Candidate", "Portfolio", "Status"]}>
            {careers.map((c) => (
              <tr key={c._id} className="border-t border-white/5 align-top">
                <td className="py-2.5 pr-6 text-white">{c.roleTitle}</td>
                <td className="py-2.5 pr-6">
                  {c.name}
                  <span className="block text-white/30">{c.email}</span>
                  {c.phone && <span className="block text-white/30">{c.phone}</span>}
                </td>
                <td className="py-2.5 pr-6">
                  {c.portfolioUrl ? (
                    <a href={c.portfolioUrl} target="_blank" rel="noreferrer" className="text-[#AFFF00] hover:underline">Portfolio</a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-2.5">
                  <select
                    value={c.status}
                    onChange={(e) => void setCareer({ applicationId: c._id, status: e.target.value as "new" | "reviewing" | "shortlisted" | "rejected" | "hired" })}
                    className="bg-[#121212] border border-white/15 text-white/70 text-xs px-2 py-1"
                  >
                    {["new", "reviewing", "shortlisted", "rejected", "hired"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  )
}

// ---------- Events ----------

function Events() {
  const events = useQuery(api.admin.listEvents)
  const setStatus = useMutation(api.admin.setEventStatus)
  const [selected, setSelected] = useState<Id<"events"> | null>(null)
  const registrations = useQuery(
    api.admin.listRegistrations,
    selected ? { eventId: selected } : "skip"
  )

  return (
    <div className="space-y-6">
      <Panel title="Events">
        {!events ? (
          <Spinner />
        ) : (
          <Table head={["Event", "Date", "Category", "Registered", "Status"]}>
            {events.map((e) => (
              <tr key={e._id} className="border-t border-white/5">
                <td className="py-2.5 pr-6">
                  <button onClick={() => setSelected(e._id)} className="text-white hover:text-[#AFFF00] text-left cursor-pointer">
                    {e.title}
                  </button>
                </td>
                <td className="py-2.5 pr-6">{e.date}</td>
                <td className="py-2.5 pr-6">{e.category}</td>
                <td className="py-2.5 pr-6">{e.registrationCount} / {e.capacity}</td>
                <td className="py-2.5">
                  <select
                    value={e.status}
                    onChange={(ev) => void setStatus({ eventId: e._id, status: ev.target.value as "upcoming" | "ongoing" | "completed" })}
                    className="bg-[#121212] border border-white/15 text-white/70 text-xs px-2 py-1"
                  >
                    {["upcoming", "ongoing", "completed"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      {selected && (
        <Panel
          title="Registrations"
          actions={
            <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white font-mono text-xs cursor-pointer">close</button>
          }
        >
          {!registrations ? (
            <Spinner />
          ) : registrations.length === 0 ? (
            <Empty>No registrations for this event.</Empty>
          ) : (
            <Table head={["Name", "Email", "Phone", "Registered"]}>
              {registrations.map((r) => (
                <tr key={r._id} className="border-t border-white/5">
                  <td className="py-2 pr-6 text-white">{r.name}</td>
                  <td className="py-2 pr-6">{r.email}</td>
                  <td className="py-2 pr-6">{r.phone ?? "—"}</td>
                  <td className="py-2">{date(r.registeredAt)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      )}
    </div>
  )
}

// ---------- Reviews ----------

function Reviews() {
  const [pendingOnly, setPendingOnly] = useState(false)
  const reviews = useQuery(api.admin.listReviews, { pendingOnly })
  const setApproval = useMutation(api.admin.setReviewApproval)
  const remove = useMutation(api.admin.deleteReview)

  return (
    <Panel
      title="Product reviews"
      actions={
        <button onClick={() => setPendingOnly((v) => !v)} className="text-white/40 hover:text-white font-mono text-xs cursor-pointer">
          {pendingOnly ? "Show all" : "Show pending only"}
        </button>
      }
    >
      {!reviews ? (
        <Spinner />
      ) : reviews.length === 0 ? (
        <Empty>No reviews here.</Empty>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r._id} className="border border-white/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#AFFF00] font-mono text-xs">{"★".repeat(r.rating)}</span>
                  <span className="text-white text-xs font-mono">{r.name}</span>
                  <span className="text-white/30 text-[11px] font-mono">{r.productSlug}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={r.isApproved ? "good" : "warn"}>{r.isApproved ? "live" : "pending"}</Badge>
                  <button
                    onClick={() => void setApproval({ reviewId: r._id, isApproved: !r.isApproved })}
                    className="font-mono text-[10px] uppercase px-2 py-1 border border-white/20 text-white/60 hover:border-[#AFFF00]/50 hover:text-[#AFFF00] cursor-pointer"
                  >
                    {r.isApproved ? "unpublish" : "approve"}
                  </button>
                  <button
                    onClick={() => void remove({ reviewId: r._id })}
                    className="font-mono text-[10px] uppercase px-2 py-1 border border-red-400/30 text-red-400/80 hover:bg-red-500/10 cursor-pointer"
                  >
                    delete
                  </button>
                </div>
              </div>
              {r.title && <p className="text-white text-sm mt-2">{r.title}</p>}
              <p className="text-white/50 font-mono text-xs mt-1 whitespace-pre-wrap">{r.body}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

// ---------- Catalog ----------

function Catalog() {
  const products = useQuery(api.admin.listProducts)
  const setStock = useMutation(api.admin.setProductStock)
  const setActive = useMutation(api.admin.setProductActive)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  return (
    <Panel title="Catalog & stock">
      {!products ? (
        <Spinner />
      ) : (
        <Table head={["Product", "Price", "Tracked stock", "LiveActions"]}>
          {products.map((p) => {
            const draft = drafts[p._id] ?? (p.stock === undefined ? "" : String(p.stock))
            return (
              <tr key={p._id} className="border-t border-white/5">
                <td className="py-2.5 pr-6 text-white">
                  {p.name}
                  <span className="block text-white/30">{p.slug}</span>
                </td>
                <td className="py-2.5 pr-6">{formatKes(p.priceKes)}</td>
                <td className="py-2.5 pr-6">
                  <div className="flex items-center gap-2">
                    <input
                      value={draft}
                      onChange={(e) => setDrafts((d) => ({ ...d, [p._id]: e.target.value }))}
                      placeholder="untracked"
                      inputMode="numeric"
                      className="w-24 bg-[#121212] border border-white/15 text-white/80 px-2 py-1"
                    />
                    <button
                      onClick={() => {
                        const raw = draft.trim()
                        const value = raw === "" ? null : Number(raw)
                        if (value !== null && (!Number.isInteger(value) || value < 0)) return
                        void setStock({ productId: p._id, stock: value })
                      }}
                      className="text-[10px] uppercase px-2 py-1 border border-white/20 text-white/60 hover:border-[#AFFF00]/50 hover:text-[#AFFF00] cursor-pointer"
                    >
                      save
                    </button>
                  </div>
                  {p.stock === 0 && <span className="text-red-400 text-[10px] font-mono">out of stock</span>}
                </td>
                <td className="py-2.5">
                  <button
                    onClick={() => void setActive({ productId: p._id, isActive: !p.isActive })}
                    className={`text-[10px] uppercase px-2 py-1 border cursor-pointer ${p.isActive ? "border-[#AFFF00]/40 text-[#AFFF00]" : "border-white/20 text-white/40"}`}
                  >
                    {p.isActive ? "live" : "hidden"}
                  </button>
                </td>
              </tr>
            )
          })}
        </Table>
      )}
    </Panel>
  )
}

// ---------- Members ----------

function Members() {
  const subs = useQuery(api.admin.listSubscriptions)
  const newsletter = useQuery(api.admin.listNewsletter)

  return (
    <div className="space-y-6">
      <Panel title="GiGi Club members">
        {!subs ? (
          <Spinner />
        ) : subs.length === 0 ? (
          <Empty>No members yet.</Empty>
        ) : (
          <Table head={["Email", "Plan", "Status", "Channel", "Next billing"]}>
            {subs.map((s) => (
              <tr key={s._id} className="border-t border-white/5">
                <td className="py-2 pr-6 text-white">{s.email}</td>
                <td className="py-2 pr-6">{s.planSlug}</td>
                <td className="py-2 pr-6">
                  <Badge tone={s.status === "active" ? "good" : s.status === "past_due" ? "warn" : s.status === "cancelled" ? "bad" : "neutral"}>
                    {s.status.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="py-2 pr-6">{s.paymentChannel.replace(/_/g, " ")}</td>
                <td className="py-2">{s.nextBillingDate ? date(s.nextBillingDate) : "—"}</td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel title="Newsletter">
        {!newsletter ? (
          <Spinner />
        ) : newsletter.length === 0 ? (
          <Empty>No subscribers yet.</Empty>
        ) : (
          <Table head={["Email", "State", "Signed up"]}>
            {newsletter.map((n) => (
              <tr key={n._id} className="border-t border-white/5">
                <td className="py-2 pr-6 text-white">{n.email}</td>
                <td className="py-2 pr-6">
                  <Badge tone={n.isActive ? "good" : "neutral"}>{n.isActive ? "confirmed" : n.unsubscribedAt ? "unsubscribed" : "pending"}</Badge>
                </td>
                <td className="py-2">{date(n.subscribedAt)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center gap-2 py-6 text-white/40 font-mono text-xs">
      <Loader2 className="w-4 h-4 animate-spin text-[#AFFF00]" /> Loading…
    </div>
  )
}

// ---------- Page ----------

export default function AdminPage() {
  const role = useQuery(api.admin.getMyRole)
  const [tab, setTab] = useState<TabId>("overview")

  if (role === undefined) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#AFFF00] animate-spin" />
      </div>
    )
  }

  if (role === null) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 p-10 text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">Admin access</h1>
          <p className="text-white/50 font-mono text-sm leading-relaxed mt-3">
            Sign in with an account that has the admin role. To grant access, run{" "}
            <code className="text-[#AFFF00] text-[11px]">npx convex run admin:promote</code> from the project.
          </p>
          <div className="mt-8">
            <SignInButton mode="modal">
              <button className="bg-[#AFFF00] text-[#121212] px-6 py-3 font-bold text-sm tracking-wide hover:opacity-90 transition-opacity cursor-pointer">
                Sign in
              </button>
            </SignInButton>
          </div>
          <Link href="/" className="mt-6 inline-block text-white/40 hover:text-white font-mono text-xs transition-colors">
            Back to the site
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-[#AFFF00] font-mono text-xs mb-4 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Site
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
              OPERATIONS <span className="text-[#AFFF00]">DESK</span>
            </h1>
            <p className="text-white/30 font-mono text-xs mt-2">
              {role.email ?? role.name ?? "admin"} · signed in
            </p>
          </div>
          <Link href="/admin" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 text-white/50 hover:text-white font-mono text-xs transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Link>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-white/10 mb-6">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 font-mono text-xs whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  active ? "border-[#AFFF00] text-[#AFFF00]" : "border-transparent text-white/40 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            )
          })}
        </div>

        {tab === "overview" && <Overview goTo={setTab} />}
        {tab === "orders" && <Orders />}
        {tab === "inbox" && <InboxTab />}
        {tab === "applications" && <Applications />}
        {tab === "events" && <Events />}
        {tab === "reviews" && <Reviews />}
        {tab === "catalog" && <Catalog />}
        {tab === "members" && <Members />}
      </div>
    </div>
  )
}

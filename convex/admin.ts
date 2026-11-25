import { v } from "convex/values"
import { internalMutation, mutation, query } from "./_generated/server"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"

type Ctx = QueryCtx | MutationCtx

// Throws unless the caller is a signed-in admin. Use at the top of every
// admin mutation/query.
export async function requireAdmin(ctx: Ctx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Sign in required.")
  const user = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).first()
  if (!user || user.role !== "admin") throw new Error("Admin access required.")
  return user
}

// UI gate: current caller's role (null when signed out / not provisioned).
export const getMyRole = query({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await requireAdmin(ctx)
      return { role: user.role, name: user.name ?? null, email: user.email ?? null }
    } catch {
      return null
    }
  },
})

// One-off promotion run from the CLI (internal: NOT callable from the browser):
//   npx convex run admin:promote '{"email":"you@example.com","secret":"..."}'
export const promote = internalMutation({
  args: { email: v.string(), secret: v.string() },
  handler: async (ctx, args) => {
    // CLI-invoked mutations have no user identity; guard with the Clerk
    // signing secret value so this can't be called from the browser.
    const expected = process.env.CLERK_SECRET_KEY ?? ""
    if (!expected || args.secret !== expected) throw new Error("Invalid secret.")

    const email = args.email.trim().toLowerCase()
    const users = await ctx.db.query("users").collect()
    const target = users.find((u) => u.email?.trim().toLowerCase() === email)
    if (!target) throw new Error(`No user record found for ${email}. They must sign in once first (webhook creates the record).`)
    await ctx.db.patch(target._id, { role: "admin" })
    return { promoted: target.email ?? email }
  },
})

// ==================== dashboard ====================

export const stats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    const [orders, inquiries, distributors, careers, products, registrations, reviews, subs, newsletter] = await Promise.all([
      ctx.db.query("orders").collect(),
      ctx.db.query("inquiries").collect(),
      ctx.db.query("distributorApplications").collect(),
      ctx.db.query("careerApplications").collect(),
      ctx.db.query("products").collect(),
      ctx.db.query("registrations").collect(),
      ctx.db.query("productReviews").collect(),
      ctx.db.query("subscriptions").collect(),
      ctx.db.query("newsletterSubscribers").collect(),
    ])

    const paid = orders.filter((o) => o.status !== "pending" && o.status !== "cancelled")
    const revenueKes = paid.reduce((sum, o) => sum + o.totalKes, 0)
    const openOrders = orders.filter((o) => o.status === "paid" || o.status === "packing" || o.status === "out_for_delivery").length

    return {
      revenueKes,
      paidOrderCount: paid.length,
      openOrders,
      awaitingPayment: orders.filter((o) => o.status === "pending").length,
      unresolvedInquiries: inquiries.filter((i) => !i.resolved).length,
      newDistributors: distributors.filter((d) => d.status === "new").length,
      newCareers: careers.filter((c) => c.status === "new").length,
      activeMembers: subs.filter((s) => s.status === "active").length,
      pastDueMembers: subs.filter((s) => s.status === "past_due").length,
      confirmedSubscribers: newsletter.filter((n) => n.isActive).length,
      pendingReviews: reviews.filter((r) => !r.isApproved).length,
      lowStock: products
        .filter((p) => p.stock !== undefined && p.stock <= 6)
        .map((p) => ({ _id: p._id, name: p.name, stock: p.stock ?? 0 })),
      registrations: registrations.length,
    }
  },
})

// ==================== orders ====================

const ORDER_STATUSES = ["pending", "paid", "packing", "out_for_delivery", "delivered", "cancelled"] as const

export const listOrders = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("packing"),
        v.literal("out_for_delivery"),
        v.literal("delivered"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const rows = await ctx.db.query("orders").order("desc").collect()
    const filtered = args.status ? rows.filter((o) => o.status === args.status) : rows
    return filtered.slice(0, 200)
  },
})

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("packing"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    if (!ORDER_STATUSES.includes(args.status)) throw new Error("Invalid status")
    const order = await ctx.db.get(args.orderId)
    if (!order) throw new Error("Order not found")
    await ctx.db.patch(args.orderId, {
      status: args.status,
      ...(args.status === "paid" && !order.paidAt ? { paidAt: Date.now() } : {}),
    })
    return { ok: true }
  },
})

// ==================== enquiries / applications ====================

export const listInquiries = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    const rows = await ctx.db.query("inquiries").order("desc").collect()
    return rows.slice(0, 200)
  },
})

export const resolveInquiry = mutation({
  args: { inquiryId: v.id("inquiries"), resolved: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    await ctx.db.patch(args.inquiryId, { resolved: args.resolved })
    return { ok: true }
  },
})

export const listDistributorApplications = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return (await ctx.db.query("distributorApplications").order("desc").collect()).slice(0, 200)
  },
})

export const setDistributorStatus = mutation({
  args: {
    applicationId: v.id("distributorApplications"),
    status: v.union(v.literal("new"), v.literal("reviewing"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    await ctx.db.patch(args.applicationId, { status: args.status })
    return { ok: true }
  },
})

export const listCareerApplications = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return (await ctx.db.query("careerApplications").order("desc").collect()).slice(0, 200)
  },
})

export const setCareerStatus = mutation({
  args: {
    applicationId: v.id("careerApplications"),
    status: v.union(
      v.literal("new"),
      v.literal("reviewing"),
      v.literal("shortlisted"),
      v.literal("rejected"),
      v.literal("hired")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    await ctx.db.patch(args.applicationId, { status: args.status })
    return { ok: true }
  },
})

// ==================== events ====================

export const listEvents = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    const events = await ctx.db.query("events").collect()
    const registrations = await ctx.db.query("registrations").collect()
    return events
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map((e) => ({
        ...e,
        registrationCount: registrations.filter((r) => r.eventId === e._id).length,
      }))
  },
})

export const setEventStatus = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(v.literal("upcoming"), v.literal("ongoing"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    await ctx.db.patch(args.eventId, { status: args.status })
    return { ok: true }
  },
})

export const listRegistrations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    return await ctx.db
      .query("registrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .collect()
  },
})

// ==================== reviews ====================

export const listReviews = query({
  args: { pendingOnly: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const rows = await ctx.db.query("productReviews").order("desc").collect()
    return (args.pendingOnly ? rows.filter((r) => !r.isApproved) : rows).slice(0, 200)
  },
})

export const setReviewApproval = mutation({
  args: { reviewId: v.id("productReviews"), isApproved: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    await ctx.db.patch(args.reviewId, { isApproved: args.isApproved })
    return { ok: true }
  },
})

export const deleteReview = mutation({
  args: { reviewId: v.id("productReviews") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    await ctx.db.delete(args.reviewId)
    return { ok: true }
  },
})

// ==================== catalog / inventory ====================

export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    const rows = await ctx.db.query("products").collect()
    return rows.sort((a, b) => a.sortOrder - b.sortOrder)
  },
})

export const setProductStock = mutation({
  args: { productId: v.id("products"), stock: v.union(v.number(), v.null()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const product = await ctx.db.get(args.productId)
    if (!product) throw new Error("Product not found")
    if (args.stock !== null && (!Number.isInteger(args.stock) || args.stock < 0)) {
      throw new Error("Stock must be a whole number of 0 or more")
    }
    await ctx.db.patch(args.productId, { stock: args.stock === null ? undefined : args.stock })
    return { ok: true }
  },
})

export const setProductActive = mutation({
  args: { productId: v.id("products"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    await ctx.db.patch(args.productId, { isActive: args.isActive })
    return { ok: true }
  },
})

// ==================== members / subscribers ====================

export const listSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return (await ctx.db.query("subscriptions").order("desc").collect()).slice(0, 200)
  },
})

export const listNewsletter = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return (await ctx.db.query("newsletterSubscribers").order("desc").collect()).slice(0, 500)
  },
})

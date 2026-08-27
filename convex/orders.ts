import { v } from "convex/values"
import { internalMutation, query } from "./_generated/server"
import { requireAdmin } from "./admin"

export const createPendingOrder = internalMutation({
  args: {
    orderNumber: v.string(),
    reference: v.string(),
    email: v.string(),
    customerName: v.string(),
    phone: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        canCount: v.number(),
        unitPriceKes: v.number(),
        quantity: v.number(),
      })
    ),
    subtotalKes: v.number(),
    memberDiscountKes: v.optional(v.number()),
    deliveryFeeKes: v.number(),
    totalKes: v.number(),
    deliveryZone: v.string(),
    deliveryAddress: v.string(),
    deliveryNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    })
  },
})

// Idempotent pending -> paid transition. Called ONLY from the Paystack
// webhook httpAction and the verify action (both signature-checked).
export const markPaidByReference = internalMutation({
  args: {
    reference: v.string(),
    amountPaidSubunit: v.number(), // KES cents from Paystack
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first()
    if (!order) return { outcome: "unknown_order" as const }

    if (order.status === "paid") return { outcome: "already_paid" as const }

    if (args.amountPaidSubunit !== order.totalKes * 100) {
      // Amount mismatch: do NOT mark paid. Flag for manual review.
      await ctx.db.patch(order._id, { paystackStatus: `amount_mismatch:${args.amountPaidSubunit}` })
      return { outcome: "amount_mismatch" as const }
    }

    await ctx.db.patch(order._id, {
      status: "paid",
      paystackStatus: "success",
      paidAt: Date.now(),
    })
    return { outcome: "paid" as const }
  },
})

export const markCancelledByReference = internalMutation({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first()
    if (!order || order.status !== "pending") return
    await ctx.db.patch(order._id, { status: "cancelled", paystackStatus: "abandoned" })
  },
})

// Customer-facing lookup: requires BOTH reference and matching email,
// returns a sanitized projection only.
export const getForCustomer = query({
  args: { reference: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase()
    const order = await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first()
    if (!order || order.email !== email) return null
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, canCount: i.canCount })),
      subtotalKes: order.subtotalKes,
      deliveryFeeKes: order.deliveryFeeKes,
      totalKes: order.totalKes,
      deliveryZone: order.deliveryZone,
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt,
      paidAt: order.paidAt ?? null,
    }
  },
})

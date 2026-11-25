import { v } from "convex/values"
import { internalMutation, internalQuery, query } from "./_generated/server"
import { internal } from "./_generated/api"
import { orderReceiptEmail } from "../lib/email-templates"

const SITE_URL = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://giflavours.vercel.app").replace(/\/$/, "")

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

    // Receipt is sent from the webhook, not the browser, so a customer who
    // closes the tab still gets proof of payment. No-ops if email is not set up.
    const receipt = orderReceiptEmail({
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPriceKes: i.unitPriceKes,
      })),
      subtotalKes: order.subtotalKes,
      memberDiscountKes: order.memberDiscountKes,
      deliveryFeeKes: order.deliveryFeeKes,
      totalKes: order.totalKes,
      deliveryZone: order.deliveryZone,
      deliveryAddress: order.deliveryAddress,
      trackUrl: `${SITE_URL}/orders/track?reference=${encodeURIComponent(order.reference)}`,
    })
    await ctx.scheduler.runAfter(0, internal.email.send, {
      to: order.email,
      subject: receipt.subject,
      html: receipt.html,
      text: receipt.text,
    })

    // Decrement stock for ordered products that track inventory. Skips docs
    // that were deleted between order creation and payment.
    for (const item of order.items) {
      const product = await ctx.db.get(item.productId)
      if (!product || product.stock === undefined) continue
      await ctx.db.patch(product._id, {
        stock: Math.max(0, product.stock - item.quantity),
      })
    }

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
export const getByIdInternal = internalQuery({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
})

// Signed-in order history for /account — matched on the account's verified
// email, never on a client-supplied one.
export const getMyOrders = query({
  args: {},
  returns: v.array(
    v.object({
      orderNumber: v.string(),
      reference: v.string(),
      status: v.string(),
      totalKes: v.number(),
      itemCount: v.number(),
      createdAt: v.number(),
      paidAt: v.union(v.number(), v.null()),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first()
    const email = (user?.email ?? (identity.emailVerified ? identity.email : undefined))
      ?.trim()
      .toLowerCase()
    if (!email) return []

    const rows = await ctx.db
      .query("orders")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect()
    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 25)
      .map((o) => ({
        orderNumber: o.orderNumber,
        reference: o.reference,
        status: o.status,
        totalKes: o.totalKes,
        itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
        createdAt: o.createdAt,
        paidAt: o.paidAt ?? null,
      }))
  },
})

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
      memberDiscountKes: order.memberDiscountKes ?? null,
      deliveryFeeKes: order.deliveryFeeKes,
      totalKes: order.totalKes,
      deliveryZone: order.deliveryZone,
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt,
      paidAt: order.paidAt ?? null,
    }
  },
})

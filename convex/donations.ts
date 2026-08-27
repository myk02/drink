import { v } from "convex/values"
import { internalMutation, query } from "./_generated/server"

export const createPending = internalMutation({
  args: {
    reference: v.string(),
    email: v.string(),
    donorName: v.optional(v.string()),
    amountKes: v.number(),
    message: v.optional(v.string()),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("donations", {
      ...args,
      email: args.email.trim().toLowerCase(),
      status: "pending",
      createdAt: Date.now(),
    })
  },
})

export const markPaidByReference = internalMutation({
  args: {
    reference: v.string(),
    amountPaidSubunit: v.number(),
    donorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first()
    if (!donation || donation.status === "success") return { outcome: "ok" as const }

    // Guard against tampered amounts
    if (args.amountPaidSubunit !== donation.amountKes * 100) return { outcome: "amount_mismatch" as const }

    await ctx.db.patch(donation._id, {
      status: "success",
      paidAt: Date.now(),
      donorName:
        donation.isAnonymous ? undefined : args.donorName?.trim() || donation.donorName,
    })
    return { outcome: "paid" as const }
  },
})

export const getByReferenceForSupporter = query({
  args: { reference: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first()
    if (!donation || donation.email !== args.email.trim().toLowerCase()) return null
    return { status: donation.status, amountKes: donation.amountKes }
  },
})

// Public "thank you" wall — successful donations only, sanitized fields
export const getWall = query({
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("donations")
      .withIndex("by_status", (q) => q.eq("status", "success"))
      .collect()
    rows.sort((a, b) => (b.paidAt ?? b.createdAt) - (a.paidAt ?? a.createdAt))
    return rows.slice(0, 12).map((d) => ({
      _id: d._id,
      name: d.isAnonymous ? "Anonymous" : d.donorName?.trim() || "A friend of GiGi",
      amountKes: d.amountKes,
      message: d.message?.slice(0, 140) ?? null,
      paidAt: d.paidAt ?? d.createdAt,
    }))
  },
})

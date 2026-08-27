import { v } from "convex/values"
import { internalMutation, query } from "./_generated/server"

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("plans")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()
  },
})

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plans")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first()
  },
})

export const savePaystackPlanCode = internalMutation({
  args: { slug: v.string(), paystackPlanCode: v.string() },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("plans")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first()
    if (!plan) throw new Error(`Plan ${args.slug} not found`)
    await ctx.db.patch(plan._id, { paystackPlanCode: args.paystackPlanCode })
  },
})

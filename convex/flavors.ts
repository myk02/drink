import { v } from "convex/values"
import { query } from "./_generated/server"

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("flavors").withIndex("by_order").collect()
  },
})

export const getAvailable = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("flavors").withIndex("by_order").filter((q) => q.eq(q.field("isAvailable"), true)).collect()
  },
})

export const getById = query({
  args: { id: v.id("flavors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

import { v } from "convex/values"
import { query } from "./_generated/server"

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("gyms").collect()
  },
})

export const getPartners = query({
  handler: async (ctx) => {
    return await ctx.db.query("gyms").filter((q) => q.eq(q.field("isPartner"), true)).collect()
  },
})

export const getByArea = query({
  args: { area: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("gyms").withIndex("by_area", (q) => q.eq("area", args.area)).collect()
  },
})

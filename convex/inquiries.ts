import { v } from "convex/values"
import { mutation } from "./_generated/server"

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    category: v.union(v.literal("tasting"), v.literal("gym"), v.literal("corporate"), v.literal("organizer"), v.literal("general")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("inquiries", {
      ...args,
      createdAt: Date.now(),
    })
  },
})

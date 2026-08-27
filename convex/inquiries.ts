import { v } from "convex/values"
import { mutation } from "./_generated/server"

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    category: v.union(v.literal("tasting"), v.literal("gym"), v.literal("corporate"), v.literal("organizer"), v.literal("general"), v.literal("distributor"), v.literal("career")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim()
    const email = args.email.trim().toLowerCase()
    const message = args.message.trim()
    if (!name) throw new Error("Please enter your name")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email address")
    if (!message) throw new Error("Please enter a message")

    let userId
    const identity = await ctx.auth.getUserIdentity()
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .first()
      userId = user?._id
    }

    return await ctx.db.insert("inquiries", {
      name,
      email,
      phone: args.phone?.trim() || undefined,
      company: args.company?.trim() || undefined,
      category: args.category,
      message,
      createdAt: Date.now(),
      userId,
    })
  },
})

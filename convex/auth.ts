import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Public mutation: called by the Clerk webhook route (app/api/webhooks/clerk)
// via ConvexHttpClient. Internal functions are not callable over HTTP.
// Idempotent upsert keyed by clerkId.
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name ?? existing.name,
        email: args.email ?? existing.email,
        imageUrl: args.imageUrl ?? existing.imageUrl,
      })
      return existing._id
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
      role: "user",
      createdAt: Date.now(),
    })
  },
})

// Identity-guarded profile lookup for the subscriber portal.
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first()
    if (!user) return null
    return { email: user.email ?? null, name: user.name ?? null }
  },
})

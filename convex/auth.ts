import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Public mutation: called by the Clerk webhook route (app/api/webhooks/clerk)
// via ConvexHttpClient. Internal functions are not callable over HTTP.
// Idempotent upsert keyed by clerkId.
// Guarded by the Clerk secret key so a caller cannot overwrite another
// member's email and then act on their subscription via email-keyed actions.
export const syncUser = mutation({
  args: {
    secret: v.string(),
    clerkId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const expected = process.env.CLERK_SECRET_KEY
    if (!expected) throw new Error("User sync is not configured.")
    if (args.secret !== expected) throw new Error("Not authorized.")

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

// Repair profiles for signed-in users when the Clerk webhook is delayed or
// unavailable. The Clerk subject always comes from the verified Convex
// identity, never from client-provided arguments.
export const ensureMe = mutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Sign in required.")

    const email = identity.emailVerified ? identity.email : undefined
    const name = identity.name ?? ([identity.givenName, identity.familyName].filter(Boolean).join(" ") || undefined)
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: name ?? existing.name,
        email: email ?? existing.email,
        imageUrl: identity.pictureUrl ?? existing.imageUrl,
      })
      return existing._id
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      name,
      email,
      imageUrl: identity.pictureUrl,
      role: "user",
      createdAt: Date.now(),
    })
  },
})

// Identity-guarded profile lookup for the subscriber portal.
export const getMe = query({
  args: {},
  returns: v.union(
    v.object({ email: v.union(v.string(), v.null()), name: v.union(v.string(), v.null()) }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first()
    if (!user) {
      return {
        email: identity.emailVerified ? identity.email ?? null : null,
        name: identity.name ?? null,
      }
    }
    return { email: user.email ?? (identity.emailVerified ? identity.email : undefined) ?? null, name: user.name ?? identity.name ?? null }
  },
})

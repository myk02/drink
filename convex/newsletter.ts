import { v } from "convex/values"
import { mutation } from "./_generated/server"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase()
    if (!EMAIL_RE.test(email)) throw new Error("Please enter a valid email address")

    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first()

    if (existing) {
      if (!existing.isActive) {
        await ctx.db.patch(existing._id, { isActive: true, subscribedAt: Date.now() })
      }
      return { alreadySubscribed: true }
    }

    await ctx.db.insert("newsletterSubscribers", {
      email,
      subscribedAt: Date.now(),
      isActive: true,
    })
    return { alreadySubscribed: false }
  },
})

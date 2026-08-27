import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import type { Id } from "./_generated/dataModel"

export const getByCategory = query({
  args: { category: v.union(v.literal("tasting"), v.literal("gym"), v.literal("corporate"), v.literal("organizer")) },
  handler: async (ctx, args) => {
    return await ctx.db.query("events").withIndex("by_category", (q) => q.eq("category", args.category)).collect()
  },
})

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("events").collect()
  },
})

export const getUpcoming = query({
  handler: async (ctx) => {
    return await ctx.db.query("events").filter((q) => q.eq(q.field("status"), "upcoming")).collect()
  },
})

export const register = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event) throw new Error("Event not found")
    if (event.status === "completed") throw new Error("This event has already ended")
    if (event.registered >= event.capacity) throw new Error("This event is fully booked")

    const email = args.email.trim().toLowerCase()
    const name = args.name.trim()
    if (!name) throw new Error("Please enter your name")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email address")

    const duplicate = await ctx.db
      .query("registrations")
      .withIndex("by_event_email", (q) => q.eq("eventId", args.eventId).eq("email", email))
      .first()
    if (duplicate) throw new Error("You are already registered for this event")

    // Attach signed-in user record when one exists
    let userId: Id<"users"> | undefined = undefined
    const identity = await ctx.auth.getUserIdentity()
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .first()
      userId = user?._id
    }

    await ctx.db.insert("registrations", {
      eventId: args.eventId,
      userId,
      name,
      email,
      phone: args.phone?.trim() || undefined,
      registeredAt: Date.now(),
    })

    await ctx.db.patch(args.eventId, { registered: event.registered + 1 })
    return { ok: true }
  },
})

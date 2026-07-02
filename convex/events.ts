import { v } from "convex/values"
import { query, mutation } from "./_generated/server"

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
    if (event.registered >= event.capacity) throw new Error("Event is full")

    await ctx.db.insert("registrations", {
      eventId: args.eventId,
      userId: "" as any,
      name: args.name,
      email: args.email,
      phone: args.phone,
      registeredAt: Date.now(),
    })

    await ctx.db.patch(args.eventId, { registered: event.registered + 1 })
  },
})

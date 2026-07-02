import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  flavors: defineTable({
    name: v.string(),
    tagline: v.string(),
    description: v.string(),
    image: v.string(),
    accent: v.string(),
    badges: v.array(v.string()),
    isAvailable: v.boolean(),
    isComingSoon: v.boolean(),
    price: v.optional(v.number()),
    order: v.number(),
  }).index("by_order", ["order"]),

  events: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.string(),
    time: v.string(),
    location: v.string(),
    image: v.optional(v.string()),
    category: v.union(v.literal("tasting"), v.literal("gym"), v.literal("corporate"), v.literal("organizer")),
    capacity: v.number(),
    registered: v.number(),
    status: v.union(v.literal("upcoming"), v.literal("ongoing"), v.literal("completed")),
    createdBy: v.optional(v.id("users")),
  }).index("by_category", ["category"]),

  registrations: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    registeredAt: v.number(),
  }).index("by_event", ["eventId"]),

  gyms: defineTable({
    name: v.string(),
    location: v.string(),
    area: v.string(),
    description: v.string(),
    image: v.optional(v.string()),
    isPartner: v.boolean(),
    contactEmail: v.optional(v.string()),
  }).index("by_area", ["area"]),

  inquiries: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    category: v.union(v.literal("tasting"), v.literal("gym"), v.literal("corporate"), v.literal("organizer"), v.literal("general")),
    message: v.string(),
    createdAt: v.number(),
    userId: v.optional(v.id("users")),
  }),

  users: defineTable({
    clerkId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),
})

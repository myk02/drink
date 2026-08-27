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
    imageStorageId: v.optional(v.id("_storage")),
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
    userId: v.optional(v.id("users")),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    registeredAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_event_email", ["eventId", "email"]),

  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    image: v.string(),
    type: v.union(v.literal("single"), v.literal("mixed"), v.literal("starter")),
    flavorName: v.optional(v.string()),
    canCount: v.number(),
    priceKes: v.number(),
    compareAtKes: v.optional(v.number()),
    imageStorageId: v.optional(v.id("_storage")),
    isActive: v.boolean(),
    sortOrder: v.number(),
    stock: v.optional(v.number()),
  })
    .index("by_isActive", ["isActive"])
    .index("by_slug", ["slug"]),

  orders: defineTable({
    orderNumber: v.string(),
    reference: v.string(),
    email: v.string(),
    customerName: v.string(),
    phone: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        canCount: v.number(),
        unitPriceKes: v.number(),
        quantity: v.number(),
      })
    ),
    subtotalKes: v.number(),
    memberDiscountKes: v.optional(v.number()),
    deliveryFeeKes: v.number(),
    totalKes: v.number(),
    deliveryZone: v.string(),
    deliveryAddress: v.string(),
    deliveryNotes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("packing"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    paystackStatus: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_reference", ["reference"])
    .index("by_orderNumber", ["orderNumber"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  plans: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    perks: v.array(v.string()),
    amountKes: v.number(),
    interval: v.union(v.literal("monthly")),
    discountPctOnShop: v.optional(v.number()),
    paystackPlanCode: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.number(),
  }).index("by_slug", ["slug"]),

  subscriptions: defineTable({
    email: v.string(),
    planSlug: v.string(),
    // pending = first payment not yet confirmed
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("past_due"),
      v.literal("paused"),
      v.literal("cancelled")
    ),
    paymentChannel: v.union(v.literal("card"), v.literal("mobile_money"), v.literal("unknown")),
    paystackCustomerCode: v.optional(v.string()),
    paystackSubscriptionCode: v.optional(v.string()),
    paystackEmailToken: v.optional(v.string()),
    phone: v.optional(v.string()),
    pendingReference: v.optional(v.string()), // MEM-/REN- checkout ref awaiting charge.success
    nextBillingDate: v.optional(v.number()), // ms epoch — source of truth for M-Pesa renewals & display
    failedChargeCount: v.number(),
    lastRenewalCheckoutUrl: v.optional(v.string()),
    lastRenewalAttemptAt: v.optional(v.number()),
    startedAt: v.number(),
    cancelledAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_plan", ["planSlug"])
    .index("by_subscriptionCode", ["paystackSubscriptionCode"])
    .index("by_pendingReference", ["pendingReference"]),

  billingEvents: defineTable({
    subscriptionId: v.id("subscriptions"),
    type: v.string(), // activated | renewed | charge_failed | paused | resumed | cancelled | renewal_link_sent
    reference: v.optional(v.string()),
    amountKes: v.optional(v.number()),
    detail: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_subscriptionId", ["subscriptionId"]),

  donations: defineTable({
    reference: v.string(),
    email: v.string(),
    donorName: v.optional(v.string()),
    amountKes: v.number(),
    message: v.optional(v.string()),
    isAnonymous: v.boolean(),
    status: v.union(v.literal("pending"), v.literal("success"), v.literal("failed")),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
  })
    .index("by_reference", ["reference"])
    .index("by_status", ["status"]),

  newsletterSubscribers: defineTable({
    email: v.string(),
    subscribedAt: v.number(),
    isActive: v.boolean(),
  }).index("by_email", ["email"]),

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
    category: v.union(v.literal("tasting"), v.literal("gym"), v.literal("corporate"), v.literal("organizer"), v.literal("general"), v.literal("distributor"), v.literal("career")),
    message: v.string(),
    createdAt: v.number(),
    resolved: v.optional(v.boolean()),
    userId: v.optional(v.id("users")),
  }),

  distributorApplications: defineTable({
    contactName: v.string(),
    businessName: v.string(),
    businessType: v.union(
      v.literal("shop"),
      v.literal("supermarket"),
      v.literal("bar_restaurant"),
      v.literal("gym"),
      v.literal("hotel"),
      v.literal("wholesaler"),
      v.literal("distributor"),
      v.literal("other")
    ),
    county: v.string(),
    location: v.string(),
    outletCount: v.optional(v.string()),
    weeklyVolume: v.string(),
    hasFridge: v.boolean(),
    experience: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    message: v.optional(v.string()),
    status: v.union(v.literal("new"), v.literal("reviewing"), v.literal("approved"), v.literal("rejected")),
    createdAt: v.number(),
    userId: v.optional(v.id("users")),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_county", ["county"]),

  careerApplications: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    roleSlug: v.string(),
    roleTitle: v.string(),
    coverLetter: v.string(),
    portfolioUrl: v.optional(v.string()),
    linkedInUrl: v.optional(v.string()),
    resumeStorageId: v.optional(v.id("_storage")),
    resumeFileName: v.optional(v.string()),
    status: v.union(v.literal("new"), v.literal("reviewing"), v.literal("shortlisted"), v.literal("rejected"), v.literal("hired")),
    createdAt: v.number(),
    userId: v.optional(v.id("users")),
  })
    .index("by_role", ["roleSlug"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  talentPool: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    interests: v.optional(v.string()),
    subscribedAt: v.number(),
    isActive: v.boolean(),
  }).index("by_email", ["email"]),

  users: defineTable({
    clerkId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),
})

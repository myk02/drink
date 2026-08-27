import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const submitApplication = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const contactName = args.contactName.trim()
    const businessName = args.businessName.trim()
    const county = args.county.trim()
    const location = args.location.trim()
    const email = args.email.trim().toLowerCase()
    const phone = args.phone.trim()
    if (!contactName) throw new Error("Please enter your contact name")
    if (!businessName) throw new Error("Please enter your business name")
    if (!county) throw new Error("Please select a county / area")
    if (!location) throw new Error("Please enter your specific location")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email address")
    if (!phone || phone.replace(/\D/g, "").length < 9) throw new Error("Please enter a valid phone number")
    if (!args.weeklyVolume) throw new Error("Please select expected weekly volume")

    const identity = await ctx.auth.getUserIdentity()
    let userId
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .first()
      userId = user?._id
    }

    return await ctx.db.insert("distributorApplications", {
      contactName,
      businessName,
      businessType: args.businessType,
      county,
      location,
      outletCount: args.outletCount?.trim() || undefined,
      weeklyVolume: args.weeklyVolume,
      hasFridge: args.hasFridge,
      experience: args.experience?.trim() || undefined,
      email,
      phone,
      message: args.message?.trim() || undefined,
      status: "new",
      createdAt: Date.now(),
      userId,
    })
  },
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first()
    if (!user || user.role !== "admin") throw new Error("Not authorized")
    return await ctx.db.query("distributorApplications").order("desc").collect()
  },
})

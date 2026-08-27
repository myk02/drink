import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const submit = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const name = args.name.trim()
    const email = args.email.trim().toLowerCase()
    const coverLetter = args.coverLetter.trim()
    if (!name) throw new Error("Please enter your full name")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email address")
    if (!coverLetter || coverLetter.length < 20) throw new Error("Please tell us a bit more about yourself (at least 20 characters)")
    if (!args.roleSlug || !args.roleTitle) throw new Error("Please select a role")
    if (args.portfolioUrl && args.portfolioUrl.trim()) {
      try {
        new URL(args.portfolioUrl.trim())
      } catch {
        throw new Error("Please enter a valid portfolio URL (include https://)")
      }
    }
    if (args.linkedInUrl && args.linkedInUrl.trim()) {
      try {
        const u = new URL(args.linkedInUrl.trim())
        if (!u.hostname.includes("linkedin.com")) throw new Error("LinkedIn URL must be a linkedin.com link")
      } catch (e) {
        if (e instanceof Error && e.message.includes("linkedin")) throw e
        throw new Error("Please enter a valid LinkedIn URL")
      }
    }

    let userId
    const identity = await ctx.auth.getUserIdentity()
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .first()
      userId = user?._id
    }

    const id = await ctx.db.insert("careerApplications", {
      name,
      email,
      phone: args.phone?.trim() || undefined,
      roleSlug: args.roleSlug.trim(),
      roleTitle: args.roleTitle.trim(),
      coverLetter,
      portfolioUrl: args.portfolioUrl?.trim() || undefined,
      linkedInUrl: args.linkedInUrl?.trim() || undefined,
      resumeStorageId: args.resumeStorageId,
      resumeFileName: args.resumeFileName?.trim() || undefined,
      status: "new",
      createdAt: Date.now(),
      userId,
    })
    return id
  },
})

export const getResumeUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Sign in required to view resumes.")
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first()
    if (!user) throw new Error("User not found.")
    // Allow if admin, or if the caller owns an application that references this file
    if (user.role !== "admin") {
      const owned = await ctx.db
        .query("careerApplications")
        .withIndex("by_email", (q) => q.eq("email", user.email ?? ""))
        .collect()
      const hasOwn = owned.some((a) => a.resumeStorageId === args.storageId)
      if (!hasOwn) throw new Error("Not authorized to view this file.")
    }
    return await ctx.storage.getUrl(args.storageId)
  },
})

export const listByRole = query({
  args: { roleSlug: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // admin-only listing helper (optional, gated)
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first()
    if (!user || user.role !== "admin") return []
    if (args.roleSlug) {
      return await ctx.db.query("careerApplications").withIndex("by_role", (q) => q.eq("roleSlug", args.roleSlug!)).collect()
    }
    return await ctx.db.query("careerApplications").collect()
  },
})

export const joinTalentPool = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    interests: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email address")
    const existing = await ctx.db
      .query("talentPool")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first()
    if (existing) {
      if (!existing.isActive) {
        await ctx.db.patch(existing._id, { isActive: true, subscribedAt: Date.now() })
      }
      return { alreadySubscribed: true }
    }
    await ctx.db.insert("talentPool", {
      email,
      name: args.name?.trim() || undefined,
      interests: args.interests?.trim() || undefined,
      subscribedAt: Date.now(),
      isActive: true,
    })
    return { alreadySubscribed: false }
  },
})

import { v } from "convex/values"
import { mutation } from "./_generated/server"
import { internal } from "./_generated/api"
import { adminAlertEmail, inquiryAckEmail } from "../lib/email-templates"

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
    if (name.length > 100) throw new Error("Name is too long")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email address")
    if (!message) throw new Error("Please enter a message")
    if (message.length > 5000) throw new Error("Message is too long — please keep it under 5000 characters")
    if (message.length < 10) throw new Error("Please write a slightly longer message so we can help")

    let userId
    const identity = await ctx.auth.getUserIdentity()
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .first()
      userId = user?._id
    }

    const id = await ctx.db.insert("inquiries", {
      name,
      email,
      phone: args.phone?.trim() || undefined,
      company: args.company?.trim() || undefined,
      category: args.category,
      message,
      createdAt: Date.now(),
      userId,
    })

    const ack = inquiryAckEmail({ name, category: args.category, message })
    await ctx.scheduler.runAfter(0, internal.email.send, {
      to: email,
      subject: ack.subject,
      html: ack.html,
      text: ack.text,
    })

    const alert = adminAlertEmail({
      subject: `New ${args.category} enquiry`,
      lines: [
        ["Name", name],
        ["Email", email],
        ["Phone", args.phone?.trim() || "—"],
        ["Company", args.company?.trim() || "—"],
        ["Message", message.slice(0, 600)],
      ],
    })
    await ctx.scheduler.runAfter(0, internal.email.sendAdminAlert, {
      subject: alert.subject,
      html: alert.html,
      text: alert.text,
    })

    return id
  },
})

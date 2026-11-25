import { v } from "convex/values"
import { mutation } from "./_generated/server"
import { internal } from "./_generated/api"
import { newsletterConfirmationEmail } from "../lib/email-templates"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function token(): string {
  // 128 bits of entropy from the platform CSPRNG.
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function siteOrigin(): string {
  return (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://giflavours.vercel.app").replace(/\/$/, "")
}

// Double opt-in: a new signup is stored inactive and only becomes a real
// subscriber after the emailed confirmation link is opened. This satisfies
// consent requirements (Kenya DPA 2019) and keeps the list deliverable.
export const subscribe = mutation({
  args: { email: v.string() },
  returns: v.object({ success: v.boolean(), pending: v.boolean(), alreadyConfirmed: v.boolean() }),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase()
    if (!EMAIL_RE.test(email)) throw new Error("Please enter a valid email address")

    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first()

    // Generic responses only — never reveal whether an address is on the list.
    if (existing?.isActive && existing.confirmedAt) {
      return { success: true, pending: false, alreadyConfirmed: true }
    }

    const confirmToken = existing?.confirmToken ?? token()
    if (existing) {
      await ctx.db.patch(existing._id, {
        isActive: false,
        subscribedAt: Date.now(),
        confirmToken,
        confirmedAt: undefined,
        unsubscribedAt: undefined,
      })
    } else {
      await ctx.db.insert("newsletterSubscribers", {
        email,
        subscribedAt: Date.now(),
        isActive: false,
        confirmToken,
      })
    }

    const content = newsletterConfirmationEmail({
      confirmUrl: `${siteOrigin()}/newsletter/confirm?token=${confirmToken}`,
    })
    await ctx.scheduler.runAfter(0, internal.email.send, {
      to: email,
      subject: content.subject,
      html: content.html,
      text: content.text,
    })

    return { success: true, pending: true, alreadyConfirmed: false }
  },
})

export const confirm = mutation({
  args: { token: v.string() },
  returns: v.object({ status: v.union(v.literal("confirmed"), v.literal("already"), v.literal("invalid")) }),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_confirmToken", (q) => q.eq("confirmToken", args.token))
      .first()
    if (!row) return { status: "invalid" as const }
    if (row.confirmedAt && row.isActive) return { status: "already" as const }

    await ctx.db.patch(row._id, {
      isActive: true,
      confirmedAt: Date.now(),
      unsubscribedAt: undefined,
      unsubscribeToken: row.unsubscribeToken ?? token(),
    })
    return { status: "confirmed" as const }
  },
})

export const unsubscribe = mutation({
  args: { token: v.string() },
  returns: v.object({ status: v.union(v.literal("unsubscribed"), v.literal("already"), v.literal("invalid")) }),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_unsubscribeToken", (q) => q.eq("unsubscribeToken", args.token))
      .first()
    if (!row) return { status: "invalid" as const }
    if (!row.isActive && row.unsubscribedAt) return { status: "already" as const }
    await ctx.db.patch(row._id, {
      isActive: false,
      unsubscribedAt: Date.now(),
    })
    return { status: "unsubscribed" as const }
  },
})

import { v } from "convex/values"
import { internalMutation, internalQuery, query, type MutationCtx } from "./_generated/server"
import type { Id } from "./_generated/dataModel"

export const MONTH_MS = 30 * 24 * 60 * 60 * 1000

async function logEvent(
  ctx: MutationCtx,
  subscriptionId: Id<"subscriptions">,
  type: string,
  extra?: { reference?: string; amountKes?: number; detail?: string }
) {
  await ctx.db.insert("billingEvents", {
    subscriptionId,
    type,
    ...extra,
    createdAt: Date.now(),
  })
}

function normalizeChannel(channel: string): "card" | "mobile_money" | "unknown" {
  if (channel === "card") return "card"
  if (channel === "mobile_money") return "mobile_money"
  return "unknown"
}

// ---------- internal lookups used by webhook handlers & cron ----------

export const getByPendingReferenceInternal = internalQuery({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_pendingReference", (q) => q.eq("pendingReference", args.reference))
      .first()
  },
})

export const getLatestActiveByEmailInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .collect()
    const candidates = rows.filter((r) => r.status === "active" || r.status === "past_due")
    return candidates.sort((a, b) => b.startedAt - a.startedAt)[0] ?? null
  },
})

export const getLatestByEmailInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .collect()
    return rows.sort((a, b) => b.startedAt - a.startedAt)[0] ?? null
  },
})

export const listDueForManualChargeInternal = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query("subscriptions").collect()
    return rows.filter(
      (r) =>
        (r.status === "active" || r.status === "past_due") &&
        r.paymentChannel !== "card" &&
        typeof r.nextBillingDate === "number" &&
        r.nextBillingDate <= args.now &&
        r.failedChargeCount < 5
    )
  },
})

// ---------- state transitions (all internal; exposed via actions/mutations) ----------

export const createPending = internalMutation({
  args: {
    email: v.string(),
    planSlug: v.string(),
    phone: v.optional(v.string()),
    pendingReference: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("subscriptions", {
      email: args.email.trim().toLowerCase(),
      planSlug: args.planSlug,
      phone: args.phone?.trim() || undefined,
      pendingReference: args.pendingReference,
      status: "pending",
      paymentChannel: "unknown",
      failedChargeCount: 0,
      startedAt: Date.now(),
    })
  },
})

// charge.success for kind=subscription | kind=renewal | managed-card renewal heuristic
export const handleChargeSuccess = internalMutation({
  args: {
    reference: v.string(),
    email: v.string(),
    amountSubunit: v.number(),
    channel: v.string(),
    customerCode: v.optional(v.string()),
    subscriptionCode: v.optional(v.string()),
    emailToken: v.optional(v.string()),
    planSlugHint: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase()

    // 1) Explicit mapping via our own checkout reference
    let sub =
      (await ctx.db
        .query("subscriptions")
        .withIndex("by_pendingReference", (q) => q.eq("pendingReference", args.reference))
        .first()) ??
      // 2) Managed-card renewal: match by stored subscription code when present
      (args.subscriptionCode
        ? await ctx.db
            .query("subscriptions")
            .withIndex("by_subscriptionCode", (q) => q.eq("paystackSubscriptionCode", args.subscriptionCode!))
            .first()
        : null) ??
      // 3) Last resort: latest active/past_due sub for this email
      (await ctx.db
        .query("subscriptions")
        .withIndex("by_email", (q) => q.eq("email", email))
        .collect()
        .then((rows) =>
          rows
            .filter((r) => r.status === "active" || r.status === "past_due" || r.status === "pending")
            .sort((a, b) => b.startedAt - a.startedAt)[0] ?? null
        ))

    if (!sub) return { outcome: "unknown_subscription" as const }

    const amountKes = Math.round(args.amountSubunit / 100)
    const channel = normalizeChannel(args.channel)
    const wasPending = sub.status === "pending"

    await ctx.db.patch(sub._id, {
      status: "active",
      paymentChannel: channel,
      paystackCustomerCode: args.customerCode ?? sub.paystackCustomerCode,
      paystackSubscriptionCode: args.subscriptionCode ?? sub.paystackSubscriptionCode,
      paystackEmailToken: args.emailToken ?? sub.paystackEmailToken,
      nextBillingDate: Date.now() + MONTH_MS,
      failedChargeCount: 0,
      lastRenewalCheckoutUrl: undefined,
      pendingReference: undefined,
    })

    await logEvent(
      ctx,
      sub._id,
      wasPending ? "activated" : "renewed",
      { reference: args.reference, amountKes }
    )

    return { outcome: wasPending ? ("activated" as const) : ("renewed" as const) }
  },
})

// subscription.create webhook: enrich codes so pause/cancel work for card subs
export const attachSubscriptionCodes = internalMutation({
  args: {
    email: v.string(),
    planSlugHint: v.optional(v.string()),
    subscriptionCode: v.string(),
    emailToken: v.string(),
    customerCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase()
    const rows = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect()
    const target =
      rows
        .filter((r) => r.status === "pending" && (!args.planSlugHint || r.planSlug === args.planSlugHint))
        .sort((a, b) => b.startedAt - a.startedAt)[0] ??
      rows.sort((a, b) => b.startedAt - a.startedAt)[0]
    if (!target) return
    await ctx.db.patch(target._id, {
      paystackSubscriptionCode: args.subscriptionCode,
      paystackEmailToken: args.emailToken,
      paystackCustomerCode: args.customerCode ?? target.paystackCustomerCode,
    })
  },
})

export const markChargeFailed = internalMutation({
  args: { email: v.string(), detail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase()
    const rows = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect()
    const sub = rows
      .filter((r) => r.status === "active" || r.status === "past_due")
      .sort((a, b) => b.startedAt - a.startedAt)[0]
    if (!sub) return
    const failedChargeCount = sub.failedChargeCount + 1
    await ctx.db.patch(sub._id, {
      status: "past_due",
      failedChargeCount,
    })
    await logEvent(ctx, sub._id, "charge_failed", { detail: args.detail ?? `attempt ${failedChargeCount}` })
  },
})

export const recordRenewalLink = internalMutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    reference: v.string(),
    checkoutUrl: v.string(),
    amountKes: v.number(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subscriptionId)
    if (!sub) return
    const failedChargeCount = sub.failedChargeCount + 1
    const status = failedChargeCount >= 5 ? ("cancelled" as const) : failedChargeCount >= 2 ? ("past_due" as const) : sub.status
    await ctx.db.patch(sub._id, {
      lastRenewalCheckoutUrl: args.checkoutUrl,
      lastRenewalAttemptAt: Date.now(),
      pendingReference: args.reference,
      failedChargeCount,
      status,
      cancelledAt: status === "cancelled" ? Date.now() : sub.cancelledAt,
    })
    await logEvent(ctx, args.subscriptionId, "renewal_link_sent", {
      reference: args.reference,
      amountKes: args.amountKes,
      detail: `attempt ${failedChargeCount}`,
    })
  },
})

export const setLocalStatus = internalMutation({
  args: { subscriptionId: v.id("subscriptions"), status: v.union(v.literal("active"), v.literal("paused"), v.literal("cancelled")) },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subscriptionId)
    if (!sub) return
    await ctx.db.patch(sub._id, {
      status: args.status,
      cancelledAt: args.status === "cancelled" ? Date.now() : undefined,
    })
    await logEvent(ctx, args.subscriptionId, args.status === "paused" ? "paused" : args.status === "cancelled" ? "cancelled" : "resumed")
  },
})

// ---------- customer-facing (auth-guarded via Clerk identity) ----------

// Thanks-page polling: most recent subscription touched in the last 45 min.
export const getRecentForEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .collect()
    const latest = rows.sort((a, b) => b.startedAt - a.startedAt)[0]
    if (!latest || Date.now() - latest.startedAt > 45 * 60 * 1000) return null
    return { status: latest.status, planSlug: latest.planSlug }
  },
})

export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first()
    const email = user?.email?.trim().toLowerCase()
    if (!email) return null

    const rows = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect()
    const sub = rows.sort((a, b) => b.startedAt - a.startedAt)[0]
    if (!sub || sub.status === "cancelled") return { subscription: null }

    const plan = await ctx.db
      .query("plans")
      .withIndex("by_slug", (q) => q.eq("slug", sub.planSlug))
      .first()

    const events = await ctx.db
      .query("billingEvents")
      .withIndex("by_subscriptionId", (q) => q.eq("subscriptionId", sub._id))
      .collect()
    events.sort((a, b) => b.createdAt - a.createdAt)

    return {
      subscription: {
        _id: sub._id,
        status: sub.status,
        planSlug: sub.planSlug,
        paymentChannel: sub.paymentChannel,
        nextBillingDate: sub.nextBillingDate ?? null,
        failedChargeCount: sub.failedChargeCount,
        lastRenewalCheckoutUrl: sub.lastRenewalCheckoutUrl ?? null,
        startedAt: sub.startedAt,
      },
      plan: plan ? { name: plan.name, description: plan.description, amountKes: plan.amountKes, perks: plan.perks } : null,
      history: events.slice(0, 12).map((e) => ({
        _id: e._id,
        type: e.type,
        amountKes: e.amountKes ?? null,
        detail: e.detail ?? null,
        createdAt: e.createdAt,
      })),
    }
  },
})

// ---------- admin / discount / deterministic renewal helpers ----------

export const getActiveShopDiscountInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .collect()
    const active = rows.filter((r) => r.status === "active").sort((a, b) => b.startedAt - a.startedAt)[0]
    if (!active) return null
    const plan = await ctx.db.query("plans").withIndex("by_slug", (q) => q.eq("slug", active.planSlug)).first()
    if (!plan?.discountPctOnShop) return null
    return { pct: plan.discountPctOnShop, planName: plan.name }
  },
})

// Public preview for the checkout UI (safe fields only).
export const getMembershipForEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .collect()
    const active = rows.filter((r) => r.status === "active").sort((a, b) => b.startedAt - a.startedAt)[0]
    if (!active) return null
    const plan = await ctx.db.query("plans").withIndex("by_slug", (q) => q.eq("slug", active.planSlug)).first()
    return {
      planName: plan?.name ?? "GiGi Club",
      discountPct: plan?.discountPctOnShop ?? null,
    }
  },
})

export const getBySubscriptionCodeInternal = internalQuery({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_subscriptionCode", (q) => q.eq("paystackSubscriptionCode", args.code))
      .first()
  },
})

// invoice.update (paid) — Paystack-managed card renewals advance here,
// keyed by subscription_code instead of reference heuristics.
export const advanceRenewalBySubscriptionCode = internalMutation({
  args: {
    subscriptionCode: v.string(),
    amountSubunit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_subscriptionCode", (q) => q.eq("paystackSubscriptionCode", args.subscriptionCode))
      .first()
    if (!sub || (sub.status !== "active" && sub.status !== "past_due")) return { outcome: "ignored" as const }

    await ctx.db.patch(sub._id, {
      status: "active",
      nextBillingDate: Date.now() + MONTH_MS,
      failedChargeCount: 0,
      lastRenewalCheckoutUrl: undefined,
    })
    await ctx.db.insert("billingEvents", {
      subscriptionId: sub._id,
      type: "renewed",
      amountKes: args.amountSubunit ? Math.round(args.amountSubunit / 100) : undefined,
      detail: "auto-renewal",
      createdAt: Date.now(),
    })
    return { outcome: "renewed" as const }
  },
})

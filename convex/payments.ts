import { v } from "convex/values"
import { action, internalAction, type ActionCtx } from "./_generated/server"
import { api, internal } from "./_generated/api"
import type { Doc } from "./_generated/dataModel"
import { getZoneFee } from "../lib/delivery"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function paystackHeaders(secretKey: string): HeadersInit {
  return { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" }
}

function generateOrderNumber(): string {
  const time = Date.now().toString(36).toUpperCase()
  const rand = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0")
  return `GG${time}${rand}`
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

// Creates a pending order and initializes a Paystack hosted checkout.
// Prices are ALWAYS recomputed here from the DB â€” client prices are never trusted.
export const createCheckoutSession = action({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
    customer: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      zone: v.string(),
      notes: v.optional(v.string()),
    }),
    origin: v.string(),
  },
  handler: async (ctx, args) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) throw new Error("Payments are not configured yet. Please try again later.")

    if (args.items.length === 0) throw new Error("Your cart is empty")

    const email = args.customer.email.trim().toLowerCase()
    const name = args.customer.name.trim()
    const phone = args.customer.phone.trim()
    const address = args.customer.address.trim()
    if (!name) throw new Error("Please enter your name")
    if (!EMAIL_RE.test(email)) throw new Error("Please enter a valid email address")
    if (!phone) throw new Error("Please enter your phone number")
    if (address.length < 5) throw new Error("Please enter a full delivery address")

    let subtotalKes = 0
    const lineItems: Array<{
      productId: import("./_generated/dataModel").Id<"products">
      name: string
      canCount: number
      unitPriceKes: number
      quantity: number
    }> = []

    for (const item of args.items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
        throw new Error("Invalid item quantity")
      }
      const product = await ctx.runQuery(api.products.getById, { id: item.productId })
      if (!product || !product.isActive) {
        throw new Error(`"${item.productId}" is no longer available â€” please refresh your cart`)
      }
      subtotalKes += product.priceKes * item.quantity
      lineItems.push({
        productId: product._id,
        name: product.name,
        canCount: product.canCount,
        unitPriceKes: product.priceKes,
        quantity: item.quantity,
      })
    }

    const deliveryFeeKes = getZoneFee(args.customer.zone)
    if (deliveryFeeKes === null) throw new Error("Please choose a valid delivery zone")

    const totalKes = subtotalKes + deliveryFeeKes
    const orderNumber = generateOrderNumber()
    const reference = `${orderNumber}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    await ctx.runMutation(internal.orders.createPendingOrder, {
      orderNumber,
      reference,
      email,
      customerName: name,
      phone,
      items: lineItems,
      subtotalKes,
      deliveryFeeKes,
      totalKes,
      deliveryZone: args.customer.zone,
      deliveryAddress: address,
      deliveryNotes: args.customer.notes?.trim() || undefined,
    })

    // Paystack amounts are in the smallest unit (KES cents)
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: totalKes * 100,
        currency: "KES",
        reference,
        callback_url: `${args.origin}/checkout/success`,
        channels: ["card", "mobile_money", "bank_transfer"],
        metadata: {
          order_number: orderNumber,
          custom_fields: [
            { display_name: "Delivery Zone", variable_name: "delivery_zone", value: args.customer.zone },
          ],
        },
      }),
    })
    const payload = await res.json().catch(() => null)
    if (!res.ok || !payload?.status || !payload?.data?.authorization_url) {
      throw new Error(payload?.message ?? "Could not start the payment. Please try again.")
    }

    return {
      authorizationUrl: payload.data.authorization_url as string,
      reference,
      orderNumber,
      totalKes,
    }
  },
})

// Fallback for when the webhook hasn't landed yet: verify directly with
// Paystack, then mark the order paid server-side.
export const verifyPayment = action({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) throw new Error("Payments are not configured yet.")

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(args.reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    })
    const payload = await res.json().catch(() => null)
    if (!res.ok || !payload?.status || !payload?.data) {
      return { orderStatus: "pending" as const }
    }

    const tx = payload.data
    if (tx.status === "success" && tx.currency === "KES") {
      const result = await ctx.runMutation(internal.orders.markPaidByReference, {
        reference: args.reference,
        amountPaidSubunit: Number(tx.amount),
      })
      if (result.outcome === "paid" || result.outcome === "already_paid") {
        return { orderStatus: "paid" as const }
      }
      return { orderStatus: "review" as const }
    }
    if (tx.status === "failed" || tx.status === "abandoned") {
      return { orderStatus: "failed" as const }
    }
    return { orderStatus: "pending" as const }
  },
})

// ==================== SUBSCRIPTIONS (GiGi Club) ====================

// Creates (once) the Paystack Plan for a local plan row and caches its code.
async function ensurePaystackPlanCode(
  ctx: Pick<ActionCtx, "runMutation">,
  secretKey: string,
  plan: { slug: string; name: string; amountKes: number; paystackPlanCode?: string }
): Promise<string> {
  if (plan.paystackPlanCode) return plan.paystackPlanCode
  const res = await fetch("https://api.paystack.co/plan", {
    method: "POST",
    headers: paystackHeaders(secretKey),
    body: JSON.stringify({
      name: `[${plan.slug}] ${plan.name}`,
      amount: plan.amountKes * 100,
      interval: "monthly",
      currency: "KES",
    }),
  })
  const payload = await res.json().catch(() => null)
  if (!res.ok || !payload?.status || !payload?.data?.plan_code) {
    throw new Error(payload?.message ?? "Could not set up this membership plan. Please try again.")
  }
  await ctx.runMutation(internal.plans.savePaystackPlanCode, {
    slug: plan.slug,
    paystackPlanCode: payload.data.plan_code,
  })
  return payload.data.plan_code as string
}

export const startSubscription = action({
  args: {
    planSlug: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    origin: v.string(),
  },
  handler: async (ctx, args): Promise<{ authorizationUrl: string; reference: string; amountKes: number }> => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) throw new Error("Payments are not configured yet.")

    const email = args.email.trim().toLowerCase()
    if (!EMAIL_RE.test(email)) throw new Error("Please enter a valid email address")

    const plan: Doc<"plans"> | null = await ctx.runQuery(api.plans.getBySlug, { slug: args.planSlug })
    if (!plan || !plan.isActive) throw new Error("That membership plan is not available right now.")

    const planCode: string = await ensurePaystackPlanCode(ctx, secretKey, plan)

    const reference = `MEM-${Date.now().toString(36).toUpperCase()}-${randomSuffix()}`
    await ctx.runMutation(internal.subscriptions.createPending, {
      email,
      planSlug: args.planSlug,
      phone: args.phone?.trim() || undefined,
      pendingReference: reference,
    })

    // Passing `plan` makes Paystack manage card auto-renewals after this first charge.
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: paystackHeaders(secretKey),
      body: JSON.stringify({
        email,
        amount: plan.amountKes * 100,
        currency: "KES",
        plan: planCode,
        reference,
        callback_url: `${args.origin}/subscribe/thanks`,
        channels: ["card", "mobile_money", "bank_transfer"],
        metadata: { kind: "subscription", plan_slug: args.planSlug, reference },
      }),
    })
    const payload = await res.json().catch(() => null)
    if (!res.ok || !payload?.status || !payload?.data?.authorization_url) {
      throw new Error(payload?.message ?? "Could not start checkout. Please try again.")
    }

    return { authorizationUrl: payload.data.authorization_url as string, reference, amountKes: plan.amountKes }
  },
})

export const startDonation = action({
  args: {
    amountKes: v.number(),
    email: v.string(),
    name: v.optional(v.string()),
    message: v.optional(v.string()),
    isAnonymous: v.boolean(),
    origin: v.string(),
  },
  handler: async (ctx, args) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) throw new Error("Payments are not configured yet.")

    const amountKes = Math.round(args.amountKes)
    if (!Number.isFinite(amountKes) || amountKes < 50 || amountKes > 500000) {
      throw new Error("Choose an amount between KSh 50 and KSh 500,000.")
    }
    const email = args.email.trim().toLowerCase()
    if (!EMAIL_RE.test(email)) throw new Error("Please enter a valid email address")
    const name = args.name?.trim() || undefined
    const message = args.message?.trim() || undefined

    const reference = `DON-${Date.now().toString(36).toUpperCase()}-${randomSuffix()}`
    await ctx.runMutation(internal.donations.createPending, {
      reference,
      email,
      donorName: name,
      amountKes,
      message,
      isAnonymous: args.isAnonymous,
    })

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: paystackHeaders(secretKey),
      body: JSON.stringify({
        email,
        amount: amountKes * 100,
        currency: "KES",
        reference,
        callback_url: `${args.origin}/support/thanks`,
        channels: ["card", "mobile_money", "bank_transfer"],
        metadata: { kind: "donation", reference },
      }),
    })
    const payload = await res.json().catch(() => null)
    if (!res.ok || !payload?.status || !payload?.data?.authorization_url) {
      throw new Error(payload?.message ?? "Could not start checkout. Please try again.")
    }

    return { authorizationUrl: payload.data.authorization_url as string, reference }
  },
})

// Daily cron target for M-Pesa (non-card) subscribers: Kenya has no M-Pesa
// auto-debit on Paystack and no direct STK push API, so we prepare a fresh
// hosted-checkout link each cycle. The portal surfaces a "Complete renewal"
// button using this link until it is paid (or attempts run out).
export const renewDueMpesaSubscriptions = internalAction({
  args: {},
  handler: async (ctx) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) return { processed: 0, error: "PAYSTACK_SECRET_KEY missing" as const }

    const now = Date.now()
    const due = await ctx.runQuery(internal.subscriptions.listDueForManualChargeInternal, { now })
    let processed = 0

    for (const sub of due.slice(0, 25)) {
      const plan = await ctx.runQuery(api.plans.getBySlug, { slug: sub.planSlug })
      if (!plan) continue

      const reference = `REN-${Date.now().toString(36).toUpperCase()}-${randomSuffix()}`
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: paystackHeaders(secretKey),
        body: JSON.stringify({
          email: sub.email,
          amount: plan.amountKes * 100,
          currency: "KES",
          reference,
          callback_url: process.env.RENEWAL_CALLBACK_URL ?? undefined,
          channels: ["mobile_money"],
          metadata: { kind: "renewal", reference },
        }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok || !payload?.status || !payload?.data?.authorization_url) continue

      await ctx.runMutation(internal.subscriptions.recordRenewalLink, {
        subscriptionId: sub._id,
        reference,
        checkoutUrl: payload.data.authorization_url,
        amountKes: plan.amountKes,
      })
      processed++
    }

    return { processed }
  },
})

// Portal actions â€” identity-guarded, drive Paystack managed subscriptions too.

async function requireSignedInEmail(ctx: ActionCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Please sign in to manage your membership.")
  const me: { email: string | null; name: string | null } | null = await ctx.runQuery(api.auth.getMe, {})
  if (!me?.email) throw new Error("Your account has no email yet. Sign out and back in, then try again.")
  return me.email.trim().toLowerCase()
}

async function getMySubscriptionForEmail(ctx: ActionCtx, email: string): Promise<Doc<"subscriptions">> {
  const sub: Doc<"subscriptions"> | null = await ctx.runQuery(
    internal.subscriptions.getLatestByEmailInternal,
    { email }
  )
  if (!sub) throw new Error("No membership found on this account.")
  return sub
}

async function setManagedSubscription(
  secretKey: string,
  code: string,
  token: string,
  disable: boolean
): Promise<void> {
  const res = await fetch(`https://api.paystack.co/subscription/${disable ? "disable" : "enable"}`, {
    method: "POST",
    headers: paystackHeaders(secretKey),
    body: JSON.stringify({ code, token }),
  })
  const payload = await res.json().catch(() => null)
  if (!res.ok || !payload?.status) {
    throw new Error(payload?.message ?? `Could not ${disable ? "pause" : "resume"} the subscription with our payment provider.`)
  }
}

export const pauseMySubscription = action({
  args: {},
  handler: async (ctx) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) throw new Error("Payments are not configured yet.")
    const email = await requireSignedInEmail(ctx)
    const sub = await getMySubscriptionForEmail(ctx, email)
    if (sub.status !== "active" && sub.status !== "past_due") throw new Error("Only an active membership can be paused.")
    if (sub.paystackSubscriptionCode && sub.paystackEmailToken) {
      await setManagedSubscription(secretKey, sub.paystackSubscriptionCode, sub.paystackEmailToken, true)
    }
    await ctx.runMutation(internal.subscriptions.setLocalStatus, { subscriptionId: sub._id, status: "paused" })
    return { status: "paused" as const }
  },
})

export const resumeMySubscription = action({
  args: {},
  handler: async (ctx) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) throw new Error("Payments are not configured yet.")
    const email = await requireSignedInEmail(ctx)
    const sub = await getMySubscriptionForEmail(ctx, email)
    if (sub.status !== "paused") throw new Error("This membership is not paused.")
    if (sub.paystackSubscriptionCode && sub.paystackEmailToken) {
      await setManagedSubscription(secretKey, sub.paystackSubscriptionCode, sub.paystackEmailToken, false)
    }
    await ctx.runMutation(internal.subscriptions.setLocalStatus, { subscriptionId: sub._id, status: "active" })
    return { status: "active" as const }
  },
})

export const cancelMySubscription = action({
  args: {},
  handler: async (ctx) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) throw new Error("Payments are not configured yet.")
    const email = await requireSignedInEmail(ctx)
    const sub = await getMySubscriptionForEmail(ctx, email)
    if (sub.status === "cancelled") return { status: "cancelled" as const }
    if (sub.paystackSubscriptionCode && sub.paystackEmailToken) {
      await setManagedSubscription(secretKey, sub.paystackSubscriptionCode, sub.paystackEmailToken, true)
    }
    await ctx.runMutation(internal.subscriptions.setLocalStatus, { subscriptionId: sub._id, status: "cancelled" })
    return { status: "cancelled" as const }
  },
})

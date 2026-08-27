import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { internal } from "./_generated/api"

async function verifyPaystackSignature(
  rawBody: string,
  signature: string | null,
  secretKey: string
): Promise<boolean> {
  if (!signature) return false
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  )
  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody))
  const expected = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  if (expected.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return diff === 0
}

interface PaystackEvent {
  event?: string
  data?: {
    reference?: unknown
    amount?: unknown
    email?: unknown
    channel?: unknown
    kind?: unknown
    customer?: { email?: unknown; customer_code?: unknown } | null
    authorization?: { channel?: unknown } | null
    subscription_code?: unknown
    email_token?: unknown
    subscription?: { subscription_code?: unknown } | null
    metadata?: Record<string, unknown> | null
  }
}

function str(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined
}

const paystackWebhook = httpAction(async (ctx, req) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) return new Response(null, { status: 200 })

  const rawBody = await req.text()
  const isValid = await verifyPaystackSignature(rawBody, req.headers.get("x-paystack-signature"), secretKey)
  if (!isValid) return new Response("Invalid signature", { status: 401 })

  try {
    const event = JSON.parse(rawBody) as PaystackEvent

    switch (event.event) {
      case "charge.success": {
        const data = event.data
        if (!data) break
        const reference = str(data.reference)
        const amountSubunit = Number(data.amount ?? 0)
        const email =
          str(data.customer?.email) ?? str(data.email) ?? ""
        const customerCode = str(data.customer?.customer_code)

        if (reference?.startsWith("DON-")) {
          await ctx.runMutation(internal.donations.markPaidByReference, {
            reference,
            amountPaidSubunit: amountSubunit,
            donorName: str(data.metadata?.name),
          })
          break
        }

        if (
          reference?.startsWith("MEM-") ||
          reference?.startsWith("REN-") ||
          data.metadata?.kind === "subscription" ||
          data.metadata?.kind === "renewal"
        ) {
          await ctx.runMutation(internal.subscriptions.handleChargeSuccess, {
            reference: reference ?? "",
            email,
            amountSubunit,
            channel: str(data.authorization?.channel) ?? "unknown",
            customerCode,
            subscriptionCode: str(data.subscription_code) ?? str(data.subscription?.subscription_code),
            emailToken: str(data.email_token),
            planSlugHint: str(data.metadata?.plan_slug),
          })
          break
        }

        // Default: shop orders
        if (reference) {
          await ctx.runMutation(internal.orders.markPaidByReference, {
            reference,
            amountPaidSubunit: amountSubunit,
          })
        }
        break
      }

      case "subscription.create": {
        const data = event.data
        const email = str(data?.customer?.email)
        const subscriptionCode = str(data?.subscription_code) ?? str(data?.subscription?.subscription_code)
        const emailToken = str(data?.email_token)
        if (!email || !subscriptionCode) break
        await ctx.runMutation(internal.subscriptions.attachSubscriptionCodes, {
          email,
          planSlugHint: undefined,
          subscriptionCode,
          emailToken: emailToken ?? "",
          customerCode: str(data?.customer?.customer_code),
        })
        break
      }

      case "invoice.payment_failed": {
        const email = str(event.data?.customer?.email)
        if (!email) break
        await ctx.runMutation(internal.subscriptions.markChargeFailed, {
          email,
          detail: "paystack invoice payment failed",
        })
        break
      }
    }
  } catch {
    // Signed but malformed payloads: acknowledge to stop retries
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
})

const http = httpRouter()

http.route({ path: "/webhooks/paystack", method: "POST", handler: paystackWebhook })

export default http

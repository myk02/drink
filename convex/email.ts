"use node"

import { v } from "convex/values"
import { internalAction } from "./_generated/server"

// Transactional email via Resend's HTTP API. No SDK dependency.
//
// The whole site degrades safely when email is not configured: every sender
// routes through deliver(), which returns { sent: false, reason: "not_configured" }
// and logs. A missing key is visible in Convex logs instead of silently
// dropping receipts.
//
// Required Convex env vars once a provider is set up:
//   RESEND_API_KEY   server-only API key from resend.com
//   EMAIL_FROM       verified sender, e.g. "GiGi Energy <hello@gigi.energy>"
//   EMAIL_REPLY_TO   optional reply-to address
//   ADMIN_EMAIL      where internal alerts (new enquiries etc.) go

const RESEND_ENDPOINT = "https://api.resend.com/emails"

interface DeliveryResult {
  sent: boolean
  reason?: string
  id?: string
}

async function deliver(input: {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM ?? "GiGi Energy <onboarding@resend.dev>"
  const to = input.to.trim().toLowerCase()

  if (!apiKey) {
    console.log(`[email] not configured — skipped "${input.subject}" to ${to}`)
    return { sent: false, reason: "not_configured" }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    console.log(`[email] invalid recipient "${to}" — skipped "${input.subject}"`)
    return { sent: false, reason: "invalid_recipient" }
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo ?? process.env.EMAIL_REPLY_TO ?? undefined,
      }),
    })
    const payload = (await res.json().catch(() => null)) as
      | { id?: string; message?: string }
      | null
    if (!res.ok) {
      console.error(`[email] provider error ${res.status}: ${payload?.message ?? "unknown"}`)
      return { sent: false, reason: `provider_${res.status}` }
    }
    return { sent: true, id: payload?.id }
  } catch (err) {
    console.error("[email] send failed", err instanceof Error ? err.message : err)
    return { sent: false, reason: "network_error" }
  }
}

export const send = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.string(),
    replyTo: v.optional(v.string()),
  },
  returns: v.object({
    sent: v.boolean(),
    reason: v.optional(v.string()),
    id: v.optional(v.string()),
  }),
  handler: async (_ctx, args): Promise<DeliveryResult> => await deliver(args),
})

export const sendAdminAlert = internalAction({
  args: { subject: v.string(), html: v.string(), text: v.string() },
  returns: v.object({ sent: v.boolean(), reason: v.optional(v.string()) }),
  handler: async (_ctx, args): Promise<{ sent: boolean; reason?: string }> => {
    const admin = process.env.ADMIN_EMAIL
    if (!admin) {
      console.log(`[email] ADMIN_EMAIL not set — dropped alert "${args.subject}"`)
      return { sent: false, reason: "not_configured" }
    }
    const result = await deliver({ to: admin, subject: args.subject, html: args.html, text: args.text })
    return { sent: result.sent, reason: result.reason }
  },
})

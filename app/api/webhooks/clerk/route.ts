import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

function getConvexClient(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) return null
  return new ConvexHttpClient(url)
}

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  // 503 (not 500) tells Clerk the endpoint is temporarily unavailable while
  // Clerk retries. Accounts are still repaired by auth.ensureMe on /account,
  // so a missing secret degrades sync instead of breaking sign-up.
  if (!CLERK_WEBHOOK_SECRET) {
    console.error("[clerk-webhook] CLERK_WEBHOOK_SECRET missing — user sync relies on auth.ensureMe")
    return Response.json({ error: "clerk_webhook_not_configured" }, { status: 503 })
  }
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY
  if (!CLERK_SECRET_KEY) {
    return Response.json({ error: "clerk_secret_not_configured" }, { status: 503 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  // Svix signs the EXACT raw bytes — verify against req.text(), not a
  // re-serialized JSON.stringify(payload) which can differ in formatting.
  const rawBody = await req.text()
  try {
    JSON.parse(rawBody)
  } catch {
    return new Response("Invalid JSON body", { status: 400 })
  }
  let evt: WebhookEvent
  try {
    const wh = new Webhook(CLERK_WEBHOOK_SECRET)
    evt = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response("Invalid webhook signature", { status: 400 })
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, first_name, last_name, email_addresses, image_url, primary_email_address_id } = evt.data
    const primaryEmailId = primary_email_address_id ?? email_addresses[0]?.id
    const email =
      email_addresses.find((e) => e.id === primaryEmailId)?.email_address ??
      email_addresses[0]?.email_address

    const convex = getConvexClient()
    if (!convex) {
      return new Response("NEXT_PUBLIC_CONVEX_URL is not configured", { status: 500 })
    }
    await convex.mutation(api.auth.syncUser, {
      secret: CLERK_SECRET_KEY,
      clerkId: id,
      name: [first_name, last_name].filter(Boolean).join(" ") || undefined,
      email,
      imageUrl: image_url,
    })
  }

  // user.deleted and other event types need no action — return 200 so Clerk
  // doesn't retry. Stale user rows are harmless (lookups miss, UI shows retry).

  return new Response(null, { status: 200 })
}

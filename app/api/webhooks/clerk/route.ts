import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!CLERK_WEBHOOK_SECRET) {
    return new Response("CLERK_WEBHOOK_SECRET is not configured", { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  const payload = await req.json()
  let evt: WebhookEvent
  try {
    const wh = new Webhook(CLERK_WEBHOOK_SECRET)
    evt = wh.verify(JSON.stringify(payload), {
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

    await convex.mutation(api.auth.syncUser, {
      clerkId: id,
      name: [first_name, last_name].filter(Boolean).join(" ") || undefined,
      email,
      imageUrl: image_url,
    })
  }

  return new Response(null, { status: 200 })
}

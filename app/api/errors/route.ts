import { NextResponse } from "next/server"

// Receives client error reports and turns them into structured logs plus an
// optional webhook notification. Rate-limited per call chain in memory; the
// endpoint is public by necessity (errors happen before sign-in).
const recent = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 20

function limited(key: string): boolean {
  const now = Date.now()
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  recent.set(key, hits)
  if (recent.size > 1000) recent.clear()
  return hits.length > MAX_PER_WINDOW
}

function clip(value: unknown, max: number): string | undefined {
  return typeof value === "string" ? value.slice(0, max) : undefined
}

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (limited(ip)) return NextResponse.json({ ok: true, throttled: true })

  const event = {
    kind: "client_error",
    message: clip(body.message, 500) ?? "Unknown error",
    stack: clip(body.stack, 4000),
    context: clip(body.context, 200),
    url: clip(body.url, 500),
    userAgent: clip(body.userAgent, 300),
    digest: clip(body.digest, 200),
    at: new Date().toISOString(),
  }

  console.error("[client-error]", JSON.stringify(event))

  const webhook = process.env.ERROR_WEBHOOK_URL
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // `content` works for Slack and Discord; extra keys are ignored.
        body: JSON.stringify({
          content: `🚨 GiGi client error: ${event.message}\n${event.url ?? ""}`,
          text: `🚨 GiGi client error: ${event.message}\n${event.url ?? ""}`,
          event,
        }),
      })
    } catch {
      // Notification failure must not fail the report.
    }
  }

  return NextResponse.json({ ok: true })
}

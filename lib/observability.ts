// Client + server error reporting without a heavy SDK.
//
// Client: reportError() posts a compact payload to /api/errors.
// Server: that route writes structured JSON to the platform logs (searchable
// in Vercel → Logs) and, when ERROR_WEBHOOK_URL is set, forwards the event to
// a Slack/Discord-compatible webhook so someone is actually notified.
//
// Swap in Sentry later by replacing the body of the route — call sites stay.

export interface ErrorReport {
  message: string
  stack?: string
  context?: string
  url?: string
  userAgent?: string
  digest?: string
}

export function reportError(error: unknown, context?: string): void {
  if (typeof window === "undefined") return
  const err = error instanceof Error ? error : new Error(typeof error === "string" ? error : "Unknown error")
  const payload: ErrorReport = {
    message: err.message.slice(0, 500),
    stack: err.stack?.slice(0, 4000),
    context,
    url: window.location.href,
    userAgent: navigator.userAgent,
    digest: (err as Error & { digest?: string }).digest,
  }
  try {
    void fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Never let reporting throw inside an error path.
  }
}

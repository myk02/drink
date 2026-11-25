"use client"

import { useEffect } from "react"
import { reportError } from "@/lib/observability"

// Catches render errors that escape every route-level boundary.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportError(error, "global-error-boundary")
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#121212", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <p style={{ color: "#AFFF00", fontSize: 11, letterSpacing: 3 }}>GIGI ENERGY</p>
            <h1 style={{ fontSize: 28, margin: "12px 0" }}>Something broke on our end</h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6 }}>
              We&apos;ve logged it and the crew is on it. Your cart is still saved — try again.
            </p>
            <button
              onClick={reset}
              style={{ marginTop: 24, background: "#AFFF00", color: "#121212", border: 0, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

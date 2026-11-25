#!/usr/bin/env node
/**
 * Paystack preflight. Read-only: calls /balance with the configured secret key
 * and reports which mode the key belongs to.
 *
 *   node scripts/check-payments.mjs        (or: npm run check:payments)
 *
 * Exits non-zero when the key is missing or rejected, so it can gate a deploy.
 * It never prints the key.
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

function loadEnvFile(file) {
  try {
    const text = readFileSync(resolve(process.cwd(), file), "utf8")
    for (const line of text.split(/\r?\n/)) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
      if (!match) continue
      const [, key, rawValue] = match
      if (process.env[key] !== undefined) continue
      process.env[key] = rawValue.replace(/^["']|["']$/g, "")
    }
  } catch {
    // File absent is fine — CI provides real env vars.
  }
}

loadEnvFile(".env.local")
loadEnvFile(".env")

const key = process.env.PAYSTACK_SECRET_KEY?.trim()
const callback = process.env.RENEWAL_CALLBACK_URL

console.log("Paystack preflight")
console.log("──────────────────")

if (!key) {
  console.error("✗ PAYSTACK_SECRET_KEY is not set (checked env and .env.local).")
  process.exit(1)
}

const mode = key.startsWith("sk_live_") ? "LIVE" : key.startsWith("sk_test_") ? "TEST" : "UNKNOWN"
console.log(`• Key mode: ${mode}`)
if (mode === "LIVE") {
  console.log("  ⚠  Live keys move real money. Use a test key for smoke tests.")
} else if (mode === "UNKNOWN") {
  console.log("  ⚠  Key does not look like a Paystack secret key.")
}

if (!callback) {
  console.log("• RENEWAL_CALLBACK_URL is not set — M-Pesa renewal emails will not return customers to a thank-you page.")
} else {
  console.log(`• Renewal callback: ${callback}`)
}

const started = Date.now()
try {
  const res = await fetch("https://api.paystack.co/balance", {
    headers: { Authorization: `Bearer ${key}` },
  })
  const payload = await res.json().catch(() => null)
  const ms = Date.now() - started
  if (!res.ok || !payload?.status) {
    console.error(`✗ Paystack rejected the key (HTTP ${res.status}): ${payload?.message ?? "no message"}`)
    process.exit(1)
  }
  const balances = Array.isArray(payload.data) ? payload.data : []
  console.log(`✓ Key accepted in ${ms}ms`)
  for (const b of balances) {
    console.log(`  balance: ${b.currency} ${(Number(b.balance) / 100).toLocaleString("en-KE")}`)
  }
  console.log("\nNext: run one order, one subscription and one donation in TEST mode.")
} catch (err) {
  console.error(`✗ Could not reach Paystack: ${err instanceof Error ? err.message : err}`)
  process.exit(1)
}

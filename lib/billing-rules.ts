// Pure billing rules shared by the subscriptions mutations and unit tests.
// Keeping the decision points here means the state machine can be verified
// without a Convex deployment.

export const MONTH_MS = 30 * 24 * 60 * 60 * 1000

export type SubscriptionStatus = "pending" | "active" | "past_due" | "paused" | "cancelled"

export function nextBillingFrom(now: number): number {
  return now + MONTH_MS
}

// After generating an unanswered renewal checkout link, how many failed
// attempts the membership has and what state it should be in.
export function renewalAttemptOutcome(
  previousFailedCount: number
): { failedChargeCount: number; status: "active" | "past_due" | "cancelled" } {
  const failedChargeCount = Math.max(0, previousFailedCount) + 1
  if (failedChargeCount >= 5) return { failedChargeCount, status: "cancelled" }
  if (failedChargeCount >= 2) return { failedChargeCount, status: "past_due" }
  return { failedChargeCount, status: "active" }
}

export function normalizeChannel(channel: string): "card" | "mobile_money" | "unknown" {
  if (channel === "card") return "card"
  if (channel === "mobile_money") return "mobile_money"
  return "unknown"
}

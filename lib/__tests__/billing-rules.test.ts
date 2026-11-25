import { describe, expect, it } from "vitest"
import { MONTH_MS, nextBillingFrom, normalizeChannel, renewalAttemptOutcome } from "../billing-rules"

describe("renewal attempt state machine", () => {
  it("stays active on the first missed cycle", () => {
    expect(renewalAttemptOutcome(0)).toEqual({ failedChargeCount: 1, status: "active" })
  })

  it("moves to past_due on the second attempt", () => {
    expect(renewalAttemptOutcome(1)).toEqual({ failedChargeCount: 2, status: "past_due" })
    expect(renewalAttemptOutcome(3)).toEqual({ failedChargeCount: 4, status: "past_due" })
  })

  it("cancels after five attempts", () => {
    expect(renewalAttemptOutcome(4)).toEqual({ failedChargeCount: 5, status: "cancelled" })
    expect(renewalAttemptOutcome(9)).toEqual({ failedChargeCount: 10, status: "cancelled" })
  })

  it("treats a negative stored count as zero", () => {
    expect(renewalAttemptOutcome(-3)).toEqual({ failedChargeCount: 1, status: "active" })
  })
})

describe("billing dates", () => {
  it("advances exactly one 30-day cycle", () => {
    expect(nextBillingFrom(1_000)).toBe(1_000 + MONTH_MS)
  })
})

describe("payment channels", () => {
  it("maps only known Paystack channels", () => {
    expect(normalizeChannel("card")).toBe("card")
    expect(normalizeChannel("mobile_money")).toBe("mobile_money")
    expect(normalizeChannel("bank_transfer")).toBe("unknown")
    expect(normalizeChannel("")).toBe("unknown")
  })
})

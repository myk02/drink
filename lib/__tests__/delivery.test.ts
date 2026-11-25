import { describe, expect, it } from "vitest"
import { computeDeliveryFeeKes, DELIVERY_ZONES, FREE_DELIVERY_THRESHOLD_KES, getZoneFee } from "../delivery"

describe("delivery zones", () => {
  it("charges each zone's fee below the free-delivery threshold", () => {
    for (const zone of DELIVERY_ZONES) {
      expect(computeDeliveryFeeKes(zone.name, 0)).toBe(zone.feeKes)
      expect(computeDeliveryFeeKes(zone.name, FREE_DELIVERY_THRESHOLD_KES - 1)).toBe(zone.feeKes)
    }
  })

  it("is free at and above the threshold", () => {
    expect(computeDeliveryFeeKes("Westlands", FREE_DELIVERY_THRESHOLD_KES)).toBe(0)
    expect(computeDeliveryFeeKes("Westlands", FREE_DELIVERY_THRESHOLD_KES + 5000)).toBe(0)
  })

  it("rejects unknown zones instead of silently charging a fee", () => {
    expect(computeDeliveryFeeKes("Atlantis", 1000)).toBeNull()
    expect(getZoneFee("Atlantis")).toBeNull()
  })
})

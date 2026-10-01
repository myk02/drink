// Nairobi delivery zones + fees (KES). Shared by checkout UI and the
// Convex checkout action — Convex is the pricing source of truth.
export interface DeliveryZone {
  name: string
  feeKes: number
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  { name: "CBD / Town", feeKes: 200 },
  { name: "Westlands", feeKes: 250 },
  { name: "Kilimani", feeKes: 250 },
  { name: "Eastlands", feeKes: 250 },
  { name: "Lavington / Kileleshwa", feeKes: 300 },
  { name: "South B / South C", feeKes: 300 },
  { name: "Karen / Langata", feeKes: 400 },
  { name: "Other Nairobi suburb", feeKes: 350 },
]

export function getZoneFee(zoneName: string): number | null {
  const zone = DELIVERY_ZONES.find((z) => z.name === zoneName)
  return zone ? zone.feeKes : null
}

// Single source of truth for the delivery fee for a given zone + subtotal.
// Used by BOTH the checkout UI (display) and the Convex checkout action
// (charging) so the advertised free-delivery threshold can never diverge
// from what the customer is actually charged.
export function computeDeliveryFeeKes(zoneName: string, subtotalKes: number): number | null {
  const zoneFee = getZoneFee(zoneName)
  if (zoneFee === null) return null
  if (subtotalKes >= FREE_DELIVERY_THRESHOLD_KES) return 0
  return zoneFee
}

export function formatKes(amount: number): string {
  return `KSh ${amount.toLocaleString("en-KE")}`
}

export const FREE_DELIVERY_THRESHOLD_KES = 3000

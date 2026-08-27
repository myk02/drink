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

export function formatKes(amount: number): string {
  return `KSh ${amount.toLocaleString("en-KE")}`
}

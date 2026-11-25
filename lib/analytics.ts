// Funnel analytics. Vercel Web Analytics is already mounted in the root
// layout; these wrappers make conversion tracking safe to call anywhere
// (no-ops during SSR, never throws into a user flow).
import { track } from "@vercel/analytics"

type Props = Record<string, string | number | boolean | null>

export function trackEvent(name: string, props?: Props): void {
  if (typeof window === "undefined") return
  try {
    track(name, props)
  } catch {
    // Analytics must never break a purchase or signup.
  }
}

// Canonical funnel event names so dashboards stay consistent.
export const FUNNEL = {
  addToCart: "add_to_cart",
  checkoutStart: "checkout_start",
  purchase: "purchase",
  subscriptionStart: "subscription_start",
  donationStart: "donation_start",
  newsletterSignup: "newsletter_signup",
  eventRegistration: "event_registration",
} as const

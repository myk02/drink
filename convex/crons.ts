import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

// Daily at 09:00 Nairobi time (06:00 UTC): prepare renewal checkout links for
// M-Pesa subscribers whose billing date has passed (Kenya has no M-Pesa
// auto-debit on Paystack).
crons.daily("renew-due-non-card-subscriptions", { hourUTC: 6, minuteUTC: 0 }, internal.payments.renewDueMpesaSubscriptions, {})

export default crons

// Shared transactional email templates. Pure functions: no SDK, no env access,
// so they can be imported by Convex actions and unit-tested with Vitest.

export interface EmailContent {
  subject: string
  html: string
  text: string
}

const BRAND = "#AFFF00"
const INK = "#121212"
const MUTED = "#6b6b6b"

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function money(amountKes: number): string {
  return `KSh ${Math.round(amountKes).toLocaleString("en-KE")}`
}

function layout(opts: { heading: string; intro: string; body: string; footer?: string }): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f4f4;font-family:Helvetica,Arial,sans-serif;color:${INK}">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:${INK};padding:20px 24px">
      <span style="color:${BRAND};font-size:20px;font-weight:800;letter-spacing:-0.5px">GIGI ENERGY</span>
    </div>
    <div style="background:#ffffff;padding:28px 24px;border:1px solid #e5e5e5;border-top:none">
      <h1 style="margin:0 0 8px;font-size:22px;line-height:1.25">${escapeHtml(opts.heading)}</h1>
      <p style="margin:0 0 20px;color:${MUTED};font-size:14px;line-height:1.6">${escapeHtml(opts.intro)}</p>
      ${opts.body}
      <hr style="border:none;border-top:1px solid #eee;margin:28px 0 16px" />
      <p style="margin:0;color:${MUTED};font-size:11px;line-height:1.6">
        ${opts.footer ? `${opts.footer}<br/>` : ""}
        GiGi Energy · Nairobi, Kenya · <a href="mailto:hello@gigi.energy" style="color:${MUTED}">hello@gigi.energy</a>
      </p>
    </div>
  </div>
</body></html>`
}

function rows(items: Array<[string, string]>): string {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${items
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 0;color:${MUTED}">${escapeHtml(label)}</td><td style="padding:6px 0;text-align:right;font-weight:600">${escapeHtml(value)}</td></tr>`
    )
    .join("")}</table>`
}

export function orderReceiptEmail(input: {
  customerName: string
  orderNumber: string
  items: Array<{ name: string; quantity: number; unitPriceKes: number }>
  subtotalKes: number
  memberDiscountKes?: number
  deliveryFeeKes: number
  totalKes: number
  deliveryZone: string
  deliveryAddress: string
  trackUrl: string
}): EmailContent {
  const itemLines = input.items
    .map((i) => `${i.quantity} × ${i.name} — ${money(i.unitPriceKes * i.quantity)}`)
    .join("\n")

  const itemRows = input.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px">${escapeHtml(i.name)}<span style="color:${MUTED}"> × ${i.quantity}</span></td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-size:14px">${escapeHtml(money(i.unitPriceKes * i.quantity))}</td></tr>`
    )
    .join("")

  const totals: Array<[string, string]> = [["Subtotal", money(input.subtotalKes)]]
  if (input.memberDiscountKes && input.memberDiscountKes > 0) {
    totals.push(["Member discount", `− ${money(input.memberDiscountKes)}`])
  }
  totals.push(["Delivery", input.deliveryFeeKes === 0 ? "Free" : money(input.deliveryFeeKes)])
  totals.push(["Total paid", money(input.totalKes)])

  return {
    subject: `Your GiGi order ${input.orderNumber} is confirmed`,
    html: layout({
      heading: `Thanks, ${input.customerName.split(" ")[0] || "friend"} — payment received`,
      intro: `Order ${input.orderNumber} is confirmed and heading to the packing bench. We deliver in 1–2 working days in Nairobi.`,
      body: `
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">${itemRows}</table>
        ${rows(totals)}
        <div style="margin-top:20px;padding:14px;background:#f7f7f7;font-size:13px;line-height:1.6">
          <strong>Delivering to</strong><br/>
          ${escapeHtml(input.deliveryAddress)}<br/>${escapeHtml(input.deliveryZone)}
        </div>
        <p style="margin:24px 0 0"><a href="${escapeHtml(input.trackUrl)}" style="background:${BRAND};color:${INK};text-decoration:none;padding:12px 20px;font-weight:700;font-size:14px;display:inline-block">Track this order</a></p>`,
      footer: "Questions? Reply to this email and a human will answer.",
    }),
    text: `Thanks ${input.customerName} — payment received for order ${input.orderNumber}.

${itemLines}

Subtotal: ${money(input.subtotalKes)}
${input.memberDiscountKes ? `Member discount: -${money(input.memberDiscountKes)}\n` : ""}Delivery: ${input.deliveryFeeKes === 0 ? "Free" : money(input.deliveryFeeKes)}
Total paid: ${money(input.totalKes)}

Delivering to:
${input.deliveryAddress}
${input.deliveryZone}

Track your order: ${input.trackUrl}`,
  }
}

export function eventConfirmationEmail(input: {
  name: string
  eventTitle: string
  date: string
  time: string
  location: string
  eventUrl: string
}): EmailContent {
  return {
    subject: `You're registered — ${input.eventTitle}`,
    html: layout({
      heading: `You're on the list, ${input.name.split(" ")[0] || "friend"}`,
      intro: `Your spot for ${input.eventTitle} is confirmed. Bring this email (or just your name) to the GiGi desk.`,
      body: `${rows([
        ["Event", input.eventTitle],
        ["Date", input.date],
        ["Time", input.time],
        ["Location", input.location],
      ])}
      <p style="margin:24px 0 0"><a href="${escapeHtml(input.eventUrl)}" style="background:${BRAND};color:${INK};text-decoration:none;padding:12px 20px;font-weight:700;font-size:14px;display:inline-block">Event details</a></p>`,
      footer: "Can't make it? Reply and we'll free your spot.",
    }),
    text: `You're registered for ${input.eventTitle}.
Date: ${input.date}
Time: ${input.time}
Location: ${input.location}
Details: ${input.eventUrl}`,
  }
}

export function inquiryAckEmail(input: {
  name: string
  category: string
  message: string
}): EmailContent {
  return {
    subject: "We got your message — GiGi Energy",
    html: layout({
      heading: `Thanks, ${input.name.split(" ")[0] || "friend"}`,
      intro: `Your ${input.category} enquiry reached the team. We reply within one working day.`,
      body: `<div style="padding:14px;background:#f7f7f7;font-size:13px;line-height:1.6;white-space:pre-wrap">${escapeHtml(input.message)}</div>`,
      footer: "Need us sooner? Call +254 700 000 000 during business hours.",
    }),
    text: `Thanks ${input.name} — your ${input.category} enquiry reached the team. We reply within one working day.

Your message:
${input.message}`,
  }
}

export function adminAlertEmail(input: {
  subject: string
  lines: Array<[string, string]>
}): EmailContent {
  return {
    subject: `[GiGi] ${input.subject}`,
    html: layout({
      heading: input.subject,
      intro: "New activity on the site.",
      body: `<div style="font-size:13px">${rows(input.lines)}</div>`,
      footer: "Sent by the GiGi site.",
    }),
    text: `${input.subject}\n\n${input.lines.map(([k, v]) => `${k}: ${v}`).join("\n")}`,
  }
}

export function renewalLinkEmail(input: {
  planName: string
  amountKes: number
  checkoutUrl: string
  nextBillingDate: string
}): EmailContent {
  return {
    subject: `Your ${input.planName} renewal is ready`,
    html: layout({
      heading: "Time to top up your membership",
      intro: `M-Pesa subscriptions renew manually. Your ${input.planName} membership is due on ${input.nextBillingDate}.`,
      body: `${rows([
        ["Plan", input.planName],
        ["Amount", money(input.amountKes)],
        ["Due", input.nextBillingDate],
      ])}
      <p style="margin:24px 0 0"><a href="${escapeHtml(input.checkoutUrl)}" style="background:${BRAND};color:${INK};text-decoration:none;padding:12px 20px;font-weight:700;font-size:14px;display:inline-block">Complete renewal · M-Pesa</a></p>
      <p style="margin:16px 0 0;color:${MUTED};font-size:12px">The link is unique to this renewal. If it expires, open your account page to generate a fresh one.</p>`,
      footer: "You can pause or cancel any time from your account page.",
    }),
    text: `Your ${input.planName} membership is due on ${input.nextBillingDate}.
Amount: ${money(input.amountKes)}
Complete renewal: ${input.checkoutUrl}`,
  }
}

export function newsletterConfirmationEmail(input: {
  confirmUrl: string
}): EmailContent {
  return {
    subject: "Confirm your GiGi Energy subscription",
    html: layout({
      heading: "One click to confirm",
      intro: "Confirm your email and we'll send new flavour drops, Nairobi activations and member offers. Nothing else.",
      body: `<p style="margin:24px 0 0"><a href="${escapeHtml(input.confirmUrl)}" style="background:${BRAND};color:${INK};text-decoration:none;padding:12px 20px;font-weight:700;font-size:14px;display:inline-block">Confirm subscription</a></p>
      <p style="margin:16px 0 0;color:${MUTED};font-size:12px">Didn't sign up? Ignore this email and we'll never contact you.</p>`,
      footer: "GiGi Energy, Nairobi, Kenya.",
    }),
    text: `Confirm your GiGi Energy subscription: ${input.confirmUrl}

If you didn't sign up, ignore this email.`,
  }
}

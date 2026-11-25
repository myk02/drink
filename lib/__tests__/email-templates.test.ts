import { describe, expect, it } from "vitest"
import { adminAlertEmail, escapeHtml, orderReceiptEmail, renewalLinkEmail } from "../email-templates"

const order = {
  customerName: "Jane Wanjiku",
  orderNumber: "GGABC123",
  items: [{ name: "Lemon Lime · 12-Pack", quantity: 2, unitPriceKes: 1600 }],
  subtotalKes: 3200,
  deliveryFeeKes: 0,
  totalKes: 3200,
  deliveryZone: "Westlands",
  deliveryAddress: "12 <script>alert(1)</script> Riverside Drive",
  trackUrl: "https://gigi.energy/orders/track?reference=GGABC123",
}

describe("email templates", () => {
  it("escapes customer-supplied values in HTML but keeps them readable in text", () => {
    const receipt = orderReceiptEmail(order)
    expect(receipt.html).not.toContain("<script>alert(1)</script>")
    expect(receipt.html).toContain("&lt;script&gt;")
    expect(receipt.text).toContain("<script>")
  })

  it("shows the correct totals and free delivery label", () => {
    const receipt = orderReceiptEmail(order)
    expect(receipt.html).toContain("KSh 3,200")
    expect(receipt.html).toContain("Free")
    expect(receipt.text).toContain("Total paid: KSh 3,200")
  })

  it("subtracts a member discount", () => {
    const receipt = orderReceiptEmail({ ...order, memberDiscountKes: 320, totalKes: 2880 })
    expect(receipt.html).toContain("− KSh 320")
    expect(receipt.text).toContain("Member discount: -KSh 320")
  })

  it("puts the renewal link in both bodies", () => {
    const renew = renewalLinkEmail({
      planName: "Case Club",
      amountKes: 1500,
      checkoutUrl: "https://checkout.paystack.com/abc",
      nextBillingDate: "1 December 2026",
    })
    expect(renew.html).toContain("https://checkout.paystack.com/abc")
    expect(renew.text).toContain("https://checkout.paystack.com/abc")
  })

  it("escapes admin alert values", () => {
    const alert = adminAlertEmail({ subject: "New enquiry", lines: [["Email", "a@b.com"]] })
    expect(alert.subject).toContain("New enquiry")
    expect(alert.html).toContain("a@b.com")
  })

  it("escapes the five HTML-significant characters", () => {
    expect(escapeHtml(`<>&"'`)).toBe("&lt;&gt;&amp;&quot;&#39;")
  })
})

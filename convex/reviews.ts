import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

const DAY_MS = 24 * 60 * 60 * 1000

export const getForProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("productReviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect()
    return rows
      .filter((r) => r.isApproved)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 50)
  },
})

export const getSummary = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("productReviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect()
    const approved = rows.filter((r) => r.isApproved)
    if (approved.length === 0) return { count: 0, average: 0 }
    const sum = approved.reduce((acc, r) => acc + r.rating, 0)
    return { count: approved.length, average: Math.round((sum / approved.length) * 10) / 10 }
  },
})

export const submit = mutation({
  args: {
    productId: v.id("products"),
    name: v.string(),
    rating: v.number(),
    title: v.optional(v.string()),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim().slice(0, 60)
    const body = args.body.trim().slice(0, 1000)
    const title = args.title?.trim().slice(0, 120) || undefined
    if (name.length < 2) throw new Error("Please enter your name")
    if (!Number.isInteger(args.rating) || args.rating < 1 || args.rating > 5) {
      throw new Error("Please choose a rating from 1 to 5")
    }
    if (body.length < 4) throw new Error("Please write a few words about this pack")
    const product = await ctx.db.get(args.productId)
    if (!product) throw new Error("Product not found")

    // Light anti-spam: max 3 reviews per product per day.
    const since = Date.now() - DAY_MS
    const recent = await ctx.db
      .query("productReviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect()
    if (recent.filter((r) => r.createdAt >= since).length >= 3) {
      throw new Error("Thanks — reviews are paused briefly to prevent spam. Try again tomorrow.")
    }

    await ctx.db.insert("productReviews", {
      productId: args.productId,
      productSlug: product.slug,
      name,
      rating: args.rating,
      title,
      body,
      isApproved: true,
      createdAt: Date.now(),
    })
    return { success: true }
  },
})

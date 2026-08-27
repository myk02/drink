import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import type { QueryCtx } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"

// Throws unless the caller is a signed-in admin. Use at the top of every
// admin mutation/query.
export async function requireAdmin(ctx: QueryCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Sign in required.")
  const user = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).first()
  if (!user || user.role !== "admin") throw new Error("Admin access required.")
  return user
}

// UI gate: current caller's role (null when signed out / not provisioned).
export const getMyRole = query({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await requireAdmin(ctx)
      return { role: user.role, name: user.name ?? null, email: user.email ?? null }
    } catch {
      return null
    }
  },
})

// One-off promotion run from the CLI:
//   npx convex run admin:promote '{"email":"you@example.com"}'
export const promote = mutation({
  args: { email: v.string(), secret: v.string() },
  handler: async (ctx, args) => {
    // CLI-invoked mutations have no user identity; guard with the Clerk
    // signing secret value so this can't be called from the browser.
    const expected = process.env.CLERK_SECRET_KEY ?? ""
    if (!expected || args.secret !== expected) throw new Error("Invalid secret.")

    const email = args.email.trim().toLowerCase()
    const users = await ctx.db.query("users").collect()
    const target = users.find((u) => u.email?.trim().toLowerCase() === email)
    if (!target) throw new Error(`No user record found for ${email}. They must sign in once first (webhook creates the record).`)
    await ctx.db.patch(target._id, { role: "admin" })
    return { promoted: target.email ?? email }
  },
})

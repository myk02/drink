import { internalMutation } from "./_generated/server"

const flavorCatalog = [
  {
    name: "Lemon Lime",
    tagline: "Citrus Shock",
    description: "A clean hit of lemon zest and bright lime made for early starts, late edits, and hot Nairobi afternoons.",
    image: "/images/flavours/lemon-lime.png",
    accent: "#84cc16",
    badges: ["Zero Sugar", "75mg Caffeine", "Natural Flavours", "Vitamin Rich"],
    order: 0,
  },
  {
    name: "Pineapple Coconut",
    tagline: "Tropical Rush",
    description: "Coastal pineapple brightness rounded out with smooth coconut for a chilled, beach-day kind of lift.",
    image: "/images/flavours/pineapple-coconut.png",
    accent: "#f59e0b",
    badges: ["Zero Sugar", "75mg Caffeine", "Natural Flavours", "Vitamin Rich"],
    order: 1,
  },
  {
    name: "Mango Passion",
    tagline: "Sunrise Burst",
    description: "Juicy mango and tangy passion fruit collide in a bright, punchy blend that tastes like golden hour.",
    image: "/images/flavours/mango-passion.png",
    accent: "#f97316",
    badges: ["Zero Sugar", "75mg Caffeine", "Natural Flavours", "Vitamin C Rich"],
    order: 2,
  },
  {
    name: "Baobab Berry",
    tagline: "Safari Zing",
    description: "Tart baobab meets mixed berries for a crisp superfruit profile with a sharp, refreshing finish.",
    image: "/images/flavours/baobab-berry.png",
    accent: "#a855f7",
    badges: ["Zero Sugar", "Antioxidant Rich", "Natural Flavours", "Vitamin Rich"],
    order: 3,
  },
  {
    name: "Tamarind Ginger",
    tagline: "Spiced Volt",
    description: "Sweet-sour tamarind with a ginger snap for a warmer, more grown-up kind of energy.",
    image: "/images/flavours/tamarind-ginger.png",
    accent: "#d97706",
    badges: ["Zero Sugar", "Ginger Kick", "Natural Flavours", "Vitamin Rich"],
    order: 4,
  },
  {
    name: "Watermelon Mint",
    tagline: "Cool Snap",
    description: "Fresh watermelon, garden mint, and a dry finish built for gym bags, lunch breaks, and sunny commutes.",
    image: "/images/flavours/watermelon-mint.png",
    accent: "#22c55e",
    badges: ["Zero Sugar", "Cooling Finish", "Natural Flavours", "Vitamin Rich"],
    order: 5,
  },
  {
    name: "Hibiscus Raspberry",
    tagline: "Floral Kick",
    description: "Ruby hibiscus and raspberry bring a tart, floral spark that feels bold without getting too sweet.",
    image: "/images/flavours/hibiscus-raspberry.png",
    accent: "#e11d48",
    badges: ["Zero Sugar", "Botanical Blend", "Natural Flavours", "Vitamin Rich"],
    order: 6,
  },
  {
    name: "Guava Chili",
    tagline: "Sweet Heat",
    description: "Pink guava up front, a tiny chili lift at the end, and enough fizz to keep the whole thing playful.",
    image: "/images/flavours/guava-chili.png",
    accent: "#fb7185",
    badges: ["Zero Sugar", "Light Spice", "Natural Flavours", "Vitamin Rich"],
    order: 7,
  },
  {
    name: "Passion Lemonade",
    tagline: "Bright Drive",
    description: "Classic lemonade energy with passion fruit depth: citrusy, tart, and easy to reach for twice.",
    image: "/images/flavours/passion-lemonade.png",
    accent: "#eab308",
    badges: ["Zero Sugar", "Citrus Lift", "Natural Flavours", "Vitamin Rich"],
    order: 8,
  },
  {
    name: "Blackcurrant Acai",
    tagline: "Deep Charge",
    description: "Dark berry intensity from blackcurrant and acai with a clean finish that keeps it crisp.",
    image: "/images/flavours/blackcurrant-acai.png",
    accent: "#7c3aed",
    badges: ["Zero Sugar", "Berry Blend", "Natural Flavours", "Vitamin Rich"],
    order: 9,
  },
]

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existingFlavors = await ctx.db.query("flavors").collect()

    for (const flavor of existingFlavors) {
      if (flavor.isComingSoon || flavor.name.toLowerCase().includes("mystery")) {
        await ctx.db.delete(flavor._id)
      }
    }

    for (const flavor of flavorCatalog) {
      const existing = existingFlavors.find((item) => item.name === flavor.name)
      const doc = {
        ...flavor,
        isAvailable: true,
        isComingSoon: false,
        price: 150,
      }

      if (existing) {
        await ctx.db.patch(existing._id, doc)
      } else {
        await ctx.db.insert("flavors", doc)
      }
    }

    const gyms = [
      { name: "FitFusion Nairobi", location: "Westlands", area: "Westlands", description: "Premium gym with state-of-the-art equipment. GiGi is the official energy drink.", isPartner: true },
      { name: "Iron Haven Gym", location: "Kilimani", area: "Kilimani", description: "Hardcore training facility. Fuel your lifts with GiGi.", isPartner: true },
      { name: "Urban Strong", location: "CBD", area: "CBD", description: "Convenient downtown gym for the busy professional.", isPartner: false },
      { name: "CrossFit 254", location: "Lavington", area: "Lavington", description: "High-intensity workouts powered by GiGi.", isPartner: true },
      { name: "Yoga & Flex Studio", location: "Karen", area: "Karen", description: "Mindful movement meets clean energy. GiGi partnered studio.", isPartner: true },
      { name: "BodyZone Gym", location: "Eastlands", area: "Eastlands", description: "Community-focused fitness center.", isPartner: false },
    ]

    const existingGyms = await ctx.db.query("gyms").collect()
    for (const gym of gyms) {
      const existing = existingGyms.find((item) => item.name === gym.name)
      if (existing) {
        await ctx.db.patch(existing._id, gym)
      } else {
        await ctx.db.insert("gyms", gym)
      }
    }
  },
})

export const seedProducts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").collect()

    const singlePacks = flavorCatalog.map((flavor) => ({
      flavorName: flavor.name,
      slug: `${flavor.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-12`,
      image: flavor.image,
      sortOrder: flavor.order + 1,
    }))

    for (const pack of singlePacks) {
      const doc = {
        name: `${pack.flavorName} · 12-Pack`,
        slug: pack.slug,
        description: `Twelve cans of ${pack.flavorName} — zero sugar, natural flavours, delivered anywhere in Nairobi.`,
        image: pack.image,
        type: "single" as const,
        flavorName: pack.flavorName,
        canCount: 12,
        priceKes: 1600,
        compareAtKes: 1800,
        isActive: true,
        sortOrder: pack.sortOrder,
      }
      const existingPack = existing.find((product) => product.slug === pack.slug)

      if (existingPack) {
        await ctx.db.patch(existingPack._id, doc)
      } else {
        await ctx.db.insert("products", doc)
      }
    }

    const starter = {
      name: "Taster · 6-Pack",
      slug: "taster-6",
      description: "New to GiGi? Six mixed cans from the full GiGi flavour wall — find your fuel before you commit.",
      image: "/images/flavours/mango-passion.png",
      type: "starter",
      canCount: 6,
      priceKes: 850,
      compareAtKes: 1000,
      isActive: true,
      sortOrder: 0,
    } as const

    const mixed = {
      name: "Mixed Case · 24 Cans",
      slug: "mixed-24",
      description: "The full ten-flavour line-up. 24 cans across the GiGi range for offices, crews, and fridge dominance.",
      image: "/images/flavours/pineapple-coconut.png",
      type: "mixed",
      canCount: 24,
      priceKes: 3000,
      compareAtKes: 3400,
      isActive: true,
      sortOrder: 11,
    } as const

    for (const product of [starter, mixed]) {
      const existingProduct = existing.find((item) => item.slug === product.slug)
      if (existingProduct) {
        await ctx.db.patch(existingProduct._id, product)
      } else {
        await ctx.db.insert("products", product)
      }
    }
  },
})

export const seedPlans = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("plans").collect()
    if (existing.length > 0) return

    await ctx.db.insert("plans", {
      slug: "club",
      name: "GiGi Club",
      description: "Back the brand month-to-month. Fuel our next batch, event and drop — and get the perks.",
      perks: [
        "Early access to every new flavour drop",
        "Members-only tasting events in Nairobi",
        "10% insider discount code for shop orders",
        "Your name on the supporters wall",
        "Sticker pack in your first shop order",
      ],
      amountKes: 300,
      interval: "monthly",
      isActive: true,
      sortOrder: 0,
    })

    await ctx.db.insert("plans", {
      slug: "case-club",
      name: "Case Club",
      description: "The serious fuel plan. A fresh case delivered to your door every month, billed monthly.",
      perks: [
        "12-can case delivered monthly (Nairobi)",
        "Save vs buying single cans",
        "Swap your flavour mix each cycle",
        "Pause or cancel anytime",
        "All GiGi Club perks included",
      ],
      amountKes: 1500,
      interval: "monthly",
      isActive: true,
      sortOrder: 1,
    })
  },
})

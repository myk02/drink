import { internalMutation } from "./_generated/server"

export const seed = internalMutation({
  handler: async (ctx) => {
    const existingFlavors = await ctx.db.query("flavors").collect()
    if (existingFlavors.length > 0) return

    await ctx.db.insert("flavors", {
      name: "Lemon Lime",
      tagline: "Citrus Shock",
      description: "A zesty explosion of natural lemon and lime that wakes you up instantly. Made with real citrus extracts sourced from local Kenyan farms.",
      image: "/images/drink2.png",
      accent: "#84cc16",
      badges: ["Zero Sugar", "Metabolism Boost", "Natural Flavours", "Vitamin Rich"],
      isAvailable: true,
      isComingSoon: false,
      price: 150,
      order: 0,
    })

    await ctx.db.insert("flavors", {
      name: "Pineapple Coconut",
      tagline: "Tropical Rush",
      description: "Island vibes with every sip. Transport yourself to the Kenyan coast with this refreshing tropical blend.",
      image: "/images/drink1.png",
      accent: "#f59e0b",
      badges: ["Zero Sugar", "Metabolism Boost", "Natural Flavours", "Vitamin Rich"],
      isAvailable: true,
      isComingSoon: false,
      price: 150,
      order: 1,
    })

    await ctx.db.insert("flavors", {
      name: "Mango Passion",
      tagline: "Sunrise Burst",
      description: "Sweet Kenyan mangoes meet tangy passion fruit for the perfect sunrise energy boost.",
      image: "/images/drink2.png",
      accent: "#f97316",
      badges: ["Zero Sugar", "Natural Flavours", "Vitamin C Rich"],
      isAvailable: true,
      isComingSoon: false,
      price: 150,
      order: 2,
    })

    await ctx.db.insert("flavors", {
      name: "Baobab Berry",
      tagline: "Safari Zing",
      description: "Inspired by the African superfruit baobab, blended with wild berries for an antioxidant-packed energy rush.",
      image: "/images/drink1.png",
      accent: "#a855f7",
      badges: ["Zero Sugar", "Antioxidant Rich", "Natural Flavours", "Vitamin Rich"],
      isAvailable: true,
      isComingSoon: false,
      price: 150,
      order: 3,
    })

    await ctx.db.insert("flavors", {
      name: "Mystery Flavour",
      tagline: "Coming Soon",
      description: "Something epic is brewing in our Nairobi lab... Stay tuned for the drop.",
      image: "/mystery-energy-drink-can-silhouette.jpg",
      accent: "#AFFF00",
      badges: ["Dropping Soon"],
      isAvailable: false,
      isComingSoon: true,
      price: undefined,
      order: 4,
    })

    const gyms = [
      { name: "FitFusion Nairobi", location: "Westlands", area: "Westlands", description: "Premium gym with state-of-the-art equipment. GiGi is the official energy drink.", isPartner: true },
      { name: "Iron Haven Gym", location: "Kilimani", area: "Kilimani", description: "Hardcore training facility. Fuel your lifts with GiGi.", isPartner: true },
      { name: "Urban Strong", location: "CBD", area: "CBD", description: "Convenient downtown gym for the busy professional.", isPartner: false },
      { name: "CrossFit 254", location: "Lavington", area: "Lavington", description: "High-intensity workouts powered by GiGi.", isPartner: true },
      { name: "Yoga & Flex Studio", location: "Karen", area: "Karen", description: "Mindful movement meets clean energy. GiGi partnered studio.", isPartner: true },
      { name: "BodyZone Gym", location: "Eastlands", area: "Eastlands", description: "Community-focused fitness center.", isPartner: false },
    ]

    for (const gym of gyms) {
      await ctx.db.insert("gyms", gym)
    }
  },
})

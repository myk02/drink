export type FlavorProfile = {
  slug: string
  name: string
  tagline: string
  description: string
  image: string
  accent: string
  badges: string[]
  price: number
  order: number
}

const baseBadges = ["Zero Sugar", "75mg Caffeine", "Natural Flavours", "Vitamin Rich"]

export const flavorProfiles: FlavorProfile[] = [
  {
    slug: "lemon-lime",
    name: "Lemon Lime",
    tagline: "Citrus Shock",
    description: "A clean hit of lemon zest and bright lime made for early starts, late edits, and hot Nairobi afternoons.",
    image: "/images/flavours/lemon-lime.png",
    accent: "#84cc16",
    badges: baseBadges,
    price: 150,
    order: 0,
  },
  {
    slug: "pineapple-coconut",
    name: "Pineapple Coconut",
    tagline: "Tropical Rush",
    description: "Coastal pineapple brightness rounded out with smooth coconut for a chilled, beach-day kind of lift.",
    image: "/images/flavours/pineapple-coconut.png",
    accent: "#f59e0b",
    badges: baseBadges,
    price: 150,
    order: 1,
  },
  {
    slug: "mango-passion",
    name: "Mango Passion",
    tagline: "Sunrise Burst",
    description: "Juicy mango and tangy passion fruit collide in a bright, punchy blend that tastes like golden hour.",
    image: "/images/flavours/mango-passion.png",
    accent: "#f97316",
    badges: ["Zero Sugar", "75mg Caffeine", "Natural Flavours", "Vitamin C Rich"],
    price: 150,
    order: 2,
  },
  {
    slug: "baobab-berry",
    name: "Baobab Berry",
    tagline: "Safari Zing",
    description: "Tart baobab meets mixed berries for a crisp superfruit profile with a sharp, refreshing finish.",
    image: "/images/flavours/baobab-berry.png",
    accent: "#a855f7",
    badges: ["Zero Sugar", "Antioxidant Rich", "Natural Flavours", "Vitamin Rich"],
    price: 150,
    order: 3,
  },
  {
    slug: "tamarind-ginger",
    name: "Tamarind Ginger",
    tagline: "Spiced Volt",
    description: "Sweet-sour tamarind with a ginger snap for a warmer, more grown-up kind of energy.",
    image: "/images/flavours/tamarind-ginger.png",
    accent: "#d97706",
    badges: ["Zero Sugar", "Ginger Kick", "Natural Flavours", "Vitamin Rich"],
    price: 150,
    order: 4,
  },
  {
    slug: "watermelon-mint",
    name: "Watermelon Mint",
    tagline: "Cool Snap",
    description: "Fresh watermelon, garden mint, and a dry finish built for gym bags, lunch breaks, and sunny commutes.",
    image: "/images/flavours/watermelon-mint.png",
    accent: "#22c55e",
    badges: ["Zero Sugar", "Cooling Finish", "Natural Flavours", "Vitamin Rich"],
    price: 150,
    order: 5,
  },
  {
    slug: "hibiscus-raspberry",
    name: "Hibiscus Raspberry",
    tagline: "Floral Kick",
    description: "Ruby hibiscus and raspberry bring a tart, floral spark that feels bold without getting too sweet.",
    image: "/images/flavours/hibiscus-raspberry.png",
    accent: "#e11d48",
    badges: ["Zero Sugar", "Botanical Blend", "Natural Flavours", "Vitamin Rich"],
    price: 150,
    order: 6,
  },
  {
    slug: "guava-chili",
    name: "Guava Chili",
    tagline: "Sweet Heat",
    description: "Pink guava up front, a tiny chili lift at the end, and enough fizz to keep the whole thing playful.",
    image: "/images/flavours/guava-chili.png",
    accent: "#fb7185",
    badges: ["Zero Sugar", "Light Spice", "Natural Flavours", "Vitamin Rich"],
    price: 150,
    order: 7,
  },
  {
    slug: "passion-lemonade",
    name: "Passion Lemonade",
    tagline: "Bright Drive",
    description: "Classic lemonade energy with passion fruit depth: citrusy, tart, and easy to reach for twice.",
    image: "/images/flavours/passion-lemonade.png",
    accent: "#eab308",
    badges: ["Zero Sugar", "Citrus Lift", "Natural Flavours", "Vitamin Rich"],
    price: 150,
    order: 8,
  },
  {
    slug: "blackcurrant-acai",
    name: "Blackcurrant Acai",
    tagline: "Deep Charge",
    description: "Dark berry intensity from blackcurrant and acai with a clean finish that keeps it crisp.",
    image: "/images/flavours/blackcurrant-acai.png",
    accent: "#7c3aed",
    badges: ["Zero Sugar", "Berry Blend", "Natural Flavours", "Vitamin Rich"],
    price: 150,
    order: 9,
  },
]

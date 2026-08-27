import { mkdir } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const flavors = [
  {
    slug: "lemon-lime",
    name: "Lemon Lime",
    tagline: "CITRUS SHOCK",
    accent: "#84cc16",
    secondary: "#fef08a",
    fruit: "lime wheels + lemon zest",
  },
  {
    slug: "pineapple-coconut",
    name: "Pineapple Coconut",
    tagline: "TROPICAL RUSH",
    accent: "#f59e0b",
    secondary: "#fef3c7",
    fruit: "pineapple wedges + coconut arcs",
  },
  {
    slug: "mango-passion",
    name: "Mango Passion",
    tagline: "SUNRISE BURST",
    accent: "#f97316",
    secondary: "#ec4899",
    fruit: "mango slices + passion seeds",
  },
  {
    slug: "baobab-berry",
    name: "Baobab Berry",
    tagline: "SAFARI ZING",
    accent: "#a855f7",
    secondary: "#f43f5e",
    fruit: "baobab pods + berry sparks",
  },
  {
    slug: "tamarind-ginger",
    name: "Tamarind Ginger",
    tagline: "SPICED VOLT",
    accent: "#d97706",
    secondary: "#facc15",
    fruit: "tamarind pods + ginger shards",
  },
  {
    slug: "watermelon-mint",
    name: "Watermelon Mint",
    tagline: "COOL SNAP",
    accent: "#22c55e",
    secondary: "#ef4444",
    fruit: "watermelon slices + mint leaves",
  },
  {
    slug: "hibiscus-raspberry",
    name: "Hibiscus Raspberry",
    tagline: "FLORAL KICK",
    accent: "#e11d48",
    secondary: "#f9a8d4",
    fruit: "hibiscus petals + raspberries",
  },
  {
    slug: "guava-chili",
    name: "Guava Chili",
    tagline: "SWEET HEAT",
    accent: "#fb7185",
    secondary: "#ef4444",
    fruit: "guava halves + chili streaks",
  },
  {
    slug: "passion-lemonade",
    name: "Passion Lemonade",
    tagline: "BRIGHT DRIVE",
    accent: "#eab308",
    secondary: "#f97316",
    fruit: "passion fruit + lemon rings",
  },
  {
    slug: "blackcurrant-acai",
    name: "Blackcurrant Acai",
    tagline: "DEEP CHARGE",
    accent: "#7c3aed",
    secondary: "#2563eb",
    fruit: "dark berries + acai beads",
  },
]

const outDir = path.join(process.cwd(), "public", "images", "flavours")

const esc = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

function fruitShapes(flavor, index) {
  const { accent, secondary } = flavor
  const seeds = Array.from({ length: 18 }, (_, i) => {
    const x = 245 + ((i * 97 + index * 41) % 710)
    const y = 205 + ((i * 131 + index * 67) % 730)
    const r = 8 + ((i + index) % 5) * 3
    const opacity = 0.16 + ((i % 4) * 0.055)
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 2 ? accent : secondary}" opacity="${opacity}" />`
  }).join("")

  const leaves = Array.from({ length: 8 }, (_, i) => {
    const x = 170 + ((i * 139 + index * 59) % 850)
    const y = 170 + ((i * 101 + index * 73) % 820)
    const rotate = (i * 37 + index * 19) % 360
    return `<ellipse cx="${x}" cy="${y}" rx="58" ry="19" fill="${i % 2 ? secondary : accent}" opacity="0.22" transform="rotate(${rotate} ${x} ${y})" />`
  }).join("")

  return `${seeds}${leaves}`
}

function svgForFlavor(flavor, index) {
  const titleWords = flavor.name.split(" ")
  const titleA = esc(titleWords[0])
  const titleB = esc(titleWords.slice(1).join(" "))

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="1200" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="halo" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="${flavor.secondary}" stop-opacity="0.58"/>
      <stop offset="48%" stop-color="${flavor.accent}" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#101010" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="can" x1="390" y1="120" x2="805" y2="1050" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="28%" stop-color="#f4f4f4"/>
      <stop offset="52%" stop-color="#d6d6d6"/>
      <stop offset="76%" stop-color="#f7f7f7"/>
      <stop offset="100%" stop-color="#c5c5c5"/>
    </linearGradient>
    <linearGradient id="label" x1="420" y1="350" x2="790" y2="875" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${flavor.accent}"/>
      <stop offset="100%" stop-color="${flavor.secondary}"/>
    </linearGradient>
    <filter id="shadow" x="230" y="80" width="740" height="1060" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="34" stdDeviation="34" flood-color="#000000" flood-opacity="0.38"/>
    </filter>
  </defs>

  <rect width="1200" height="1200" fill="#121212"/>
  <rect width="1200" height="1200" fill="url(#halo)"/>
  ${fruitShapes(flavor, index)}

  <g filter="url(#shadow)">
    <ellipse cx="600" cy="177" rx="180" ry="45" fill="#f9fafb"/>
    <rect x="420" y="170" width="360" height="825" rx="96" fill="url(#can)"/>
    <ellipse cx="600" cy="993" rx="178" ry="48" fill="#bfc4ca"/>
    <ellipse cx="600" cy="178" rx="148" ry="29" fill="#d4d7db"/>
    <ellipse cx="600" cy="178" rx="87" ry="14" fill="#9ca3af"/>
    <path d="M443 268C489 246 538 235 590 235C675 235 739 263 774 306V389C725 344 660 322 579 322C525 322 479 331 443 349V268Z" fill="${flavor.accent}" opacity="0.18"/>
    <rect x="450" y="356" width="300" height="390" rx="44" fill="url(#label)"/>
    <rect x="450" y="356" width="300" height="390" rx="44" fill="#121212" opacity="0.1"/>
    <path d="M480 398C545 374 635 372 720 396V444C641 421 555 422 480 449V398Z" fill="#ffffff" opacity="0.28"/>
    <text x="600" y="460" text-anchor="middle" fill="#121212" font-family="Arial Black, Arial, sans-serif" font-size="86" font-weight="900" letter-spacing="0">GiGi</text>
    <text x="600" y="535" text-anchor="middle" fill="#121212" font-family="Arial, sans-serif" font-size="26" font-weight="800" letter-spacing="5">${esc(flavor.tagline)}</text>
    <rect x="490" y="582" width="220" height="3" fill="#121212" opacity="0.42"/>
    <text x="600" y="646" text-anchor="middle" fill="#121212" font-family="Arial Black, Arial, sans-serif" font-size="48" font-weight="900">${titleA}</text>
    <text x="600" y="702" text-anchor="middle" fill="#121212" font-family="Arial Black, Arial, sans-serif" font-size="43" font-weight="900">${titleB}</text>
    <text x="600" y="805" text-anchor="middle" fill="#121212" font-family="Arial, sans-serif" font-size="22" font-weight="800" letter-spacing="3">ZERO SUGAR</text>
    <text x="600" y="842" text-anchor="middle" fill="#121212" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="2">NATURAL FLAVOURS</text>
    <path d="M733 218C757 311 765 583 742 930" stroke="#ffffff" stroke-width="18" stroke-linecap="round" opacity="0.32"/>
    <path d="M467 235C441 338 436 668 461 932" stroke="#000000" stroke-width="10" stroke-linecap="round" opacity="0.08"/>
  </g>

  <text x="600" y="1114" text-anchor="middle" fill="#ffffff" opacity="0.64" font-family="Arial, sans-serif" font-size="27" font-weight="700" letter-spacing="2">${esc(flavor.fruit)}</text>
</svg>`
}

// DEPRECATED: This script generated cartoonish placeholder cans (flat vector, dark background)
// and was the source of low-clarity / cartoonish flavour images reported by users.
// Photographic flavour bottles (public/images/flavours/*.png) are now photographic and clear
// (see .backups/flavours-originals for the single cartoon backup that was removed).
// DO NOT run this script without updating it to generate photographic packshots - it will
// overwrite the clear bottles with cartoonish vectors.
// If you need to regenerate, ensure you have high-res photographic sources.
await mkdir(outDir, { recursive: true })

await Promise.all(
  flavors.map((flavor, index) =>
    sharp(Buffer.from(svgForFlavor(flavor, index)))
      .png({ compressionLevel: 9, quality: 92 })
      .toFile(path.join(outDir, `${flavor.slug}.png`))
  )
)

console.log(`Generated ${flavors.length} flavor packshots in ${outDir}`)
console.warn("WARNING: This overwrites photographic flavour bottles with cartoonish placeholders. Do not run unless intentional.")

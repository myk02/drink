export type CareerRole = {
  slug: string
  title: string
  department: "Sales" | "Operations" | "Brand" | "General"
  type: string
  employmentType: "FULL_TIME" | "PART_TIME" | "INTERN"
  location: string
  workModel: "On-site" | "Hybrid" | "Remote"
  salary: string
  salaryMinKes: number
  salaryMaxKes: number
  postedAt: string // ISO date
  blurb: string
  summary: string
  responsibilities: string[]
  requirements: string[]
  niceToHave: string[]
  perks: string[]
}

export const ROLES: CareerRole[] = [
  {
    slug: "field-sales-lead",
    title: "Field Sales Lead",
    department: "Sales",
    type: "Full-time",
    employmentType: "FULL_TIME",
    location: "Nairobi",
    workModel: "On-site",
    salary: "KES 80,000 – 120,000 / mo + commission",
    salaryMinKes: 80000,
    salaryMaxKes: 120000,
    postedAt: "2026-07-15",
    blurb: "Own outlet acquisition and relationships across Nairobi — bars, gyms, shops and offices. You'll carry quota and the flag.",
    summary:
      "Own the street. You'll be the face of GiGi in Nairobi — opening new stockists, nurturing repeat orders, and hitting monthly volume targets across bars, gyms, dukas, and corporate accounts.",
    responsibilities: [
      "Open 15+ new stockists per month across assigned zones (Westlands, CBD, Industrial Area)",
      "Own the full cycle: pitch → sample drop → first order → restock cadence",
      "Hit monthly volume and revenue quota; forecast accurately every Monday",
      "Train outlet staff on product story, pricing, and fridge standards",
      "Run weekly sampling activations with the Brand team",
      "Keep CRM/HQ sheet clean: visits, outcomes, next actions",
    ],
    requirements: [
      "2+ years field sales or route-to-market in FMCG, telco, or HORECA in Nairobi",
      "You own a motorbike or can commute daily across Nairobi (allowance provided)",
      "Comfortable with targets, rejection, and early mornings",
      "Strong Swahili + English, sheng is a plus",
    ],
    niceToHave: [
      "Existing relationships with bars/gyms/retail in Nairobi",
      "Experience with M-Pesa till / Paystack sales tools",
      "You actually drink energy drinks and can tell the flavours apart blind",
    ],
    perks: ["Commission uncapped", "Motorbike & airtime allowance", "Free GiGi + gym partner access"],
  },
  {
    slug: "operations-logistics-associate",
    title: "Operations & Logistics Associate",
    department: "Operations",
    type: "Full-time",
    employmentType: "FULL_TIME",
    location: "Nairobi",
    workModel: "On-site",
    salary: "KES 70,000 – 110,000 / mo",
    salaryMinKes: 70000,
    salaryMaxKes: 110000,
    postedAt: "2026-07-20",
    blurb: "Keep cans flowing: inventory, delivery partners, zone routing and restock schedules. Detail-obsessed organizers thrive here.",
    summary:
      "Keep the machine humming. You’ll run inventory, route Boda & van deliveries, manage 3PL handoffs, and make sure no stockist ever hears 'iko out of stock'.",
    responsibilities: [
      "Own stock ledger: inbound batches, expiry rotation (FEFO), and weekly counts",
      "Plan daily delivery waves by zone; optimize for 48hr restock SLA in Nairobi",
      "Coordinate with 3PLs for upcountry runs and track PODs",
      "Run the restock trigger system with Sales — no stockout surprises",
      "Own packaging, POS and fridge logistics for activations",
      "Weekly ops report: fill rate, on-time %, cost per drop",
    ],
    requirements: [
      "1–3 years in ops, supply chain, or dispatch in Nairobi (FMCG/logistics preferred)",
      "Spreadsheet-native (Google Sheets/Excel) — you pivot without blinking",
      "Obsessive attention to detail; you spot a missing can in a 24-pack",
      "Calm under heat — literally, Nairobi traffic at 5pm",
    ],
    niceToHave: [
      "Experience with route planning tools or Shopify/Convex ops",
      "Forklift / warehouse safety cert",
      "You’ve tracked a boda with live share and won",
    ],
    perks: ["Performance bonus", "Learning budget KES 30k/yr", "Early Friday closes"],
  },
  {
    slug: "brand-social-media-intern",
    title: "Brand & Social Media Intern",
    department: "Brand",
    type: "Internship · 6 months",
    employmentType: "INTERN",
    location: "Hybrid — Nairobi",
    workModel: "Hybrid",
    salary: "KES 25,000 – 35,000 / mo stipend",
    salaryMinKes: 25000,
    salaryMaxKes: 35000,
    postedAt: "2026-08-01",
    blurb: "Create content that makes Nairobi thirsty. TikTok, IG, event coverage. Portfolio over pedigree — show us what you've made.",
    summary:
      "Make Nairobi stop scrolling. You’ll shoot, cut, and post daily content for TikTok & IG, cover events, and turn GiGi moments into memes, reels, and stories that sell.",
    responsibilities: [
      "Plan + publish 5+ posts/week across TikTok & Instagram (Reels, Stories, feed)",
      "Cover tastings, gym activations, and campus drops — shoot on phone, edit same day",
      "Write captions in GiGi voice (bold, Swahili-sprinkled, never cringe)",
      "Track content performance weekly; double down on what pops",
      "Support influencer seeding and UGC collection",
      "Keep brand asset folder tight — no 'final_final2.mp4'",
    ],
    requirements: [
      "Portfolio of work — TikTok, Reels, or stills (link required)",
      "Can shoot & edit on phone (CapCut / Premiere / InShot)",
      "You live on TikTok/IG and know what slaps this week",
      "Available 4 days/week in Nairobi, hybrid",
    ],
    niceToHave: [
      "Photography / motion basics or Canva pro skills",
      "Campus ambassador or event hosting experience",
      "You’ve grown an account past 5k followers",
    ],
    perks: ["Mentorship from Brand Lead", "Portfolio of national brand work", "Stipend + transport + GiGi merch"],
  },
]

export const DEPARTMENTS = ["All", "Sales", "Operations", "Brand"] as const
export const LOCATIONS = ["All", "Nairobi", "Hybrid — Nairobi"] as const

export function getRoleBySlug(slug: string) {
  return ROLES.find((r) => r.slug === slug)
}

export const BENEFITS = [
  {
    title: "Pay that respects you",
    desc: "Transparent bands, reviewed biannually. Commission uncapped for Sales. Interns get real pay, not exposure.",
    icon: "TrendingUp",
  },
  {
    title: "Health & wellness",
    desc: "NHIF + private top-up, annual check-up, and partner gym access. You sell energy — we fuel yours.",
    icon: "Heart",
  },
  {
    title: "Learn out loud",
    desc: "KES 30k/year learning budget, monthly show-and-tells, and blameless post-mortems.",
    icon: "GraduationCap",
  },
  {
    title: "Hybrid that works",
    desc: "2 days WFH for Hybrid roles, core hours 10–3, no meeting Wednesdays.",
    icon: "House",
  },
  {
    title: "Ship & own",
    desc: "Small team = real ownership. Your work hits shelves in weeks, not quarters.",
    icon: "Rocket",
  },
  {
    title: "Free GiGi, for real",
    desc: "Weekly can allowance, launch tasting panels, and friends & family discounts.",
    icon: "Package",
  },
]

export const TESTIMONIALS = [
  {
    name: "Amina K.",
    role: "Field Sales, since 2024",
    quote: "I opened 22 new stockists my first month. Quota is real, but so is the support — my manager does ride-alongs weekly.",
    initials: "AK",
  },
  {
    name: "Brian O.",
    role: "Operations, since 2025",
    quote: "Ops here is a puzzle you actually get to solve. I cut our Nairobi SLA from 72h to 36h in three months.",
    initials: "BO",
  },
  {
    name: "Faith M.",
    role: "Brand Intern → Full-time 2025",
    quote: "Started as intern, now lead TikTok. One reel hit 400k views and sold out our Mango run. Portfolio > pedigree.",
    initials: "FM",
  },
]

export const HIRING_STEPS = [
  { n: "01", title: "Apply — 5 min", desc: "Name, email, short note + optional resume/portfolio link. No account needed.", time: "5 min" },
  { n: "02", title: "Recruiter chat — 30 min", desc: "We reply within 48 hours. Quick call about you, the role, and pay.", time: "30 min" },
  { n: "03", title: "Task / interview — 60 min", desc: "Role-relevant: ride-along pitch, ops routing exercise, or content cut.", time: "60 min" },
  { n: "04", title: "Offer — within 2 days", desc: "Meet the team, reference check, and decision fast while interest is hot.", time: "2 days" },
]

export const FAQS = [
  {
    q: "How long does the application take?",
    a: "About 5 minutes. We only ask for name, email, a short note, and an optional resume/portfolio link. Everything else we collect after you’re in the pipeline.",
  },
  {
    q: "Do I need to create an account to apply?",
    a: "No. No forced sign-up, no portal login before you can apply. If you want updates by email, you’ll get them automatically.",
  },
  {
    q: "What’s the interview timeline?",
    a: "We reply within 48 hours. From there, the full loop is 1–2 weeks: recruiter screen (30 min), one role-specific interview/task (60 min), then offer. We publish this so you’re never left guessing.",
  },
  {
    q: "Are these roles remote?",
    a: "Field Sales and Ops are on-site in Nairobi (you need to be where the cans and customers are). Brand is hybrid — 2–3 days on-site for shoots/events, rest remote.",
  },
  {
    q: "Do you offer visa sponsorship?",
    a: "These Nairobi-based roles require the right to work in Kenya. For future roles, we review sponsorship case-by-case — it will be stated on the listing.",
  },
  {
    q: "Will you contact references or ask for a cover letter?",
    a: "Cover letters are optional — a concise note about why GiGi + links to your work beats a formal letter. References only at the offer stage, with your permission.",
  },
]

export function formatPosted(dateStr: string) {
  const d = new Date(dateStr)
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  if (diff < 7) return `${diff} days ago`
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`
  return d.toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })
}

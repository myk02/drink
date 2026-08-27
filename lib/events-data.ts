export type EventCategory = "tasting" | "gym" | "corporate" | "organizer"
export type EventStatus = "upcoming" | "ongoing" | "completed"

export type GiGiEvent = {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  area: string
  category: EventCategory
  status: EventStatus
  capacity: number
  registered: number
  image: string
  price: string
  featured?: boolean
}

export const MOCK_EVENTS: GiGiEvent[] = [
  {
    _id: "evt_tasting_cbd_001",
    title: "CBD Tasting — City Market Pop-Up",
    description: "Free samples of all 10 GiGi flavours, meet the makers, 25% off your first 12-pack. Bring a friend, stay for the buzz.",
    date: "2026-09-12",
    time: "11:00 AM – 6:00 PM",
    location: "City Market, Muindi Mbingu St",
    area: "CBD",
    category: "tasting",
    status: "upcoming",
    capacity: 120,
    registered: 78,
    image: "/images/flavours/mango-passion.png",
    price: "Free",
    featured: true,
  },
  {
    _id: "evt_gym_westlands_002",
    title: "Iron Haven Gym Activation",
    description: "Partner gym takeover: PT sessions + GiGi sampling, member challenge day. Official energy drink of Iron Haven.",
    date: "2026-09-15",
    time: "6:00 AM – 9:00 AM",
    location: "Iron Haven, Kilimani",
    area: "Kilimani",
    category: "gym",
    status: "upcoming",
    capacity: 80,
    registered: 42,
    image: "/images/flavours/watermelon-mint.png",
    price: "Free",
  },
  {
    _id: "evt_corp_westlands_003",
    title: "Corporate Drop — Westlands Towers",
    description: "Friday office energiser for 300+ staff across 3 towers. Branded fridge, sampling, team bundle deals.",
    date: "2026-09-18",
    time: "10:00 AM – 3:00 PM",
    location: "Westlands, Network Towers",
    area: "Westlands",
    category: "corporate",
    status: "upcoming",
    capacity: 300,
    registered: 145,
    image: "/images/flavours/lemon-lime.png",
    price: "Free",
  },
  {
    _id: "evt_org_karen_004",
    title: "Nairobi Street Food Festival",
    description: "GiGi as official energy partner — main stage, chill zone, 4 flavour bars. 5K attendees expected.",
    date: "2026-09-20",
    time: "12:00 PM – 10:00 PM",
    location: "Karen, Waterfront Mall Grounds",
    area: "Karen",
    category: "organizer",
    status: "upcoming",
    capacity: 500,
    registered: 312,
    image: "/images/flavours/blackcurrant-acai.png",
    price: "KSh 500",
  },
  {
    _id: "evt_tasting_eastlands_005",
    title: "Eastlands Tasting — Buruburu Centre",
    description: "Estate sampling + Duka recruitment. Taste, vote for next flavour, grab launch packs.",
    date: "2026-09-06",
    time: "10:00 AM – 5:00 PM",
    location: "Buruburu Shopping Centre",
    area: "Eastlands",
    category: "tasting",
    status: "completed",
    capacity: 150,
    registered: 150,
    image: "/images/flavours/pineapple-coconut.png",
    price: "Free",
  },
  {
    _id: "evt_gym_lavington_006",
    title: "CrossFit 254 Throwdown",
    description: "Community WOD powered by GiGi — recovery station, podium cans, athlete meetup.",
    date: "2026-09-22",
    time: "7:00 AM – 12:00 PM",
    location: "CrossFit 254, Lavington",
    area: "Lavington",
    category: "gym",
    status: "upcoming",
    capacity: 100,
    registered: 29,
    image: "/images/flavours/guava-chili.png",
    price: "Free",
  },
  {
    _id: "evt_corp_cbd_007",
    title: "Safaricom Office Hours",
    description: "Invite-only corporate wellness hour — productivity talk + GiGi tasting for 120 staff.",
    date: "2026-09-10",
    time: "3:00 PM – 4:30 PM",
    location: "Safaricom HQ, Waiyaki Way",
    area: "Westlands",
    category: "corporate",
    status: "ongoing",
    capacity: 120,
    registered: 108,
    image: "/images/flavours/baobab-berry.png",
    price: "Invite",
  },
  {
    _id: "evt_org_cbd_008",
    title: "Nairobi Tech Week — Afterparty Fuel",
    description: "Late-night energy sponsor for 800 devs — GiGi bar, neon photo wall, 1-year supply raffle.",
    date: "2026-10-02",
    time: "6:00 PM – 1:00 AM",
    location: "KICC, CBD",
    area: "CBD",
    category: "organizer",
    status: "upcoming",
    capacity: 800,
    registered: 421,
    image: "/images/flavours/hibiscus-raspberry.png",
    price: "KSh 1,500",
  },
]

export const AREAS = ["All Areas", "CBD", "Westlands", "Kilimani", "Lavington", "Karen", "Eastlands"] as const
export const CATEGORIES = [
  { value: "all", label: "All Activations", icon: "Sparkles" },
  { value: "tasting", label: "Free Tastings", icon: "Wine" },
  { value: "gym", label: "Gyms & Studios", icon: "Dumbbell" },
  { value: "corporate", label: "Corporate", icon: "Building2" },
  { value: "organizer", label: "Organizer Collabs", icon: "CalendarCheck" },
] as const

export function googleCalendarUrl(ev: GiGiEvent) {
  const start = new Date(`${ev.date} ${ev.time.split("–")[0].trim()}`).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  const endDate = new Date(new Date(`${ev.date} ${ev.time.split("–")[0].trim()}`).getTime() + 2 * 3600000).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  const details = `${ev.description} — ${ev.location}`
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${start}/${endDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(ev.location)}`
}

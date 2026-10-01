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

export const AREAS = ["All Areas", "CBD", "Westlands", "Kilimani", "Lavington", "Karen", "Eastlands"] as const
export const CATEGORIES = [
  { value: "all", label: "All Activations", icon: "Sparkles" },
  { value: "tasting", label: "Free Tastings", icon: "Wine" },
  { value: "gym", label: "Gyms & Studios", icon: "Dumbbell" },
  { value: "corporate", label: "Corporate", icon: "Building2" },
  { value: "organizer", label: "Organizer Collabs", icon: "CalendarCheck" },
] as const

// Builds a Google Calendar link. Event times are Africa/Nairobi local wall
// times, so we compute the UTC offset for that date explicitly (Kenya is
// always UTC+3 — no DST — but we still parse robustly instead of relying on
// the host machine's timezone).
function parseEventTime(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number)
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  let hours = match ? Number(match[1]) : 9
  const minutes = match ? Number(match[2]) : 0
  const meridiem = match ? match[3].toUpperCase() : "AM"
  if (meridiem === "PM" && hours !== 12) hours += 12
  if (meridiem === "AM" && hours === 12) hours = 0
  // Nairobi is UTC+3 year-round
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, hours - 3, minutes))
}

export function googleCalendarUrl(ev: GiGiEvent) {
  const start = parseEventTime(ev.date, ev.time)
  // End time: use the event's own end time when parseable, otherwise 2h after start.
  // Accepts both en-dash (–) and hyphen (-) separators.
  const endMatch = ev.time.match(/[–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i)
  let endDate = endMatch ? parseEventTime(ev.date, endMatch[1]) : new Date(start.getTime() + 2 * 3600000)
  // Overnight events (e.g. "6:00 PM – 1:00 AM") parse the end earlier than the
  // start on the same date — roll the end to the next day.
  if (endDate.getTime() <= start.getTime()) {
    endDate = new Date(endDate.getTime() + 24 * 3600000)
  }
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  const details = `${ev.description} — ${ev.location}`
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${fmt(start)}/${fmt(endDate)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(ev.location)}`
}

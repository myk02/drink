import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Events & Activations",
  description:
    "Experience GiGi Energy — free tasting events in Nairobi, partner gyms, corporate supply, and event organizer partnerships across Kenya.",
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children
}

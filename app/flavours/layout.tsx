import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Flavours",
  description:
    "Explore GiGi Energy's ten-flavour lineup, from Lemon Lime and Mango Passion to Guava Chili and Blackcurrant Acai. Zero sugar, made in Nairobi.",
}

export default function FlavoursLayout({ children }: { children: React.ReactNode }) {
  return children
}

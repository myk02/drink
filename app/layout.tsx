import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { ConvexClientProvider } from "@/components/convex-client-provider"
import { LenisProvider } from "@/components/lenis-provider"
import ClickSpark from "@/components/click-spark"
import "./globals.css"

const _inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const _jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "GiGi Energy Drink | Made in Nairobi, Kenya",
  description: "Zero sugar, 75mg caffeine, 100% natural flavors. Kenya's own energy drink — available in Nairobi and across the country.",
  keywords: ["energy drink", "zero sugar", "natural energy", "GiGi", "Kenya", "Nairobi", "Kenyan energy drink"],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#AFFF00",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ClerkProvider>
          <ConvexClientProvider>
            <ClickSpark
              sparkColor="#AFFF00"
              sparkSize={12}
              sparkRadius={20}
              sparkCount={8}
              duration={400}
              easing="ease-out"
            >
              <LenisProvider>{children}</LenisProvider>
            </ClickSpark>
            <Analytics />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}

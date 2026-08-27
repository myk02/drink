import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { ConvexClientProvider } from "@/components/convex-client-provider"
import { LenisProvider } from "@/components/lenis-provider"
import ClickSpark from "@/components/click-spark"
import { CartProvider } from "@/components/cart-provider"
import { CartDrawer } from "@/components/cart-drawer"
import { Toaster } from "@/components/ui/sonner"
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site"
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Made in Nairobi, Kenya`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["energy drink", "zero sugar", "natural energy", "GiGi", "Kenya", "Nairobi", "Kenyan energy drink"],
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Made in Nairobi, Kenya`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/images/gigi.jpg", width: 1200, height: 630, alt: `${SITE_NAME} energy drink` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Made in Nairobi, Kenya`,
    description: SITE_DESCRIPTION,
    images: ["/images/gigi.jpg"],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: "#AFFF00",
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/apple-icon.png`,
  description: SITE_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ClerkProvider
          appearance={{
            variables: {
              borderRadius: "0",
            },
          }}
        >
          <ConvexClientProvider>

            <ClickSpark
              sparkColor="#AFFF00"
              sparkSize={12}
              sparkRadius={20}
              sparkCount={8}
              duration={400}
              easing="ease-out"
            >
              <CartProvider>
                <LenisProvider>{children}</LenisProvider>
                <CartDrawer />
              </CartProvider>
            </ClickSpark>
            <Toaster position="top-center" richColors theme="dark" />
            <Analytics />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}

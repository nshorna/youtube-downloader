import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { APP_NAME, SITE_URL, SEO } from "@/lib/config"
import { AuthProvider } from "@/components/auth/auth-provider"
import { AnalyticsProvider } from "@/components/analytics/analytics-provider"
import { PageViewTracker } from "@/components/analytics/page-view-tracker"
import { OrganizationSchema } from "@/components/seo/structured-data"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO.defaultTitle,
    template: `%s | ${APP_NAME}`,
  },
  description: SEO.defaultDescription,
  keywords: [...SEO.keywords],
  authors: [{ name: SEO.author }],
  creator: SEO.author,
  publisher: SEO.author,
  generator: "Next.js",
  applicationName: APP_NAME,
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: SEO.locale,
    url: SITE_URL,
    siteName: SEO.siteName,
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
    images: [
      {
        url: `${SITE_URL}/icon.svg`,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} - YouTube Video Downloader`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
    images: [`${SITE_URL}/icon.svg`],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-dark-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  verification: {
    // Add verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <OrganizationSchema />
        <AnalyticsProvider />
        <AuthProvider>
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}

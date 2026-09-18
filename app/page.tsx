import type { Metadata } from "next"
import { UrlForm } from "@/components/landing/url-form"
import { BenefitsSection } from "@/components/landing/benefits-section"
import { RecentDownloadsSection } from "@/components/landing/recent-downloads-section"
import { FAQSection, FAQ_DATA } from "@/components/landing/faq-section"
import { APP_NAME, SITE_URL } from "@/lib/config"
import { WebApplicationSchema, FAQPageSchema } from "@/components/seo/structured-data"

export const metadata: Metadata = {
  title: "Fast & Simple YouTube Downloader",
  description:
    "Download YouTube videos in high quality for offline viewing. Simple, fast, and free. No registration required. Support for MP4, WebM, and more formats.",
  openGraph: {
    title: "Fast & Simple YouTube Downloader",
    description:
      "Download YouTube videos in high quality for offline viewing. Simple, fast, and free.",
    url: SITE_URL,
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
    title: "Fast & Simple YouTube Downloader",
    description:
      "Download YouTube videos in high quality for offline viewing. Simple, fast, and free.",
  },
}

/**
 * Landing Page
 * Server-side page component that composes landing page sections
 */
export default function LandingPage() {
  return (
    <>
      <WebApplicationSchema />
      <FAQPageSchema faqs={FAQ_DATA} />
      <div className="flex flex-col gap-20 py-12 md:py-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-pretty">
            Fast & Simple YouTube <span className="text-primary">Video Downloader</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 text-balance">
            Download your favorite videos in high quality for offline viewing. No registration required, 100% free and
            secure.
          </p>
          <UrlForm />
        </section>

        <RecentDownloadsSection />
        <BenefitsSection />
        <FAQSection />
      </div>
    </>
  )
}

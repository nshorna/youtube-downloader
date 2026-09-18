import type { Metadata } from "next"
import { APP_NAME, SITE_URL } from "@/lib/config"

export const metadata: Metadata = {
  title: `About ${APP_NAME}`,
  description: `Learn about ${APP_NAME}, our mission to make web content accessible offline, and how our YouTube video downloader works.`,
  openGraph: {
    title: `About ${APP_NAME} - YouTube Video Downloader`,
    description: `Learn about ${APP_NAME}, our mission to make web content accessible offline, and how our YouTube video downloader works.`,
    url: `${SITE_URL}/about`,
  },
  twitter: {
    title: `About ${APP_NAME}`,
    description: `Learn about ${APP_NAME}, our mission to make web content accessible offline.`,
  },
}

/**
 * About Page
 * Server-side page component that displays information about the application
 * Includes mission statement, legal notices, and how the service works
 */
export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-8">About {APP_NAME}</h1>

      <div className="prose prose-lg dark:prose-invert">
        <p className="text-xl text-muted-foreground mb-8">
          {APP_NAME} was created to provide a clean, simple, and efficient way for users to access their favorite content
          offline.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4">Our Mission</h2>
        <p>
          We believe in making the web more accessible. Whether you&apos;re traveling, have a limited internet
          connection, or just want to save your favorite educational content for later, {APP_NAME} is designed to be your
          reliable companion.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4">Copyright & Legal</h2>
        <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-xl my-8">
          <p className="font-semibold text-destructive mb-2">Important Notice:</p>
          <p className="text-sm">
            {APP_NAME} is intended for content the user owns or has explicit permission to use. Downloading copyrighted
            content without authorization is not allowed and violates YouTube&apos;s Terms of Service. Users are solely
            responsible for their actions and compliance with local laws.
          </p>
        </div>

        <h2 className="text-2xl font-bold mt-12 mb-4">How it Works</h2>
        <p>
          Our platform uses advanced simulated processing to identify available video streams. We prioritize
          high-quality MP4 formats to ensure compatibility across all your devices, from smartphones to desktop
          computers.
        </p>
      </div>
    </div>
  )
}

import type { Metadata } from "next"
import { APP_NAME, SITE_URL } from "@/lib/config"
import { DownloadContent } from "@/components/download/download-content"

export const metadata: Metadata = {
  title: `Download YouTube Video - ${APP_NAME}`,
  description: `Download YouTube videos in your preferred format and quality. Select from available formats including MP4, WebM, and more.`,
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: `Download YouTube Video - ${APP_NAME}`,
    description: `Download YouTube videos in your preferred format and quality.`,
    url: `${SITE_URL}/download`,
  },
  twitter: {
    title: `Download YouTube Video - ${APP_NAME}`,
    description: `Download YouTube videos in your preferred format and quality.`,
  },
}

/**
 * Download Page
 * Server-side page component that renders the download content
 */
export default function DownloadPage() {
  return <DownloadContent />
}

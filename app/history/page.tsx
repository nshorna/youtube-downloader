import type { Metadata } from "next"
import { APP_NAME, SITE_URL } from "@/lib/config"
import { HistoryList } from "@/components/history/history-list"

export const metadata: Metadata = {
  title: `Download History - ${APP_NAME}`,
  description: `View your download history on ${APP_NAME}. Access previously downloaded YouTube videos.`,
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: `Download History - ${APP_NAME}`,
    description: `View your download history on ${APP_NAME}.`,
    url: `${SITE_URL}/history`,
  },
  twitter: {
    title: `Download History - ${APP_NAME}`,
    description: `View your download history on ${APP_NAME}.`,
  },
}

/**
 * History Page
 * Server-side page component that displays download history
 */
export default function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <HistoryList />
    </div>
  )
}

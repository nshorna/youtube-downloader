/**
 * Application configuration constants
 */

export const APP_NAME = "FastTube"

/**
 * Site URL for SEO and metadata
 * Falls back to localhost for development
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3021"

/**
 * SEO metadata constants
 */
export const SEO = {
  defaultTitle: `${APP_NAME} - Fast & Simple YouTube Downloader`,
  defaultDescription:
    "Download YouTube videos in high quality for offline viewing. Simple, fast, and free.",
  keywords: [
    "youtube downloader",
    "youtube video downloader",
    "download youtube videos",
    "youtube to mp4",
    "youtube to webm",
    "free youtube downloader",
    "youtube video converter",
    "offline youtube videos",
  ],
  author: APP_NAME,
  siteName: APP_NAME,
  locale: "en_US",
} as const


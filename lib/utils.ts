import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts YouTube video ID from various URL formats
 * @param url - YouTube URL
 * @returns Video ID or null if not found
 */
export function extractVideoId(url: string): string | null {
  if (!url) return null

  // Standard format: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (watchMatch) return watchMatch[1]

  // Short format: https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) return shortMatch[1]

  // YouTube Shorts format: https://www.youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
  if (shortsMatch) return shortsMatch[1]

  // Embed format: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
  if (embedMatch) return embedMatch[1]

  // Alternative format: https://youtube.com/v/VIDEO_ID
  const vMatch = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/)
  if (vMatch) return vMatch[1]

  return null
}

/**
 * Extracts video ID from yt-dlp JSON output
 * @param videoInfo - Video info object from yt-dlp --dump-json
 * @returns Video ID or null if not found
 */
export function getVideoIdFromYtDlp(videoInfo: any): string | null {
  if (!videoInfo) return null
  return videoInfo.id || null
}

/**
 * Sanitizes a string for use in filenames
 * Removes invalid filename characters
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeFilename(str: string): string {
  // Remove invalid filename characters: /, \, :, *, ?, ", <, >, |
  return str.replace(/[\/\\:*?"<>|]/g, '').trim()
}

/**
 * Generates a download filename with the convention: appname-video name-formatId-videoID.ext
 * @param appName - Application name
 * @param videoTitle - Video title
 * @param formatId - Format ID from yt-dlp --list-formats
 * @param videoId - YouTube video ID
 * @param ext - File extension
 * @returns Generated filename
 */
export function generateDownloadFilename(
  appName: string,
  videoTitle: string,
  formatId: string,
  videoId: string,
  ext: string
): string {
  // Substring video title to 50 characters
  let title = videoTitle.substring(0, 50).trim()
  if (videoTitle.length > 50) {
    // Remove any partial words at the end
    const lastSpace = title.lastIndexOf(' ')
    if (lastSpace > 30) {
      title = title.substring(0, lastSpace)
    }
  }

  // Sanitize title
  title = sanitizeFilename(title)

  // Handle edge cases
  if (!title) title = "Unknown"
  if (!formatId) formatId = "unknown"
  if (!videoId) videoId = "unknown"

  // Remove leading dot from extension if present
  const cleanExt = ext.startsWith('.') ? ext.substring(1) : ext

  // Format: appname-video name-formatId-videoID.ext
  return `${appName}-${title}-${formatId}-${videoId}.${cleanExt}`
}

import { z } from "zod"

/**
 * YouTube URL validation schema using Zod
 * Supports multiple YouTube URL formats:
 * - Standard: https://www.youtube.com/watch?v=VIDEO_ID
 * - Short: https://youtu.be/VIDEO_ID
 * - Shorts: https://www.youtube.com/shorts/VIDEO_ID
 * - Embed: https://www.youtube.com/embed/VIDEO_ID
 * - Alternative: https://youtube.com/v/VIDEO_ID
 */
export const youtubeUrlSchema = z
  .string()
  .url("Invalid URL format")
  .refine(
    (url) => {
      const youtubePatterns = [
        /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/,
        /youtube\.com\/watch\?v=[\w-]+/,
        /youtu\.be\/[\w-]+/,
        /youtube\.com\/shorts\/[\w-]+/,
        /youtube\.com\/embed\/[\w-]+/,
        /youtube\.com\/v\/[\w-]+/,
      ]

      return youtubePatterns.some((pattern) => pattern.test(url))
    },
    {
      message: "URL must be a valid YouTube video URL",
    }
  )

/**
 * Schema for API request body containing YouTube URL
 */
export const youtubeUrlRequestSchema = z.object({
  url: youtubeUrlSchema,
})

/**
 * Schema for download API request body
 */
export const downloadRequestSchema = z.object({
  url: youtubeUrlSchema,
  formatId: z.string().min(1, "Format ID is required"),
})


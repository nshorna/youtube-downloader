import { prisma } from "@/lib/prisma"
import { RecentDownloadsList } from "./recent-downloads-list"
import { extractVideoId } from "@/lib/utils"

/**
 * Recent Downloads Section Component
 * Server component that fetches recent downloads data and passes to client component
 * Widgetized component - no padding/margin applied here
 */
export async function RecentDownloadsSection() {
  console.log("📥 [SERVER] Fetching recent downloads for landing page...")

  try {
    // Fetch more downloads to ensure we have enough unique videos after deduplication
    // Order by creation date (most recent first)
    // Note: We don't filter by videoId here because we'll extract it from URL if missing
    const allDownloads = await prisma.download.findMany({
      where: {
        status: "COMPLETED",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Fetch more to ensure we get 5 unique videos
      select: {
        id: true,
        videoTitle: true,
        videoId: true,
        url: true,
        formatResolution: true,
        formatExt: true,
        createdAt: true,
      },
    })

    console.log(`📊 [SERVER] Fetched ${allDownloads.length} total downloads for deduplication`)

    // Helper function to check if URL has pp=value parameter (audio-only indicator)
    const hasPpParameter = (url: string): boolean => {
      try {
        const urlObj = new URL(url)
        return urlObj.searchParams.has('pp')
      } catch {
        // Fallback: check if URL contains pp= in query string
        return url.includes('pp=')
      }
    }

    // Deduplicate by videoId and pp parameter status, keeping only the most recent for each combination
    // This ensures audio-only downloads (with pp=value) are treated separately from video downloads
    // Also extract videoId from URL if it's missing from the database (e.g., for YouTube Shorts)
    const seenKeys = new Set<string>()
    const uniqueDownloads = allDownloads
      .map((download) => {
        // Extract videoId from database or URL and enrich the download object
        const videoId = download.videoId || extractVideoId(download.url)
        return {
          ...download,
          videoId: videoId, // Ensure videoId is set even if it was extracted from URL
        }
      })
      .filter((download) => {
        if (!download.videoId) {
          return false // Skip downloads without a valid videoId
        }
        // Create a unique key combining videoId and whether it has pp parameter
        const hasPp = hasPpParameter(download.url)
        const uniqueKey = `${download.videoId}:${hasPp ? 'audio' : 'video'}`
        
        if (seenKeys.has(uniqueKey)) {
          return false // Skip if we've already seen this videoId + pp combination
        }
        seenKeys.add(uniqueKey)
        return true
      })

    // Take only the first 5 unique downloads
    const recentDownloads = uniqueDownloads.slice(0, 5)

    console.log(`✅ [SERVER] Found ${recentDownloads.length} unique recent downloads (filtered from ${allDownloads.length} total)`)

    // If no downloads, don't render the section
    if (!recentDownloads || recentDownloads.length === 0) {
      console.log("📊 [SERVER] No recent downloads found, skipping section")
      return null
    }

    return <RecentDownloadsList downloads={recentDownloads} />
  } catch (error: any) {
    console.error("❌ [SERVER] Error in RecentDownloadsSection:", error.message)
    // Fail silently - don't break the page if this section fails
    return null
  }
}


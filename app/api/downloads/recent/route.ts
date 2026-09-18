import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { extractVideoId } from "@/lib/utils"

/**
 * API Route: GET /api/downloads/recent
 * Fetches the last 5 completed downloads for display on landing page
 */
export async function GET() {
  console.log("📥 [API] Received GET request to fetch recent downloads")

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

    console.log(`📊 [API] Fetched ${allDownloads.length} total downloads for deduplication`)

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

    console.log(`✅ [API] Found ${recentDownloads.length} unique recent downloads (filtered from ${allDownloads.length} total)`)

    return NextResponse.json({
      success: true,
      downloads: recentDownloads,
    })
  } catch (error: any) {
    console.error("❌ [API] Error fetching recent downloads:", error.message)
    return NextResponse.json(
      { error: "Failed to fetch recent downloads" },
      { status: 500 }
    )
  }
}


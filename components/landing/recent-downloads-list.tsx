"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { trackEvent } from "@/lib/analytics"
import { extractVideoId } from "@/lib/utils"

/**
 * Interface for recent download data
 */
interface RecentDownload {
  id: string
  videoTitle: string
  videoId: string | null
  url: string
  formatResolution: string
  formatExt: string
  createdAt: Date | string
}

interface RecentDownloadsListProps {
  downloads: RecentDownload[]
}

/**
 * Generates YouTube thumbnail URL from video ID
 * Falls back to default thumbnail if videoId is not available
 */
function getThumbnailUrl(videoId: string | null): string {
  if (!videoId) {
    return "/placeholder.svg"
  }
  // Use maxresdefault for best quality, with fallback to hqdefault
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

/**
 * Recent Downloads List Component
 * Client component that displays recent downloads with thumbnails and download buttons
 * Widgetized component - no padding/margin applied here
 */
export function RecentDownloadsList({ downloads }: RecentDownloadsListProps) {
  /**
   * Handle download button click
   * Navigates to download page where user can choose format
   */
  const handleDownloadClick = (download: RecentDownload) => {
    console.log("📥 [FRONTEND] User clicked download for recent video:", download.videoTitle)
    console.log(`📥 [FRONTEND] Video URL: ${download.url}`)

    // Track navigation event
    trackEvent("recent_download_clicked", {
      job_id: download.id,
      video_title: download.videoTitle,
      video_id: download.videoId,
      video_url: download.url,
      format_resolution: download.formatResolution,
      format_ext: download.formatExt,
    })

    console.log(`🚀 [FRONTEND] Navigating to download page for: ${download.videoTitle}`)
  }

  return (
    <section className="bg-secondary/50 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Recent Downloads</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {downloads.map((download) => {
            // Extract videoId from URL if it's missing (fallback for edge cases)
            const videoId = download.videoId || extractVideoId(download.url)
            const thumbnailUrl = getThumbnailUrl(videoId)
            
            return (
              <div
                key={download.id}
                className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border/50"
              >
                {/* Thumbnail */}
                <div className="relative w-full aspect-video bg-muted">
                  <Image
                    src={thumbnailUrl}
                    alt={download.videoTitle}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback to hqdefault if maxresdefault fails
                      if (videoId && e.currentTarget.src.includes("maxresdefault")) {
                        e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                      }
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-3">
                  {/* Video Title */}
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {download.videoTitle}
                  </h3>

                  {/* Time Ago */}
                  <p className="text-xs text-muted-foreground">
                    {new Date(download.createdAt).toLocaleDateString()} at{" "}
                    {new Date(download.createdAt).toLocaleTimeString()}
                  </p>

                  {/* Download Button */}
                  <Button
                    asChild
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Link 
                      href={`/download?url=${encodeURIComponent(download.url)}`}
                      onClick={() => handleDownloadClick(download)}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


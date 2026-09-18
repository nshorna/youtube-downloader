"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { APP_NAME } from "@/lib/config"
import { STORAGE_KEYS } from "@/lib/constants"
import { VideoInfo, VideoHeader } from "./video-info"
import { FormatTable } from "./format-table"
import {
  fetchFormats,
  createDownloadJob,
  pollJobStatus,
  triggerDownload,
  type VideoData,
  type Format,
} from "@/lib/services/download-service"
import { trackEvent, trackError, claritySet } from "@/lib/analytics"
import { useAuth } from "@/components/auth/auth-provider"

/**
 * Download Content Component
 * Main client component for the download page
 * Handles fetching formats, displaying video info, and managing downloads
 * Widgetized component - no padding/margin applied here
 */
function DownloadContentInner() {
  const searchParams = useSearchParams()
  const url = searchParams.get("url")
  const { loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [downloadingFormatId, setDownloadingFormatId] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({})
  const { toast } = useToast()

  /**
   * Fetch video formats on mount
   * Wait for auth to be ready before making API calls
   */
  useEffect(() => {
    // Wait for auth to be initialized before making API calls
    if (authLoading) {
      console.log("⏳ [FRONTEND] Waiting for auth to initialize...")
      return
    }

    if (!url) {
      console.log("❌ [FRONTEND] No URL provided in search params")
      setError("No URL provided")
      setLoading(false)
      return
    }

    console.log("🚀 [FRONTEND] URL found in search params:", url)

    const loadFormats = async () => {
      try {
        const data = await fetchFormats(url)
        setVideoData(data)

        // Track formats fetched event
        trackEvent("formats_fetched", {
          video_title: data.title,
          format_count: data.formats?.length || 0,
          url_length: url.length,
        })
        
        // Set Clarity state for session context
        claritySet('video_title', data.title)
        claritySet('format_count', String(data.formats?.length || 0))

        // Save to history
        console.log("💾 [FRONTEND] Saving to localStorage history...")
        const historyKey = STORAGE_KEYS.HISTORY(APP_NAME)
        const history = JSON.parse(localStorage.getItem(historyKey) || "[]")
        const newEntry = {
          url,
          title: data.title,
          thumbnail: data.thumbnail,
          timestamp: new Date().toISOString(),
        }
        // Remove duplicates and keep only last 10
        const updatedHistory = [newEntry, ...history.filter((item: any) => item.url !== url)].slice(0, 10)
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory))
        console.log("✅ [FRONTEND] History updated")
      } catch (err: any) {
        console.error("❌ [FRONTEND] Fetch error:", err.message)
        
        // Track fetch error
        trackError(err instanceof Error ? err : new Error(err.message || "Failed to fetch formats"), false)
        trackEvent("formats_fetch_error", {
          error_message: err.message || "Unknown error",
          url_length: url.length,
        })
        
        setError(err.message || "Something went wrong. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadFormats()
  }, [url, authLoading])

  /**
   * Handle download button click
   */
  const handleDownload = async (format: Format) => {
    if (!url || !videoData) {
      console.error("❌ [FRONTEND] Missing URL or video data for download")
      toast({
        title: "Error",
        description: "Missing information for download",
        variant: "destructive",
      })
      return
    }

    // Set loading state for this specific format
    setDownloadingFormatId(format.id)

    console.log("🚀 [FRONTEND] User clicked download button")
    console.log("📥 [FRONTEND] Download request:", {
      url,
      formatId: format.id,
      resolution: format.resolution,
      ext: format.ext,
      title: videoData.title,
    })

    // Track download started event
    trackEvent("download_started", {
      format_id: format.id,
      resolution: format.resolution,
      extension: format.ext,
      video_title: videoData.title,
      url_length: url.length,
    })
    
    // Set Clarity state for download context
    claritySet('downloading_format', format.id)
    claritySet('downloading_resolution', format.resolution || 'unknown')

    toast({
      title: "Download Started",
      description: `Preparing download for ${videoData.title} (${format.resolution} .${format.ext})...`,
    })

    try {
      // Step 1: Create download job
      const jobId = await createDownloadJob(url, format, videoData.title)

      toast({
        title: "Processing",
        description: "Your download is being prepared. Please wait...",
      })

      // Step 2: Poll for job completion with progress updates
      await pollJobStatus(jobId, (progress) => {
        setDownloadProgress((prev) => ({
          ...prev,
          [format.id]: progress,
        }))
      })

      // Step 3: Download the file using direct navigation
      toast({
        title: "Download Starting",
        description: "Your download should appear in Chrome's download manager shortly...",
      })

      triggerDownload(jobId, videoData, format)

      // Track download completed event
      trackEvent("download_completed", {
        job_id: jobId,
        format_id: format.id,
        resolution: format.resolution,
        extension: format.ext,
        video_title: videoData.title,
      })
      
      // Clear download state in Clarity
      claritySet('downloading_format', '')
      claritySet('downloading_resolution', '')

      toast({
        title: "Download Started",
        description: `Downloading ${videoData.title} (${format.resolution}). Check Chrome's download manager for progress.`,
      })
    } catch (err: any) {
      console.error("❌ [FRONTEND] Download error:", err.message)
      
      // Track download failed event
      trackError(err instanceof Error ? err : new Error(err.message || "Download failed"), false)
      trackEvent("download_failed", {
        format_id: format.id,
        resolution: format.resolution,
        extension: format.ext,
        error_message: err.message || "Unknown error",
        video_title: videoData.title,
      })
      
      // Clear download state in Clarity
      claritySet('downloading_format', '')
      claritySet('downloading_resolution', '')
      
      toast({
        title: "Download Failed",
        description: err.message || "An error occurred during download",
        variant: "destructive",
      })
    } finally {
      // Clear loading state and progress
      setDownloadingFormatId(null)
      setDownloadProgress((prev) => {
        const updated = { ...prev }
        delete updated[format.id]
        return updated
      })
    }
  }

  /**
   * Handle share button click
   */
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "URL Copied",
      description: "Share link has been copied to your clipboard.",
    })
  }

  // Show loading state while auth is initializing or formats are loading
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
            <Skeleton className="w-full md:w-1/3 aspect-video rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="pt-4 space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Error</h2>
        <p className="text-muted-foreground mb-8">{error}</p>
        <Button asChild>
          <Link href="/">Try Another Link</Link>
        </Button>
      </div>
    )
  }

  if (!videoData) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" asChild className="gap-2 -ml-4">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-none shadow-2xl bg-card">
        <div className="flex flex-col">
          <VideoInfo videoData={videoData} onShare={handleShare} />
          <div className="p-6 md:p-8">
            <VideoHeader videoData={videoData} onShare={handleShare} />
            <FormatTable
              formats={videoData.formats}
              downloadingFormatId={downloadingFormatId}
              downloadProgress={downloadProgress}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </Card>

      <div className="mt-12 text-center p-6 bg-secondary/30 rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">
          Having issues? Remember this tool is for educational purposes and content you have rights to.
        </p>
      </div>
    </div>
  )
}

/**
 * Download Content Component with Suspense wrapper
 */
export function DownloadContent() {
  return (
    <Suspense fallback={null}>
      <DownloadContentInner />
    </Suspense>
  )
}


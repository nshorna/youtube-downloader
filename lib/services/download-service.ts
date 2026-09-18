import { API_ENDPOINTS, DOWNLOAD_CONFIG } from "@/lib/constants"
import { generateDownloadFilename } from "@/lib/utils"
import { APP_NAME } from "@/lib/config"
import { apiPost, apiGet } from "@/lib/services/api-client"

/**
 * Format interface for video formats
 */
export interface Format {
  id: string
  ext: string
  resolution: string
  filesize: string
  note: string
}

/**
 * Video data interface
 */
export interface VideoData {
  title: string
  thumbnail: string
  videoId?: string
  formats: Format[]
}

/**
 * Fetch available formats for a YouTube URL
 */
export async function fetchFormats(url: string): Promise<VideoData> {
  console.log("📤 [FRONTEND] Sending POST request to fetch formats...")
  
  const response = await apiPost(API_ENDPOINTS.FETCH_FORMATS, { url })

  console.log("📥 [FRONTEND] Received response from fetch-formats API")
  const data = await response.json()

  if (!response.ok) {
    console.error("❌ [FRONTEND] API error:", data.error)
    throw new Error(data.error || "Failed to fetch video details")
  }

  console.log("✅ [FRONTEND] Formats fetched successfully")
  console.log(`✅ [FRONTEND] Video title: ${data.title}`)
  console.log(`✅ [FRONTEND] Video ID: ${data.videoId}`)
  console.log(`✅ [FRONTEND] Found ${data.formats?.length || 0} formats`)

  return {
    title: data.title,
    thumbnail: data.thumbnail,
    videoId: data.videoId,
    formats: data.formats,
  }
}

/**
 * Create a download job
 */
export async function createDownloadJob(
  url: string,
  format: Format,
  videoTitle: string
): Promise<string> {
  console.log("📤 [FRONTEND] Sending POST request to create download job...")
  
  const createResponse = await apiPost(API_ENDPOINTS.DOWNLOAD_CREATE, {
    url,
    formatId: format.id,
    videoTitle,
    formatResolution: format.resolution,
    formatExt: format.ext,
  })

  console.log("📥 [FRONTEND] Received response from create job API")
  console.log(`📥 [FRONTEND] Response status: ${createResponse.status}`)

  if (!createResponse.ok) {
    const errorData = await createResponse.json()
    console.error("❌ [FRONTEND] Job creation failed:", errorData.error)
    throw new Error(errorData.error || "Failed to create download job")
  }

  const { jobId } = await createResponse.json()
  console.log(`✅ [FRONTEND] Download job created with ID: ${jobId}`)
  
  return jobId
}

/**
 * Job status interface
 */
export interface JobStatus {
  status: string
  progress: number
  error?: string
}

/**
 * Poll for job status until completion or failure
 * Returns progress updates via callback
 */
export async function pollJobStatus(
  jobId: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  console.log("🔄 [FRONTEND] Starting to poll for job status...")
  
  return new Promise((resolve, reject) => {
    let pollAttempts = 0
    let pollInterval = DOWNLOAD_CONFIG.POLL_INTERVAL_MS

    const poll = async () => {
      pollAttempts++
      console.log(`🔄 [FRONTEND] Polling attempt ${pollAttempts}/${DOWNLOAD_CONFIG.MAX_POLL_ATTEMPTS} for job ${jobId}`)

      try {
        const statusResponse = await apiGet(API_ENDPOINTS.DOWNLOAD_STATUS(jobId))
        console.log(`📥 [FRONTEND] Status check response: ${statusResponse.status}`)

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json()
          console.error("❌ [FRONTEND] Status check failed:", errorData.error)
          reject(new Error(errorData.error || "Failed to check download status"))
          return
        }

        const statusData = await statusResponse.json()
        console.log(`📊 [FRONTEND] Job status: ${statusData.status}, progress: ${statusData.progress ?? 0}%`)

        // Update progress if callback provided
        if (onProgress && statusData.progress !== undefined) {
          onProgress(statusData.progress)
        }

        if (statusData.status === "COMPLETED") {
          console.log("✅ [FRONTEND] Job completed, ready to download")
          if (onProgress) {
            onProgress(100)
          }
          resolve()
          return
        }

        if (statusData.status === "FAILED") {
          console.error("❌ [FRONTEND] Job failed:", statusData.error)
          reject(new Error(statusData.error || "Download failed"))
          return
        }

        // Still processing, continue polling
        if (pollAttempts >= DOWNLOAD_CONFIG.MAX_POLL_ATTEMPTS) {
          console.error("❌ [FRONTEND] Polling timeout reached")
          reject(new Error("Download is taking too long. Please try again later."))
          return
        }

        // Continue polling with exponential backoff (max 5 seconds)
        setTimeout(poll, Math.min(pollInterval, DOWNLOAD_CONFIG.MAX_POLL_INTERVAL_MS))
      } catch (err: any) {
        console.error("❌ [FRONTEND] Polling error:", err.message)
        if (pollAttempts >= DOWNLOAD_CONFIG.MAX_POLL_ATTEMPTS) {
          reject(err)
        } else {
          setTimeout(poll, Math.min(pollInterval, DOWNLOAD_CONFIG.MAX_POLL_INTERVAL_MS))
        }
      }
    }

    poll()
  })
}

/**
 * Trigger browser download for completed job
 */
export function triggerDownload(jobId: string, videoData: VideoData, format: Format): void {
  console.log("📥 [FRONTEND] Job completed, starting file download...")
  
  const videoId = videoData.videoId || "unknown"
  const filename = generateDownloadFilename(
    APP_NAME,
    videoData.title,
    format.id,
    videoId,
    format.ext
  )

  // Create download link pointing directly to the API endpoint
  // The browser will handle the download natively with progress visibility
  console.log("📥 [FRONTEND] Creating direct download link...")
  const a = document.createElement("a")
  a.href = API_ENDPOINTS.DOWNLOAD_FILE(jobId)
  a.download = filename
  a.style.display = "none"
  document.body.appendChild(a)
  
  console.log(`📥 [FRONTEND] Triggering native browser download: ${filename}`)
  a.click()
  
  // Clean up after a short delay to ensure click is processed
  setTimeout(() => {
    document.body.removeChild(a)
  }, 100)

  console.log("✅ [FRONTEND] Download initiated successfully")
}


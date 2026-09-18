import { prisma } from "@/lib/prisma"
import { downloadByFormatId } from "@/lib/ytdlp"
import { APP_NAME } from "@/lib/config"
import { generateDownloadFilename } from "@/lib/utils"
import { scheduleFileCleanup } from "@/lib/services/file-cleanup"

/**
 * Processes a download job in the background
 * Updates the database with progress and results
 */
export async function processDownloadJob(jobId: string) {
  console.log(`🚀 [JOB-QUEUE] Starting to process job ${jobId}`)

  try {
    // Update status to PROCESSING
    await prisma.download.update({
      where: { id: jobId },
      data: { status: "PROCESSING" },
    })
    console.log(`⚙️ [JOB-QUEUE] Job ${jobId} status changed to: PROCESSING`)

    // Get job details
    const job = await prisma.download.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      console.error(`❌ [JOB-QUEUE] Job ${jobId} not found in database`)
      return
    }

    console.log(`📥 [JOB-QUEUE] Processing download for: ${job.videoTitle}`)
    console.log(`📥 [JOB-QUEUE] URL: ${job.url.substring(0, 50)}...`)
    console.log(`📥 [JOB-QUEUE] Format ID: ${job.formatId}`)

    // Download to /tmp directory with predictable filename using jobId
    const outputDir = "/tmp"
    console.log(`🚀 [JOB-QUEUE] Starting yt-dlp download...`)
    
    // Track progress and update database periodically
    let lastSavedProgress = 0
    const progressCallback = async (progress: number) => {
      // Only update database if progress increased by at least 5% to avoid spam
      if (progress - lastSavedProgress >= 5 || progress >= 100) {
        lastSavedProgress = progress
        try {
          await prisma.download.update({
            where: { id: jobId },
            data: { progress },
          })
          console.log(`📊 [JOB-QUEUE] Progress updated: ${progress.toFixed(1)}%`)
        } catch (error) {
          console.error(`⚠️ [JOB-QUEUE] Failed to update progress:`, error)
        }
      }
    }

    const filePath = await downloadByFormatId(
      job.url,
      job.formatId,
      outputDir,
      jobId,
      job.formatExt,
      progressCallback
    )

    console.log(`✅ [JOB-QUEUE] Download completed: ${filePath}`)

    // Generate filename using new naming convention: appname-video name-formatId-videoID.ext
    const videoId = job.videoId || "unknown"
    const fileName = generateDownloadFilename(
      APP_NAME,
      job.videoTitle,
      job.formatId,
      videoId,
      job.formatExt
    )

    console.log(`📝 [JOB-QUEUE] Generated filename: ${fileName}`)

    // Update job with completed status, file path, and final progress
    await prisma.download.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        filePath,
        fileName,
        progress: 100,
      },
    })

    console.log(`✅ [JOB-QUEUE] Job ${jobId} completed successfully`)
    console.log(`✅ [JOB-QUEUE] File saved: ${fileName}`)

    // Schedule cleanup of the downloaded file after 10 minutes
    console.log(`⏰ [JOB-QUEUE] Scheduling cleanup for file: ${filePath}`)
    scheduleFileCleanup(filePath)
  } catch (error: any) {
    console.error(`❌ [JOB-QUEUE] Job ${jobId} failed:`, error.message)

    // Update job with failed status and error message
    await prisma.download.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        error: error.message || "Unknown error occurred",
      },
    })

    console.log(`❌ [JOB-QUEUE] Job ${jobId} marked as FAILED`)
  }
}


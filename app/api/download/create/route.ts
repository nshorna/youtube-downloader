import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { downloadRequestSchema } from "@/lib/validations"
import { processDownloadJob } from "@/lib/download-processor"
import { extractVideoId } from "@/lib/utils"
import { access, constants } from "fs/promises"
import { verifyAuthToken } from "@/lib/middleware/auth-middleware"

export async function POST(req: NextRequest) {
  console.log("📥 [API] Received POST request to create download job")

  try {
    // Verify authentication
    const userId = await verifyAuthToken(req)
    console.log("✅ [API] User authenticated:", userId)
    const body = await req.json()
    console.log("📥 [API] Request body received")

    // Validate request body using Zod schema
    console.log("🔍 [API] Validating request with Zod schema...")
    const validationResult = downloadRequestSchema.safeParse(body)

    if (!validationResult.success) {
      console.log("❌ [API] Validation failed:", validationResult.error.errors)
      const errorMessage = validationResult.error.errors[0]?.message || "Invalid request"
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const { url, formatId } = validationResult.data
    console.log("✅ [API] Request validation passed")

    // Extract video ID from URL
    const videoId = extractVideoId(url)
    if (!videoId) {
      console.warn("⚠️ [API] Could not extract video ID from URL, proceeding without deduplication")
    }

    // Extract additional metadata from request body (if provided)
    const videoTitle = body.videoTitle || "Unknown Title"
    const formatResolution = body.formatResolution || "Unknown"
    const formatExt = body.formatExt || "mp4"

    // Deduplication: Check if we already have this download
    if (videoId) {
      console.log("🔍 [API] Checking for existing download with formatId:", formatId, "videoId:", videoId)
      const existingDownload = await prisma.download.findFirst({
        where: {
          formatId,
          videoId,
          status: "COMPLETED",
        },
        orderBy: {
          createdAt: "desc", // Get the most recent one
        },
      })

      if (existingDownload && existingDownload.filePath) {
        // Check if file still exists on disk
        try {
          await access(existingDownload.filePath, constants.F_OK)
          console.log("✅ [API] Found existing download, file exists. Reusing job:", existingDownload.id)
          console.log("📊 [API] Deduplication hit - skipping download to prevent IP ban")

          // Return existing job ID immediately
          return NextResponse.json({
            success: true,
            jobId: existingDownload.id,
            status: "COMPLETED",
            reused: true,
          })
        } catch (error) {
          // File doesn't exist, mark old job as failed and continue with new download
          console.log("⚠️ [API] Existing download found but file missing. Marking as failed and creating new job")
          await prisma.download.update({
            where: { id: existingDownload.id },
            data: {
              status: "FAILED",
              error: "File was deleted from disk",
            },
          })
        }
      } else {
        console.log("📊 [API] No existing download found, proceeding with new download")
      }
    }

    console.log("📥 [API] Creating download job:", {
      url: url.substring(0, 50) + "...",
      formatId,
      videoId,
      videoTitle,
      formatResolution,
      formatExt,
    })

    // Create download job in database
    const job = await prisma.download.create({
      data: {
        url,
        formatId,
        videoId,
        videoTitle,
        formatResolution,
        formatExt,
        status: "PENDING",
      },
    })

    console.log(`✅ [API] Download job created with ID: ${job.id}`)

    // Start background processing (fire-and-forget)
    // Don't await - let it run in background
    processDownloadJob(job.id).catch((error) => {
      console.error(`❌ [API] Background job processing error for ${job.id}:`, error)
    })

    console.log(`🚀 [API] Background processing started for job ${job.id}`)

    // Return job ID immediately
    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: "PENDING",
    })
  } catch (error: any) {
    // Handle auth errors separately
    if (error.message?.includes("Authentication failed") || error.message?.includes("Missing or invalid")) {
      console.error("❌ [API] Authentication error:", error.message)
      return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 })
    }
    console.error("❌ [API] Error creating download job:", error.message)
    return NextResponse.json({ error: error.message || "Failed to create download job" }, { status: 500 })
  }
}


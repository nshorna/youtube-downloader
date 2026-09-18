import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/middleware/auth-middleware"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params
  console.log(`📥 [API] Received status check request for job: ${jobId}`)

  try {
    // Verify authentication
    const userId = await verifyAuthToken(req)
    console.log("✅ [API] User authenticated:", userId)
    // Query database for download job
    const job = await prisma.download.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        status: true,
        filePath: true,
        fileName: true,
        error: true,
        videoTitle: true,
        formatResolution: true,
        formatExt: true,
        progress: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!job) {
      console.log(`❌ [API] Job ${jobId} not found`)
      return NextResponse.json({ error: "Download job not found" }, { status: 404 })
    }

    console.log(`✅ [API] Job ${jobId} status: ${job.status}`)

    // Return job status and metadata
    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      filePath: job.filePath,
      fileName: job.fileName,
      error: job.error,
      videoTitle: job.videoTitle,
      formatResolution: job.formatResolution,
      formatExt: job.formatExt,
      progress: job.progress ?? 0,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    })
  } catch (error: any) {
    // Handle auth errors separately
    if (error.message?.includes("Authentication failed") || error.message?.includes("Missing or invalid")) {
      console.error("❌ [API] Authentication error:", error.message)
      return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 })
    }
    console.error(`❌ [API] Error checking job status for ${jobId}:`, error.message)
    return NextResponse.json({ error: error.message || "Failed to check job status" }, { status: 500 })
  }
}


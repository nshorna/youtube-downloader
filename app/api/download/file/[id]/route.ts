import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { readFile, access } from "fs/promises"
import { constants } from "fs"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params
  console.log(`📥 [API] Received file download request for job: ${jobId}`)

  try {
    // Get job from database
    const job = await prisma.download.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      console.log(`❌ [API] Job ${jobId} not found`)
      return NextResponse.json({ error: "Download job not found" }, { status: 404 })
    }

    // Verify job is completed
    if (job.status !== "COMPLETED") {
      console.log(`❌ [API] Job ${jobId} is not completed. Status: ${job.status}`)
      return NextResponse.json(
        { error: `Download is not ready. Current status: ${job.status}` },
        { status: 400 }
      )
    }

    if (!job.filePath) {
      console.log(`❌ [API] Job ${jobId} has no file path`)
      return NextResponse.json({ error: "File path not found" }, { status: 500 })
    }

    console.log(`✅ [API] Job ${jobId} verified, reading file from: ${job.filePath}`)

    // Verify file exists
    try {
      await access(job.filePath, constants.F_OK)
      console.log(`✅ [API] File exists, reading...`)
    } catch (error) {
      console.error(`❌ [API] File does not exist at path: ${job.filePath}`)
      return NextResponse.json({ error: "Downloaded file not found" }, { status: 500 })
    }

    // Read the file
    const fileBuffer = await readFile(job.filePath)
    const fileName = job.fileName || job.filePath.split("/").pop() || "download"

    console.log(`✅ [API] File ready: ${fileName} (${fileBuffer.length} bytes)`)

    // Encode filename for Content-Disposition header (RFC 5987)
    // First, create a safe ASCII fallback by replacing non-ASCII characters
    const safeFileName = fileName.replace(/[^\x20-\x7E]/g, (char) => {
      // Replace non-ASCII characters with underscore or remove them
      return "_"
    })
    
    // Encode the original filename for UTF-8 support (RFC 5987)
    const encodedFileName = encodeURIComponent(fileName)
    
    // Use both ASCII fallback and UTF-8 encoded version
    const contentDisposition = `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`

    // Return the file as a download
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": contentDisposition,
        "Content-Length": fileBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error(`❌ [API] Error downloading file for job ${jobId}:`, error.message)
    return NextResponse.json({ error: error.message || "Failed to download file" }, { status: 500 })
  }
}


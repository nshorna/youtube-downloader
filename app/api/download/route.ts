import { NextResponse } from "next/server"
import { downloadByFormatId } from "@/lib/ytdlp"
import { readFile, access } from "fs/promises"
import { constants } from "fs"
import { downloadRequestSchema } from "@/lib/validations"

export async function POST(req: Request) {
  console.log("📥 [API] Received POST request to download video")

  try {
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
    console.log("📥 [API] Download request:", { url: url.substring(0, 50) + "...", formatId })

    console.log("🚀 [API] Starting download with yt-dlp...")
    // Download to /tmp directory (adjust as needed for your server)
    const outputDir = "/tmp"
    const filePath = await downloadByFormatId(url, formatId, outputDir)

    console.log("✅ [API] Download completed, verifying file exists...")
    // Verify file exists
    try {
      await access(filePath, constants.F_OK)
      console.log("✅ [API] File exists, reading...")
    } catch (error) {
      console.error("❌ [API] File does not exist at path:", filePath)
      return NextResponse.json({ error: "Downloaded file not found" }, { status: 500 })
    }

    // Read the file and return it
    const fileBuffer = await readFile(filePath)
    const fileName = filePath.split("/").pop() || "download"

    console.log(`✅ [API] File ready: ${fileName} (${fileBuffer.length} bytes)`)

    // Return the file as a download
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error("❌ [API] Download error:", error.message)
    return NextResponse.json({ error: error.message || "Download failed" }, { status: 500 })
  }
}


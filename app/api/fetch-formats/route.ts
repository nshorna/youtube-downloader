import { NextRequest, NextResponse } from "next/server"
import { fetchFormats } from "@/lib/ytdlp"
import { youtubeUrlRequestSchema } from "@/lib/validations"
import { verifyAuthToken } from "@/lib/middleware/auth-middleware"

export async function POST(req: NextRequest) {
  console.log("📥 [API] Received POST request to fetch formats")

  try {
    // Verify authentication
    const userId = await verifyAuthToken(req)
    console.log("✅ [API] User authenticated:", userId)

    const body = await req.json()
    console.log("📥 [API] Request body received")

    // Validate request body using Zod schema
    console.log("🔍 [API] Validating URL with Zod schema...")
    const validationResult = youtubeUrlRequestSchema.safeParse(body)

    if (!validationResult.success) {
      console.log("❌ [API] Validation failed:", validationResult.error.errors)
      const errorMessage = validationResult.error.errors[0]?.message || "Invalid request"
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const { url } = validationResult.data
    console.log("✅ [API] URL validation passed:", url.substring(0, 50) + "...")

    console.log("🚀 [API] Calling yt-dlp to fetch formats...")
    const videoData = await fetchFormats(url)

    console.log("✅ [API] Formats fetched successfully")
    console.log(`✅ [API] Found ${videoData.formats.length} formats for: ${videoData.title}`)

    return NextResponse.json({
      success: true,
      title: videoData.title,
      thumbnail: videoData.thumbnail,
      videoId: videoData.videoId,
      formats: videoData.formats,
    })
  } catch (error: any) {
    // Handle auth errors separately
    if (error.message?.includes("Authentication failed") || error.message?.includes("Missing or invalid")) {
      console.error("❌ [API] Authentication error:", error.message)
      return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 })
    }
    console.error("❌ [API] Error fetching formats:", error.message)
    return NextResponse.json({ error: error.message || "Failed to fetch formats" }, { status: 500 })
  }
}

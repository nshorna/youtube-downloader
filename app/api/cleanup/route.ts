import { NextResponse } from "next/server"
import { cleanupOldFiles } from "@/lib/services/file-cleanup"

/**
 * API route for manual cleanup of old files
 * Can be called manually or scheduled via cron job
 * Deletes files in /tmp that are older than 10 minutes
 */
export async function POST() {
  console.log("📥 [API] Received POST request to cleanup old files")

  try {
    const result = await cleanupOldFiles()

    console.log(`✅ [API] Cleanup completed: ${result.deleted} files deleted, ${result.errors} errors`)

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      errors: result.errors,
    })
  } catch (error: any) {
    console.error("❌ [API] Cleanup error:", error.message)
    return NextResponse.json(
      { error: error.message || "Failed to cleanup files" },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for manual cleanup (useful for testing)
 */
export async function GET() {
  console.log("📥 [API] Received GET request to cleanup old files")

  try {
    const result = await cleanupOldFiles()

    console.log(`✅ [API] Cleanup completed: ${result.deleted} files deleted, ${result.errors} errors`)

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      errors: result.errors,
    })
  } catch (error: any) {
    console.error("❌ [API] Cleanup error:", error.message)
    return NextResponse.json(
      { error: error.message || "Failed to cleanup files" },
      { status: 500 }
    )
  }
}


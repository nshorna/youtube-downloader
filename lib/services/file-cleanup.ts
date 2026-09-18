import { readdir, stat, unlink } from "fs/promises"
import { join } from "path"
import { prisma } from "@/lib/prisma"
import { CLEANUP_CONFIG } from "@/lib/constants"

/**
 * Deletes a specific file by its path
 * Also updates the database if the file is associated with a download job
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  console.log(`🗑️ [CLEANUP] Attempting to delete file: ${filePath}`)

  try {
    // Check if file exists
    await stat(filePath)
    
    // Delete the file
    await unlink(filePath)
    console.log(`✅ [CLEANUP] Successfully deleted file: ${filePath}`)

    // Try to find and update the associated download job in database
    // Files are named as {jobId}.{ext}, so we can extract jobId from filename
    const fileName = filePath.split("/").pop() || ""
    const jobId = fileName.split(".")[0] // Extract jobId before the extension

    if (jobId) {
      try {
        // Check if this job exists in the database
        const job = await prisma.download.findUnique({
          where: { id: jobId },
        })

        if (job && job.filePath === filePath) {
          // Update the job to remove filePath (file no longer exists)
          await prisma.download.update({
            where: { id: jobId },
            data: { filePath: null },
          })
          console.log(`📝 [CLEANUP] Updated database for job ${jobId}: removed filePath`)
        }
      } catch (dbError) {
        // Non-critical: continue even if database update fails
        console.warn(`⚠️ [CLEANUP] Could not update database for job ${jobId}:`, dbError)
      }
    }

    return true
  } catch (error: any) {
    // File doesn't exist or already deleted - not an error
    if (error.code === "ENOENT") {
      console.log(`ℹ️ [CLEANUP] File already deleted or doesn't exist: ${filePath}`)
      return true
    }
    
    console.error(`❌ [CLEANUP] Failed to delete file ${filePath}:`, error.message)
    return false
  }
}

/**
 * Cleans up files in the output directory that are older than the configured TTL
 * This function scans the directory and deletes files based on their modification time
 */
export async function cleanupOldFiles(): Promise<{ deleted: number; errors: number }> {
  console.log(`🧹 [CLEANUP] Starting cleanup of old files in ${CLEANUP_CONFIG.OUTPUT_DIR}`)
  console.log(`⏰ [CLEANUP] Files older than ${CLEANUP_CONFIG.FILE_TTL_MS / 1000 / 60} minutes will be deleted`)

  const now = Date.now()
  const cutoffTime = now - CLEANUP_CONFIG.FILE_TTL_MS
  let deletedCount = 0
  let errorCount = 0

  try {
    // Read all files in the output directory
    const files = await readdir(CLEANUP_CONFIG.OUTPUT_DIR)
    console.log(`📂 [CLEANUP] Found ${files.length} files in directory`)

    // Process each file
    for (const file of files) {
      const filePath = join(CLEANUP_CONFIG.OUTPUT_DIR, file)

      try {
        // Get file stats to check modification time
        const stats = await stat(filePath)
        const fileAge = stats.mtimeMs

        // Check if file is older than TTL
        if (fileAge < cutoffTime) {
          console.log(`⏰ [CLEANUP] File ${file} is ${Math.round((now - fileAge) / 1000 / 60)} minutes old, deleting...`)
          
          const deleted = await deleteFile(filePath)
          if (deleted) {
            deletedCount++
          } else {
            errorCount++
          }
        } else {
          const ageMinutes = Math.round((now - fileAge) / 1000 / 60)
          console.log(`⏸️ [CLEANUP] File ${file} is ${ageMinutes} minutes old, keeping (threshold: ${CLEANUP_CONFIG.FILE_TTL_MS / 1000 / 60} minutes)`)
        }
      } catch (error: any) {
        // Skip directories or files we can't access
        if (error.code === "EISDIR" || error.code === "EACCES") {
          console.log(`⏭️ [CLEANUP] Skipping ${file} (directory or access denied)`)
          continue
        }
        
        console.error(`❌ [CLEANUP] Error processing file ${file}:`, error.message)
        errorCount++
      }
    }

    console.log(`✅ [CLEANUP] Cleanup completed: ${deletedCount} files deleted, ${errorCount} errors`)
    return { deleted: deletedCount, errors: errorCount }
  } catch (error: any) {
    console.error(`❌ [CLEANUP] Failed to read directory ${CLEANUP_CONFIG.OUTPUT_DIR}:`, error.message)
    return { deleted: deletedCount, errors: errorCount + 1 }
  }
}

/**
 * Schedules cleanup for a specific file after the TTL period
 * This sets up a timeout to delete the file after 10 minutes
 */
export function scheduleFileCleanup(filePath: string): void {
  console.log(`⏰ [CLEANUP] Scheduling cleanup for file: ${filePath} in ${CLEANUP_CONFIG.FILE_TTL_MS / 1000 / 60} minutes`)

  setTimeout(async () => {
    console.log(`⏰ [CLEANUP] Scheduled cleanup time reached for: ${filePath}`)
    await deleteFile(filePath)
  }, CLEANUP_CONFIG.FILE_TTL_MS)
}


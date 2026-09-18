import { exec, spawn } from "child_process"
import { existsSync } from "fs"
import path from "path"
import { promisify } from "util"

const execAsync = promisify(exec)

const YTDLP_JS_RUNTIME = `node:${process.execPath}`
const YTDLP_COOKIES_FILE =
  process.env.YTDLP_COOKIES_FILE?.trim() ||
  path.join(process.env.HOME || "/tmp", ".config/yt-dlp/cookies.txt")
const YTDLP_COOKIES_FROM_BROWSER = process.env.YTDLP_COOKIES_FROM_BROWSER?.trim()

function getYtDlpCookieArgs(): string[] {
  if (YTDLP_COOKIES_FILE && existsSync(YTDLP_COOKIES_FILE)) {
    return ["--cookies", YTDLP_COOKIES_FILE]
  }

  if (YTDLP_COOKIES_FROM_BROWSER) {
    return ["--cookies-from-browser", YTDLP_COOKIES_FROM_BROWSER]
  }

  console.warn(
    `⚠️ [YT-DLP] No YouTube cookies configured. Set YTDLP_COOKIES_FILE or run ./yt-dlp-setup.sh cookies`
  )
  return []
}

function getYtDlpBaseArgs(): string[] {
  return ["--js-runtimes", YTDLP_JS_RUNTIME, ...getYtDlpCookieArgs()]
}

function shellQuote(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`
}

function ytDlpShellArgs(args: string): string {
  const baseArgs = getYtDlpBaseArgs().map(shellQuote).join(" ")
  return `yt-dlp ${baseArgs} ${args}`
}

function ytDlpSpawnArgs(args: string[]): string[] {
  return [...getYtDlpBaseArgs(), ...args]
}

/**
 * Interface for parsed format information from yt-dlp
 */
export interface YtDlpFormat {
  id: string
  ext: string
  resolution: string
  filesize: string
  note: string
}

/**
 * Interface for video metadata from yt-dlp
 */
export interface VideoMetadata {
  title: string
  thumbnail: string
  videoId: string
  formats: YtDlpFormat[]
}

/**
 * Parses yt-dlp --list-formats output into structured format data
 * Handles the table format output from yt-dlp
 */
function parseFormatsList(output: string): YtDlpFormat[] {
  const formats: YtDlpFormat[] = []
  const lines = output.split("\n")

  // Find the start of the format table (after the header line with dashes)
  let tableStartIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("ID") && lines[i].includes("EXT") && lines[i].includes("RESOLUTION")) {
      // Next line should be the separator, and after that the data
      tableStartIndex = i + 2
      break
    }
  }

  if (tableStartIndex === -1) {
    return formats
  }

  // Parse each format line
  for (let i = tableStartIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith("─")) continue

    // Parse format line: ID EXT RESOLUTION FPS CH │ FILESIZE TBR PROTO │ VCODEC VBR ACODEC ABR ASR MORE INFO
    const parts = line.split(/\s+/).filter((p) => p && p !== "│")

    if (parts.length < 3) continue

    const id = parts[0]
    const ext = parts[1]
    let resolution = parts[2]
    let filesize = ""
    let note = ""

    // Extract resolution (may include fps)
    if (resolution.includes("x")) {
      // Video format
      const resolutionMatch = resolution.match(/(\d+x\d+)/)
      if (resolutionMatch) {
        resolution = resolutionMatch[1]
      }
    } else if (resolution === "audio") {
      // Audio-only format
      resolution = "Audio Only"
    }

    // Find filesize (usually after resolution/fps)
    for (let j = 3; j < parts.length; j++) {
      if (parts[j].includes("MiB") || parts[j].includes("GiB") || parts[j].includes("KiB")) {
        filesize = parts[j]
        break
      }
    }

    // Extract note from the end (in brackets)
    const noteMatch = line.match(/\[([^\]]+)\]/)
    if (noteMatch) {
      note = noteMatch[1]
    }

    formats.push({
      id,
      ext,
      resolution,
      filesize: filesize || "Unknown",
      note: note || "",
    })
  }

  return formats
}

/**
 * Fetches available formats for a YouTube URL using yt-dlp
 */
export async function fetchFormats(url: string): Promise<VideoMetadata> {
  console.log("📥 [YT-DLP] Fetching formats for URL:", url)

  try {
    // First, get video info (title and thumbnail) using --dump-json
    console.log("📥 [YT-DLP] Fetching video metadata...")
    const { stdout: infoOutput } = await execAsync(ytDlpShellArgs(`--dump-json "${url}"`))
    const videoInfo = JSON.parse(infoOutput)

    const title = videoInfo.title || "Unknown Title"
    const thumbnail = videoInfo.thumbnail || videoInfo.thumbnails?.[0]?.url || ""
    const videoId = videoInfo.id || ""

    console.log("✅ [YT-DLP] Video metadata fetched:", { title, thumbnail: thumbnail.substring(0, 50) + "...", videoId })

    // Then, get format list
    console.log("📥 [YT-DLP] Fetching format list...")
    const { stdout: formatsOutput } = await execAsync(ytDlpShellArgs(`--list-formats "${url}"`))
    console.log("✅ [YT-DLP] Format list received, parsing...")

    const formats = parseFormatsList(formatsOutput)
    console.log(`✅ [YT-DLP] Parsed ${formats.length} formats`)

    return {
      title,
      thumbnail,
      videoId,
      formats,
    }
  } catch (error: any) {
    console.error("❌ [YT-DLP] Error fetching formats:", error.message)
    throw new Error(`Failed to fetch formats: ${error.message}`)
  }
}

/**
 * Downloads a video/audio using yt-dlp with a specific format ID
 * Returns the path to the downloaded file
 * @param jobId - Optional job ID to use in the filename for predictable naming
 * @param formatExt - Optional file extension for the format (e.g., "mp4", "m4a")
 * @param onProgress - Optional callback function to receive progress updates (0-100)
 */
export async function downloadByFormatId(
  url: string,
  formatId: string,
  outputDir: string = "/tmp",
  jobId?: string,
  formatExt?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  console.log(`📥 [YT-DLP] Starting download for format ID: ${formatId}`)
  console.log(`📥 [YT-DLP] URL: ${url}`)
  console.log(`📥 [YT-DLP] Output directory: ${outputDir}`)

  try {
    // Determine file extension - use provided formatExt or query from video info
    let ext = formatExt || "mp4"
    if (!formatExt) {
      // Get video info to determine the file extension if not provided
      const { stdout: infoOutput } = await execAsync(ytDlpShellArgs(`--dump-json "${url}"`))
      const videoInfo = JSON.parse(infoOutput)
      ext = videoInfo.ext || "mp4"
    }

    // Use predictable filename with jobId if provided, otherwise use video ID
    let outputFilename: string
    if (jobId) {
      // Use jobId for predictable naming: {jobId}.{ext}
      outputFilename = `${jobId}.${ext}`
    } else {
      // Fallback: get video ID for filename
      const { stdout: infoOutput } = await execAsync(ytDlpShellArgs(`--dump-json "${url}"`))
      const videoInfo = JSON.parse(infoOutput)
      const videoId = videoInfo.id || "unknown"
      outputFilename = `${videoId}.${ext}`
    }

    const filePath = `${outputDir}/${outputFilename}`

    // Use yt-dlp to download with specific format ID and predictable filename
    // -f specifies format ID, -o specifies output path
    // --newline ensures progress output is on separate lines
    // --progress-template formats progress as JSON-like output
    console.log(`🚀 [YT-DLP] Executing command: yt-dlp -f "${formatId}" -o "${filePath}" "${url}"`)

    // Use spawn instead of exec to get real-time progress updates
    return new Promise((resolve, reject) => {
      const args = ytDlpSpawnArgs([
        "-f",
        formatId,
        "-o",
        filePath,
        "--newline",
        "--progress-template",
        "%(progress.downloaded_bytes)s/%(progress.total_bytes)s %(progress._percent_str)s",
        url,
      ])

      const ytdlpProcess = spawn("yt-dlp", args)

      let stdoutData = ""
      let stderrData = ""
      let lastProgress = 0

      ytdlpProcess.stdout.on("data", (data: Buffer) => {
        const output = data.toString()
        stdoutData += output

        // Parse progress from output
        // Format: "1234567/12345678 10.0%"
        const progressMatch = output.match(/(\d+\.\d+)%/)
        if (progressMatch && onProgress) {
          const progress = parseFloat(progressMatch[1])
          // Only update if progress increased significantly (avoid spam)
          if (progress - lastProgress >= 5 || progress >= 100) {
            lastProgress = progress
            onProgress(Math.min(100, Math.max(0, progress)))
          }
        }
      })

      ytdlpProcess.stderr.on("data", (data: Buffer) => {
        stderrData += data.toString()
      })

      ytdlpProcess.on("close", (code) => {
        if (code === 0) {
          console.log("✅ [YT-DLP] Download completed")
          if (stdoutData) {
            console.log("📤 [YT-DLP] Output:", stdoutData.substring(0, 500))
          }
          if (stderrData) {
            console.log("⚠️ [YT-DLP] Warnings:", stderrData.substring(0, 500))
          }
          if (onProgress) {
            onProgress(100)
          }
          console.log(`✅ [YT-DLP] File saved to: ${filePath}`)
          resolve(filePath)
        } else {
          const errorMsg = stderrData || stdoutData || "Unknown error"
          console.error("❌ [YT-DLP] Download failed with code:", code)
          console.error("❌ [YT-DLP] Error:", errorMsg)
          reject(new Error(`Download failed with exit code ${code}: ${errorMsg}`))
        }
      })

      ytdlpProcess.on("error", (error) => {
        console.error("❌ [YT-DLP] Process error:", error.message)
        reject(error)
      })
    })
  } catch (error: any) {
    console.error("❌ [YT-DLP] Download error:", error.message)
    throw new Error(`Download failed: ${error.message}`)
  }
}


"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Download, Loader2, Video, Volume2 } from "lucide-react"
import type { Format } from "@/lib/services/download-service"
import { extractCountryCode, getCountryFlag } from "@/lib/utils/format-utils"

interface FormatTableRowProps {
  format: Format
  downloadingFormatId: string | null
  downloadProgress: Record<string, number>
  onDownload: (format: Format) => void
}

export function FormatTableRow({
  format,
  downloadingFormatId,
  downloadProgress,
  onDownload,
}: FormatTableRowProps) {
  const isAudioOnly = format.resolution === "Audio Only" || format.resolution.toLowerCase().includes("audio")
  const isVideoOnly = !isAudioOnly && format.resolution.includes("x")
  const countryCode = extractCountryCode(format)
  const flagEmoji = countryCode ? getCountryFlag(countryCode) : null

  return (
    <tr key={format.id} className="group hover:bg-muted/50 transition-colors">
      <td className="py-3 font-medium">
        <div className="flex items-center gap-2">
          {isAudioOnly && <Volume2 className="w-4 h-4 text-muted-foreground" />}
          {isVideoOnly && <Video className="w-4 h-4 text-muted-foreground" />}
          <span>{format.resolution}</span>
          {flagEmoji && (
            <span className="text-base" title={countryCode || ""}>
              {flagEmoji}
            </span>
          )}
          {format.note && (
            <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {format.note}
            </span>
          )}
        </div>
      </td>
      <td className="py-3 uppercase">{format.ext}</td>
      <td className="py-3 text-muted-foreground">{format.filesize}</td>
      <td className="py-3 text-right">
        <div className="flex flex-col items-end gap-2">
          {downloadingFormatId === format.id && downloadProgress[format.id] !== undefined && (
            <div className="w-32">
              <Progress value={downloadProgress[format.id]} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {downloadProgress[format.id].toFixed(0)}%
              </p>
            </div>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onDownload(format)}
            disabled={downloadingFormatId === format.id}
            className="gap-2"
          >
            {downloadingFormatId === format.id ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download
              </>
            )}
          </Button>
        </div>
      </td>
    </tr>
  )
}


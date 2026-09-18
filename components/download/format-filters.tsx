"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X, Video, Volume2, File, Grid3x3 } from "lucide-react"
import { getLanguageName } from "@/lib/utils/format-utils"
import type { LucideIcon } from "lucide-react"

interface FormatFiltersProps {
  uniqueExtensions: string[]
  uniqueResolutions: string[]
  uniqueFilesizes: string[]
  uniqueLanguages: string[]
  selectedExtension: string
  selectedResolution: string
  selectedFilesize: string
  selectedLanguage: string
  onExtensionChange: (value: string) => void
  onResolutionChange: (value: string) => void
  onFilesizeChange: (value: string) => void
  onLanguageChange: (value: string) => void
}

/**
 * Gets the appropriate icon for a file extension
 */
function getExtensionIcon(ext: string): LucideIcon {
  const extLower = ext.toLowerCase()
  
  // Video formats
  const videoFormats = ["mp4", "webm", "mkv", "avi", "mov", "flv", "wmv", "m4v", "3gp"]
  if (videoFormats.includes(extLower)) {
    return Video
  }
  
  // Audio formats
  const audioFormats = ["mp3", "m4a", "opus", "ogg", "wav", "aac", "flac", "wma", "webm"]
  if (audioFormats.includes(extLower)) {
    return Volume2
  }
  
  // Default file icon for other formats
  return File
}

export function FormatFilters({
  uniqueExtensions,
  uniqueResolutions,
  uniqueFilesizes,
  uniqueLanguages,
  selectedExtension,
  selectedResolution,
  selectedFilesize,
  selectedLanguage,
  onExtensionChange,
  onResolutionChange,
  onFilesizeChange,
  onLanguageChange,
}: FormatFiltersProps) {
  const hasActiveFilters =
    selectedExtension !== "all" ||
    selectedResolution !== "all" ||
    selectedFilesize !== "all" ||
    selectedLanguage !== "all"

  const handleClearAll = () => {
    onExtensionChange("all")
    onResolutionChange("all")
    onFilesizeChange("all")
    onLanguageChange("all")
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={selectedExtension} onValueChange={onExtensionChange}>
        <SelectTrigger className="w-[140px] min-w-[120px] flex-shrink-0">
          <SelectValue placeholder="Filter by extension" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              <span>All Extensions</span>
            </div>
          </SelectItem>
          {uniqueExtensions.map((ext) => {
            const Icon = getExtensionIcon(ext)
            return (
              <SelectItem key={ext} value={ext}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>.{ext}</span>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      <Select value={selectedResolution} onValueChange={onResolutionChange}>
        <SelectTrigger className="w-[160px] min-w-[140px] flex-shrink-0">
          <SelectValue placeholder="Filter by resolution" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Resolutions</SelectItem>
          {uniqueResolutions.map((resolution) => (
            <SelectItem key={resolution} value={resolution}>
              {resolution}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedFilesize} onValueChange={onFilesizeChange}>
        <SelectTrigger className="w-[140px] min-w-[120px] flex-shrink-0">
          <SelectValue placeholder="Filter by filesize" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Filesizes</SelectItem>
          {uniqueFilesizes.map((filesize) => (
            <SelectItem key={filesize} value={filesize}>
              {filesize}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {uniqueLanguages.length > 0 && (
        <Select value={selectedLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[140px] min-w-[120px] flex-shrink-0">
            <SelectValue placeholder="Filter by language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {uniqueLanguages.map((langCode) => (
              <SelectItem key={langCode} value={langCode}>
                {getLanguageName(langCode)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          className="flex-shrink-0"
        >
          <X className="w-4 h-4" />
          Clear All
        </Button>
      )}
    </div>
  )
}


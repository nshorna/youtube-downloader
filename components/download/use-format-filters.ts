import { useState, useMemo } from "react"
import type { Format } from "@/lib/services/download-service"
import { extractLanguage, getLanguageName } from "@/lib/utils/format-utils"

export interface FormatFilters {
  selectedExtension: string
  selectedResolution: string
  selectedFilesize: string
  selectedLanguage: string
}

export function useFormatFilters(formats: Format[]) {
  const [selectedExtension, setSelectedExtension] = useState<string>("all")
  const [selectedResolution, setSelectedResolution] = useState<string>("all")
  const [selectedFilesize, setSelectedFilesize] = useState<string>("all")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")

  // Extract unique extensions from formats
  const uniqueExtensions = useMemo(() => {
    const extensions = new Set(formats.map((f) => f.ext.toUpperCase()))
    return Array.from(extensions).sort()
  }, [formats])

  // Extract unique resolutions from formats
  const uniqueResolutions = useMemo(() => {
    const resolutions = new Set(formats.map((f) => f.resolution))
    return Array.from(resolutions).sort((a, b) => {
      // Sort audio-only to the end
      if (a === "Audio Only") return 1
      if (b === "Audio Only") return -1
      // Sort video resolutions by height (extract number after 'x')
      const aMatch = a.match(/(\d+)x(\d+)/)
      const bMatch = b.match(/(\d+)x(\d+)/)
      if (aMatch && bMatch) {
        return parseInt(bMatch[2]) - parseInt(aMatch[2]) // Sort descending by height
      }
      return a.localeCompare(b)
    })
  }, [formats])

  // Extract unique filesizes from formats
  const uniqueFilesizes = useMemo(() => {
    const filesizes = new Set(formats.map((f) => f.filesize))
    return Array.from(filesizes).sort((a, b) => {
      // Sort by size: extract numeric value and unit
      const parseSize = (size: string): number => {
        if (size === "Unknown") return -1
        const match = size.match(/([\d.]+)\s*(KiB|MiB|GiB|TiB)/i)
        if (!match) return 0
        const value = parseFloat(match[1])
        const unit = match[2].toUpperCase()
        const multipliers: Record<string, number> = { KiB: 1, MiB: 1024, GiB: 1024 * 1024, TiB: 1024 * 1024 * 1024 }
        return value * (multipliers[unit] || 1)
      }
      return parseSize(b) - parseSize(a) // Sort descending
    })
  }, [formats])

  // Extract unique languages from formats
  const uniqueLanguages = useMemo(() => {
    const languages = new Set<string>()
    formats.forEach((f) => {
      const lang = extractLanguage(f)
      if (lang) {
        languages.add(lang)
      }
    })
    return Array.from(languages).sort((a, b) => {
      const nameA = getLanguageName(a)
      const nameB = getLanguageName(b)
      return nameA.localeCompare(nameB)
    })
  }, [formats])

  // Filter formats by selected filters
  const filteredFormats = useMemo(() => {
    return formats.filter((f) => {
      if (selectedExtension !== "all" && f.ext.toUpperCase() !== selectedExtension) {
        return false
      }
      if (selectedResolution !== "all" && f.resolution !== selectedResolution) {
        return false
      }
      if (selectedFilesize !== "all" && f.filesize !== selectedFilesize) {
        return false
      }
      if (selectedLanguage !== "all") {
        const formatLanguage = extractLanguage(f)
        if (!formatLanguage || formatLanguage !== selectedLanguage) {
          return false
        }
      }
      return true
    })
  }, [formats, selectedExtension, selectedResolution, selectedFilesize, selectedLanguage])

  const hasActiveFilters = selectedExtension !== "all" || 
    selectedResolution !== "all" || 
    selectedFilesize !== "all" || 
    selectedLanguage !== "all"

  return {
    filters: {
      selectedExtension,
      selectedResolution,
      selectedFilesize,
      selectedLanguage,
    },
    setFilters: {
      setSelectedExtension,
      setSelectedResolution,
      setSelectedFilesize,
      setSelectedLanguage,
    },
    uniqueValues: {
      uniqueExtensions,
      uniqueResolutions,
      uniqueFilesizes,
      uniqueLanguages,
    },
    filteredFormats,
    hasActiveFilters,
  }
}


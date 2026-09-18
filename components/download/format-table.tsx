"use client"

import type { Format } from "@/lib/services/download-service"
import { useFormatFilters } from "./use-format-filters"
import { FormatFilters } from "./format-filters"
import { FormatTableRow } from "./format-table-row"

interface FormatTableProps {
  formats: Format[]
  downloadingFormatId: string | null
  downloadProgress: Record<string, number>
  onDownload: (format: Format) => void
}

/**
 * Format Table Component
 * Displays available video formats in a table with download buttons
 * Widgetized component - no padding/margin applied here
 */
export function FormatTable({ formats, downloadingFormatId, downloadProgress, onDownload }: FormatTableProps) {
  const {
    filters,
    setFilters,
    uniqueValues,
    filteredFormats,
    hasActiveFilters,
  } = useFormatFilters(formats)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Available Formats
        </h3>
        <FormatFilters
          uniqueExtensions={uniqueValues.uniqueExtensions}
          uniqueResolutions={uniqueValues.uniqueResolutions}
          uniqueFilesizes={uniqueValues.uniqueFilesizes}
          uniqueLanguages={uniqueValues.uniqueLanguages}
          selectedExtension={filters.selectedExtension}
          selectedResolution={filters.selectedResolution}
          selectedFilesize={filters.selectedFilesize}
          selectedLanguage={filters.selectedLanguage}
          onExtensionChange={setFilters.setSelectedExtension}
          onResolutionChange={setFilters.setSelectedResolution}
          onFilesizeChange={setFilters.setSelectedFilesize}
          onLanguageChange={setFilters.setSelectedLanguage}
        />
      </div>
      {hasActiveFilters && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredFormats.length} of {formats.length} formats
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="pb-3 font-medium">Resolution</th>
              <th className="pb-3 font-medium">EXT</th>
              <th className="pb-3 font-medium">Filesize</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredFormats.map((format) => (
              <FormatTableRow
                key={format.id}
                format={format}
                downloadingFormatId={downloadingFormatId}
                downloadProgress={downloadProgress}
                onDownload={onDownload}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


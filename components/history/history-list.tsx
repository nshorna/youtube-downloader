"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { History, Trash2, Search } from "lucide-react"
import Link from "next/link"
import { HistoryItem } from "./history-item"
import { getHistory, clearHistory, removeFromHistory, type HistoryItem as HistoryItemType } from "@/lib/services/history-service"

/**
 * History List Component
 * Displays list of download history items with management actions
 * Widgetized component - no padding/margin applied here
 */
export function HistoryList() {
  const [history, setHistory] = useState<HistoryItemType[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const items = getHistory()
    setHistory(items)
  }, [])

  // Filter history based on search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) {
      return history
    }

    const query = searchQuery.toLowerCase().trim()
    return history.filter(
      (item) =>
        item.title.toLowerCase().includes(query) || item.url.toLowerCase().includes(query)
    )
  }, [history, searchQuery])

  /**
   * Handle clear all history
   */
  const handleClearHistory = () => {
    clearHistory()
    setHistory([])
  }

  /**
   * Handle remove single item
   */
  const handleRemoveItem = (url: string) => {
    removeFromHistory(url)
    setHistory((prev) => prev.filter((item) => item.url !== url))
  }

  if (history.length === 0) {
    return (
      <Card className="border-dashed border-2 py-20 text-center">
        <CardContent>
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-medium mb-2">No history yet</h2>
          <p className="text-muted-foreground mb-6">Your recently fetched videos will appear here.</p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show "no results" message when search returns empty
  if (searchQuery.trim() && filteredHistory.length === 0) {
    return (
      <>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Download History</h1>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card className="border-dashed border-2 py-20 text-center">
          <CardContent>
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-medium mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6">
              No history items match your search query "{searchQuery}".
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <History className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Download History</h1>
        </div>
        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 bg-transparent"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </Button>
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery.trim() && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {filteredHistory.length} of {history.length} items
          </p>
        )}
      </div>

      <div className="grid gap-4">
        {filteredHistory.map((item) => (
          <HistoryItem key={item.url} item={item} onRemove={handleRemoveItem} />
        ))}
      </div>
    </>
  )
}


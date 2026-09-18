"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Trash2, ArrowRight } from "lucide-react"
import type { HistoryItem as HistoryItemType } from "@/lib/services/history-service"

interface HistoryItemProps {
  item: HistoryItemType
  onRemove: (url: string) => void
}

/**
 * History Item Component
 * Displays a single history item with thumbnail, title, and actions
 * Widgetized component - no padding/margin applied here
 */
export function HistoryItem({ item, onRemove }: HistoryItemProps) {
  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-colors group">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-48 aspect-video bg-muted">
            <Image src={item.thumbnail || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                Fetched on {new Date(item.timestamp).toLocaleDateString()} at{" "}
                {new Date(item.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.url)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Remove
              </Button>
              <Button asChild size="sm" className="gap-2">
                <Link href={`/download?url=${encodeURIComponent(item.url)}`}>
                  <Download className="w-4 h-4" /> Redownload <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


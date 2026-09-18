"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import type { VideoData } from "@/lib/services/download-service"

interface VideoInfoProps {
  videoData: VideoData
  onShare: () => void
}

/**
 * Video Info Component
 * Displays video thumbnail and title with share button
 * Widgetized component - no padding/margin applied here
 */
export function VideoInfo({ videoData, onShare }: VideoInfoProps) {
  return (
    <div className="w-full relative bg-muted aspect-video">
      <Image
        src={videoData.thumbnail}
        alt={videoData.title}
        fill
        className="object-cover"
      />
    </div>
  )
}

/**
 * Video Header Component
 * Displays video title and share button
 * Widgetized component - no padding/margin applied here
 */
export function VideoHeader({ videoData, onShare }: VideoInfoProps) {
  return (
    <div className="flex justify-between items-start gap-4 mb-4">
      <h1 className="text-2xl font-bold leading-tight">{videoData.title}</h1>
      <Button variant="outline" size="icon" onClick={onShare} title="Share Link">
        <Share2 className="w-4 h-4" />
      </Button>
    </div>
  )
}


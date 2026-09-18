"use client"

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

/**
 * Page View Tracker Component
 * Automatically tracks page views when the route changes
 * Uses Next.js App Router navigation hooks
 */
export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Only track in browser
    if (typeof window === 'undefined') {
      return
    }

    // Build full path with query params if they exist
    const fullPath = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname

    // Get page title from document
    const pageTitle = document.title || pathname

    // Track page view
    trackPageView(fullPath, pageTitle)
  }, [pathname, searchParams])

  // This component doesn't render anything
  return null
}


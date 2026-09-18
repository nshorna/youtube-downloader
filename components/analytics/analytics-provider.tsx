"use client"

import { useEffect } from 'react'
import { initGoogleAnalytics, initMicrosoftClarity } from '@/lib/analytics'
import { GA_MEASUREMENT_ID } from '@/lib/constants'

/**
 * Analytics Provider Component
 * Initializes Google Analytics and Microsoft Clarity on mount
 * Only runs in the browser (client-side)
 */
export function AnalyticsProvider() {
  useEffect(() => {
    // Only initialize in browser
    if (typeof window === 'undefined') {
      return
    }

    console.log('📊 [ANALYTICS] Initializing analytics providers...')

    // Initialize Google Analytics
    const gaMeasurementId = GA_MEASUREMENT_ID
    if (gaMeasurementId) {
      initGoogleAnalytics(gaMeasurementId)
    } else {
      console.warn('⚠️ [ANALYTICS] GA_MEASUREMENT_ID not found, skipping Google Analytics initialization')
    }

    // Initialize Microsoft Clarity
    // Note: For client-side access in Next.js, the env var must be prefixed with NEXT_PUBLIC_
    const clarityProjectId = process.env.NEXT_PUBLIC_MS_CLARITY_PROJECT_ID
    if (clarityProjectId) {
      initMicrosoftClarity(clarityProjectId)
    } else {
      console.warn('⚠️ [ANALYTICS] NEXT_PUBLIC_MS_CLARITY_PROJECT_ID not found, skipping Microsoft Clarity initialization')
    }
  }, [])

  // This component doesn't render anything
  return null
}


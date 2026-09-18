/**
 * Google Analytics 4 (GA4) Tracking Utilities
 * Provides functions to initialize GA4 and track page views, events, and errors
 * Uses Firebase Analytics under the hood
 */

import { analytics } from '@/lib/firebase.client'
import { logEvent } from 'firebase/analytics'

let isInitialized = false
let storedMeasurementId: string | null = null

/**
 * Check if Google Analytics is loaded and ready
 */
export function isGoogleAnalyticsReady(): boolean {
  return typeof window !== 'undefined' && analytics !== null && isInitialized
}

/**
 * Initialize Google Analytics 4
 * @param measurementId - GA4 Measurement ID (e.g., G-XXXXXXXXXX)
 * Note: Firebase Analytics is already initialized in firebase.client.ts
 * This function just marks analytics as ready
 */
export function initGoogleAnalytics(measurementId: string): void {
  // Only initialize in browser
  if (typeof window === 'undefined') {
    return
  }

  // Prevent double initialization
  if (isInitialized) {
    console.log('📊 [ANALYTICS] Google Analytics already initialized')
    return
  }

  console.log('📊 [ANALYTICS] Initializing Google Analytics via Firebase...')

  try {
    // Store measurement ID for later use
    storedMeasurementId = measurementId

    // Firebase Analytics is already initialized in firebase.client.ts
    // Just mark as initialized if analytics is available
    if (analytics) {
      isInitialized = true
      console.log('✅ [ANALYTICS] Google Analytics initialized successfully via Firebase')
      
      // Log initial page view
      logEvent(analytics, 'page_view', {
        page_path: window.location.pathname,
        page_title: document.title,
      })
    } else {
      console.warn('⚠️ [ANALYTICS] Firebase Analytics not available')
    }
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error initializing Google Analytics:', error.message)
  }
}

/**
 * Track a page view
 * @param path - Page path (e.g., '/download')
 * @param title - Optional page title
 */
export function trackPageView(path: string, title?: string): void {
  if (!isGoogleAnalyticsReady() || !analytics) {
    console.warn('⚠️ [ANALYTICS] Google Analytics not ready, skipping page view tracking')
    return
  }

  try {
    logEvent(analytics, 'page_view', {
      page_path: path,
      page_title: title || document.title,
    })
    console.log('📊 [ANALYTICS] Page view tracked:', path)
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error tracking page view:', error.message)
  }
}

/**
 * Track a custom event
 * @param eventName - Event name (e.g., 'download_started')
 * @param params - Optional event parameters
 */
export function trackEvent(eventName: string, params?: Record<string, any>): void {
  if (!isGoogleAnalyticsReady() || !analytics) {
    console.warn('⚠️ [ANALYTICS] Google Analytics not ready, skipping event tracking')
    return
  }

  try {
    logEvent(analytics, eventName, params || {})
    console.log('📊 [ANALYTICS] Event tracked:', eventName, params || {})
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error tracking event:', error.message)
  }
}

/**
 * Track an error
 * @param error - Error object or error message string
 * @param fatal - Whether the error is fatal (default: false)
 */
export function trackError(error: Error | string, fatal: boolean = false): void {
  if (!isGoogleAnalyticsReady() || !analytics) {
    console.warn('⚠️ [ANALYTICS] Google Analytics not ready, skipping error tracking')
    return
  }

  try {
    const errorMessage = error instanceof Error ? error.message : error
    const errorStack = error instanceof Error ? error.stack : undefined

    logEvent(analytics, 'exception', {
      description: errorMessage,
      fatal: fatal,
      ...(errorStack && { error_stack: errorStack }),
    })
    console.log('❌ [ANALYTICS] Error tracked:', errorMessage, { fatal })
  } catch (err: any) {
    console.error('❌ [ANALYTICS] Error tracking exception:', err.message)
  }
}


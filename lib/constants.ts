/**
 * Centralized constants for API endpoints and reusable values
 * Only includes colors, API endpoints, and other reusable values
 * Does NOT include font sizes, spacing, or other styling values
 */

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  FETCH_FORMATS: "/api/fetch-formats",
  DOWNLOAD_CREATE: "/api/download/create",
  DOWNLOAD_STATUS: (jobId: string) => `/api/download/status/${jobId}`,
  DOWNLOAD_FILE: (jobId: string) => `/api/download/file/${jobId}`,
} as const

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  HISTORY: (appName: string) => `${appName.toLowerCase()}_history`,
} as const

/**
 * Download polling configuration
 */
export const DOWNLOAD_CONFIG = {
  MAX_POLL_ATTEMPTS: 100, // 5 minutes max (100 * 3 seconds)
  POLL_INTERVAL_MS: 3000, // Start with 3 seconds
  MAX_POLL_INTERVAL_MS: 5000, // Maximum poll interval with exponential backoff
} as const

/**
 * Analytics configuration (optional — set NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID)
 */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""

/**
 * File cleanup configuration
 */
export const CLEANUP_CONFIG = {
  FILE_TTL_MS: 30 * 60 * 1000, // 30 minutes in milliseconds
  OUTPUT_DIR: "/tmp", // Directory where downloaded files are stored
} as const




/**
 * Unified Analytics Interface
 * Exports all analytics functions for easy importing
 */

export {
  initGoogleAnalytics,
  trackPageView,
  trackEvent,
  trackError,
  isGoogleAnalyticsReady,
} from './google-analytics'

export {
  initMicrosoftClarity,
  clarityIdentify,
  clarityEvent,
  claritySet,
  clarityUpgrade,
  isClarityReady,
} from './microsoft-clarity'

/**
 * Unified analytics object for convenience
 */
export const analytics = {
  // Google Analytics
  trackPageView: (path: string, title?: string) => {
    const { trackPageView } = require('./google-analytics')
    trackPageView(path, title)
  },
  trackEvent: (eventName: string, params?: Record<string, any>) => {
    const { trackEvent } = require('./google-analytics')
    const { clarityEvent } = require('./microsoft-clarity')
    // Track in both Google Analytics and Microsoft Clarity
    trackEvent(eventName, params)
    clarityEvent(eventName, params)
  },
  trackError: (error: Error | string, fatal?: boolean) => {
    const { trackError } = require('./google-analytics')
    trackError(error, fatal)
  },
  // Microsoft Clarity
  identify: (userId: string) => {
    const { clarityIdentify } = require('./microsoft-clarity')
    clarityIdentify(userId)
  },
  setClarityState: (key: string, value: string) => {
    const { claritySet } = require('./microsoft-clarity')
    claritySet(key, value)
  },
  identifyClarity: (userId: string) => {
    const { clarityIdentify } = require('./microsoft-clarity')
    clarityIdentify(userId)
  },
}


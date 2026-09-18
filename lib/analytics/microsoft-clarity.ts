/**
 * Microsoft Clarity Tracking Utilities
 * Provides functions to initialize Microsoft Clarity
 */

declare global {
  interface Window {
    clarity?: (...args: any[]) => void
  }
}

let isInitialized = false
let pendingIdentifications: string[] = []
let checkInterval: ReturnType<typeof setInterval> | null = null

/**
 * Check if Microsoft Clarity is loaded and ready
 */
export function isClarityReady(): boolean {
  return typeof window !== 'undefined' && typeof window.clarity === 'function' && isInitialized
}

/**
 * Process pending user identifications once Clarity is ready
 */
function processPendingIdentifications(): void {
  if (!isClarityReady() || pendingIdentifications.length === 0) {
    return
  }

  // Process all pending identifications
  const userIds = [...pendingIdentifications]
  pendingIdentifications = []

  userIds.forEach((userId) => {
    try {
      window.clarity!('identify', userId)
      console.log('📊 [ANALYTICS] User identified in Clarity (from queue):', userId)
    } catch (error: any) {
      console.error('❌ [ANALYTICS] Error identifying user in Clarity:', error.message)
    }
  })

  // Clear the interval if we've processed everything
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
}

/**
 * Start checking periodically if Clarity is ready
 */
function startReadinessCheck(): void {
  if (checkInterval) {
    return // Already checking
  }

  // Check every 100ms for up to 5 seconds
  let attempts = 0
  const maxAttempts = 50

  checkInterval = setInterval(() => {
    attempts++
    
    // Check if Clarity is ready (window.clarity might exist before isInitialized is true)
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      // If we have pending identifications, try to process them
      if (pendingIdentifications.length > 0) {
        // Set isInitialized if it's not already set
        if (!isInitialized) {
          isInitialized = true
          console.log('✅ [ANALYTICS] Microsoft Clarity detected as ready')
        }
        processPendingIdentifications()
      }
    }

    // Stop checking after max attempts
    if (attempts >= maxAttempts) {
      if (checkInterval) {
        clearInterval(checkInterval)
        checkInterval = null
      }
    }
  }, 100)
}

/**
 * Initialize Microsoft Clarity
 * @param projectId - Clarity Project ID
 */
export function initMicrosoftClarity(projectId: string): void {
  // Only initialize in browser
  if (typeof window === 'undefined') {
    return
  }

  // Prevent double initialization
  if (isInitialized) {
    console.log('📊 [ANALYTICS] Microsoft Clarity already initialized')
    return
  }

  console.log('📊 [ANALYTICS] Initializing Microsoft Clarity...')

  try {
    // Load Clarity script
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${projectId}");
    `
    script.onload = () => {
      isInitialized = true
      console.log('✅ [ANALYTICS] Microsoft Clarity initialized successfully')
      // Process any pending identifications now that Clarity is ready
      processPendingIdentifications()
    }
    script.onerror = () => {
      console.error('❌ [ANALYTICS] Failed to load Microsoft Clarity script')
    }
    document.head.appendChild(script)
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error initializing Microsoft Clarity:', error.message)
  }
}

/**
 * Identify a user in Clarity (optional, for authenticated users)
 * @param userId - User ID to identify
 */
export function clarityIdentify(userId: string): void {
  if (!isClarityReady()) {
    // Queue the identification for later
    if (!pendingIdentifications.includes(userId)) {
      pendingIdentifications.push(userId)
      console.log('📊 [ANALYTICS] Queued user identification for Clarity:', userId)
      // Start checking if Clarity becomes ready
      startReadinessCheck()
    }
    return
  }

  try {
    window.clarity!('identify', userId)
    console.log('📊 [ANALYTICS] User identified in Clarity:', userId)
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error identifying user in Clarity:', error.message)
  }
}

/**
 * Track a custom event in Clarity
 * @param eventName - Event name (e.g., 'download_started')
 * @param eventData - Optional event data/metadata
 */
export function clarityEvent(eventName: string, eventData?: Record<string, any>): void {
  if (!isClarityReady()) {
    console.warn('⚠️ [ANALYTICS] Microsoft Clarity not ready, skipping event tracking')
    return
  }

  try {
    if (eventData) {
      window.clarity!('event', eventName, eventData)
    } else {
      window.clarity!('event', eventName)
    }
    console.log('📊 [ANALYTICS] Clarity event tracked:', eventName, eventData || {})
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error tracking Clarity event:', error.message)
  }
}

/**
 * Set state/metadata for session context in Clarity
 * @param key - State key (e.g., 'video_title', 'format_id')
 * @param value - State value (must be a string)
 */
export function claritySet(key: string, value: string): void {
  if (!isClarityReady()) {
    console.warn('⚠️ [ANALYTICS] Microsoft Clarity not ready, skipping state setting')
    return
  }

  try {
    window.clarity!('set', key, value)
    console.log('📊 [ANALYTICS] Clarity state set:', key, '=', value)
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error setting Clarity state:', error.message)
  }
}

/**
 * Upgrade an anonymous session to an authenticated user session
 * Links the current anonymous session to a user ID
 * @param userId - User ID to upgrade to
 */
export function clarityUpgrade(userId: string): void {
  if (!isClarityReady()) {
    console.warn('⚠️ [ANALYTICS] Microsoft Clarity not ready, skipping session upgrade')
    return
  }

  try {
    window.clarity!('upgrade', userId)
    console.log('📊 [ANALYTICS] Clarity session upgraded to user:', userId)
  } catch (error: any) {
    console.error('❌ [ANALYTICS] Error upgrading Clarity session:', error.message)
  }
}


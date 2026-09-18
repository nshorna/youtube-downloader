import { STORAGE_KEYS } from "@/lib/constants"
import { APP_NAME } from "@/lib/config"

/**
 * History item interface
 */
export interface HistoryItem {
  url: string
  title: string
  thumbnail: string
  timestamp: string
}

/**
 * Get history from localStorage
 */
export function getHistory(): HistoryItem[] {
  console.log("📖 [FRONTEND] Loading history from localStorage...")
  const historyKey = STORAGE_KEYS.HISTORY(APP_NAME)
  const history = JSON.parse(localStorage.getItem(historyKey) || "[]")
  console.log(`✅ [FRONTEND] Loaded ${history.length} history items`)
  return history
}

/**
 * Save item to history
 */
export function saveToHistory(item: Omit<HistoryItem, "timestamp">): void {
  console.log("💾 [FRONTEND] Saving to localStorage history...")
  const historyKey = STORAGE_KEYS.HISTORY(APP_NAME)
  const history = getHistory()
  const newEntry: HistoryItem = {
    ...item,
    timestamp: new Date().toISOString(),
  }
  // Remove duplicates and keep only last 10
  const updatedHistory = [newEntry, ...history.filter((item) => item.url !== newEntry.url)].slice(0, 10)
  localStorage.setItem(historyKey, JSON.stringify(updatedHistory))
  console.log("✅ [FRONTEND] History updated")
}

/**
 * Remove item from history
 */
export function removeFromHistory(url: string): void {
  console.log("🗑️ [FRONTEND] Removing item from history:", url)
  const historyKey = STORAGE_KEYS.HISTORY(APP_NAME)
  const history = getHistory()
  const updated = history.filter((item) => item.url !== url)
  localStorage.setItem(historyKey, JSON.stringify(updated))
  console.log("✅ [FRONTEND] Item removed from history")
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  console.log("🗑️ [FRONTEND] Clearing all history...")
  const historyKey = STORAGE_KEYS.HISTORY(APP_NAME)
  localStorage.removeItem(historyKey)
  console.log("✅ [FRONTEND] History cleared")
}


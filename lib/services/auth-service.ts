import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, Auth, signInAnonymously, User, onAuthStateChanged } from "firebase/auth"
import { FIREBASE_CONFIG } from "@/lib/firebase.config"

let app: FirebaseApp | null = null
let auth: Auth | null = null

/**
 * Initialize Firebase app (singleton pattern)
 */
function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const existingApps = getApps()
    if (existingApps.length > 0) {
      app = existingApps[0]
    } else {
      app = initializeApp(FIREBASE_CONFIG)
    }
  }
  return app
}

/**
 * Get Firebase Auth instance
 */
function getFirebaseAuth(): Auth {
  if (!auth) {
    const firebaseApp = getFirebaseApp()
    auth = getAuth(firebaseApp)
  }
  return auth
}

/**
 * Sign in anonymously
 * Returns the user object on success
 */
export async function signInAnonymouslyUser(): Promise<User> {
  const authInstance = getFirebaseAuth()
  const userCredential = await signInAnonymously(authInstance)
  return userCredential.user
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  const authInstance = getFirebaseAuth()
  return authInstance.currentUser
}

/**
 * Get current user's ID token
 * Returns null if user is not authenticated
 */
export async function getIdToken(): Promise<string | null> {
  const user = getCurrentUser()
  if (!user) {
    return null
  }
  try {
    const token = await user.getIdToken()
    return token
  } catch (error) {
    console.error("❌ [AUTH] Error getting ID token:", error)
    return null
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  const authInstance = getFirebaseAuth()
  return onAuthStateChanged(authInstance, callback)
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}


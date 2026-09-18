import { initializeApp, getApps, cert, App } from "firebase-admin/app"
import { getAuth, Auth } from "firebase-admin/auth"
import "dotenv/config"

let app: App | null = null
let auth: Auth | null = null

/**
 * Initialize Firebase Admin SDK
 * Uses service account from environment variable
 */
function getFirebaseAdminApp(): App {
  if (!app) {
    const existingApps = getApps()
    if (existingApps.length > 0) {
      app = existingApps[0]
    } else {
      // Get service account from environment
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
      if (!serviceAccountJson) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set")
      }

      let serviceAccount
      try {
        serviceAccount = JSON.parse(serviceAccountJson)
      } catch (error) {
        throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON")
      }

      app = initializeApp({
        credential: cert(serviceAccount),
      })
    }
  }
  return app
}

/**
 * Get Firebase Admin Auth instance
 */
export function getFirebaseAdminAuth(): Auth {
  if (!auth) {
    const adminApp = getFirebaseAdminApp()
    auth = getAuth(adminApp)
  }
  return auth
}

/**
 * Verify Firebase ID token
 * Returns the decoded token with user ID
 */
export async function verifyIdToken(token: string): Promise<{ uid: string; [key: string]: any }> {
  const authInstance = getFirebaseAdminAuth()
  try {
    const decodedToken = await authInstance.verifyIdToken(token)
    return decodedToken
  } catch (error: any) {
    throw new Error(`Invalid token: ${error.message}`)
  }
}


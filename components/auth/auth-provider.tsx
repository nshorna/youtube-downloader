"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User } from "firebase/auth"
import { signInAnonymouslyUser, onAuthStateChange, getIdToken, getCurrentUser } from "@/lib/services/auth-service"
import { clarityIdentify } from "@/lib/analytics"

interface AuthContextType {
  user: User | null
  loading: boolean
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Auth Provider Component
 * Wraps the app and provides Firebase authentication state
 * Automatically signs in anonymously on first load
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const initializeAuth = async () => {
      try {
        // Check if user is already signed in
        const currentUser = getCurrentUser()
        if (currentUser) {
          console.log("✅ [AUTH] User already authenticated:", currentUser.uid)
          setUser(currentUser)
          // Identify user in Clarity
          clarityIdentify(currentUser.uid)
          setLoading(false)
          return
        }

        // Sign in anonymously
        console.log("🔐 [AUTH] Signing in anonymously...")
        const newUser = await signInAnonymouslyUser()
        console.log("✅ [AUTH] Anonymous sign-in successful:", newUser.uid)
        setUser(newUser)
        // Identify anonymous user in Clarity
        clarityIdentify(newUser.uid)
      } catch (error: any) {
        console.error("❌ [AUTH] Error signing in anonymously:", error.message)
        setUser(null)
      } finally {
        setLoading(false)
      }

      // Subscribe to auth state changes
      unsubscribe = onAuthStateChange((authUser) => {
        console.log("🔄 [AUTH] Auth state changed:", authUser?.uid || "null")
        setUser(authUser)
        // Identify user in Clarity when auth state changes
        if (authUser) {
          clarityIdentify(authUser.uid)
        }
      })
    }

    initializeAuth()

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const getToken = async (): Promise<string | null> => {
    return getIdToken()
  }

  const value: AuthContextType = {
    user,
    loading,
    getIdToken: getToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


import { NextRequest } from "next/server"
import { verifyIdToken } from "@/lib/firebase-admin"

/**
 * Extract and verify Firebase token from request
 * Returns the user ID if token is valid
 * Throws error if token is missing or invalid
 */
export async function verifyAuthToken(req: NextRequest): Promise<string> {
  // Extract token from Authorization header
  const authHeader = req.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header")
  }

  const token = authHeader.substring(7) // Remove "Bearer " prefix

  if (!token) {
    throw new Error("Token not provided")
  }

  // Verify token
  try {
    const decodedToken = await verifyIdToken(token)
    return decodedToken.uid
  } catch (error: any) {
    throw new Error(`Authentication failed: ${error.message}`)
  }
}

/**
 * Middleware helper to wrap API route handlers with auth
 * Usage: export const POST = withAuth(async (req, userId) => { ... })
 */
export function withAuth(
  handler: (req: NextRequest, userId: string, ...args: any[]) => Promise<Response>
) {
  return async (req: NextRequest, ...args: any[]): Promise<Response> => {
    try {
      const userId = await verifyAuthToken(req)
      return handler(req, userId, ...args)
    } catch (error: any) {
      console.error("❌ [AUTH] Authentication error:", error.message)
      return Response.json({ error: error.message || "Unauthorized" }, { status: 401 })
    }
  }
}


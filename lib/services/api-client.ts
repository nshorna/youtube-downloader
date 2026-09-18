import { getIdToken } from "@/lib/services/auth-service"

/**
 * API Client
 * Centralized fetch wrapper that automatically adds Firebase authentication token
 * to all API requests
 */

interface RequestOptions extends RequestInit {
  skipAuth?: boolean // Option to skip auth for specific requests
}

/**
 * Fetch with automatic Firebase token injection
 */
export async function apiFetch(url: string, options: RequestOptions = {}): Promise<Response> {
  const { skipAuth = false, headers = {}, ...restOptions } = options

  // Get Firebase token (unless auth is skipped)
  let authHeaders: HeadersInit = {}
  if (!skipAuth) {
    const token = await getIdToken()
    if (token) {
      authHeaders = {
        Authorization: `Bearer ${token}`,
      }
    } else {
      console.warn("⚠️ [API] No auth token available, request may fail")
    }
  }

  // Merge headers
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...authHeaders,
    ...headers,
  }

  // Make the request
  const response = await fetch(url, {
    ...restOptions,
    headers: mergedHeaders,
  })

  return response
}

/**
 * GET request helper
 */
export async function apiGet(url: string, options: RequestOptions = {}): Promise<Response> {
  return apiFetch(url, {
    ...options,
    method: "GET",
  })
}

/**
 * POST request helper
 */
export async function apiPost(url: string, data?: any, options: RequestOptions = {}): Promise<Response> {
  return apiFetch(url, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT request helper
 */
export async function apiPut(url: string, data?: any, options: RequestOptions = {}): Promise<Response> {
  return apiFetch(url, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE request helper
 */
export async function apiDelete(url: string, options: RequestOptions = {}): Promise<Response> {
  return apiFetch(url, {
    ...options,
    method: "DELETE",
  })
}


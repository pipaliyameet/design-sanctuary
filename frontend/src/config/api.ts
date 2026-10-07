/**
 * Production-Safe Central API Configuration
 * Supports Vercel deployments, custom domains, and local development with strict DEV guards.
 */
export function getApiBaseUrl(): string {
  // 1. Explicit Vite environment variable (e.g. VITE_API_URL in production or .env)
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) {
    return String(import.meta.env.VITE_API_URL).replace(/\/$/, "");
  }

  // 2. Local development fallback (strictly guarded by import.meta.env.DEV)
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    return "http://localhost:5001/api";
  }

  // 3. Client-side browser runtime detection (Production)
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5001/api";
    }
    return `${window.location.origin}/api`;
  }

  // 4. Server-side rendering (SSR) in Node/Nitro
  if (typeof process !== "undefined" && process.env) {
    const ssrUrl = process.env.VITE_API_URL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;
    if (ssrUrl) {
      return ssrUrl.replace(/\/$/, "");
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api`;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}/api`;
    }
  }

  // Absolute fallback for local Node SSR execution
  return "http://localhost:5001/api";
}

export const API_BASE_URL = getApiBaseUrl();


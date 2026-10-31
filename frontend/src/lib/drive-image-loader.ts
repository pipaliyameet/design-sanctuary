import { API_BASE_URL } from "@/config/api";

/**
 * Global Caches for Google Drive Images
 */
// Successfully loaded and verified URLs (naturalWidth > 1 && naturalHeight > 1)
export const verifiedUrlsCache = new Set<string>();

// Permanently failed URLs/IDs (to prevent infinite retries)
export const failedUrlsCache = new Set<string>();

// Mapping of fileId -> working candidate endpoint to instantly reuse the best URL across components
export const fileIdEndpointCache = new Map<string, string>();

// In-flight promises to deduplicate concurrent requests for the exact same image
const inFlightPromises = new Map<string, Promise<string>>();

/**
 * Extracts a Google Drive File ID from any Google Drive/UserContent URL or raw ID string.
 */
export function extractGoogleDriveId(srcOrId?: string): string | null {
  if (!srcOrId || typeof srcOrId !== "string") return null;
  const trimmed = srcOrId.trim();

  // Guard against non-Google URLs and special schemes
  if (
    trimmed.startsWith("local-") ||
    trimmed.startsWith("sim-") ||
    trimmed.startsWith("err-") ||
    trimmed.startsWith("mem_") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:") ||
    trimmed.includes("/api/media/local/") ||
    trimmed.includes("localhost:")
  ) {
    return null;
  }

  // 1. lh3.googleusercontent.com/d/ID (with optional size parameter like =w1200)
  const dMatch = trimmed.match(/lh3\.googleusercontent\.com\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/i);
  if (dMatch?.[1]) return dMatch[1];

  // 2. drive.google.com/thumbnail?id=ID
  const thumbMatch = trimmed.match(/drive\.google\.com\/thumbnail\?.*id=([a-zA-Z0-9_-]+)/i);
  if (thumbMatch?.[1]) return thumbMatch[1];

  // 3. drive.google.com/uc?id=ID
  const ucMatch = trimmed.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/i);
  if (ucMatch?.[1]) return ucMatch[1];

  // 4. drive.google.com/file/d/ID
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileMatch?.[1]) return fileMatch[1];

  // 5. drive.google.com/open?id=ID
  const openMatch = trimmed.match(/drive\.google\.com\/open\?.*id=([a-zA-Z0-9_-]+)/i);
  if (openMatch?.[1]) return openMatch[1];

  // 6. Generic googleusercontent / drive regex
  const genMatch = trimmed.match(/(?:lh\d+|drive)\.google(?:usercontent)?\.com\/.*[?&/=]([a-zA-Z0-9_-]{28,45})/i);
  if (genMatch?.[1]) return genMatch[1];

  // 7. Clean alphanumeric Drive ID (28-45 chars, no slashes or dots)
  if (/^[a-zA-Z0-9_-]{28,45}$/.test(trimmed) && !trimmed.includes(".")) {
    return trimmed;
  }

  return null;
}

/**
 * Builds an optimized, ordered list of high-availability Google Drive image endpoints.
 */
export function buildDriveCandidateUrls(
  src?: string,
  driveId?: string,
  fallbackUrls: string[] = [],
): string[] {
  const extractedId = extractGoogleDriveId(driveId) || extractGoogleDriveId(src);
  const candidates: string[] = [];
  const proxyBase = API_BASE_URL.replace(/\/$/, "");

  if (extractedId) {
    // If we already know a working endpoint for this specific fileId, put it first!
    const knownWorking = fileIdEndpointCache.get(extractedId);
    if (knownWorking) {
      candidates.push(knownWorking);
    }

    // 1. Direct Google Edge CDN (fastest delivery, HTTP/2 & HTTP/3 multiplexing)
    const edgeCdn = `https://lh3.googleusercontent.com/d/${extractedId}`;
    if (!candidates.includes(edgeCdn)) candidates.push(edgeCdn);

    // 2. High-speed backend cached proxy (RAM LRU, verified Service Account, 0ms on warm)
    const backendProxy = `${proxyBase}/media/drive-image/${extractedId}`;
    if (!candidates.includes(backendProxy)) candidates.push(backendProxy);

    // 3. Google High-Res Thumbnail
    const thumb1200 = `https://drive.google.com/thumbnail?id=${extractedId}&sz=w1200`;
    if (!candidates.includes(thumb1200)) candidates.push(thumb1200);

    // 4. Google Medium Thumbnail
    const thumb800 = `https://drive.google.com/thumbnail?id=${extractedId}&sz=w800`;
    if (!candidates.includes(thumb800)) candidates.push(thumb800);
  }

  // 5. Original provided src (if not already present)
  if (src && !candidates.includes(src)) {
    candidates.push(src);
  }

  // 6. Consumer-provided fallback URLs
  for (const url of fallbackUrls) {
    if (url && !candidates.includes(url)) {
      candidates.push(url);
    }
  }

  return candidates;
}

/**
 * Intelligent Image Preloader with In-Flight Deduplication & Verification
 */
export function preloadAndVerifyImage(url: string): Promise<string> {
  if (!url) return Promise.reject(new Error("Empty image URL"));
  if (verifiedUrlsCache.has(url)) return Promise.resolve(url);

  // Return in-flight promise if another component is currently verifying this exact URL
  if (inFlightPromises.has(url)) {
    return inFlightPromises.get(url)!;
  }

  const promise = new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";

    let isSettled = false;

    const cleanup = () => {
      isSettled = true;
      img.onload = null;
      img.onerror = null;
    };

    img.onload = () => {
      if (isSettled) return;
      // Usability check: ensure valid dimensions
      if (img.naturalWidth > 1 && img.naturalHeight > 1) {
        cleanup();
        verifiedUrlsCache.add(url);
        resolve(url);
      } else {
        cleanup();
        reject(new Error(`Image loaded with unusable dimensions (${img.naturalWidth}x${img.naturalHeight})`));
      }
    };

    img.onerror = () => {
      if (isSettled) return;
      cleanup();
      reject(new Error(`Failed to load image from ${url}`));
    };

    img.src = url;
  }).finally(() => {
    inFlightPromises.delete(url);
  });

  inFlightPromises.set(url, promise);
  return promise;
}

/**
 * Calculate exponential backoff delay with random jitter
 * Default: ~350ms base, factor 1.5, + 50-120ms random jitter
 */
export function calculateRetryDelay(attempt: number, baseMs = 350): number {
  const exponential = baseMs * Math.pow(1.5, attempt);
  const jitter = Math.floor(Math.random() * 120) + 40;
  return Math.min(Math.round(exponential + jitter), 2500);
}

/**
 * Evict a deleted image from memory caches
 */
export function evictFromImageCache(driveIdOrUrl?: string): void {
  if (!driveIdOrUrl) {
    verifiedUrlsCache.clear();
    fileIdEndpointCache.clear();
    failedUrlsCache.clear();
    return;
  }

  const id = extractGoogleDriveId(driveIdOrUrl) || driveIdOrUrl;
  fileIdEndpointCache.delete(id);

  for (const url of Array.from(verifiedUrlsCache)) {
    if (url.includes(id)) {
      verifiedUrlsCache.delete(url);
    }
  }

  failedUrlsCache.add(id);
}



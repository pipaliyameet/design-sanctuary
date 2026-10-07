import { getGoogleDriveClient } from "./googleDrive.service.js";

interface CachedImageEntry {
  buffer: Buffer;
  contentType: string;
  etag: string;
  lastModified: Date;
  size: number;
}

// Pure In-Memory LRU Cache (RAM only — zero disk files or directories created)
const memoryCache = new Map<string, CachedImageEntry>();
const MAX_MEMORY_ITEMS = 60;

function pruneMemoryCache() {
  if (memoryCache.size > MAX_MEMORY_ITEMS) {
    const keysToRemove = Array.from(memoryCache.keys()).slice(0, 15);
    for (const k of keysToRemove) {
      memoryCache.delete(k);
    }
  }
}

function getCacheKey(fileId: string, sz: string = "orig"): string {
  return `${fileId.trim()}_${sz.trim()}`;
}

/**
 * Retrieves image from in-memory RAM cache or downloads from Google Drive with 0 disk writes
 */
export async function getOrFetchCachedImage(
  fileId: string,
  sz: string = "orig",
): Promise<{
  buffer: Buffer;
  contentType: string;
  etag: string;
  lastModified: Date;
  from: "memory" | "network";
} | null> {
  const cacheKey = getCacheKey(fileId, sz);

  // 1. Check in-memory RAM cache
  if (memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey)!;
    // Move to end for LRU
    memoryCache.delete(cacheKey);
    memoryCache.set(cacheKey, entry);
    return { ...entry, from: "memory" };
  }

  // 2. Fetch from Google Drive API or upstream Google CDN
  let buffer: Buffer | null = null;
  let contentType = "image/jpeg";

  // Try direct Google Drive client
  const drive = getGoogleDriveClient();
  if (drive) {
    try {
      const driveRes = await drive.files.get(
        { fileId, alt: "media", supportsAllDrives: true },
        { responseType: "arraybuffer" },
      );
      if (driveRes.data) {
        buffer = Buffer.from(driveRes.data as ArrayBuffer);
        contentType = (driveRes.headers as any)?.["content-type"] || "image/jpeg";
      }
    } catch {
      // Fallback to fetch upstream CDN
    }
  }

  // Upstream CDN fallback
  if (!buffer) {
    const candidateUrls = [
      `https://lh3.googleusercontent.com/d/${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=${sz === "orig" ? "w1200" : sz}`,
      `https://drive.google.com/uc?export=view&id=${fileId}`,
    ];

    for (const url of candidateUrls) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        if (response.ok) {
          contentType = response.headers.get("content-type") || "image/jpeg";
          const arrayBuffer = await response.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
          break;
        }
      } catch {
        // Try next
      }
    }
  }

  if (!buffer || buffer.length === 0) {
    return null;
  }

  const etag = `W/"drive-${cacheKey}-${buffer.length}"`;
  const lastModified = new Date();

  const entry: CachedImageEntry = {
    buffer,
    contentType,
    etag,
    lastModified,
    size: buffer.length,
  };

  // Save exclusively to RAM memory
  memoryCache.set(cacheKey, entry);
  pruneMemoryCache();

  return { ...entry, from: "network" };
}

/**
 * Invalidate in-memory cache for a specific file or all files
 */
export function invalidateImageCache(fileId?: string) {
  if (!fileId) {
    memoryCache.clear();
    return;
  }

  for (const k of Array.from(memoryCache.keys())) {
    if (k.startsWith(fileId)) {
      memoryCache.delete(k);
    }
  }
}

/**
 * Preload an array of file IDs into the in-memory background RAM cache
 */
export async function preloadDriveImages(fileIds: string[]) {
  const uniqueIds = Array.from(new Set(fileIds.filter(Boolean)));
  for (const id of uniqueIds.slice(0, 10)) {
    getOrFetchCachedImage(id, "orig").catch(() => {});
  }
}

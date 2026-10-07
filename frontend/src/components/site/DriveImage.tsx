import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Maximize2, Image as ImageIcon, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

// Global in-memory cache of loaded image URLs to guarantee 0ms instant display without re-flashing skeleton
const loadedUrlsCache = new Set<string>();

/**
 * Preloads an image into the browser's disk & memory cache
 */
export function preloadImage(src: string): Promise<void> {
  if (!src || loadedUrlsCache.has(src)) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.referrerPolicy = "no-referrer";
    img.onload = () => {
      loadedUrlsCache.add(src);
      resolve();
    };
    img.onerror = () => resolve();
  });
}

/**
 * Extracts a Google Drive File ID from any standard Google Drive/Google User Content URL or raw ID string.
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

  const dMatch = trimmed.match(/lh3\.googleusercontent\.com\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/i);
  if (dMatch?.[1]) return dMatch[1];

  const thumbMatch = trimmed.match(/drive\.google\.com\/thumbnail\?.*id=([a-zA-Z0-9_-]+)/i);
  if (thumbMatch?.[1]) return thumbMatch[1];

  const ucMatch = trimmed.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/i);
  if (ucMatch?.[1]) return ucMatch[1];

  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileMatch?.[1]) return fileMatch[1];

  const openMatch = trimmed.match(/drive\.google\.com\/open\?.*id=([a-zA-Z0-9_-]+)/i);
  if (openMatch?.[1]) return openMatch[1];

  // If already a clean Google Drive alphanumeric ID (28-45 chars, no slashes/periods)
  if (/^[a-zA-Z0-9_-]{28,45}$/.test(trimmed) && !trimmed.includes(".")) {
    return trimmed;
  }

  return null;
}

/**
 * Builds an ordered list of high-speed direct CDN endpoints and fallbacks for a given Drive asset.
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
    // 1. Direct Google UserContent CDN (fastest edge delivery, HTTP/2 & HTTP/3)
    candidates.push(`https://lh3.googleusercontent.com/d/${extractedId}`);
    
    // 2. High-speed backend disk/RAM cached proxy (immediate 0ms response when cached)
    candidates.push(`${proxyBase}/media/drive-image/${extractedId}`);

    // 3. Google High-Res Thumbnail
    candidates.push(`https://drive.google.com/thumbnail?id=${extractedId}&sz=w1200`);
    candidates.push(`https://drive.google.com/thumbnail?id=${extractedId}&sz=w800`);

    // 4. Alternative Google UserContent CDN
    candidates.push(`https://lh3.googleusercontent.com/u/0/d/${extractedId}`);
    // 5. Google Drive Export View
    candidates.push(`https://drive.google.com/uc?export=view&id=${extractedId}`);
  }

  // 6. Original provided src (if not already in candidates)
  if (src && !candidates.includes(src)) {
    candidates.push(src);
  }

  // 7. Custom fallback URLs provided by consumer
  for (const url of fallbackUrls) {
    if (url && !candidates.includes(url)) {
      candidates.push(url);
    }
  }

  return candidates;
}

interface DriveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  driveId?: string;
  fallbackUrls?: string[];
  showZoomBadge?: boolean;
  onOpenZoom?: () => void;
  wrapperClassName?: string;
  autoAspect?: boolean;
  priority?: boolean;
}

export function DriveImage({
  src,
  alt,
  className,
  wrapperClassName,
  driveId,
  fallbackUrls = [],
  showZoomBadge = false,
  autoAspect = false,
  priority = false,
  onOpenZoom,
  style,
  ...props
}: DriveImageProps) {
  const candidateUrls = buildDriveCandidateUrls(src, driveId, fallbackUrls);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSrc = candidateUrls[currentIndex] || src || "";

  // Check if image is already warm in browser/session cache
  const isPrecached = Boolean(currentSrc && loadedUrlsCache.has(currentSrc));
  const [loaded, setLoaded] = useState(isPrecached);
  const [hasError, setHasError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state on target image source change
  useEffect(() => {
    setCurrentIndex(0);
    setAspectRatio(null);
    const firstSrc = candidateUrls[0] || src || "";
    if (firstSrc && loadedUrlsCache.has(firstSrc)) {
      setLoaded(true);
      setHasError(false);
    } else if (!src && !driveId && candidateUrls.length === 0) {
      setLoaded(true);
      setHasError(true);
    } else {
      setLoaded(false);
      setHasError(false);
    }
  }, [src, driveId, candidateUrls.length]);

  const advanceToNextCandidate = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCurrentIndex((prev) => {
      if (prev < candidateUrls.length - 1) {
        return prev + 1;
      }
      setHasError(true);
      setLoaded(true);
      return prev;
    });
  }, [candidateUrls.length]);

  // Network hang safeguard: if an image source stalls for >2.5 seconds, advance to next candidate
  useEffect(() => {
    if (loaded || hasError || candidateUrls.length === 0) return;

    timeoutRef.current = setTimeout(() => {
      if (!loaded && !hasError) {
        advanceToNextCandidate();
      }
    }, 1500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [currentIndex, loaded, hasError, candidateUrls.length, advanceToNextCandidate]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const target = e.currentTarget;
    if (target && target.naturalWidth && target.naturalHeight) {
      setAspectRatio(target.naturalWidth / target.naturalHeight);
    }
    if (currentSrc) {
      loadedUrlsCache.add(currentSrc);
      if (src) loadedUrlsCache.add(src);
    }
    setLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    advanceToNextCandidate();
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(0);
    setLoaded(false);
    setHasError(false);
  };

  const wrapperStyle = autoAspect && aspectRatio
    ? { ...style, aspectRatio: `${aspectRatio}` }
    : style;

  return (
    <div
      className={cn("relative select-none overflow-hidden", wrapperClassName)}
      style={wrapperStyle}
      onClick={onOpenZoom}
    >
      {/* Sleek Skeleton Loading State */}
      {!loaded && !hasError && (
        <div className="absolute inset-0 z-0 bg-secondary/40 flex items-center justify-center animate-pulse">
          <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
            <ImageIcon className="size-6 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-70">
              Loading Sanctuary…
            </span>
          </div>
        </div>
      )}

      {/* Fallback View if all candidate endpoints fail */}
      {hasError ? (
        <div className="flex h-full min-h-[220px] w-full flex-col items-center justify-center bg-card/60 border border-border/50 p-6 text-center">
          <ImageIcon className="size-7 text-muted-foreground/60 mb-2.5" />
          <p className="text-xs font-medium text-foreground">Spatial Visual Detail</p>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-[240px]">
            High-resolution architectural view.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 rounded border border-border bg-card px-3 py-1.5 text-[11px] text-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="size-3" />
              <span>Reload Image</span>
            </button>
          </div>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt || "Architectural Interior"}
          referrerPolicy="no-referrer"
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300 ease-out",
            loaded ? "opacity-100" : "opacity-0",
            className,
          )}
          {...props}
        />
      )}

      {/* Optional Zoom Trigger Overlay */}
      {showZoomBadge && onOpenZoom && loaded && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenZoom();
          }}
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded bg-black/75 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white shadow-md transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer"
          title="Open Photo in Fullscreen Lightbox"
        >
          <Maximize2 className="size-3" />
          <span>Expand View</span>
        </button>
      )}
    </div>
  );
}

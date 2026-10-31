import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Maximize2, Image as ImageIcon, RefreshCw } from "lucide-react";
import {
  extractGoogleDriveId,
  buildDriveCandidateUrls,
  verifiedUrlsCache,
  failedUrlsCache,
  fileIdEndpointCache,
  preloadAndVerifyImage,
  calculateRetryDelay,
} from "@/lib/drive-image-loader";

// Re-export core loader functions for backward compatibility with existing imports
export { extractGoogleDriveId, buildDriveCandidateUrls };

/**
 * Preloads an image into the browser's cache and verifies usability.
 */
export function preloadImage(src: string): Promise<void> {
  return preloadAndVerifyImage(src)
    .then(() => {})
    .catch(() => {});
}

export interface DriveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  driveId?: string;
  fallbackUrls?: string[];
  showZoomBadge?: boolean;
  onOpenZoom?: () => void;
  wrapperClassName?: string;
  autoAspect?: boolean;
  priority?: boolean;
  maxRetries?: number;
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
  maxRetries = 2,
  onOpenZoom,
  style,
  ...props
}: DriveImageProps) {
  const candidateUrls = useMemo(
    () => buildDriveCandidateUrls(src, driveId, fallbackUrls),
    [src, driveId, fallbackUrls],
  );

  const extractedId = useMemo(
    () => extractGoogleDriveId(driveId) || extractGoogleDriveId(src),
    [driveId, src],
  );

  const firstCandidate = candidateUrls[0] || src || "";

  // Check if image is already verified and warm in memory/session cache
  const isPrecached = useMemo(() => {
    if (firstCandidate && verifiedUrlsCache.has(firstCandidate)) return true;
    if (extractedId) {
      const knownEndpoint = fileIdEndpointCache.get(extractedId);
      if (knownEndpoint && verifiedUrlsCache.has(knownEndpoint)) return true;
    }
    return false;
  }, [firstCandidate, extractedId]);

  const isKnownFailed = useMemo(
    () => Boolean(extractedId && failedUrlsCache.has(extractedId)),
    [extractedId],
  );

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    isPrecached ? "loaded" : isKnownFailed ? "error" : "loading",
  );
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state whenever image source changes
  useEffect(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    setCandidateIndex(0);
    setAttemptCount(0);
    setAspectRatio(null);

    const first = candidateUrls[0] || src || "";
    const warm =
      (first && verifiedUrlsCache.has(first)) ||
      (extractedId &&
        fileIdEndpointCache.has(extractedId) &&
        verifiedUrlsCache.has(fileIdEndpointCache.get(extractedId)!));
    const failed = Boolean(extractedId && failedUrlsCache.has(extractedId));

    if (warm) {
      setStatus("loaded");
    } else if (failed || (!src && !driveId && candidateUrls.length === 0)) {
      setStatus("error");
    } else {
      setStatus("loading");
    }
  }, [src, driveId, candidateUrls, extractedId]);

  // Clean up any pending retry timers on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, []);

  const currentCandidate = candidateUrls[candidateIndex] || src || "";

  // Compute active image URL with retry query if retrying same endpoint
  const activeSrc = useMemo(() => {
    if (!currentCandidate) return "";
    if (attemptCount > 0) {
      const separator = currentCandidate.includes("?") ? "&" : "?";
      return `${currentCandidate}${separator}_r=${attemptCount}`;
    }
    return currentCandidate;
  }, [currentCandidate, attemptCount]);

  const handleError = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    // Attempt 1 or 2: Retry the current candidate endpoint with exponential backoff & jitter
    if (attemptCount < maxRetries) {
      const nextAttempt = attemptCount + 1;
      const delay = calculateRetryDelay(nextAttempt);
      retryTimerRef.current = setTimeout(() => {
        setAttemptCount(nextAttempt);
      }, delay);
      return;
    }

    // Step 2: Retries on current candidate exhausted -> advance to next candidate endpoint
    if (candidateIndex < candidateUrls.length - 1) {
      setCandidateIndex((prev) => prev + 1);
      setAttemptCount(0);
      return;
    }

    // Step 3: All candidates and retries exhausted -> mark as failed
    if (extractedId) {
      failedUrlsCache.add(extractedId);
    }
    setStatus("error");
  }, [attemptCount, candidateIndex, candidateUrls.length, extractedId, maxRetries]);

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      const img = e.currentTarget;
      // Usability verification: reject 0x0 or corrupted 1x1 responses
      if (!img || img.naturalWidth <= 1 || img.naturalHeight <= 1) {
        handleError();
        return;
      }

      // Add to global verified caches for instant 0ms retrieval
      if (currentCandidate) {
        verifiedUrlsCache.add(currentCandidate);
        if (src) verifiedUrlsCache.add(src);
      }
      if (extractedId && currentCandidate) {
        fileIdEndpointCache.set(extractedId, currentCandidate);
      }

      if (img.naturalWidth && img.naturalHeight) {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      }

      setStatus("loaded");
    },
    [currentCandidate, src, extractedId, handleError],
  );

  // Generous 12-second safeguard for dead/zombie connections (avoids early aborts)
  useEffect(() => {
    if (status !== "loading" || !activeSrc) return;

    const hangTimer = setTimeout(() => {
      if (status === "loading") {
        handleError();
      }
    }, 12000);

    return () => clearTimeout(hangTimer);
  }, [status, activeSrc, handleError]);

  const handleManualRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (extractedId) {
      failedUrlsCache.delete(extractedId);
    }
    setCandidateIndex(0);
    setAttemptCount(0);
    setStatus("loading");
  };

  const wrapperStyle =
    autoAspect && aspectRatio ? { ...style, aspectRatio: `${aspectRatio}` } : style;

  return (
    <div
      className={cn("relative overflow-hidden", wrapperClassName)}
      style={wrapperStyle}
      onClick={onOpenZoom}
    >
      {/* Sleek Skeleton Loading State */}
      {status === "loading" && (
        <div className="absolute inset-0 z-0 bg-secondary/40 flex items-center justify-center animate-pulse">
          <div className="flex flex-col items-center gap-2 text-foreground/60">
            <ImageIcon className="size-6 animate-pulse" />
            <span className="text-xs font-mono tracking-[0.08em] uppercase font-medium">
              Loading Sanctuary…
            </span>
          </div>
        </div>
      )}

      {/* Fallback View if all candidate endpoints fail */}
      {status === "error" ? (
        <div className="flex h-full min-h-[220px] w-full flex-col items-center justify-center bg-card/60 border border-border/50 p-6 text-center">
          <ImageIcon className="size-7 text-foreground/60 mb-2.5" />
          <p className="text-sm font-semibold text-foreground">Spatial Visual Detail</p>
          <p className="text-xs sm:text-sm text-foreground/80 mt-1 max-w-[240px] leading-relaxed">
            High-resolution architectural view.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleManualRetry}
              className="inline-flex items-center gap-1.5 rounded border border-border bg-card px-3.5 py-2 text-xs sm:text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="size-3.5" />
              <span>Reload Image</span>
            </button>
          </div>
        </div>
      ) : (
        <img
          src={activeSrc}
          alt={alt || "Architectural Interior"}
          referrerPolicy="no-referrer"
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300 ease-out",
            status === "loaded" ? "opacity-100" : "opacity-0",
            className,
          )}
          {...props}
        />
      )}

      {/* Optional Zoom Trigger Overlay */}
      {showZoomBadge && onOpenZoom && status === "loaded" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenZoom();
          }}
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded bg-black/85 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer"
          title="Open Photo in Fullscreen Lightbox"
        >
          <Maximize2 className="size-3.5" />
          <span>Expand View</span>
        </button>
      )}
    </div>
  );
}

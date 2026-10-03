import { useEffect, useRef, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  FolderOpen,
  Maximize2,
  ZoomIn,
  ZoomOut,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { GoogleDrivePhoto } from "@/lib/google-drive-photos";
import { DriveImage } from "./DriveImage";
import { cn } from "@/lib/utils";

interface PhotoLightboxModalProps {
  photo: GoogleDrivePhoto | null;
  photosList?: GoogleDrivePhoto[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto?: (photo: GoogleDrivePhoto) => void;
}

export function PhotoLightboxModal({
  photo,
  photosList = [],
  isOpen,
  onClose,
  onSelectPhoto,
}: PhotoLightboxModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Reset zoom on photo change
  useEffect(() => {
    setIsZoomed(false);
  }, [photo?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !photo) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && photosList.length > 0) {
        const idx = photosList.findIndex((p) => p.id === photo.id);
        if (idx > 0) {
          onSelectPhoto?.(photosList[idx - 1]!);
        } else if (idx === 0) {
          onSelectPhoto?.(photosList[photosList.length - 1]!);
        }
      }
      if (e.key === "ArrowRight" && photosList.length > 0) {
        const idx = photosList.findIndex((p) => p.id === photo.id);
        if (idx < photosList.length - 1 && idx !== -1) {
          onSelectPhoto?.(photosList[idx + 1]!);
        } else if (idx === photosList.length - 1) {
          onSelectPhoto?.(photosList[0]!);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, photo, photosList, onClose, onSelectPhoto]);

  if (!isOpen || !photo) return null;

  const currentIndex = photosList.findIndex((p) => p.id === photo.id);
  const total = photosList.length;

  const handlePrev = () => {
    if (total <= 1) return;
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : total - 1;
    onSelectPhoto?.(photosList[prevIdx]!);
  };

  const handleNext = () => {
    if (total <= 1) return;
    const nextIdx = currentIndex < total - 1 ? currentIndex + 1 : 0;
    onSelectPhoto?.(photosList[nextIdx]!);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-3 sm:p-6 transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="rounded bg-white/10 px-3 py-1 text-xs font-mono tracking-wider">
            {currentIndex >= 0 ? `${currentIndex + 1} / ${total}` : `PHOTO #${photo.index}`}
          </span>
          <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-white/70">
            {photo.category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close photo preview"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-lg bg-card/95 border border-border shadow-2xl flex flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left / Center Image Stage */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative flex-1 bg-black/95 flex items-center justify-center min-h-[350px] lg:min-h-[550px] overflow-hidden select-none p-4"
        >
          <div className={cn("transition-transform duration-300 flex items-center justify-center w-full h-full", isZoomed ? "scale-150 cursor-grab" : "scale-100")}>
            <DriveImage
              src={photo.url}
              driveId={photo.id}
              fallbackUrls={[photo.thumbnailUrl, photo.driveViewUrl]}
              alt={photo.title}
              className="max-h-[75vh] max-w-full object-contain rounded-md shadow-2xl"
              wrapperClassName="flex items-center justify-center w-full h-full"
            />
          </div>

          {/* Zoom Toggle Button */}
          <button
            type="button"
            onClick={() => setIsZoomed((z) => !z)}
            className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            aria-label={isZoomed ? "Zoom out photo" : "Zoom in photo"}
          >
            {isZoomed ? <ZoomOut className="size-3.5" /> : <ZoomIn className="size-3.5" />}
            <span>{isZoomed ? "Zoom Out" : "Zoom In"}</span>
          </button>

          {/* Navigation Arrows if in playlist */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex size-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="size-6" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex size-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
                aria-label="Next Photo"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}
        </div>

        {/* Right Info Sidebar */}
        <div className="w-full lg:w-84 border-t lg:border-t-0 lg:border-l border-border p-5 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[350px] lg:max-h-[85vh] bg-card">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent font-semibold">
                <Sparkles className="size-3" />
                <span>{photo.category}</span>
              </div>
              <h3 className="mt-1 font-display text-lg sm:text-xl font-light text-foreground leading-snug">
                {photo.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-3 text-accent" />
                <span>{photo.projectTitle} · {photo.location}</span>
              </p>
            </div>

            <div className="rounded border border-border/60 bg-muted/30 p-3">
              <p className="text-xs leading-relaxed text-muted-foreground font-light">
                {photo.caption}
              </p>
            </div>

            <div className="space-y-2 text-[11px] text-muted-foreground font-mono">
              <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                <span>Typology:</span>
                <span className="text-foreground">{photo.category}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                <span>Project Code:</span>
                <span className="text-foreground">{photo.projectCode}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                <span>Location:</span>
                <span className="text-foreground">{photo.location}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {photo.tags
                .filter((t) => !t.toLowerCase().includes("drive"))
                .map((t) => (
                  <span
                    key={t}
                    className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium"
                  >
                    #{t}
                  </span>
                ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-4 mt-4">
            <a
              href="/contact#consultation"
              className="w-full inline-flex items-center justify-center gap-2 rounded bg-foreground px-4 py-2.5 text-xs text-background uppercase tracking-widest font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Sparkles className="size-3.5" />
              <span>Enquire About This Space</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pause,
  Play,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceItem } from "@/lib/public.functions";
import { DriveImage } from "./DriveImage";
import { PhotoLightboxModal } from "./PhotoLightboxModal";
import type { GoogleDrivePhoto } from "@/lib/google-drive-photos";

const SLIDE_DURATION_MS = 4500; // 4.5 seconds per photo

// Curated default multi-perspective photos for each discipline fallback
const DISCIPLINE_FALLBACK_IMAGES: Record<string, string[]> = {
  "01": [
    "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
    "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
    "https://lh3.googleusercontent.com/d/1lR9CjqpuCkuV2ietp3LOplngUozxQl_R",
    "https://lh3.googleusercontent.com/d/1YhMC1rcK8CG5IIoGohUveL6D4UZzh17f",
  ],
  "02": [
    "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
    "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
    "https://lh3.googleusercontent.com/d/1VXY00jcsOzQyxcdQq9g0Uubc7DwmmaPN",
    "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
  ],
  "03": [
    "https://lh3.googleusercontent.com/d/1UNtmTkQxW0vxEKvv7_POkseU7576wxPR",
    "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
    "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
    "https://lh3.googleusercontent.com/d/1YhMC1rcK8CG5IIoGohUveL6D4UZzh17f",
  ],
};

const DEFAULT_GLOBAL_IMAGES = [
  "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
  "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
  "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
  "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
];

function getServicePhotos(service?: ServiceItem, index = 0): string[] {
  if (!service) return DEFAULT_GLOBAL_IMAGES;

  const list: string[] = [];
  if (Array.isArray(service.images) && service.images.length > 0) {
    list.push(...service.images.filter(Boolean));
  } else if (service.image) {
    list.push(service.image);
  }

  // If fewer than 2 images, supplement from curated discipline fallbacks
  const numKey = service.number || `0${index + 1}`;
  const fallbacks = DISCIPLINE_FALLBACK_IMAGES[numKey] || DEFAULT_GLOBAL_IMAGES;
  for (const img of fallbacks) {
    if (!list.includes(img)) {
      list.push(img);
    }
  }

  return list.length > 0 ? list : DEFAULT_GLOBAL_IMAGES;
}

export function EditorialServicesSection({
  services,
}: {
  services?: ServiceItem[];
}) {
  const [activeHoverIdx, setActiveHoverIdx] = useState<number>(0);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [openAccordionIdx, setOpenAccordionIdx] = useState<number | null>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<GoogleDrivePhoto | null>(null);

  const safeServices = useMemo(() => {
    if (!services || services.length === 0) return [];
    return services;
  }, [services]);

  const currentService = safeServices[activeHoverIdx] || safeServices[0];
  const currentPhotos = useMemo(() => {
    return getServicePhotos(currentService, activeHoverIdx);
  }, [currentService, activeHoverIdx]);

  // When active service changes, reset photo index to 0
  useEffect(() => {
    setActivePhotoIdx(0);
  }, [activeHoverIdx]);

  // Auto-rotation timer: cycles photos every SLIDE_DURATION_MS
  useEffect(() => {
    if (isPaused || currentPhotos.length <= 1) return;

    const timer = setInterval(() => {
      setActivePhotoIdx((prev) => (prev + 1) % currentPhotos.length);
    }, SLIDE_DURATION_MS);

    return () => clearInterval(timer);
  }, [isPaused, currentPhotos.length, activeHoverIdx]);

  const handlePrevPhoto = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActivePhotoIdx((prev) => (prev === 0 ? currentPhotos.length - 1 : prev - 1));
    },
    [currentPhotos.length],
  );

  const handleNextPhoto = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActivePhotoIdx((prev) => (prev + 1) % currentPhotos.length);
    },
    [currentPhotos.length],
  );

  const toggleAccordion = (idx: number) => {
    setOpenAccordionIdx((prev) => (prev === idx ? null : idx));
  };

  if (!safeServices || safeServices.length === 0) {
    return null;
  }

  const currentPhotoUrl = currentPhotos[activePhotoIdx] || currentPhotos[0] || "";

  return (
    <div>
      {/* DESKTOP VIEW: Clean Editorial Rows with Interactive Auto-Rotating Frame */}
      <div className="hidden md:block">
        <div className="grid grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Numbered Editorial Service Rows */}
          <div className="col-span-7 divide-y divide-border">
            {safeServices.map((service, idx) => {
              const isActive = activeHoverIdx === idx;
              const sNum = service.number || `0${idx + 1}`;
              const sTitle = service.title;
              const sDesc = service.shortDesc || service.short_description || service.fullDesc || service.description;

              return (
                <div
                  key={service._id || service.number || idx}
                  onMouseEnter={() => setActiveHoverIdx(idx)}
                  onClick={() => setActiveHoverIdx(idx)}
                  className={cn(
                    "group relative py-8 px-4 transition-all duration-300 cursor-pointer rounded-sm",
                    isActive
                      ? "bg-card/40 pl-6 border-l-2 border-accent"
                      : "hover:bg-card/20 hover:pl-6 border-l-2 border-transparent",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-6">
                    <div className="flex items-baseline gap-6">
                      <span
                        className={cn(
                          "font-mono text-xs tracking-widest transition-colors",
                          isActive ? "text-accent font-semibold" : "text-muted-foreground",
                        )}
                      >
                        {sNum}
                      </span>
                      <h3
                        className={cn(
                          "font-display text-2xl lg:text-3xl font-light transition-colors",
                          isActive ? "text-foreground" : "text-foreground/80 group-hover:text-accent",
                        )}
                      >
                        {sTitle}
                      </h3>
                    </div>

                    <Link
                      to={service.link || "/services"}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "shrink-0 transition-all duration-300",
                        isActive
                          ? "text-accent translate-x-1"
                          : "text-muted-foreground group-hover:text-accent group-hover:translate-x-1",
                      )}
                    >
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>

                  {sDesc && (
                    <p className="mt-3 pl-12 text-sm leading-relaxed text-muted-foreground font-light max-w-xl">
                      {sDesc}
                    </p>
                  )}

                  {/* Active Service Deliverables Pill Strip */}
                  {isActive && service.deliverables && service.deliverables.length > 0 && (
                    <div className="mt-4 pl-12 flex flex-wrap gap-2 animate-in fade-in duration-300">
                      {service.deliverables.slice(0, 3).map((del, dIdx) => (
                        <span
                          key={dIdx}
                          className="inline-flex items-center gap-1.5 rounded-full bg-background/80 border border-border/80 px-2.5 py-0.5 text-[11px] text-muted-foreground font-light"
                        >
                          <span className="size-1 rounded-full bg-accent" />
                          <span>{del}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Interactive Sticky Frame with Auto-Changing Photos */}
          <div className="col-span-5 sticky top-28">
            <div
              className="group relative aspect-[4/5] w-full overflow-hidden bg-stone border border-border/80 rounded-md shadow-xl transition-all duration-500 hover:shadow-2xl hover:border-accent/50"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Animated Progress Bar along Top Border */}
              <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-black/40 overflow-hidden">
                <div
                  key={`${activeHoverIdx}-${activePhotoIdx}-${isPaused}`}
                  className={cn(
                    "h-full bg-accent origin-left",
                    !isPaused && "transition-all ease-linear",
                  )}
                  style={{
                    animationDuration: `${SLIDE_DURATION_MS}ms`,
                    animationTimingFunction: "linear",
                    animationFillMode: "forwards",
                    animationPlayState: isPaused ? "paused" : "running",
                    animationName: !isPaused ? "progress-fill" : "none",
                  }}
                />
              </div>

              {/* Photos Render with Smooth Cross-fade Layers */}
              <div className="relative size-full overflow-hidden">
                {currentPhotos.map((url, pIdx) => {
                  const isVisible = pIdx === activePhotoIdx;
                  return (
                    <div
                      key={`${url}-${pIdx}`}
                      className={cn(
                        "absolute inset-0 size-full transition-all duration-700 ease-in-out",
                        isVisible
                          ? "opacity-100 scale-100 z-10 pointer-events-auto"
                          : "opacity-0 scale-105 z-0 pointer-events-none",
                      )}
                    >
                      <DriveImage
                        src={url}
                        alt={`${currentService?.title || "Architecture"} - Perspective ${pIdx + 1}`}
                        className="size-full object-cover"
                        wrapperClassName="size-full"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Ambient Cinematic Gradient Overlays */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-ink/40 via-transparent to-transparent pointer-events-none" />

              {/* Top Controls Overlay: Discipline Tag */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
                <div className="inline-flex items-center gap-2 rounded bg-ink/75 backdrop-blur-md px-2.5 py-1 text-[10px] uppercase tracking-widest text-ink-foreground font-mono border border-ink-foreground/15">
                  <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                  <span>
                    Discipline {currentService?.number || `0${activeHoverIdx + 1}`}
                  </span>
                </div>
              </div>

              {/* Prev / Next Chevrons on Hover */}
              {currentPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-ink/70 backdrop-blur-md text-ink-foreground/90 hover:bg-accent hover:text-accent-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer shadow-md"
                    title="Previous Photo"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-ink/70 backdrop-blur-md text-ink-foreground/90 hover:bg-accent hover:text-accent-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer shadow-md"
                    title="Next Photo"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </>
              )}

              {/* Bottom Editorial Caption & Perspective Navigation */}
              <div className="absolute bottom-5 left-5 right-5 z-20 text-ink-foreground pointer-events-auto">
                <div className="mb-1.5">
                  <span className="text-[10px] uppercase tracking-[0.24em] text-accent font-mono font-semibold">
                    {currentService?.number || `0${activeHoverIdx + 1}`} · Perspective {activePhotoIdx + 1} of {currentPhotos.length}
                  </span>
                </div>

                <p className="font-display text-2xl text-ink-foreground font-light leading-tight">
                  {currentService?.title}
                </p>

                {currentService?.shortDesc && (
                  <p className="text-xs text-ink-foreground/85 font-light mt-1 line-clamp-2 leading-relaxed">
                    {currentService.shortDesc}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW: Clean Accordion Rows with Slideshow */}
      <div className="block md:hidden divide-y divide-border">
        {safeServices.map((service, idx) => {
          const isOpen = openAccordionIdx === idx;
          const sNum = service.number || `0${idx + 1}`;
          const sTitle = service.title;
          const sDesc = service.fullDesc || service.description || service.shortDesc || service.short_description;
          const photos = getServicePhotos(service, idx);

          return (
            <div key={service._id || service.number || idx} className="py-5">
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="flex w-full items-center justify-between text-left gap-4 select-none"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-accent font-semibold">{sNum}</span>
                  <span className="font-display text-lg font-light text-foreground">
                    {sTitle}
                  </span>
                </div>
                <div className="p-1 text-muted-foreground">
                  {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="mt-4 pt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {sDesc && (
                    <p className="text-xs leading-relaxed text-muted-foreground font-light">
                      {sDesc}
                    </p>
                  )}

                  {/* Mobile Slideshow Photo Frame */}
                  <MobileServiceSlideshow
                    photos={photos}
                    title={sTitle}
                    onOpenZoom={(photoUrl, pIdx) => {
                      setLightboxPhoto({
                        id: `mobile-service-${idx}-${pIdx}`,
                        index: pIdx,
                        fileName: `${sTitle}-${pIdx + 1}.jpg`,
                        title: sTitle,
                        caption: sDesc || sTitle,
                        category: "Studio Practice",
                        projectId: "services",
                        projectTitle: sTitle,
                        projectCode: "RADS",
                        location: "Mumbai",
                        url: photoUrl,
                        thumbnailUrl: photoUrl,
                        driveViewUrl: photoUrl,
                        tags: ["Service", sTitle],
                      });
                    }}
                  />

                  {service.deliverables && service.deliverables.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] uppercase tracking-wider text-foreground font-semibold mb-2">
                        Deliverables:
                      </p>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {service.deliverables.map((item, dIdx) => (
                          <li key={dIdx} className="flex items-center gap-2">
                            <span className="size-1 rounded-full bg-accent shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2">
                    <Link
                      to={service.link || "/services"}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-accent font-medium"
                    >
                      Explore Service Details <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal for Fullscreen Photo View */}
      <PhotoLightboxModal
        photo={lightboxPhoto}
        photosList={[]}
        isOpen={!!lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
        onSelectPhoto={(photo) => setLightboxPhoto(photo)}
      />
    </div>
  );
}

/**
 * Mobile-specific auto-rotating photo preview component
 */
function MobileServiceSlideshow({
  photos,
  title,
  onOpenZoom,
}: {
  photos: string[];
  title: string;
  onOpenZoom?: (url: string, index: number) => void;
}) {
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setPhotoIdx((prev) => (prev + 1) % photos.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [photos.length]);

  const currentUrl = photos[photoIdx] || photos[0] || "";

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden bg-stone rounded border border-border/80 shadow-sm"
      onClick={() => onOpenZoom?.(currentUrl, photoIdx)}
    >
      <div className="relative size-full">
        {photos.map((url, idx) => (
          <div
            key={url}
            className={cn(
              "absolute inset-0 size-full transition-opacity duration-500",
              idx === photoIdx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none",
            )}
          >
            <DriveImage
              src={url}
              alt={`${title} - View ${idx + 1}`}
              className="size-full object-cover"
              wrapperClassName="size-full"
            />
          </div>
        ))}
      </div>

      {/* Overlay controls */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink/75 via-transparent to-transparent pointer-events-none" />

      {photos.length > 1 && (
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1">
          {photos.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPhotoIdx(idx);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === photoIdx ? "w-4 bg-accent" : "w-1.5 bg-ink-foreground/50",
              )}
            />
          ))}
        </div>
      )}

      <span className="absolute bottom-3 left-3 z-20 text-[10px] font-mono uppercase tracking-wider text-ink-foreground/80">
        Perspective {photoIdx + 1} / {photos.length}
      </span>
    </div>
  );
}

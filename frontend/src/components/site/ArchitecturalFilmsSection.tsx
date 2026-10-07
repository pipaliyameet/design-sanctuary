import { useState, useRef, useEffect } from "react";
import { Film, ExternalLink, Sparkles } from "lucide-react";
import {
  ARCHITECTURAL_FILMS,
  GOOGLE_DRIVE_VIDEOS_FOLDER_URL,
  type DriveVideo,
} from "@/lib/google-drive-videos";
import { cn } from "@/lib/utils";

export function ArchitecturalFilmsSection() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [hasStreamError, setHasStreamError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentFilm: DriveVideo = ARCHITECTURAL_FILMS[currentVideoIndex] || ARCHITECTURAL_FILMS[0]!;

  // Autoplay immediately on mount and on slide change - permanently muted
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.currentTime = 0;
    
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }, [currentVideoIndex, currentFilm.streamUrl]);

  // Seamlessly cycle to next walkthrough reel when current ends
  const handleVideoEnded = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % ARCHITECTURAL_FILMS.length);
  };

  return (
    <section className="border-t border-border bg-background text-foreground py-16 sm:py-24 relative overflow-hidden">
      <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent font-mono font-medium">
              <Film className="size-3.5 text-accent" />
              <span>LIVE SITE DISPATCH</span>
            </div>
            <h2 className="mt-2 text-3xl sm:text-5xl font-display font-light text-foreground tracking-tight">
              Spatial Walkthrough & Motion Study
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md font-light leading-relaxed">
              Continuous live documentation of crafted spaces. Filmed in natural vertical orientation to showcase vertical volume, double-height joinery, and material flow.
            </p>
            <a
              href={GOOGLE_DRIVE_VIDEOS_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-xs uppercase tracking-[0.16em] text-foreground font-medium hover:border-accent hover:text-accent transition-all"
            >
              <span>Drive Video Vault</span>
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        {/* Vertical Rectangle Video Showcase Layout - Responsive Tablet Side-by-Side */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-14 items-center">
          {/* Left: Vertical Rectangular Cinema Frame (5 Cols on Tablet & Desktop) */}
          <div className="md:col-span-5 flex justify-center md:justify-start">
            <div className="relative w-full max-w-[320px] sm:max-w-[350px] md:max-w-[340px] lg:max-w-[380px] aspect-[9/16] rounded-2xl overflow-hidden bg-stone border-2 border-border shadow-2xl ring-1 ring-black/5 group">
              {/* Autoplaying HTML5 Video Stream - Permanent Mute */}
              {!hasStreamError ? (
                <video
                  ref={videoRef}
                  key={currentFilm.streamUrl}
                  src={currentFilm.streamUrl}
                  poster={currentFilm.posterUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  onCanPlay={() => {
                    if (videoRef.current && videoRef.current.paused) {
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  onLoadedData={() => {
                    if (videoRef.current && videoRef.current.paused) {
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  onEnded={handleVideoEnded}
                  onError={() => setHasStreamError(true)}
                  className="size-full object-cover"
                />
              ) : (
                <iframe
                  key={currentFilm.driveEmbedUrl}
                  src={`${currentFilm.driveEmbedUrl}?autoplay=1&mute=1`}
                  title={currentFilm.title}
                  allow="autoplay; fullscreen; encrypted-media"
                  className="size-full border-0 object-cover"
                />
              )}

              {/* Top Video Tag */}
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-wider text-amber-300 border border-amber-400/30 font-mono">
                  <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
                  Live Walkthrough
                </span>
              </div>
            </div>
          </div>

          {/* Right: Architectural Narrative & Craft Specifications (7 Cols on Tablet & Desktop) */}
          <div className="md:col-span-7 flex flex-col space-y-6 lg:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-accent uppercase tracking-widest">
                  <Sparkles className="size-3.5" />
                  REEL {currentVideoIndex + 1} OF {ARCHITECTURAL_FILMS.length}
                </span>
                <span className="text-muted-foreground/60 text-xs">·</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                  {currentFilm.category}
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-light text-foreground leading-tight">
                {currentFilm.title}
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground font-light leading-relaxed">
                {currentFilm.description}
              </p>
            </div>

            {/* Interactive Reel Selector Chips (Tablet & Touch Friendly) */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                Select Architectural Film:
              </span>
              <div className="flex flex-wrap gap-2">
                {ARCHITECTURAL_FILMS.map((film, idx) => (
                  <button
                    key={film.id}
                    type="button"
                    onClick={() => {
                      setHasStreamError(false);
                      setCurrentVideoIndex(idx);
                    }}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded border transition-all cursor-pointer min-h-[36px] flex items-center gap-1.5 font-medium",
                      idx === currentVideoIndex
                        ? "border-accent bg-accent/15 text-foreground font-semibold shadow-xs"
                        : "border-border bg-card/50 text-muted-foreground hover:border-accent/60 hover:text-foreground",
                    )}
                  >
                    <span className="font-mono text-[10px] text-accent">0{idx + 1}</span>
                    <span className="truncate max-w-[140px] sm:max-w-[200px]">{film.title.replace("Walkthrough — ", "")}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Architectural Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-lg border border-border bg-card/40 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Location & Context</span>
                <p className="font-medium text-foreground text-xs sm:text-sm">{currentFilm.location}</p>
                <p className="text-[11px] text-muted-foreground font-light leading-snug">Daylight orientation & spatial volume alignment.</p>
              </div>
              <div className="p-3.5 rounded-lg border border-border bg-card/40 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Discipline Scope</span>
                <p className="font-medium text-foreground text-xs sm:text-sm">{currentFilm.category}</p>
                <p className="text-[11px] text-muted-foreground font-light leading-snug">Bespoke joinery, lighting & turnkey execution.</p>
              </div>
            </div>

            {/* Quick Actions & Links */}
            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href="https://www.instagram.com/right_angle_interior_design/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded border border-border bg-card/70 px-3.5 py-2 text-xs uppercase tracking-[0.14em] text-foreground font-medium hover:border-accent hover:text-accent transition-colors min-h-[38px]"
                >
                  <span>Watch on Instagram</span>
                  <ExternalLink className="size-3 text-accent" />
                </a>

                <a
                  href="https://wa.me/919537586804?text=Hello%20Right%20Angle%20Design%20Studio%2C%20I%20am%20interested%20in%20discussing%20an%20interior%20architecture%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded bg-foreground px-3.5 py-2 text-xs uppercase tracking-[0.14em] text-background font-medium hover:bg-accent hover:text-accent-foreground transition-colors min-h-[38px]"
                >
                  <span>Enquire on WhatsApp</span>
                </a>
              </div>

              <a
                href={GOOGLE_DRIVE_VIDEOS_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-[0.14em] text-accent hover:underline font-medium inline-flex items-center gap-1.5"
              >
                <span>Drive Video Vault</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

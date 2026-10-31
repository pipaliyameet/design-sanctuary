import { useState, useRef, useEffect } from "react";
import { Film, ExternalLink, Pencil } from "lucide-react";
import {
  ARCHITECTURAL_FILMS,
  GOOGLE_DRIVE_VIDEOS_FOLDER_URL,
  type DriveVideo,
} from "@/lib/google-drive-videos";
import { cn } from "@/lib/utils";

interface ArchitecturalFilmsSectionProps {
  films?: DriveVideo[];
  isEditable?: boolean;
  onEditFilm?: (film: DriveVideo, index: number) => void;
  onEditHeader?: () => void;
}

export function ArchitecturalFilmsSection({
  films: propFilms,
  isEditable = false,
  onEditFilm,
  onEditHeader,
}: ArchitecturalFilmsSectionProps = {}) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [hasStreamError, setHasStreamError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const displayFilms = propFilms && propFilms.length > 0 ? propFilms : ARCHITECTURAL_FILMS;
  const currentFilm: DriveVideo = displayFilms[currentVideoIndex] || displayFilms[0] || ARCHITECTURAL_FILMS[0]!;

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

  // Seamlessly loop the walkthrough reel when it ends
  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <section className="border-t border-border bg-background text-foreground pt-10 sm:pt-14 pb-8 sm:pb-10 relative overflow-hidden">
      <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-5 border-b border-border">
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
              className="inline-flex items-center gap-2 rounded border border-border bg-card/60 px-4 py-2 text-xs uppercase tracking-[0.16em] text-foreground font-medium hover:border-accent hover:text-accent transition-all"
            >
              <span>Drive Video Vault</span>
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        {/* Vertical Rectangle Video Showcase Layout - Responsive Tablet Side-by-Side */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-10 items-start">
          {/* Left: Vertical Rectangular Cinema Frame (5 Cols on Tablet & Desktop) */}
          <div className="md:col-span-5 flex justify-center md:justify-start">
            <div className="relative w-full max-w-[270px] sm:max-w-[290px] md:max-w-[300px] lg:max-w-[320px] aspect-[9/16] rounded-xl overflow-hidden bg-stone border-2 border-border shadow-xl ring-1 ring-black/5 group">
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
                <span className="inline-flex items-center gap-1.5 rounded bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] uppercase tracking-wider text-amber-300 border border-amber-400/30 font-mono">
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  Live Walkthrough
                </span>
              </div>
            </div>
          </div>

          {/* Right: Architectural Narrative & Craft Specifications (7 Cols on Tablet & Desktop) */}
          <div className="md:col-span-7 flex flex-col space-y-4 lg:space-y-5">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-accent uppercase tracking-widest">
                    ARCHITECTURAL MOTION STUDY
                  </span>
                  <span className="text-muted-foreground/60 text-xs">·</span>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                    {currentFilm.category}
                  </span>
                </div>

                {isEditable && onEditFilm && (
                  <button
                    type="button"
                    onClick={() => onEditFilm(currentFilm, currentVideoIndex)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-accent/40 bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all cursor-pointer font-medium"
                  >
                    <Pencil className="size-3" />
                    <span>Edit Reel</span>
                  </button>
                )}
              </div>

              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-light text-foreground leading-tight">
                {currentFilm.title}
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground font-light leading-relaxed">
                {currentFilm.description}
              </p>
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

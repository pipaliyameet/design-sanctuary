import { useState, useRef, useEffect } from "react";
import { Film, ExternalLink, Pencil } from "lucide-react";
import {
  ARCHITECTURAL_FILMS,
  GOOGLE_DRIVE_VIDEOS_FOLDER_URL,
  resolveVideoStreamUrl,
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

  // Studio owner requested single reel showcase (reels 02 and 03 removed from display)
  const displayFilms = (propFilms && propFilms.length > 0 ? propFilms : ARCHITECTURAL_FILMS).slice(0, 1);
  const currentFilm: DriveVideo = displayFilms[0] || ARCHITECTURAL_FILMS[0]!;

  const resolvedInitialUrl = resolveVideoStreamUrl(currentFilm.driveFileId, currentFilm.streamUrl);
  const [activeStreamUrl, setActiveStreamUrl] = useState<string>(resolvedInitialUrl);
  const [hasStreamError, setHasStreamError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync active stream URL whenever film or file ID changes
  useEffect(() => {
    const nextUrl = resolveVideoStreamUrl(currentFilm.driveFileId, currentFilm.streamUrl);
    setActiveStreamUrl(nextUrl);
    setHasStreamError(false);
  }, [currentFilm.streamUrl, currentFilm.driveFileId]);

  // Autoplay immediately on mount and on reel change - strictly muted and zero controls
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.controls = false;
    video.currentTime = 0;
    
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }, [activeStreamUrl]);

  // Seamlessly loop the walkthrough reel when it ends
  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  // Safe fallback if stream fails: first fallback to high-quality local MP4, then cropped clean iframe
  const handleVideoError = () => {
    if (activeStreamUrl !== "/videos/architectural-film-01.mp4") {
      setActiveStreamUrl("/videos/architectural-film-01.mp4");
      return;
    }
    setHasStreamError(true);
  };

  return (
    <section className="border-t border-border bg-background text-foreground py-8 sm:py-10 relative overflow-hidden">
      <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent font-mono font-medium">
              <Film className="size-3.5 text-accent" />
              <span>LIVE SITE DISPATCH</span>
            </div>
            <h2 className="mt-1.5 text-2xl sm:text-4xl font-display font-light text-foreground tracking-tight">
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

        {/* Vertical Rectangle Video Showcase Layout - Centered horizontally and vertically for all screens */}
        <div className="mt-6 sm:mt-8 mx-auto max-w-5xl lg:max-w-6xl w-full flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-10 xl:gap-14">
          {/* Left: Vertical Rectangular Cinema Frame (Clean cinematic loop, zero controls, default mute) */}
          <div className="w-full md:w-auto shrink-0 flex justify-center">
            <div className="relative w-full max-w-[280px] sm:w-[310px] md:w-[320px] lg:w-[350px] xl:w-[370px] aspect-[9/16] rounded-2xl overflow-hidden bg-black border-2 border-border/80 shadow-2xl ring-1 ring-black/5 select-none">
              {/* Autoplaying HTML5 Video Stream - Permanent Mute, Zero Controls Bar */}
              {!hasStreamError ? (
                <video
                  ref={videoRef}
                  key={activeStreamUrl}
                  src={activeStreamUrl}
                  poster={currentFilm.posterUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  controls={false}
                  disablePictureInPicture
                  controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
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
                  onError={handleVideoError}
                  className="size-full object-cover select-none pointer-events-none"
                />
              ) : (
                /* Cropped Google Drive Iframe Fallback: controls toolbar and top header cropped outside bounds */
                <div className="absolute inset-0 size-full overflow-hidden pointer-events-none select-none bg-black">
                  <iframe
                    key={currentFilm.driveEmbedUrl}
                    src={`${currentFilm.driveEmbedUrl}?autoplay=1&mute=1&controls=0`}
                    title={currentFilm.title}
                    allow="autoplay; fullscreen; encrypted-media"
                    tabIndex={-1}
                    className="absolute -top-[12%] -bottom-[18%] -left-[20%] -right-[20%] w-[140%] h-[130%] border-0 pointer-events-none select-none"
                  />
                </div>
              )}

              {/* Top Video Tag */}
              <div className="absolute top-4 left-4 z-20 pointer-events-none select-none">
                <span className="inline-flex items-center gap-1.5 rounded bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] uppercase tracking-wider text-amber-300 border border-amber-400/30 font-mono">
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  Live Walkthrough
                </span>
              </div>
            </div>
          </div>

          {/* Right: Architectural Narrative & Craft Specifications */}
          <div className="flex-1 min-w-0 max-w-xl lg:max-w-2xl flex flex-col justify-center space-y-4 lg:space-y-5">
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
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground font-light leading-relaxed max-w-2xl">
                {currentFilm.description}
              </p>
            </div>

            {/* Architectural Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 max-w-2xl">
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
            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 max-w-2xl">
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

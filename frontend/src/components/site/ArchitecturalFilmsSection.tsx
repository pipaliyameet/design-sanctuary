import { useState, useRef, useEffect } from "react";
import { Film, Volume2, VolumeX, ExternalLink, Sparkles, Compass, CheckCircle2 } from "lucide-react";
import {
  ARCHITECTURAL_FILMS,
  GOOGLE_DRIVE_VIDEOS_FOLDER_URL,
  type DriveVideo,
} from "@/lib/google-drive-videos";
import { cn } from "@/lib/utils";

export function ArchitecturalFilmsSection() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentFilm: DriveVideo = ARCHITECTURAL_FILMS[currentVideoIndex] || ARCHITECTURAL_FILMS[0]!;

  // Autoplay and loop management
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });
    }
  }, [currentVideoIndex, isMuted]);

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

        {/* Vertical Rectangle Video Showcase Layout */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left / Center: Vertical Rectangular Cinema Frame (5 Cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[340px] sm:max-w-[390px] aspect-[9/16] rounded-2xl overflow-hidden bg-stone border-2 border-border shadow-2xl ring-1 ring-black/5 group">
              {/* Vertical Video Element */}
              <video
                ref={videoRef}
                key={currentFilm.videoSrc}
                src={currentFilm.videoSrc}
                poster={currentFilm.posterUrl}
                autoPlay
                muted={isMuted}
                playsInline
                onEnded={handleVideoEnded}
                className="size-full object-cover transition-opacity duration-700"
              />

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Top Video Tag & Sound Toggle */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-wider text-amber-300 border border-amber-400/30 font-mono">
                  <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
                  Live Walkthrough
                </span>

                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="flex size-8 items-center justify-center rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-black transition-all cursor-pointer"
                  title={isMuted ? "Click to unmute" : "Click to mute"}
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                  {isMuted ? <VolumeX className="size-3.5 text-amber-400" /> : <Volume2 className="size-3.5 text-emerald-400" />}
                </button>
              </div>

              {/* Bottom Video Label */}
              <div className="absolute bottom-5 left-5 right-5 z-20 space-y-1 pointer-events-none text-white">
                <p className="text-[10px] uppercase tracking-widest text-amber-300 font-mono font-medium">
                  {currentFilm.location}
                </p>
                <h3 className="font-display text-lg font-light leading-snug line-clamp-2">
                  {currentFilm.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Right: Architectural Narrative & Craft Specifications (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-accent uppercase tracking-widest">
                <Sparkles className="size-3.5" />
                PROJECT REEL {currentVideoIndex + 1} OF {ARCHITECTURAL_FILMS.length}
              </span>
              <h3 className="font-display text-2xl sm:text-4xl font-light text-foreground leading-tight">
                {currentFilm.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
                {currentFilm.description}
              </p>
            </div>

            {/* Architectural Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg border border-border bg-card/40 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Location & Context</span>
                <p className="font-medium text-foreground text-sm">{currentFilm.location}</p>
                <p className="text-xs text-muted-foreground font-light">Detailed site planning aligned to solar daylight orientation.</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card/40 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Discipline Scope</span>
                <p className="font-medium text-foreground text-sm">{currentFilm.category}</p>
                <p className="text-xs text-muted-foreground font-light">Bespoke spatial joinery, lighting & white-glove turnkey execution.</p>
              </div>
            </div>

            {/* Sequence Dots & Live Status */}
            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Reels:</span>
                {ARCHITECTURAL_FILMS.map((film, idx) => (
                  <button
                    key={film.id}
                    onClick={() => setCurrentVideoIndex(idx)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-500 cursor-pointer",
                      idx === currentVideoIndex
                        ? "w-8 bg-accent"
                        : "w-2.5 bg-border hover:bg-muted-foreground"
                    )}
                    aria-label={`Switch to film ${idx + 1}`}
                  />
                ))}
              </div>

              <a
                href={GOOGLE_DRIVE_VIDEOS_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-[0.16em] text-accent hover:underline font-medium inline-flex items-center gap-1.5"
              >
                <span>View all videos in Google Drive</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

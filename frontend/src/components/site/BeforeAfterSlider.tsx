import { useState, useRef, useCallback, useEffect } from "react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { DriveImage } from "./DriveImage";

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
  className?: string;
  aspectRatio?: string;
}

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = "Before (Site Excavation / Shell)",
  afterLabel = "After (Finished Sanctuary)",
  caption,
  className,
  aspectRatio = "aspect-[16/10]",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <div className={cn("group flex flex-col space-y-3", className)}>
      <div
        ref={containerRef}
        tabIndex={0}
        role="slider"
        aria-label="Before and After transformation comparison"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={cn(
          "relative isolate w-full overflow-hidden select-none cursor-ew-resize focus:outline-none focus-visible:ring-1 focus-visible:ring-accent",
          aspectRatio,
        )}
      >
        {/* After Image (Background) */}
        <DriveImage
          src={afterUrl}
          alt={afterLabel}
          className="absolute inset-0 size-full object-cover pointer-events-none"
          wrapperClassName="absolute inset-0 size-full pointer-events-none"
        />

        {/* Before Image (Foreground with Clip) */}
        <div
          className="absolute inset-0 size-full overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <DriveImage
            src={beforeUrl}
            alt={beforeLabel}
            className="absolute inset-0 size-full object-cover filter contrast-[0.95]"
            wrapperClassName="absolute inset-0 size-full pointer-events-none"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <span className="bg-ink/80 backdrop-blur-md px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-ink-foreground">
            {beforeLabel}
          </span>
        </div>
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <span className="bg-ink/80 backdrop-blur-md px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-ink-foreground">
            {afterLabel}
          </span>
        </div>

        {/* Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 z-20 w-px bg-accent/80 transition-shadow duration-300 pointer-events-none group-hover:shadow-[0_0_12px_rgba(212,175,55,0.4)]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-ink/90 border border-accent/80 text-accent backdrop-blur-md shadow-lg transition-transform duration-200 group-hover:scale-110">
            <MoveHorizontal className="size-4" />
          </div>
        </div>
      </div>

      {caption && (
        <p className="text-xs text-muted-foreground italic tracking-wide text-center pt-1">
          {caption} · <span className="not-italic text-accent">Drag divider left or right</span>
        </p>
      )}
    </div>
  );
}

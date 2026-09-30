import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { CaseCard } from "@/lib/public.functions";
import { cn } from "@/lib/utils";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";
import { DriveImage } from "./DriveImage";

interface CaseCardItemProps {
  study: CaseCard;
  layoutVariant?: "heroic" | "tall" | "wide" | "standard" | "compact";
  className?: string;
  showSummary?: boolean;
}

export function CaseCardItem({
  study,
  layoutVariant = "standard",
  className,
  showSummary = false,
}: CaseCardItemProps) {
  const isHeroic = layoutVariant === "heroic";
  const isTall = layoutVariant === "tall";
  const isWide = layoutVariant === "wide";

  return (
    <Link
      to="/portfolio/$slug"
      params={{ slug: study.slug }}
      className={cn(
        "group block cursor-pointer select-none transition-all duration-300",
        isHeroic && "lg:col-span-12",
        isWide && "md:col-span-2 lg:col-span-7",
        isTall && "md:col-span-1 lg:col-span-5",
        className,
      )}
    >
      {/* Image container: clean, uncluttered, no dark overlay or floating buttons */}
      <div
        className={cn(
          "relative w-full overflow-hidden bg-secondary/30",
          isHeroic
            ? "aspect-[16/9] sm:aspect-[21/9]"
            : isTall
              ? "aspect-[3/4] sm:aspect-[4/5]"
              : isWide
                ? "aspect-[16/10]"
                : "aspect-[4/3] sm:aspect-[16/11]",
        )}
      >
        <DriveImage
          src={study.hero_image || GOOGLE_DRIVE_PHOTOS[0]?.url}
          alt={study.title}
          className="arch-card-img size-full object-cover"
          wrapperClassName="size-full"
        />

        {/* Minimal architectural category pill (visible naturally) */}
        <div className="absolute top-4 left-4 z-10">
          <span className="border border-ink/20 bg-background/90 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground font-medium">
            {study.space_type ?? "Residential"}
          </span>
        </div>
      </div>

      {/* Subtle thin extending line directly beneath image */}
      <div className="h-[1.5px] w-full bg-border/60 overflow-hidden">
        <div className="arch-line-extend h-full bg-accent/80" />
      </div>

      {/* Metadata text: natural, legible, subtle 3px upward lift on hover */}
      <div className="pt-4 sm:pt-5 pb-2">
        <div className="flex items-baseline justify-between gap-4">
          <div className="arch-title-lift">
            <h3 className="font-display text-xl sm:text-2xl font-light text-foreground group-hover:text-accent transition-colors">
              {study.title}
            </h3>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-opacity group-hover:text-foreground/80">
              {study.space_type} · {study.location}
              {study.year ? ` · ${study.year}` : ""}
            </p>
          </div>

          {/* Understated animated arrow that slides 6px to right */}
          <div className="arch-arrow-slide text-accent shrink-0 pt-1">
            <ArrowRight className="size-4" />
          </div>
        </div>

        {showSummary && study.summary && (
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground font-light line-clamp-2">
            {study.summary}
          </p>
        )}
      </div>
    </Link>
  );
}

export function EditorialProjectGrid({ projects }: { projects: CaseCard[] }) {
  if (!projects || projects.length === 0) return null;

  const [lead, second, third, fourth, fifth, sixth, ...remaining] = projects;

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* 1. Featured Cinematic Lead Project */}
      {lead && (
        <div>
          <CaseCardItem study={lead} layoutVariant="heroic" showSummary />
        </div>
      )}

      {/* 2. Asymmetrical Composition: Wide Cinematic (7 cols) + Vertical Detail (5 cols) */}
      {(second || third) && (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 items-start">
          {second && (
            <CaseCardItem
              study={second}
              layoutVariant="wide"
              className="lg:col-span-7"
              showSummary
            />
          )}
          {third && (
            <CaseCardItem
              study={third}
              layoutVariant="tall"
              className="lg:col-span-5 md:mt-10"
              showSummary
            />
          )}
        </div>
      )}

      {/* 3. Three-Column Balanced Rhythm */}
      {(fourth || fifth || sixth) && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {fourth && <CaseCardItem study={fourth} layoutVariant="standard" />}
          {fifth && <CaseCardItem study={fifth} layoutVariant="standard" />}
          {sixth && <CaseCardItem study={sixth} layoutVariant="standard" />}
        </div>
      )}

      {/* 4. Additional Projects in Asymmetric Pairing if available */}
      {remaining.length > 0 && (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 items-start pt-4">
          {remaining[0] && (
            <CaseCardItem study={remaining[0]} layoutVariant="tall" className="lg:col-span-5" />
          )}
          {remaining[1] && (
            <CaseCardItem
              study={remaining[1]}
              layoutVariant="wide"
              className="lg:col-span-7 md:mt-12"
            />
          )}
        </div>
      )}
    </div>
  );
}

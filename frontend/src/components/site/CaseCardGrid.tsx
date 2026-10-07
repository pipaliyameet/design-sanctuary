import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { CaseCard } from "@/lib/public.functions";
import { cn } from "@/lib/utils";
import { DriveImage } from "./DriveImage";

interface ProjectCardProps {
  project: CaseCard;
  index: number;
  layoutVariant?: "asymmetric-left" | "asymmetric-right" | "full-cinematic" | "balanced" | "compact";
  className?: string;
  showSummary?: boolean;
}

export function ProjectCard({
  project,
  index,
  layoutVariant = "balanced",
  className,
  showSummary = true,
}: ProjectCardProps) {
  const formattedIndex = String(index + 1).padStart(2, "0");

  if (layoutVariant === "full-cinematic") {
    return (
      <Link
        to="/portfolio/$slug"
        params={{ slug: project.slug }}
        className={cn(
          "group block w-full overflow-hidden transition-all duration-500 cursor-pointer",
          className,
        )}
      >
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-stone">
          <DriveImage
            src={project.hero_image}
            alt={project.title}
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            wrapperClassName="size-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />

          {/* Cinematic Overlay Text */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-accent font-medium mb-2">
                <span className="font-mono text-ink-foreground/80">{formattedIndex}</span>
                <span>·</span>
                <span>{project.space_type || "Residential"}</span>
                <span>·</span>
                <span>{project.location}</span>
                {project.year ? <span>· {project.year}</span> : null}
              </div>
              <h3 className="font-display text-2xl sm:text-4xl lg:text-5xl font-light text-ink-foreground tracking-tight leading-[1.1]">
                {project.title}
              </h3>
              {showSummary && project.summary && (
                <p className="mt-2.5 text-xs sm:text-sm text-ink-foreground/85 font-light max-w-xl line-clamp-2 leading-relaxed">
                  {project.summary}
                </p>
              )}
            </div>

            <div className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] text-accent font-medium transition-transform group-hover:translate-x-1 shrink-0">
              <span>View Project</span>
              <ArrowRight className="size-3.5" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (layoutVariant === "asymmetric-left") {
    return (
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-center",
          className,
        )}
      >
        {/* Large Dominant Image (7 cols on tablet, 8 on desktop) */}
        <Link
          to="/portfolio/$slug"
          params={{ slug: project.slug }}
          className="group block md:col-span-7 lg:col-span-8 overflow-hidden bg-stone cursor-pointer"
        >
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
            <DriveImage
              src={project.hero_image}
              alt={project.title}
              className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              wrapperClassName="size-full"
            />
          </div>
        </Link>

        {/* Supporting Editorial Story (5 cols on tablet, 4 on desktop) */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col justify-center space-y-3.5 lg:space-y-4">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="font-mono text-accent font-semibold">{formattedIndex}</span>
            <span>·</span>
            <span>{project.space_type || "Residential"}</span>
            <span>·</span>
            <span>{project.year || "2026"}</span>
          </div>

          <Link
            to="/portfolio/$slug"
            params={{ slug: project.slug }}
            className="group block"
          >
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-light text-foreground tracking-tight leading-[1.15] group-hover:text-accent transition-colors">
              {project.title}
            </h3>
          </Link>

          <p className="text-xs uppercase tracking-wider text-muted-foreground/90 font-medium">
            {project.location}
            {project.area_sqft ? ` · ${project.area_sqft.toLocaleString()} Sq Ft` : ""}
          </p>

          {showSummary && project.summary && (
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground font-light pt-1 line-clamp-3">
              {project.summary}
            </p>
          )}

          <div className="pt-2">
            <Link
              to="/portfolio/$slug"
              params={{ slug: project.slug }}
              className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground hover:text-accent font-medium transition-colors border-b border-foreground/30 pb-1"
            >
              <span>View Project</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 text-accent" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (layoutVariant === "asymmetric-right") {
    return (
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-center",
          className,
        )}
      >
        {/* Supporting Editorial Story (5 cols on tablet, 4 on desktop, placed first on tablet/desktop) */}
        <div className="md:col-span-5 lg:col-span-4 order-2 md:order-1 flex flex-col justify-center space-y-3.5 lg:space-y-4">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="font-mono text-accent font-semibold">{formattedIndex}</span>
            <span>·</span>
            <span>{project.space_type || "Residential"}</span>
            <span>·</span>
            <span>{project.year || "2026"}</span>
          </div>

          <Link
            to="/portfolio/$slug"
            params={{ slug: project.slug }}
            className="group block"
          >
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-light text-foreground tracking-tight leading-[1.15] group-hover:text-accent transition-colors">
              {project.title}
            </h3>
          </Link>

          <p className="text-xs uppercase tracking-wider text-muted-foreground/90 font-medium">
            {project.location}
            {project.area_sqft ? ` · ${project.area_sqft.toLocaleString()} Sq Ft` : ""}
          </p>

          {showSummary && project.summary && (
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground font-light pt-1 line-clamp-3">
              {project.summary}
            </p>
          )}

          <div className="pt-2">
            <Link
              to="/portfolio/$slug"
              params={{ slug: project.slug }}
              className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground hover:text-accent font-medium transition-colors border-b border-foreground/30 pb-1"
            >
              <span>View Project</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 text-accent" />
            </Link>
          </div>
        </div>

        {/* Large Dominant Image (7 cols on tablet, 8 on desktop) */}
        <Link
          to="/portfolio/$slug"
          params={{ slug: project.slug }}
          className="group block md:col-span-7 lg:col-span-8 order-1 md:order-2 overflow-hidden bg-stone cursor-pointer"
        >
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
            <DriveImage
              src={project.hero_image}
              alt={project.title}
              className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              wrapperClassName="size-full"
            />
          </div>
        </Link>
      </div>
    );
  }

  // Standard / Balanced Card (used in 2-column or 3-column rows and mobile single column)
  return (
    <Link
      to="/portfolio/$slug"
      params={{ slug: project.slug }}
      className={cn(
        "group block select-none cursor-pointer transition-all duration-300",
        className,
      )}
    >
      <div className="relative w-full overflow-hidden bg-stone aspect-[4/3] sm:aspect-[16/11]">
        <DriveImage
          src={project.hero_image}
          alt={project.title}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          wrapperClassName="size-full"
        />

        {/* Minimal Number & Category Tag */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/90 backdrop-blur-md px-3 py-1 border border-border/60">
          <span className="font-mono text-[10px] text-accent font-semibold">{formattedIndex}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-foreground font-medium">
            {project.space_type || "Residential"}
          </span>
        </div>
      </div>

      {/* Metadata */}
      <div className="pt-4 pb-2">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-light text-foreground group-hover:text-accent transition-colors">
              {project.title}
            </h3>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {project.location} {project.year ? `· ${project.year}` : ""}
            </p>
          </div>

          <div className="text-accent shrink-0 pt-1 transition-transform group-hover:translate-x-1">
            <ArrowRight className="size-4" />
          </div>
        </div>

        {showSummary && project.summary && (
          <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground font-light line-clamp-2">
            {project.summary}
          </p>
        )}
      </div>
    </Link>
  );
}

// Backward-compatible alias for existing routes
export const CaseCardItem = ({
  study,
  layoutVariant,
  className,
  showSummary = false,
}: {
  study: CaseCard;
  layoutVariant?: any;
  className?: string;
  showSummary?: boolean;
}) => (
  <ProjectCard
    project={study}
    index={0}
    layoutVariant={layoutVariant === "heroic" ? "full-cinematic" : "balanced"}
    className={className}
    showSummary={showSummary}
  />
);

export function EditorialProjectGrid({ projects }: { projects: CaseCard[] }) {
  if (!projects || projects.length === 0) return null;

  const [p1, p2, p3, p4, p5, ...remaining] = projects;

  const defaultP5: CaseCard = {
    slug: "oberoi-sea-facing-duplex",
    title: "Oberoi Sea-Facing Duplex",
    subtitle: "High-Floor Minimalist Sanctuary Overlooking the Arabian Sea",
    location: "Worli Sea Face, Mumbai",
    year: 2026,
    hero_image: "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
    summary: "Monolithic Grigio Carnico quartzite, warm fluted walnut panelling, and panoramic floor-to-ceiling oceanic views.",
    space_type: "Sea-Facing Duplex",
    style: "Refined Modernist",
    area_sqft: 5200,
  };

  const effectiveP5 = p5 || (p4 ? defaultP5 : undefined);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Project 01: Large Asymmetric Lead (8 cols image / 4 cols text) */}
      {p1 && (
        <ProjectCard
          project={p1}
          index={0}
          layoutVariant="asymmetric-left"
          showSummary
        />
      )}

      {/* 2. Project 02: Alternating Asymmetric Spread (4 cols text / 8 cols image) */}
      {p2 && (
        <ProjectCard
          project={p2}
          index={1}
          layoutVariant="asymmetric-right"
          showSummary
        />
      )}

      {/* 3. Project 03: Dramatic Full-Width Cinematic Banner */}
      {p3 && (
        <ProjectCard
          project={p3}
          index={2}
          layoutVariant="full-cinematic"
          showSummary
        />
      )}

      {/* 4. Projects 04 & 05: Balanced 2-Column Architectural Composition */}
      {(p4 || effectiveP5) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {p4 && <ProjectCard project={p4} index={3} layoutVariant="balanced" showSummary />}
          {effectiveP5 && <ProjectCard project={effectiveP5} index={4} layoutVariant="balanced" showSummary />}
        </div>
      )}

      {/* 5. Any Remaining Projects in Balanced Grid (Only if 2 or more to prevent single dangling cards) */}
      {remaining.length >= 2 && (
        <div
          className={cn(
            "grid gap-8 sm:gap-10 pt-4",
            remaining.length % 3 === 0
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2",
          )}
        >
          {remaining.map((p, idx) => (
            <ProjectCard
              key={p.slug || idx}
              project={p}
              index={idx + 5}
              layoutVariant="balanced"
              showSummary={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

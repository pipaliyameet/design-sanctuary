import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { CaseCard } from "@/lib/public.functions";
import { cn } from "@/lib/utils";

interface CaseCardItemProps {
  study: CaseCard;
  layoutVariant?: "heroic" | "tall" | "wide" | "standard";
  className?: string;
}

export function CaseCardItem({
  study,
  layoutVariant = "standard",
  className,
}: CaseCardItemProps) {
  const isHeroic = layoutVariant === "heroic";
  const isTall = layoutVariant === "tall";
  const isWide = layoutVariant === "wide";

  return (
    <Link
      to="/portfolio/$slug"
      params={{ slug: study.slug }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden transition-all duration-500",
        isHeroic && "lg:col-span-12",
        isWide && "md:col-span-2 lg:col-span-8",
        isTall && "md:col-span-1 lg:col-span-4",
        className,
      )}
    >
      {/* Image container */}
      <div
        className={cn(
          "relative w-full overflow-hidden bg-secondary/30",
          isHeroic
            ? "aspect-[16/9] sm:aspect-[21/9]"
            : isTall
              ? "aspect-[3/4]"
              : isWide
                ? "aspect-[16/10]"
                : "aspect-[4/3]",
        )}
      >
        <img
          src={study.hero_image ?? "/portfolio/hero.jpg"}
          alt={study.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />

        {/* Subtle dark vignette on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-75" />

        {/* Badges / Category Tag */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <span className="bg-ink/75 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ink-foreground backdrop-blur-md">
            {study.space_type ?? "Residential"}
          </span>
          {study.year && (
            <span className="bg-ink/75 px-2.5 py-1 text-[10px] tracking-[0.15em] text-ink-foreground/80 backdrop-blur-md">
              {study.year}
            </span>
          )}
        </div>

        {/* Action arrow appearing on hover */}
        <div className="absolute bottom-5 right-5 z-10 flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
          <ArrowUpRight className="size-5" />
        </div>
      </div>

      {/* Metadata text */}
      <div className="pt-4 sm:pt-5 pb-1 flex flex-col justify-between">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl sm:text-2xl font-normal text-foreground group-hover:text-accent transition-colors">
            {study.title}
          </h3>
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground whitespace-nowrap">
            {study.location}
          </span>
        </div>

        {study.summary && (
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {study.summary}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accent font-medium opacity-80 group-hover:opacity-100 transition-opacity">
          <span>View Project</span>
          <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export function EditorialProjectGrid({ projects }: { projects: CaseCard[] }) {
  if (!projects || projects.length === 0) return null;

  const [lead, second, third, fourth, ...remaining] = projects;

  return (
    <div className="space-y-16">
      {/* Featured Heroic Project */}
      {lead && <CaseCardItem study={lead} layoutVariant="heroic" />}

      {/* Asymmetrical 2-Column Section */}
      {(second || third) && (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 items-start">
          {second && (
            <CaseCardItem
              study={second}
              layoutVariant="wide"
              className="lg:col-span-7"
            />
          )}
          {third && (
            <CaseCardItem
              study={third}
              layoutVariant="tall"
              className="lg:col-span-5 md:mt-12"
            />
          )}
        </div>
      )}

      {/* Three Column Balance */}
      {fourth && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <CaseCardItem study={fourth} layoutVariant="standard" />
          {remaining.slice(0, 2).map((item) => (
            <CaseCardItem key={item.slug} study={item} layoutVariant="standard" />
          ))}
        </div>
      )}
    </div>
  );
}

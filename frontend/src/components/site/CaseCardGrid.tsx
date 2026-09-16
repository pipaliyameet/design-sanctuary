import { Link } from "@tanstack/react-router";
import type { CaseCard } from "@/lib/public.functions";

export function CaseCardItem({ study, large = false }: { study: CaseCard; large?: boolean }) {
  return (
    <Link
      to="/portfolio/$slug"
      params={{ slug: study.slug }}
      className="group block"
      aria-label={study.title}
    >
      <div className="relative overflow-hidden bg-secondary">
        <img
          src={study.hero_image ?? "/portfolio/hero.jpg"}
          alt={`${study.title} — ${study.style ?? "interior"} ${study.space_type ?? "project"} in ${study.location ?? "India"}`}
          loading="lazy"
          className={
            large
              ? "aspect-[16/10] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
              : "aspect-[4/3] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
          }
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className={large ? "text-2xl sm:text-3xl" : "text-xl"}>{study.title}</h3>
        <span className="shrink-0 text-xs tracking-[0.16em] text-muted-foreground uppercase">
          {study.year ?? ""}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {[study.space_type, study.location, study.area_sqft ? `${study.area_sqft} sq ft` : null]
          .filter(Boolean)
          .join(" · ")}
      </p>
    </Link>
  );
}

export function CaseCardGrid({ studies }: { studies: CaseCard[] }) {
  return (
    <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
      {studies.map((s) => (
        <CaseCardItem key={s.slug} study={s} />
      ))}
    </div>
  );
}

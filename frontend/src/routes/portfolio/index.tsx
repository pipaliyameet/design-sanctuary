import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowRight, SlidersHorizontal, RotateCcw } from "lucide-react";
import { listCaseStudies, FALLBACK_CASE_STUDIES, type CaseCard } from "@/lib/public.functions";
import { PublicShell, PageHeader } from "@/components/site/PublicShell";
import { CaseCardItem } from "@/components/site/CaseCardGrid";
import { cn } from "@/lib/utils";

const portfolioQuery = queryOptions({
  queryKey: ["case-studies"],
  queryFn: () => listCaseStudies(),
});

export const Route = createFileRoute("/portfolio/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(portfolioQuery),
  component: PortfolioPage,
  head: () => ({
    meta: [
      { title: "Completed Architectural Projects & Interiors | Atelier Vermilion" },
      {
        name: "description",
        content:
          "Explore completed luxury interior architecture projects by Atelier Vermilion: penthouses, villas, heritage restorations, and commercial workspaces across India.",
      },
      { property: "og:title", content: "Projects Archive — Atelier Vermilion" },
      {
        property: "og:description",
        content: "Completed residential and commercial interiors, resolved room by room.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => (
    <PublicShell>
      <PageHeader eyebrow="Projects" title="Projects Loading Error" />
    </PublicShell>
  ),
});

const PRIMARY_CATEGORIES = [
  "All",
  "Residential",
  "Villa",
  "Penthouse",
  "Commercial",
  "Hospitality",
  "Office",
  "Heritage",
];

function PortfolioPage() {
  const { data } = useSuspenseQuery(portfolioQuery);
  const studies: CaseCard[] = data && data.length > 0 ? data : FALLBACK_CASE_STUDIES;

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("All");

  const cities = useMemo(() => {
    const rawCities = studies
      .map((s) => s.location?.split(",")[0]?.trim())
      .filter(Boolean) as string[];
    return ["All", ...Array.from(new Set(rawCities))].sort();
  }, [studies]);

  const filtered = useMemo(() => {
    return studies.filter((study) => {
      // Match Category
      let matchesCat = true;
      if (activeCategory !== "All") {
        const cat = activeCategory.toLowerCase();
        const space = (study.space_type ?? "").toLowerCase();
        const style = (study.style ?? "").toLowerCase();
        const tags = (study.tags ?? []).map((t) => t.toLowerCase());
        matchesCat =
          space.includes(cat) || style.includes(cat) || tags.some((t) => t.includes(cat));
      }

      // Match City
      let matchesCity = true;
      if (selectedCity !== "All") {
        matchesCity = (study.location ?? "").toLowerCase().includes(selectedCity.toLowerCase());
      }

      return matchesCat && matchesCity;
    });
  }, [studies, activeCategory, selectedCity]);

  const hasActiveFilters = activeCategory !== "All" || selectedCity !== "All";

  return (
    <PublicShell>
      {/* Editorial Header */}
      <div className="border-b border-border bg-background pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="eyebrow">Architectural Archives</p>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl lg:text-7xl font-light text-foreground tracking-tight max-w-4xl">
            Selected Works & Interior Commissions.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed font-light">
            Every project detailed room by room. Filter by typology or city to examine the brief,
            material selections, and final built spaces.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8">
        {/* Filter Toolbar */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-border pb-8">
          {/* Typology Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {PRIMARY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors border",
                  activeCategory === cat
                    ? "border-foreground bg-foreground text-background font-medium"
                    : "border-border/80 bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* City Dropdown & Reset */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <SlidersHorizontal className="size-3.5 text-accent" />
              <span>City:</span>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setSelectedCity("All");
                }}
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
              >
                <RotateCcw className="size-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Counter Info */}
        <div className="py-6 flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider">
          <span>
            Showing {filtered.length} of {studies.length} Commissions
          </span>
          <span>Room-by-Room Documentation</span>
        </div>

        {/* Editorial Project Grid */}
        <div className="pb-28">
          {filtered.length > 0 ? (
            <div className="space-y-16">
              {/* Asymmetric Alternating Layout */}
              {filtered.map((study, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={study.slug}
                    className="border-b border-border/60 pb-16 transition-opacity duration-300"
                  >
                    <div className="grid gap-8 md:grid-cols-12 items-center">
                      <div className={cn("md:col-span-7", isEven ? "md:order-1" : "md:order-2")}>
                        <Link
                          to="/portfolio/$slug"
                          params={{ slug: study.slug }}
                          className="group block overflow-hidden bg-secondary/30 aspect-[16/10]"
                        >
                          <img
                            src={study.hero_image ?? "/portfolio/hero.jpg"}
                            alt={study.title}
                            loading="lazy"
                            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        </Link>
                      </div>

                      <div
                        className={cn(
                          "md:col-span-5 flex flex-col justify-center",
                          isEven ? "md:order-2 md:pl-6" : "md:order-1 md:pr-6",
                        )}
                      >
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-accent font-medium">
                          <span>{study.space_type}</span>
                          <span>·</span>
                          <span>{study.year}</span>
                          {study.area_sqft && (
                            <>
                              <span>·</span>
                              <span>{study.area_sqft} sq ft</span>
                            </>
                          )}
                        </div>

                        <h2 className="mt-3 font-display text-2xl sm:text-4xl text-foreground font-light tracking-tight hover:text-accent transition-colors">
                          <Link to="/portfolio/$slug" params={{ slug: study.slug }}>
                            {study.title}
                          </Link>
                        </h2>

                        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                          {study.location}
                        </p>

                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground font-light line-clamp-3">
                          {study.summary}
                        </p>

                        <div className="mt-8 flex items-center gap-4">
                          <Link
                            to="/portfolio/$slug"
                            params={{ slug: study.slug }}
                            className="inline-flex items-center gap-2 bg-foreground px-6 py-3 text-xs tracking-[0.2em] uppercase text-background font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            Explore Project <ArrowRight className="size-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-border py-32 text-center">
              <p className="font-display text-2xl text-foreground">No projects match the selected filters.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try selecting a different typology or clearing your filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setSelectedCity("All");
                }}
                className="mt-6 inline-flex items-center gap-2 border border-border px-6 py-2.5 text-xs uppercase tracking-widest text-foreground hover:bg-secondary/40"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Bottom Consultation Banner */}
        <div className="border-t border-border pt-16 pb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl text-foreground font-light">
              Interested in a tailored commission for your space?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We review architectural drawings and site briefs pan-India.
            </p>
          </div>
          <Link
            to="/contact"
            hash="consultation"
            className="inline-flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background font-medium hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
          >
            Book a Consultation <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}

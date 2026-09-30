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
      { title: "Architectural Portfolio & Selected Works | Atelier Vermilion" },
      {
        name: "description",
        content:
          "Explore 28+ completed interior architecture commissions by Atelier Vermilion: private residences, villas, commercial workspaces, and heritage restorations across India.",
      },
      { property: "og:title", content: "Projects Archive — Atelier Vermilion" },
      {
        property: "og:description",
        content:
          "Completed residential, commercial and turnkey commissions, resolved room by room.",
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

// Section 6 Required Categories
const PRIMARY_CATEGORIES = [
  "All",
  "Residential",
  "Commercial",
  "Office",
  "Hospitality",
  "Renovation",
  "Other",
] as const;

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
          space === cat ||
          space.includes(cat) ||
          style.includes(cat) ||
          tags.some((t) => t.includes(cat));
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
      {/* Editorial Header with controlled vertical breathing room */}
      <div className="border-b border-border bg-background pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="eyebrow">PORTFOLIO ARCHIVE</p>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl lg:text-6xl font-light text-foreground tracking-tight max-w-4xl leading-[1.12]">
            Selected Works & Interior Commissions.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-light">
            Every project detailed room by room around daylight, stone and quiet craft. Filter by
            typology or city to examine completed built spaces.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8">
        {/* Filter Toolbar (Section 6 & 20 Requirements) */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between border-b border-border pb-6">
          {/* Desktop & Mobile Category Filters: horizontally scrollable on mobile without wrapping */}
          <div className="no-scrollbar overflow-x-auto flex items-center gap-6 sm:gap-8 pb-2 sm:pb-0 -mx-5 px-5 sm:mx-0 sm:px-0">
            {PRIMARY_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "relative py-1 text-xs uppercase tracking-[0.2em] whitespace-nowrap transition-colors cursor-pointer",
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>{cat}</span>
                  {/* Subtle architectural active indicator underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                  )}
                </button>
              );
            })}
          </div>

          {/* City Dropdown & Reset Filter */}
          <div className="flex items-center gap-4 shrink-0 pt-2 sm:pt-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <SlidersHorizontal className="size-3.5 text-accent" />
              <span>Location:</span>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none cursor-pointer"
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
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline cursor-pointer"
              >
                <RotateCcw className="size-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Counter Info */}
        <div className="py-5 flex items-center justify-between text-[11px] text-muted-foreground uppercase tracking-wider">
          <span>
            Showing {filtered.length} of {studies.length} Commissions
          </span>
          <span>Room-by-Room Documentation</span>
        </div>

        {/* Editorial Project Showcase: Varied visual rhythm (Sections 5 & 19) */}
        <div className="pb-20">
          {filtered.length > 0 ? (
            <div className="space-y-16 sm:space-y-20">
              {/* Render in editorial groups to produce varied visual rhythm */}
              {Array.from({ length: Math.ceil(filtered.length / 5) }).map((_, groupIdx) => {
                const group = filtered.slice(groupIdx * 5, (groupIdx + 1) * 5);
                const [first, second, third, fourth, fifth] = group;

                return (
                  <div key={groupIdx} className="space-y-12 sm:space-y-16">
                    {/* Item 1: Wide or Heroic Feature */}
                    {first && <CaseCardItem study={first} layoutVariant="heroic" showSummary />}

                    {/* Items 2 & 3: Asymmetric 2-Column Pairing (7 cols wide + 5 cols tall) */}
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

                    {/* Items 4 & 5: Balanced 2-Column or 3-Column */}
                    {(fourth || fifth) && (
                      <div className="grid gap-8 sm:grid-cols-2">
                        {fourth && <CaseCardItem study={fourth} layoutVariant="standard" />}
                        {fifth && <CaseCardItem study={fifth} layoutVariant="standard" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-border/80 bg-card/30 py-20 text-center">
              <p className="font-display text-xl sm:text-2xl text-foreground font-light">
                No projects match the selected filter.
              </p>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Try selecting a different typology or resetting your filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setSelectedCity("All");
                }}
                className="mt-6 inline-flex items-center gap-2 border border-foreground/30 px-6 py-2.5 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Bottom Consultation Banner */}
        <div className="border-t border-border pt-12 pb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl text-foreground font-light">
              Interested in a bespoke commission for your space?
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              We review architectural floorplans and site parameters across India.
            </p>
          </div>
          <Link
            to="/contact"
            hash="consultation"
            className="inline-flex items-center gap-2 bg-foreground px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-background font-medium hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
          >
            Book a Consultation <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}

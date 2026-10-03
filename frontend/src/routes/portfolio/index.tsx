import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowRight, SlidersHorizontal, RotateCcw, ChevronDown, MapPin, Calendar, Layers } from "lucide-react";
import { listCaseStudies, type CaseCard } from "@/lib/public.functions";
import { PublicShell } from "@/components/site/PublicShell";
import { DriveImage } from "@/components/site/DriveImage";
import { cn } from "@/lib/utils";

const portfolioQuery = queryOptions({
  queryKey: ["case-studies"],
  queryFn: () => listCaseStudies(),
});

export const Route = createFileRoute("/portfolio/")({
  beforeLoad: () => {
    throw redirect({ to: "/gallery" });
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(portfolioQuery),
  component: PortfolioPage,
  head: () => ({
    meta: [
      { title: "Architectural Portfolio & Selected Works | Right Angle Design Studio" },
      {
        name: "description",
        content:
          "Explore completed interior architecture commissions by Right Angle Design Studio: private residences, sky penthouses, coastal villas, commercial headquarters, and heritage restorations across India.",
      },
      { property: "og:title", content: "Projects Archive — Right Angle Design Studio" },
      {
        property: "og:description",
        content:
          "Completed residential, commercial and turnkey commissions, resolved room by room around daylight, stone and quiet craft.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => (
    <PublicShell>
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <p className="eyebrow text-accent">PORTFOLIO</p>
        <h1 className="mt-3 text-3xl font-display font-light text-foreground">
          Unable to Load Portfolio Archive
        </h1>
        <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed">
          We encountered an issue retrieving the latest studio commissions. Please refresh to try again.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 border border-foreground/30 px-6 py-2.5 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            Return to Studio
          </Link>
        </div>
      </div>
    </PublicShell>
  ),
});

export function PortfolioPage() {
  const { data } = useSuspenseQuery(portfolioQuery);
  const studies: CaseCard[] = Array.isArray(data) ? data : [];

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");

  // Dynamic Categories derived directly from MongoDB database (only existing typologies)
  const categories = useMemo(() => {
    const set = new Set<string>(["ALL"]);
    for (const s of studies) {
      if (s.space_type) {
        set.add(s.space_type.toUpperCase().trim());
      }
      if (s.tags) {
        for (const t of s.tags) {
          const upper = t.toUpperCase().trim();
          if (["PENTHOUSE", "VILLA", "RESIDENTIAL", "COMMERCIAL", "HOSPITALITY", "OFFICE", "RENOVATION"].includes(upper)) {
            set.add(upper);
          }
        }
      }
    }
    return Array.from(set);
  }, [studies]);

  // Unique Cities derived from MongoDB
  const cities = useMemo(() => {
    const raw = studies
      .map((s) => s.location?.split(",")[0]?.trim())
      .filter(Boolean) as string[];
    return ["ALL", ...Array.from(new Set(raw))].sort();
  }, [studies]);

  // Filtered commissions
  const filtered = useMemo(() => {
    return studies.filter((study) => {
      let matchesCat = true;
      if (activeCategory !== "ALL") {
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

      let matchesCity = true;
      if (selectedCity !== "ALL") {
        matchesCity = (study.location ?? "").toLowerCase().includes(selectedCity.toLowerCase());
      }

      return matchesCat && matchesCity;
    });
  }, [studies, activeCategory, selectedCity]);

  const hasActiveFilters = activeCategory !== "ALL" || selectedCity !== "ALL";

  // Flagship project for the hero and spotlight
  const flagshipProject = studies[0];
  const heroImageSrc = flagshipProject?.hero_image || "";

  // Split filtered projects for editorial rhythm:
  // p1: Featured Project 01
  // p2: Asymmetric Left (8-col image / 4-col text)
  // p3: Asymmetric Right (4-col text / 8-col image)
  // p4: Full-Bleed Cinematic Wide (21/9)
  // p5 & p6: Asymmetric Pair (7-col & 5-col)
  // remaining: Balanced rhythmic showcase
  const [firstProject, secondProject, thirdProject, fourthProject, fifthProject, sixthProject, ...remainingProjects] = filtered;

  return (
    <PublicShell overlayHeader>
      {/* =========================================================================
          SECTION 01 — EDITORIAL PORTFOLIO HERO (80–92vh Desktop, 75–85vh Mobile)
          ========================================================================= */}
      <section className="relative isolate min-h-[80vh] sm:min-h-[88vh] lg:min-h-[92vh] overflow-hidden flex flex-col justify-end pt-24 pb-12 sm:pb-20">
        {heroImageSrc ? (
          <DriveImage
            src={heroImageSrc}
            alt="Right Angle Design Studio Architectural Portfolio Sanctuary"
            className="absolute inset-0 size-full object-cover slow-zoom brightness-[0.82]"
            wrapperClassName="absolute inset-0 size-full"
          />
        ) : (
          <div className="absolute inset-0 bg-ink" />
        )}

        {/* Ambient Architectural Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/25 to-transparent" />

        <div className="relative mx-auto w-full max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="max-w-4xl">
            <p className="eyebrow text-ink-foreground/80 flex items-center gap-2 mb-3">
              <span className="inline-block size-1.5 rounded-full bg-accent" />
              Architectural Portfolio · Selected Commissions
            </p>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-8xl text-ink-foreground font-light tracking-tight leading-[1.05]">
              Spaces shaped around <span className="italic font-normal text-accent">how people live.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-lg lg:text-xl leading-relaxed text-ink-foreground/85 font-light">
              A curated archive of private residences, sky penthouses, coastal villas, and executive sanctuaries detailed around daylight, natural stone and quiet craft.
            </p>
          </div>

          {/* Minimal Scroll Cue */}
          <div className="mt-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-ink-foreground/60 font-mono">
            <span className="animate-bounce">↓</span>
            <span>Scroll to Explore Archive</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 02 — EDITORIAL CATEGORY & TYPOLOGY FILTER TOOLBAR
          ========================================================================= */}
      <section className="sticky top-20 z-30 border-y border-border/80 bg-background/95 backdrop-blur-md transition-colors">
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Typology Filter Tabs */}
            <div className="no-scrollbar overflow-x-auto flex items-center gap-6 sm:gap-8 pb-1 sm:pb-0 -mx-5 px-5 sm:mx-0 sm:px-0">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "relative py-1 text-xs uppercase tracking-[0.2em] whitespace-nowrap transition-colors cursor-pointer font-medium",
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>{cat}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent transition-all" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* City Filter & Reset */}
            <div className="flex items-center gap-4 shrink-0 pt-2 lg:pt-0 justify-between lg:justify-end border-t lg:border-t-0 border-border/60">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-mono">
                <SlidersHorizontal className="size-3.5 text-accent" />
                <span>City:</span>
              </div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none cursor-pointer rounded-none uppercase font-mono tracking-wider"
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
                    setActiveCategory("ALL");
                    setSelectedCity("ALL");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline cursor-pointer uppercase tracking-wider font-mono"
                >
                  <RotateCcw className="size-3" /> Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 03 — ARCHITECTURAL ARCHIVE CONTENT
          ========================================================================= */}
      <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16 py-10 sm:py-16">
        {/* Archive Metadata Strip */}
        <div className="pb-8 mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 text-xs text-muted-foreground uppercase tracking-widest font-mono">
          <span>
            Showing {filtered.length} of {studies.length} Commissions
          </span>
          <span>Room-by-Room Detailing · Verified Photographs</span>
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-24 sm:space-y-36">
            {/* =================================================================
                COMPOSITION 01: FEATURED SPOTLIGHT LEAD (Grand Visual Feature)
                ================================================================= */}
            {firstProject && (
              <div className="group block scroll-mt-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                  {/* Grand Visual Image */}
                  <Link
                    to="/portfolio/$slug"
                    params={{ slug: firstProject.slug }}
                    className="lg:col-span-8 overflow-hidden bg-stone cursor-pointer relative"
                  >
                    <div className="aspect-[16/10] sm:aspect-[16/9] overflow-hidden">
                      <DriveImage
                        src={firstProject.hero_image}
                        alt={firstProject.title}
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        wrapperClassName="size-full"
                      />
                    </div>
                    {/* Floating Monogram Badge */}
                    <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-md px-3 py-1 border border-border/70 text-[10px] uppercase font-mono tracking-widest text-accent font-semibold">
                      Featured Commission 01
                    </div>
                  </Link>

                  {/* Editorial Dossier */}
                  <div className="lg:col-span-4 flex flex-col justify-center space-y-5">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-accent font-mono font-medium">
                      <span>01</span>
                      <span>·</span>
                      <span>{firstProject.space_type}</span>
                      {firstProject.year && (
                        <>
                          <span>·</span>
                          <span>{firstProject.year}</span>
                        </>
                      )}
                    </div>

                    <Link to="/portfolio/$slug" params={{ slug: firstProject.slug }} className="group/link block">
                      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight leading-[1.1] group-hover/link:text-accent transition-colors">
                        {firstProject.title}
                      </h2>
                    </Link>

                    {firstProject.subtitle && (
                      <p className="font-editorial text-base sm:text-lg italic text-foreground/80 font-light">
                        {firstProject.subtitle}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-wider text-muted-foreground font-medium pt-1">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-accent" /> {firstProject.location}
                      </span>
                      {firstProject.area_sqft && (
                        <span>· {firstProject.area_sqft.toLocaleString()} Sq Ft</span>
                      )}
                    </div>

                    {firstProject.summary && (
                      <p className="text-sm leading-relaxed text-muted-foreground font-light pt-2">
                        {firstProject.summary}
                      </p>
                    )}

                    <div className="pt-4">
                      <Link
                        to="/portfolio/$slug"
                        params={{ slug: firstProject.slug }}
                        className="inline-flex items-center gap-2.5 bg-foreground px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-background hover:bg-accent hover:text-accent-foreground transition-colors font-medium cursor-pointer"
                      >
                        <span>View Full Case Study</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================
                COMPOSITION 02: ASYMMETRIC LEFT (8-col image / 4-col narrative)
                ================================================================= */}
            {secondProject && (
              <div className="group block scroll-mt-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                  <Link
                    to="/portfolio/$slug"
                    params={{ slug: secondProject.slug }}
                    className="lg:col-span-8 overflow-hidden bg-stone cursor-pointer relative"
                  >
                    <div className="aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
                      <DriveImage
                        src={secondProject.hero_image}
                        alt={secondProject.title}
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        wrapperClassName="size-full"
                      />
                    </div>
                  </Link>

                  <div className="lg:col-span-4 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono">
                      <span className="text-accent font-semibold">02</span>
                      <span>·</span>
                      <span>{secondProject.space_type}</span>
                      {secondProject.year && (
                        <>
                          <span>·</span>
                          <span>{secondProject.year}</span>
                        </>
                      )}
                    </div>

                    <Link to="/portfolio/$slug" params={{ slug: secondProject.slug }} className="group/link block">
                      <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-light text-foreground tracking-tight leading-[1.15] group-hover/link:text-accent transition-colors">
                        {secondProject.title}
                      </h3>
                    </Link>

                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      {secondProject.location}
                      {secondProject.area_sqft ? ` · ${secondProject.area_sqft.toLocaleString()} Sq Ft` : ""}
                    </p>

                    {secondProject.summary && (
                      <p className="text-sm leading-relaxed text-muted-foreground font-light">
                        {secondProject.summary}
                      </p>
                    )}

                    <div className="pt-2">
                      <Link
                        to="/portfolio/$slug"
                        params={{ slug: secondProject.slug }}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground hover:text-accent font-medium transition-colors border-b border-foreground/30 pb-1"
                      >
                        <span>Explore Project</span>
                        <ArrowRight className="size-3.5 text-accent" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================
                COMPOSITION 03: ASYMMETRIC RIGHT (4-col narrative / 8-col image)
                ================================================================= */}
            {thirdProject && (
              <div className="group block scroll-mt-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                  <div className="lg:col-span-4 order-2 lg:order-1 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono">
                      <span className="text-accent font-semibold">03</span>
                      <span>·</span>
                      <span>{thirdProject.space_type}</span>
                      {thirdProject.year && (
                        <>
                          <span>·</span>
                          <span>{thirdProject.year}</span>
                        </>
                      )}
                    </div>

                    <Link to="/portfolio/$slug" params={{ slug: thirdProject.slug }} className="group/link block">
                      <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-light text-foreground tracking-tight leading-[1.15] group-hover/link:text-accent transition-colors">
                        {thirdProject.title}
                      </h3>
                    </Link>

                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      {thirdProject.location}
                      {thirdProject.area_sqft ? ` · ${thirdProject.area_sqft.toLocaleString()} Sq Ft` : ""}
                    </p>

                    {thirdProject.summary && (
                      <p className="text-sm leading-relaxed text-muted-foreground font-light">
                        {thirdProject.summary}
                      </p>
                    )}

                    <div className="pt-2">
                      <Link
                        to="/portfolio/$slug"
                        params={{ slug: thirdProject.slug }}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground hover:text-accent font-medium transition-colors border-b border-foreground/30 pb-1"
                      >
                        <span>Explore Project</span>
                        <ArrowRight className="size-3.5 text-accent" />
                      </Link>
                    </div>
                  </div>

                  <Link
                    to="/portfolio/$slug"
                    params={{ slug: thirdProject.slug }}
                    className="lg:col-span-8 order-1 lg:order-2 overflow-hidden bg-stone cursor-pointer relative"
                  >
                    <div className="aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
                      <DriveImage
                        src={thirdProject.hero_image}
                        alt={thirdProject.title}
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        wrapperClassName="size-full"
                      />
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {/* =================================================================
                COMPOSITION 04: FULL-BLEED CINEMATIC PANORAMA (21/9 Aspect)
                ================================================================= */}
            {fourthProject && (
              <Link
                to="/portfolio/$slug"
                params={{ slug: fourthProject.slug }}
                className="group block w-full overflow-hidden transition-all duration-500 cursor-pointer scroll-mt-32"
              >
                <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-stone">
                  <DriveImage
                    src={fourthProject.hero_image}
                    alt={fourthProject.title}
                    className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    wrapperClassName="size-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-accent font-medium mb-2 font-mono">
                        <span className="text-ink-foreground/80">04</span>
                        <span>·</span>
                        <span>{fourthProject.space_type}</span>
                        <span>·</span>
                        <span>{fourthProject.location}</span>
                        {fourthProject.year && <span>· {fourthProject.year}</span>}
                      </div>
                      <h3 className="font-display text-2xl sm:text-4xl lg:text-5xl font-light text-ink-foreground tracking-tight leading-[1.1]">
                        {fourthProject.title}
                      </h3>
                      {fourthProject.summary && (
                        <p className="mt-2.5 text-xs sm:text-sm text-ink-foreground/85 font-light max-w-xl line-clamp-2 leading-relaxed">
                          {fourthProject.summary}
                        </p>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] text-accent font-medium transition-transform group-hover:translate-x-1 shrink-0 font-mono">
                      <span>View Panoramic Study</span>
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* =================================================================
                COMPOSITION 05 & 06: ASYMMETRIC 2-COLUMN ARCHITECTURAL PAIRING
                ================================================================= */}
            {(fifthProject || sixthProject) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 items-start">
                {fifthProject && (
                  <Link
                    to="/portfolio/$slug"
                    params={{ slug: fifthProject.slug }}
                    className="group block lg:col-span-7 select-none cursor-pointer"
                  >
                    <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-stone">
                      <DriveImage
                        src={fifthProject.hero_image}
                        alt={fifthProject.title}
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        wrapperClassName="size-full"
                      />
                      <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-md px-3 py-1 border border-border/60 text-[10px] font-mono text-accent uppercase tracking-widest">
                        05 · {fifthProject.space_type}
                      </div>
                    </div>
                    <div className="pt-4 space-y-1">
                      <h4 className="font-display text-xl sm:text-2xl font-light text-foreground group-hover:text-accent transition-colors">
                        {fifthProject.title}
                      </h4>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                        {fifthProject.location} {fifthProject.year ? `· ${fifthProject.year}` : ""}
                      </p>
                      {fifthProject.summary && (
                        <p className="text-xs sm:text-sm text-muted-foreground font-light pt-1 line-clamp-2">
                          {fifthProject.summary}
                        </p>
                      )}
                    </div>
                  </Link>
                )}

                {sixthProject && (
                  <Link
                    to="/portfolio/$slug"
                    params={{ slug: sixthProject.slug }}
                    className="group block lg:col-span-5 md:mt-12 select-none cursor-pointer"
                  >
                    <div className="relative w-full aspect-[4/5] overflow-hidden bg-stone">
                      <DriveImage
                        src={sixthProject.hero_image}
                        alt={sixthProject.title}
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        wrapperClassName="size-full"
                      />
                      <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-md px-3 py-1 border border-border/60 text-[10px] font-mono text-accent uppercase tracking-widest">
                        06 · {sixthProject.space_type}
                      </div>
                    </div>
                    <div className="pt-4 space-y-1">
                      <h4 className="font-display text-xl sm:text-2xl font-light text-foreground group-hover:text-accent transition-colors">
                        {sixthProject.title}
                      </h4>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                        {sixthProject.location} {sixthProject.year ? `· ${sixthProject.year}` : ""}
                      </p>
                      {sixthProject.summary && (
                        <p className="text-xs sm:text-sm text-muted-foreground font-light pt-1 line-clamp-2">
                          {sixthProject.summary}
                        </p>
                      )}
                    </div>
                  </Link>
                )}
              </div>
            )}

            {/* =================================================================
                COMPOSITION 07+: BALANCED EDITORIAL COMMISSIONS
                ================================================================= */}
            {remainingProjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pt-8 border-t border-border/60">
                {remainingProjects.map((p, idx) => {
                  const num = String(idx + 7).padStart(2, "0");
                  return (
                    <Link
                      key={p.slug || idx}
                      to="/portfolio/$slug"
                      params={{ slug: p.slug }}
                      className="group block select-none cursor-pointer space-y-3"
                    >
                      <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone">
                        <DriveImage
                          src={p.hero_image}
                          alt={p.title}
                          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                          wrapperClassName="size-full"
                        />
                        <div className="absolute top-3 left-3 z-10 bg-background/90 backdrop-blur-md px-2.5 py-0.5 border border-border/60 text-[9px] font-mono text-accent uppercase tracking-widest">
                          {num} · {p.space_type}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-display text-lg sm:text-xl font-light text-foreground group-hover:text-accent transition-colors">
                          {p.title}
                        </h4>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mt-0.5">
                          {p.location} {p.year ? `· ${p.year}` : ""}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Clean Luxury Empty State */
          <div className="border border-border/80 bg-card/20 py-24 px-6 text-center max-w-3xl mx-auto my-12">
            <p className="eyebrow text-accent">COMMISSIONS ARCHIVE</p>
            <h3 className="mt-3 font-display text-2xl sm:text-3xl text-foreground font-light">
              No commissions found matching your criteria.
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-light max-w-md mx-auto leading-relaxed">
              We update our portfolio as projects complete white-glove handover. Try selecting another typology or reset your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory("ALL");
                setSelectedCity("ALL");
              }}
              className="mt-6 inline-flex items-center gap-2 border border-foreground/30 px-6 py-2.5 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* =========================================================================
            SECTION 04 — EDITORIAL FOOTER CONSULTATION CTA
            ========================================================================= */}
        <div className="mt-24 sm:mt-36 border-t border-border pt-16 pb-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="max-w-2xl">
            <p className="eyebrow text-accent">COMMISSION INQUIRY</p>
            <h3 className="mt-2 font-display text-3xl sm:text-5xl font-light text-foreground tracking-tight leading-[1.12]">
              Let’s create something meaningful.
            </h3>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
              A quiet invitation to begin a conversation about your space. Whether commissioning a private residence, sky penthouse, or boutique workplace, share your architectural parameters.
            </p>
          </div>

          <Link
            to="/contact"
            hash="consultation"
            className="inline-flex items-center gap-3 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.22em] text-background font-medium hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Start a Conversation</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Maximize2, Compass, Layers, Sparkles, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import {
  getHomeContent,
  type CaseCard,
  type ServiceItem,
  type ProcessStepItem,
  type TestimonialItem,
  type MaterialItem,
  type GoogleDrivePhoto,
} from "@/lib/public.functions";
import { PublicShell } from "@/components/site/PublicShell";
import { EditorialProjectGrid, ProjectCard } from "@/components/site/CaseCardGrid";
import { EditorialServicesSection } from "@/components/site/EditorialServices";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { ConsultationForm } from "@/components/site/ConsultationForm";
import { InstagramFeedSection } from "@/components/site/InstagramFeedSection";
import { ArchitecturalFilmsSection } from "@/components/site/ArchitecturalFilmsSection";
import { DriveImage } from "@/components/site/DriveImage";
import { PhotoLightboxModal } from "@/components/site/PhotoLightboxModal";
import { cn } from "@/lib/utils";

const homeQuery = queryOptions({
  queryKey: ["home-content"],
  queryFn: () => getHomeContent(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Right Angle Design Studio — Architecture & Interior Design" },
      {
        name: "description",
        content:
          "Spaces shaped by light, material and everyday life. Right Angle Design Studio crafts bespoke residential, commercial and turnkey interiors across India detailed around daylight, stone and quiet craft.",
      },
      { property: "og:title", content: "Right Angle Design Studio — Interior Architecture" },
      {
        property: "og:description",
        content:
          "Spaces shaped by light, material and everyday life. Residential and commercial interiors crafted from concept to execution.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => (
    <PublicShell>
      <div className="mx-auto max-w-xl px-5 py-28 text-center">
        <h1 className="text-3xl font-display font-light">Right Angle Design Studio</h1>
        <p className="mt-3 text-sm text-muted-foreground font-light">
          Refreshing studio parameters. Please reload to view our portfolio.
        </p>
      </div>
    </PublicShell>
  ),
});

export function HomePage() {
  const { data } = useSuspenseQuery(homeQuery);
  const studies: CaseCard[] = data?.studies || [];
  const services: ServiceItem[] = data?.services || [];
  const processSteps: ProcessStepItem[] = data?.processSteps || [];
  const testimonials: TestimonialItem[] = data?.testimonials || [];
  const materials: MaterialItem[] = data?.materials || [];

  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<GoogleDrivePhoto | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  // Derive dynamic categories from database projects
  const availableCategories = useMemo(() => {
    const set = new Set<string>(["ALL"]);
    for (const s of studies) {
      if (s.space_type) set.add(s.space_type.toUpperCase());
      if (s.tags) {
        for (const t of s.tags) set.add(t.toUpperCase());
      }
    }
    return Array.from(set).slice(0, 6);
  }, [studies]);

  const filteredProjects = useMemo(() => {
    if (selectedFilter === "ALL") return studies;
    const term = selectedFilter.toLowerCase();
    return studies.filter((s) => {
      const type = (s.space_type || "").toLowerCase();
      const style = (s.style || "").toLowerCase();
      const tags = (s.tags || []).map((t) => t.toLowerCase());
      return type.includes(term) || style.includes(term) || tags.some((t) => t.includes(term));
    });
  }, [studies, selectedFilter]);

  // Featured flagship story project
  const flagshipProject = studies[0];
  const heroImageSrc = flagshipProject?.hero_image || "";

  return (
    <PublicShell overlayHeader>
      {/* =========================================================================
          SECTION 01 — FULL-SCREEN / CINEMATIC HERO (80–95vh Desktop, 70–85vh Mobile)
          ========================================================================= */}
      <section className="relative isolate min-h-[78vh] sm:min-h-[88vh] lg:min-h-[92vh] overflow-hidden flex flex-col justify-end pt-20">
        {heroImageSrc ? (
          <DriveImage
            src={heroImageSrc}
            alt="Right Angle Design Studio Architectural Hero Space"
            className="absolute inset-0 size-full object-cover slow-zoom brightness-[0.85]"
            wrapperClassName="absolute inset-0 size-full cursor-pointer"
            onOpenZoom={() =>
              setActiveLightboxPhoto({
                id: "hero",
                index: 0,
                fileName: "hero.jpg",
                title: "Hero Interior Architecture",
                caption: data.heroTitle || "Right Angle Design Studio",
                url: heroImageSrc,
                thumbnailUrl: heroImageSrc,
                driveViewUrl: heroImageSrc,
                category: "Living",
                tags: ["Hero"],
                projectId: "",
                projectTitle: "Right Angle Design Studio",
                projectCode: "RADS",
                location: "Mumbai",
              })
            }
          />
        ) : (
          <div className="absolute inset-0 bg-ink" />
        )}

        {/* Ambient Architectural Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/20 to-transparent" />

        {/* Hero Content Box */}
        <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-10 sm:px-8 sm:pb-16">
          <div className="max-w-3xl">
            {/* Small Eyebrow */}
            <p className="eyebrow text-ink-foreground/80 flex items-center gap-2 mb-3">
              <span className="inline-block size-1.5 rounded-full bg-accent" />
              Architecture & Interior Design
            </p>

            {/* Main Headline */}
            <h1 className="reveal font-display text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-ink-foreground tracking-tight font-light leading-[1.08]">
              Spaces shaped by{" "}
              <span className="italic font-normal text-accent">light, material</span> and everyday life.
            </h1>

            {/* Positioning Statement */}
            <p className="reveal mt-4 max-w-xl text-sm sm:text-base lg:text-lg leading-relaxed text-ink-foreground/85 font-light">
              {data.heroSubtitle ||
                "Bespoke residential, commercial and turnkey interiors across India. Detailed around daylight, natural stone and quiet craft."}
            </p>

            {/* CTAs */}
            <div className="reveal mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/portfolio"
                className="group inline-flex items-center gap-2.5 bg-accent px-7 py-3.5 text-xs font-semibold tracking-[0.2em] text-accent-foreground uppercase transition-all duration-300 hover:bg-ink-foreground hover:text-ink cursor-pointer"
              >
                <span>View Projects</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                hash="consultation"
                className="inline-flex items-center gap-2 border border-ink-foreground/40 bg-ink/20 backdrop-blur-md px-6 py-3.5 text-xs font-medium tracking-[0.18em] text-ink-foreground uppercase transition-colors hover:border-accent hover:text-accent cursor-pointer"
              >
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Metadata Ribbon */}
        <div className="relative border-t border-ink-foreground/15 bg-ink/65 backdrop-blur-md py-3 text-ink-foreground/75 text-[11px] sm:text-xs">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-4 sm:gap-6 font-light">
              <span>Mumbai · Bengaluru · Pan India</span>
              <span>·</span>
              <span>12+ Years Practice</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 font-light">
              <span>28+ Architectural Commissions</span>
              <span>·</span>
              <span>Single-Source Turnkey Accountability</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 02 — STUDIO STATEMENT
          ========================================================================= */}
      <section className="py-16 sm:py-24 bg-card/30 border-b border-border">
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <p className="eyebrow">THE STUDIO</p>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-light text-foreground leading-[1.15] tracking-tight">
                We create considered residential and commercial interiors where{" "}
                <span className="italic text-accent font-normal">
                  material, proportion and light work together.
                </span>
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-light max-w-2xl">
                Every project we undertake starts by stripping away the non-essential. We avoid
                ephemeral trends and disposable finishes in pursuit of spaces that breathe: natural
                vein-cut stone with tactile depth, hand-troweled lime plaster that catches the changing sun,
                and bespoke millwork resolved with millimeter precision.
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-light max-w-2xl">
                Operating across Mumbai and Bengaluru, our practice provides single-source turnkey accountability
                from measured drawing sets through to final white-glove styling.
              </p>

              <div>
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground hover:text-accent font-semibold border-b border-foreground/30 pb-1 transition-colors"
                >
                  <span>Discover the Studio</span>
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Architectural Statistics */}
              <div className="pt-8 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-light text-foreground">
                    28+
                  </span>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                    Commissions
                  </p>
                </div>
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-light text-foreground">
                    12+
                  </span>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                    Years Active
                  </p>
                </div>
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-light text-foreground">
                    06
                  </span>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                    Disciplines
                  </p>
                </div>
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-light text-foreground">
                    11
                  </span>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                    Cities
                  </p>
                </div>
              </div>
            </div>

            {/* Studio Atmosphere Photography from Database/Drive */}
            <div className="group relative lg:col-span-5 overflow-hidden bg-stone aspect-[4/5] border border-border">
              {studies[1]?.hero_image ? (
                <DriveImage
                  src={studies[1].hero_image}
                  alt="Right Angle Design Studio atmosphere and stone curation"
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  wrapperClassName="size-full"
                />
              ) : (
                <div className="size-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
                  Right Angle Design Studio
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 03 — SELECTED PROJECTS (Editorial 12-Column Grid)
          ========================================================================= */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-border">
            <div>
              <p className="eyebrow">SELECTED WORK</p>
              <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground tracking-tight">
                Featured Architectural Commissions
              </h2>
            </div>

            {/* SECTION 04 — Dynamic Category Filter */}
            {availableCategories.length > 1 && (
              <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-1">
                {availableCategories.map((cat) => {
                  const isActive = selectedFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedFilter(cat)}
                      className={cn(
                        "relative py-1 text-xs uppercase tracking-[0.2em] transition-colors cursor-pointer whitespace-nowrap",
                        isActive
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span>{cat}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Predictable Editorial Grid */}
          <div className="pt-12">
            {filteredProjects.length > 0 ? (
              <EditorialProjectGrid projects={filteredProjects.slice(0, 5)} />
            ) : (
              <div className="py-16 text-center text-muted-foreground">
                <p className="font-display text-xl font-light">No projects found in this category.</p>
                <button
                  type="button"
                  onClick={() => setSelectedFilter("ALL")}
                  className="mt-4 text-xs uppercase tracking-widest text-accent underline cursor-pointer"
                >
                  View All Projects
                </button>
              </div>
            )}
          </div>

          {studies.length > 0 && (
            <div className="mt-14 text-center">
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-3 border border-foreground/30 px-8 py-3.5 text-xs uppercase tracking-[0.22em] text-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer"
              >
                Explore Complete Portfolio Archive ({studies.length}+ Works) <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 05 — FEATURED PROJECT STORY (Magazine Spread)
          ========================================================================= */}
      {flagshipProject && (
        <section className="border-t border-border bg-card/20 py-16 sm:py-24">
          <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 aspect-[16/10] overflow-hidden bg-stone">
                <DriveImage
                  src={flagshipProject.hero_image}
                  alt={flagshipProject.title}
                  className="size-full object-cover transition-transform duration-700 hover:scale-105"
                  wrapperClassName="size-full"
                />
              </div>

              <div className="lg:col-span-5 space-y-5">
                <p className="eyebrow">EDITORIAL SPOTLIGHT</p>
                <h3 className="font-display text-2xl sm:text-4xl font-light text-foreground tracking-tight leading-[1.15]">
                  {flagshipProject.title}
                </h3>
                {flagshipProject.subtitle && (
                  <p className="font-editorial text-base sm:text-lg italic text-foreground/85 font-light">
                    {flagshipProject.subtitle}
                  </p>
                )}
                <p className="text-sm leading-relaxed text-muted-foreground font-light">
                  {flagshipProject.summary ||
                    "A sequence of flowing spatial chambers defined by vein-matched Roman travertine portals and custom cast brass pull handles."}
                </p>

                <div className="pt-2 flex flex-wrap gap-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  <span>Typology: {flagshipProject.space_type}</span>
                  <span>·</span>
                  <span>Location: {flagshipProject.location}</span>
                </div>

                <div className="pt-4">
                  <Link
                    to="/portfolio/$slug"
                    params={{ slug: flagshipProject.slug }}
                    className="inline-flex items-center gap-2.5 bg-foreground px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-background hover:bg-accent hover:text-accent-foreground transition-colors font-medium cursor-pointer"
                  >
                    <span>View Case Study</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 06 — SERVICES (Database-Driven)
          ========================================================================= */}
      {services.length > 0 && (
        <section className="py-16 sm:py-24 bg-background border-t border-border">
          <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
            <div className="flex flex-wrap items-end justify-between gap-6 pb-10 border-b border-border">
              <div>
                <p className="eyebrow">PRACTICE DISCIPLINES</p>
                <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground tracking-tight">
                  Disciplines & Scope of Practice
                </h2>
              </div>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground hover:text-accent font-semibold transition-colors"
              >
                Full Service Overview <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="pt-10">
              <EditorialServicesSection services={services} />
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 07 — PROCESS / METHODOLOGY (Database-Driven)
          ========================================================================= */}
      {processSteps.length > 0 && (
        <section className="border-t border-border bg-card/30 py-16 sm:py-24">
          <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
            <div className="max-w-2xl pb-10">
              <p className="eyebrow">METHODOLOGY</p>
              <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground tracking-tight">
                Our 5-Stage Architectural Process
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                From initial laser site survey through to final white-glove handover, our structured
                methodology eliminates ambiguity.
              </p>
            </div>

            <ProcessTimeline steps={processSteps} />
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 07.5 — ARCHITECTURAL CINEMA & VIDEO DISPATCH (Google Drive)
          ========================================================================= */}
      <ArchitecturalFilmsSection />

      {/* =========================================================================
          SECTION 08 — MATERIAL / DETAIL STORY (Tactile Curation from DB)
          ========================================================================= */}
      {materials.length > 0 && (
        <section className="border-t border-border bg-background py-16 sm:py-24">
          <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-border">
              <div>
                <p className="eyebrow">MATERIALITY & CRAFT</p>
                <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground tracking-tight">
                  Tactile Material Provenance
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md font-light">
                Every stone slab, timber flitch, and patinated metal profile is selected directly from quarries and mills.
              </p>
            </div>

            <div className="pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {materials.map((m, idx) => (
                <div
                  key={m._id || idx}
                  className="group border border-border/80 bg-card/60 rounded-sm overflow-hidden hover:border-accent/60 transition-all duration-500 hover:shadow-xl hover:shadow-black/5"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-stone relative">
                    <DriveImage
                      src={m.image}
                      alt={m.name}
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                      wrapperClassName="size-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {m.projectTitle && (
                      <span className="absolute bottom-3 left-3 z-10 rounded bg-black/70 backdrop-blur-sm px-2.5 py-1 text-[10px] uppercase tracking-wider text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {m.projectTitle}
                      </span>
                    )}
                  </div>
                  <div className="p-6 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-accent font-mono font-medium">
                      <span>{m.category}</span>
                      <span className="text-muted-foreground/80 font-normal">{m.provenance}</span>
                    </div>
                    <h4 className="font-display text-xl text-foreground font-light group-hover:text-accent transition-colors">
                      {m.name}
                    </h4>
                    <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed font-light line-clamp-3">
                      {m.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 09 — BEFORE / AFTER TRANSFORMATION
          ========================================================================= */}
      {studies[2]?.hero_image && studies[0]?.hero_image && (
        <section className="border-t border-border bg-card/20 py-16 sm:py-24">
          <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
            <div className="max-w-2xl pb-10">
              <p className="eyebrow">TRANSFORMATION</p>
              <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground tracking-tight">
                From Bare Shell to Architectural Sanctuary
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                Slide the divider below to inspect the transformation of The Shah Residence living pavilion.
              </p>
            </div>

            <BeforeAfterSlider
              beforeUrl={studies[2].hero_image}
              afterUrl={studies[0].hero_image}
              beforeLabel="BEFORE EXECUTION"
              afterLabel="COMPLETED SANCTUARY"
              caption="The Shah Residence, Ahmedabad · 6,400 sq ft transformation"
              aspectRatio="aspect-[16/9] sm:aspect-[21/10]"
            />
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 10 — ABOUT THE STUDIO / PHILOSOPHY
          ========================================================================= */}
      <section className="border-t border-border bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="border-t border-accent/60 pt-6 space-y-3">
              <span className="font-mono text-xs text-accent font-semibold">01 / HONEST MATERIALS</span>
              <h4 className="font-display text-xl text-foreground font-light">Stone, Timber & Lime</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                We select genuine materials that age with grace. Vein-cut Roman travertine, fumed European oak,
                and patinated architectural bronze.
              </p>
            </div>

            <div className="border-t border-accent/60 pt-6 space-y-3">
              <span className="font-mono text-xs text-accent font-semibold">02 / LIGHT & VOLUME</span>
              <h4 className="font-display text-xl text-foreground font-light">Daylight as Structure</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                Every space is shaped around natural illumination vectors and low-glare 2400K–2700K ambient
                luminaire layers for evening calm.
              </p>
            </div>

            <div className="border-t border-accent/60 pt-6 space-y-3">
              <span className="font-mono text-xs text-accent font-semibold">03 / TURNKEY RIGOR</span>
              <h4 className="font-display text-xl text-foreground font-light">End-to-End Custody</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                From structural drawings to bespoke furniture fabrication and white-glove styling, our single-source
                governance guarantees zero friction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11 — CLIENT PERSPECTIVES (Only when approved in DB)
          ========================================================================= */}
      {testimonials.length > 0 && (
        <section className="border-t border-border bg-card/30 py-16 sm:py-20">
          <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
            <p className="eyebrow text-center mb-10">CLIENT PERSPECTIVES</p>

            <div className="grid gap-10 md:grid-cols-2 max-w-4xl mx-auto">
              {testimonials.map((t, idx) => (
                <div
                  key={t._id || idx}
                  className="flex flex-col justify-between border-l border-accent/70 pl-6 py-2"
                >
                  <p className="font-editorial text-lg sm:text-xl font-light italic text-foreground leading-relaxed">
                    “{t.text}”
                  </p>
                  <div className="mt-6">
                    <p className="font-display text-sm text-foreground">{t.clientName}</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                      {t.project} · {t.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}



      {/* =========================================================================
          SECTION 13 — PHOTO VAULT / CURATED STRIP (Owner-Selected Google Drive Media)
          ========================================================================= */}
      <InstagramFeedSection photos={data?.homepageMedia} />

      {/* =========================================================================
          SECTION 14 — CONSULTATION INQUIRY (Real API Endpoint)
          ========================================================================= */}
      <section id="consultation" className="bg-card/70 py-16 sm:py-24 border-t border-border">
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow">START A CONVERSATION</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-light text-foreground tracking-tight">
              LET'S TALK ABOUT YOUR SPACE.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground font-light">
              Tell us about your space. Every brief is reviewed by our senior design partners within two
              business days.
            </p>
          </div>

          <ConsultationForm />
        </div>
      </section>

      {/* Lightbox Modal for Fullscreen Photo Exploration */}
      <PhotoLightboxModal
        photo={activeLightboxPhoto}
        photosList={[]}
        isOpen={!!activeLightboxPhoto}
        onClose={() => setActiveLightboxPhoto(null)}
        onSelectPhoto={(photo) => setActiveLightboxPhoto(photo)}
      />
    </PublicShell>
  );
}

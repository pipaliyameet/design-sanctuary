import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Maximize2, Compass, Layers, Sparkles, MapPin } from "lucide-react";
import { getHomeContent, FALLBACK_CASE_STUDIES, type CaseCard } from "@/lib/public.functions";
import { PublicShell } from "@/components/site/PublicShell";
import { EditorialProjectGrid, ProjectCard } from "@/components/site/CaseCardGrid";
import { EditorialServicesSection } from "@/components/site/EditorialServices";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { ConsultationForm } from "@/components/site/ConsultationForm";
import { InstagramFeedSection } from "@/components/site/InstagramFeedSection";
import { GOOGLE_DRIVE_PHOTOS, type GoogleDrivePhoto } from "@/lib/google-drive-photos";
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
      { title: "Atelier Vermilion — Architecture & Interior Design Studio" },
      {
        name: "description",
        content:
          "Spaces shaped by light, material and everyday life. Atelier Vermilion crafts bespoke residential, commercial and turnkey interiors across India detailed around daylight, stone and quiet craft.",
      },
      { property: "og:title", content: "Atelier Vermilion — Interior Architecture Studio" },
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
        <h1 className="text-3xl font-display font-light">Atelier Vermilion</h1>
        <p className="mt-3 text-sm text-muted-foreground font-light">
          Refreshing studio parameters. Please reload to view our portfolio.
        </p>
      </div>
    </PublicShell>
  ),
});

const TESTIMONIALS = [
  {
    text: "The team transformed our home into something that feels completely ours. Natural light now reaches corners we never knew existed, and every piece of stone feels deliberate.",
    client: "Rajesh & Priya Shah",
    project: "The Shah Residence",
    location: "Sindhu Bhavan, Ahmedabad",
  },
  {
    text: "As an art collector, I needed museum-grade acoustic calm and precise lighting. The studio’s turnkey discipline meant zero friction during the entire build.",
    client: "Sameer Nambiar",
    project: "Koramangala Penthouse",
    location: "Bengaluru",
  },
];

const CATEGORY_FILTERS = ["ALL", "RESIDENTIAL", "COMMERCIAL", "PENTHOUSE", "VILLA"] as const;

function HomePage() {
  const { data } = useSuspenseQuery(homeQuery);
  const studies: CaseCard[] = data?.studies && data.studies.length > 0 ? data.studies : FALLBACK_CASE_STUDIES;
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<GoogleDrivePhoto | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

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

  // Featured flagship story project (Altamount Penthouse or first project)
  const flagshipProject = studies[0] || FALLBACK_CASE_STUDIES[0];

  return (
    <PublicShell overlayHeader>
      {/* =========================================================================
          SECTION 01 — HERO (75–95vh Desktop, 65–80vh Mobile)
          ========================================================================= */}
      <section className="relative isolate min-h-[78vh] sm:min-h-[88vh] lg:min-h-[92vh] overflow-hidden flex flex-col justify-end pt-20">
        {/* Hero Architectural Photography */}
        <DriveImage
          src={GOOGLE_DRIVE_PHOTOS[10]?.url || "https://lh3.googleusercontent.com/d/1rd1eUwEnOsj4rWR5J5Hf6uCrX5FhTMQQ"}
          driveId={GOOGLE_DRIVE_PHOTOS[10]?.id}
          fallbackUrls={[GOOGLE_DRIVE_PHOTOS[10]?.thumbnailUrl || ""]}
          alt="Architectural sunlit interior in honed travertine and fumed oak"
          className="absolute inset-0 size-full object-cover slow-zoom brightness-[0.85]"
          wrapperClassName="absolute inset-0 size-full cursor-pointer"
          onOpenZoom={() => setActiveLightboxPhoto(GOOGLE_DRIVE_PHOTOS[10] || null)}
        />

        {/* Subtle Ambient Gradients (No heavy contrast obscuring image) */}
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
              Bespoke residential, commercial and turnkey interiors across India. Detailed around
              daylight, natural stone and quiet craft.
            </p>

            {/* CTAs */}
            <div className="reveal mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/portfolio"
                className="group inline-flex items-center gap-2.5 bg-accent px-7 py-3.5 text-xs font-semibold tracking-[0.2em] text-accent-foreground uppercase transition-all duration-300 hover:bg-ink-foreground hover:text-ink cursor-pointer"
              >
                <span>Explore Projects</span>
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
          SECTION 02 — STUDIO INTRO
          ========================================================================= */}
      <section className="py-16 sm:py-24 bg-card/30 border-b border-border">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <p className="eyebrow">ABOUT THE STUDIO</p>
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
                  <span>Explore Studio Philosophy</span>
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

            {/* Right Studio Photography */}
            <div
              onClick={() => setActiveLightboxPhoto(GOOGLE_DRIVE_PHOTOS[6] || null)}
              className="group relative lg:col-span-5 overflow-hidden bg-stone aspect-[4/5] border border-border cursor-pointer select-none"
            >
              <DriveImage
                src={GOOGLE_DRIVE_PHOTOS[6]?.url}
                driveId={GOOGLE_DRIVE_PHOTOS[6]?.id}
                fallbackUrls={[GOOGLE_DRIVE_PHOTOS[6]?.thumbnailUrl || ""]}
                alt="Atelier Vermilion studio atmosphere with drawings, stone samples and models"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                wrapperClassName="size-full"
              />
              <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="flex items-center gap-1.5 rounded-full bg-ink/80 px-3.5 py-1.5 text-xs text-ink-foreground backdrop-blur-md">
                  <Maximize2 className="size-3.5 text-accent" />
                  <span>Inspect Studio Atmosphere</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 03 — SELECTED PROJECTS (Visual Backbone & Editorial Grid)
          ========================================================================= */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-border">
            <div>
              <p className="eyebrow">SELECTED WORK</p>
              <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground tracking-tight">
                Featured Architectural Commissions
              </h2>
            </div>

            {/* Lightweight Category Filter Tabs */}
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-1">
              {CATEGORY_FILTERS.map((cat) => {
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
          </div>

          {/* Predictable Editorial Grid with 0 Unwanted Vertical Whitespace */}
          <div className="pt-12">
            <EditorialProjectGrid projects={filteredProjects.slice(0, 6)} />
          </div>

          <div className="mt-14 text-center">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-3 border border-foreground/30 px-8 py-3.5 text-xs uppercase tracking-[0.22em] text-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer"
            >
              Explore Complete Portfolio Archive ({studies.length}+ Works) <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 04 — SERVICES / DISCIPLINES
          ========================================================================= */}
      <section className="py-16 sm:py-24 bg-card/20 border-t border-border">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
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
            <EditorialServicesSection />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 05 — PROCESS / METHODOLOGY
          ========================================================================= */}
      <section className="border-t border-border bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="max-w-2xl pb-10">
            <p className="eyebrow">METHODOLOGY</p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground tracking-tight">
              Our 5-Stage Architectural Process
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
              From initial laser site survey through to final white-glove handover, our disciplined
              workflow ensures predictable execution and zero ambiguity.
            </p>
          </div>

          <ProcessTimeline />
        </div>
      </section>

      {/* =========================================================================
          SECTION 06 — BEFORE / AFTER TRANSFORMATION
          ========================================================================= */}
      <section className="border-t border-border bg-card/30 py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
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
            beforeUrl={GOOGLE_DRIVE_PHOTOS[13]?.url || GOOGLE_DRIVE_PHOTOS[12]?.url}
            afterUrl={GOOGLE_DRIVE_PHOTOS[8]?.url}
            beforeLabel="BEFORE EXECUTION"
            afterLabel="COMPLETED SANCTUARY"
            caption="The Shah Residence, Ahmedabad · 6,400 sq ft transformation"
            aspectRatio="aspect-[16/9] sm:aspect-[21/10]"
          />
        </div>
      </section>

      {/* =========================================================================
          SECTION 07 — FEATURED EDITORIAL STORY (Magazine Spread)
          ========================================================================= */}
      {flagshipProject && (
        <section className="border-t border-border bg-background py-16 sm:py-24">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Cinematic Visual Frame */}
              <div className="lg:col-span-7 aspect-[16/10] overflow-hidden bg-stone">
                <DriveImage
                  src={flagshipProject.hero_image || GOOGLE_DRIVE_PHOTOS[0]?.url}
                  alt={flagshipProject.title}
                  className="size-full object-cover transition-transform duration-700 hover:scale-105"
                  wrapperClassName="size-full"
                />
              </div>

              {/* Story Column */}
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
                    <span>Read Monograph</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 08 — ABOUT THE STUDIO / PHILOSOPHY
          ========================================================================= */}
      <section className="border-t border-border bg-card/30 py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
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
          SECTION 09 — CLIENT PERSPECTIVES (TESTIMONIALS)
          ========================================================================= */}
      <section className="border-t border-border bg-secondary/30 py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="eyebrow text-center mb-10">CLIENT PERSPECTIVES</p>

          <div className="grid gap-10 md:grid-cols-2 max-w-4xl mx-auto">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between border-l border-accent/70 pl-6 py-2"
              >
                <p className="font-editorial text-lg sm:text-xl font-light italic text-foreground leading-relaxed">
                  “{t.text}”
                </p>
                <div className="mt-6">
                  <p className="font-display text-sm text-foreground">{t.client}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    {t.project} · {t.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10 — PHOTO VAULT / INSTAGRAM FEED
          ========================================================================= */}
      <InstagramFeedSection />

      {/* =========================================================================
          SECTION 11 — FINAL CTA / CONSULTATION INQUIRY
          ========================================================================= */}
      <section id="consultation" className="bg-card/70 py-16 sm:py-24 border-t border-border">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow">START A CONVERSATION</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-light text-foreground tracking-tight">
              LET'S CREATE SOMETHING CONSIDERED.
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
        photosList={GOOGLE_DRIVE_PHOTOS}
        isOpen={!!activeLightboxPhoto}
        onClose={() => setActiveLightboxPhoto(null)}
        onSelectPhoto={(photo) => setActiveLightboxPhoto(photo)}
      />
    </PublicShell>
  );
}

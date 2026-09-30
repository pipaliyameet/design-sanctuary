import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Maximize2 } from "lucide-react";
import { getHomeContent, FALLBACK_CASE_STUDIES } from "@/lib/public.functions";
import { PublicShell } from "@/components/site/PublicShell";
import { EditorialProjectGrid } from "@/components/site/CaseCardGrid";
import { EditorialServicesSection } from "@/components/site/EditorialServices";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { ConsultationForm } from "@/components/site/ConsultationForm";
import { InstagramFeedSection } from "@/components/site/InstagramFeedSection";
import { GOOGLE_DRIVE_PHOTOS, type GoogleDrivePhoto } from "@/lib/google-drive-photos";
import { DriveImage } from "@/components/site/DriveImage";
import { PhotoLightboxModal } from "@/components/site/PhotoLightboxModal";

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
          "Spaces designed with intention. Atelier Vermilion crafts bespoke residential, commercial and turnkey interiors across India detailed around daylight, stone and quiet craft.",
      },
      { property: "og:title", content: "Atelier Vermilion — Interior Architecture Studio" },
      {
        property: "og:description",
        content:
          "Spaces designed with intention. Residential and commercial interiors crafted from concept to execution.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => (
    <PublicShell>
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-3xl font-display">Atelier Vermilion</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Refreshing studio parameters. Please reload to view our portfolio.
        </p>
      </div>
    </PublicShell>
  ),
});

const TESTIMONIALS = [
  {
    text: "The team transformed our home into something that feels completely ours. Natural light now reaches corners we never knew existed.",
    client: "Rajesh & Priya Shah",
    project: "The Shah Residence",
    location: "Ahmedabad",
  },
  {
    text: "As an art collector, I needed museum-grade acoustic calm and precise lighting. The studio’s turnkey discipline meant zero friction during the entire build.",
    client: "Sameer Nambiar",
    project: "Koramangala Penthouse",
    location: "Bengaluru",
  },
];

function HomePage() {
  const { data } = useSuspenseQuery(homeQuery);
  const studies = data?.studies && data.studies.length > 0 ? data.studies : FALLBACK_CASE_STUDIES;
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<GoogleDrivePhoto | null>(null);

  return (
    <PublicShell overlayHeader>
      {/* 1. HERO SECTION (Requirement 7) */}
      <section className="relative isolate min-h-[85vh] sm:min-h-[92vh] overflow-hidden flex flex-col justify-end pt-24">
        {/* Background Architectural Photography */}
        <DriveImage
          src={GOOGLE_DRIVE_PHOTOS[10]?.url || "https://lh3.googleusercontent.com/d/1rd1eUwEnOsj4rWR5J5Hf6uCrX5FhTMQQ"}
          driveId={GOOGLE_DRIVE_PHOTOS[10]?.id}
          fallbackUrls={[GOOGLE_DRIVE_PHOTOS[10]?.thumbnailUrl || ""]}
          alt="Architectural sunlit interior in honed travertine and fumed oak"
          className="absolute inset-0 size-full object-cover slow-zoom brightness-[0.88]"
          wrapperClassName="absolute inset-0 size-full cursor-pointer"
          onOpenZoom={() => setActiveLightboxPhoto(GOOGLE_DRIVE_PHOTOS[10] || null)}
        />

        {/* Ambient Architectural Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/20 to-transparent" />

        {/* Hero Content Box with generous negative space */}
        <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-12 sm:px-8 sm:pb-16">
          <div className="max-w-3xl">
            {/* Small eyebrow */}
            <p className="eyebrow text-ink-foreground/80 flex items-center gap-2 mb-3">
              <span className="inline-block size-1.5 rounded-full bg-accent" />
              Architecture & Interior Design
            </p>

            {/* Headline */}
            <h1 className="reveal font-display text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-ink-foreground tracking-tight font-light leading-[1.08]">
              Spaces designed with{" "}
              <span className="italic font-normal text-accent">intention.</span>
            </h1>

            {/* Supporting statement */}
            <p className="reveal mt-4 max-w-xl text-sm sm:text-base lg:text-lg leading-relaxed text-ink-foreground/85 font-light">
              Residential and commercial interiors crafted from concept to execution. Detailed
              around daylight, stone and quiet craft.
            </p>

            {/* CTAs */}
            <div className="reveal mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/portfolio"
                className="group inline-flex items-center gap-2.5 bg-accent px-7 py-3.5 text-xs font-semibold tracking-[0.2em] text-accent-foreground uppercase transition-all duration-300 hover:bg-ink-foreground hover:text-ink"
              >
                <span>Explore Projects</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                hash="consultation"
                className="inline-flex items-center gap-2 border border-ink-foreground/40 bg-ink/20 backdrop-blur-md px-6 py-3.5 text-xs font-medium tracking-[0.18em] text-ink-foreground uppercase transition-colors hover:border-accent hover:text-accent"
              >
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Metadata Ribbon */}
        <div className="relative border-t border-ink-foreground/15 bg-ink/65 backdrop-blur-md py-3 text-ink-foreground/75 text-[11px] sm:text-xs">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <span>Mumbai · Bengaluru · Pan India</span>
              <span>·</span>
              <span>12+ Years Practice</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <span>28+ Architectural Commissions</span>
              <span>·</span>
              <span>Single-Source Accountability</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SELECTED PROJECTS (Requirement 10) */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 pb-10 border-b border-border">
            <div>
              <p className="eyebrow">SELECTED WORKS</p>
              <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground">
                Featured Architectural Projects
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground hover:text-accent font-semibold transition-colors"
            >
              View Full Portfolio ({studies.length}) <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="pt-12">
            <EditorialProjectGrid projects={studies.slice(0, 6)} />
          </div>

          <div className="mt-14 text-center">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-3 border border-foreground/30 px-8 py-3.5 text-xs uppercase tracking-[0.22em] text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Explore Complete Archive ({studies.length}+ Works) <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. STUDIO INTRODUCTION (Requirement 16) */}
      <section className="border-t border-border bg-card/30 py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <p className="eyebrow">ABOUT THE STUDIO</p>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-light text-foreground leading-[1.15]">
                We create interiors that balance{" "}
                <span className="italic text-accent font-normal">
                  material, proportion, light and life.
                </span>
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-light max-w-2xl">
                Every project we undertake starts by stripping away the non-essential. We avoid
                ephemeral trends and disposable finishes in pursuit of spaces that breathe: natural
                stone with tactile depth, hand-plastered surfaces that catch the changing sun, and
                bespoke millwork resolved with millimeter precision.
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-light max-w-2xl">
                Operating across Mumbai and Bengaluru, our practice provides full turnkey accountability
                from measured drawing sets to final white-glove styling.
              </p>

              <div>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground hover:text-accent font-semibold border-b border-foreground/40 pb-1"
                >
                  Discover Our Studio <ArrowRight className="size-3" />
                </Link>
              </div>

              {/* Subtle architectural statistics (NOT SaaS cards) */}
              <div className="pt-8 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-light text-foreground">
                    28+
                  </span>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    Projects
                  </p>
                </div>
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-light text-foreground">
                    12+
                  </span>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    Years
                  </p>
                </div>
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-light text-foreground">
                    04
                  </span>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    Disciplines
                  </p>
                </div>
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-light text-foreground">
                    11
                  </span>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    Cities
                  </p>
                </div>
              </div>
            </div>

            {/* Right Studio Photography */}
            <div
              onClick={() => setActiveLightboxPhoto(GOOGLE_DRIVE_PHOTOS[6] || null)}
              className="group relative lg:col-span-5 overflow-hidden bg-secondary/30 aspect-[4/5] border border-border cursor-pointer"
            >
              <DriveImage
                src={GOOGLE_DRIVE_PHOTOS[6]?.url}
                driveId={GOOGLE_DRIVE_PHOTOS[6]?.id}
                fallbackUrls={[GOOGLE_DRIVE_PHOTOS[6]?.thumbnailUrl || ""]}
                alt="Atelier Vermilion studio atmosphere with drawings, stone samples and models"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                wrapperClassName="size-full"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="flex items-center gap-1.5 rounded-full bg-black/80 px-3.5 py-1.5 text-xs text-white backdrop-blur-md">
                  <Maximize2 className="size-3.5 text-accent" />
                  <span>Inspect Studio Detail</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SERVICES (Requirement 17 - 6 Clean Categories) */}
      <section className="py-16 sm:py-24 bg-background border-t border-border">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 pb-10 border-b border-border">
            <div>
              <p className="eyebrow">PRACTICE DISCIPLINES</p>
              <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground">
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

      {/* 5. PROCESS (Requirement 18 - 5 Stages, No Duplicates) */}
      <section className="border-t border-border bg-card/40 py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="max-w-2xl pb-10">
            <p className="eyebrow">METHODOLOGY</p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground">
              Our 5-Stage Architectural Process
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              From site survey through to final white-glove styling, our structured methodology
              eliminates ambiguity.
            </p>
          </div>

          <ProcessTimeline />
        </div>
      </section>

      {/* 6. BEFORE / AFTER (Requirement 19) */}
      <section className="border-t border-border bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="max-w-2xl pb-10">
            <p className="eyebrow">TRANSFORMATION</p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground">
              From Shell to Sanctuary
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Drag the divider below to inspect the transformation of The Shah Residence living pavilion.
            </p>
          </div>

          <BeforeAfterSlider
            beforeUrl={GOOGLE_DRIVE_PHOTOS[13]?.url || GOOGLE_DRIVE_PHOTOS[12]?.url}
            afterUrl={GOOGLE_DRIVE_PHOTOS[8]?.url}
            beforeLabel="BEFORE"
            afterLabel="AFTER"
            caption="The Shah Residence, Ahmedabad · 6,400 sq ft transformation"
            aspectRatio="aspect-[16/9] sm:aspect-[21/10]"
          />
        </div>
      </section>

      {/* 7. TESTIMONIALS (Requirement 21 - Minimalist Quotes, No Fake Stars) */}
      <section className="border-t border-border bg-secondary/30 py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="eyebrow text-center mb-10">CLIENT PERSPECTIVES</p>

          <div className="grid gap-10 md:grid-cols-2 max-w-4xl mx-auto">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between border-l border-accent/60 pl-6 py-2"
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

      {/* 8. STUDIO JOURNAL / INSTAGRAM (Requirement 22) */}
      <InstagramFeedSection />

      {/* 9. CONSULTATION & INQUIRY (Requirement 23) */}
      <section id="consultation" className="bg-card/70 py-16 sm:py-24 border-t border-border">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow">START A CONVERSATION</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-light text-foreground tracking-tight">
              LET'S CREATE SOMETHING BEAUTIFUL.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Tell us about your space. Every brief is reviewed by our senior design partners within two
              business days.
            </p>
          </div>

          <ConsultationForm />
        </div>
      </section>

      {/* Lightbox Modal */}
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


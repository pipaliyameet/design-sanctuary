import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Compass, Sparkles, Layers, Clock, MapPin } from "lucide-react";
import { getCaseStudy, type FullCaseStudy, type CaseCard } from "@/lib/public.functions";
import { PublicShell } from "@/components/site/PublicShell";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { CaseCardItem } from "@/components/site/CaseCardGrid";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";
import { DriveImage } from "@/components/site/DriveImage";

const studyQuery = (slug: string) =>
  queryOptions({
    queryKey: ["case-study", slug],
    queryFn: () => getCaseStudy({ data: { slug } }),
  });

export const Route = createFileRoute("/portfolio/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(studyQuery(params.slug));
    if (!result || !result.study) throw notFound();
    return result;
  },
  component: CaseStudyDetailPage,
  head: ({ loaderData }) => {
    const study = loaderData?.study;
    if (!study) return {};
    const title = study.seo_title ?? `${study.title} — Atelier Vermilion`;
    const description =
      study.seo_description ??
      study.summary ??
      "An architectural interior design commission by Atelier Vermilion.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: study.title,
            description,
            locationCreated: study.location,
            dateCreated: study.year ? String(study.year) : undefined,
            creator: { "@type": "Organization", name: "Atelier Vermilion" },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicShell>
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="text-3xl font-display">Project Not Found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This project may be private or unreleased. Return to our portfolio to explore completed
          commissions.
        </p>
        <div className="mt-8">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background"
          >
            <ArrowLeft className="size-3.5" /> Back to All Projects
          </Link>
        </div>
      </div>
    </PublicShell>
  ),
});

function CaseStudyDetailPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(studyQuery(slug));
  const study = data.study as FullCaseStudy;
  const related = data.related ?? [];
  const prev = (data as unknown as { prev?: CaseCard }).prev;
  const next = (data as unknown as { next?: CaseCard }).next;

  return (
    <PublicShell overlayHeader>
      {/* 1. CINEMATIC HERO BANNER */}
      <section className="relative isolate min-h-[85vh] sm:min-h-[92vh] overflow-hidden flex flex-col justify-end pt-24">
        <DriveImage
          src={study.hero_image || GOOGLE_DRIVE_PHOTOS[0]?.url}
          alt={study.title}
          className="absolute inset-0 size-full object-cover brightness-[0.88] slow-zoom"
          wrapperClassName="absolute inset-0 size-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />

        <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-12 sm:px-8 sm:pb-20">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-foreground/75 hover:text-accent mb-4 transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Projects Archive
          </Link>

          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-accent font-medium mb-2.5">
              <span>{study.space_type}</span>
              <span>·</span>
              <span>{study.location}</span>
              <span>·</span>
              <span>{study.year}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-ink-foreground font-light tracking-tight leading-[1.06]">
              {study.title}
            </h1>

            {study.subtitle && (
              <p className="mt-3 text-base sm:text-lg text-ink-foreground/85 font-light font-editorial italic">
                {study.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Floating Quick Metadata Strip */}
        <div className="relative border-t border-ink-foreground/15 bg-ink/60 backdrop-blur-md py-3 text-xs text-ink-foreground/80">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-accent" /> {study.location}
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">
                Area: {study.area_sqft?.toLocaleString()} Sq Ft
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span>Timeline: {study.timeline || "12 months"}</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">Turnkey Handover</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROJECT NARRATIVE & SPECIFICATIONS */}
      <section className="bg-background py-16 sm:py-24 border-b border-border">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <p className="eyebrow">The Concept & Context</p>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl text-foreground font-light leading-snug">
                  {study.summary}
                </h2>
              </div>

              {study.brief && (
                <div className="border-l-2 border-accent pl-5 py-1">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5">
                    Client Brief
                  </h3>
                  <p className="text-base leading-relaxed text-foreground font-light font-editorial italic">
                    “{study.brief}”
                  </p>
                </div>
              )}

              {study.solution && (
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest text-foreground font-semibold">
                    Architectural Solution & Methodology
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground font-light">
                    {study.solution}
                  </p>
                </div>
              )}

              {/* Material Palette Tags */}
              {study.materials && study.materials.length > 0 && (
                <div className="pt-4 border-t border-border/60">
                  <p className="text-xs uppercase tracking-widest text-foreground font-semibold mb-3 flex items-center gap-2">
                    <Layers className="size-3.5 text-accent" /> Primary Material Palette
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {study.materials.map((m) => (
                      <span
                        key={m}
                        className="border border-border/80 bg-secondary/30 px-3 py-1 text-xs text-foreground/90"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Project Factsheet */}
            <div className="lg:col-span-5">
              <div className="border border-border bg-card/40 p-6 sm:p-8 space-y-5">
                <h3 className="font-display text-lg sm:text-xl text-foreground pb-3 border-b border-border">
                  Project Dossier
                </h3>

                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                  <div>
                    <span className="eyebrow block mb-1">Typology</span>
                    <span className="text-foreground font-medium">{study.space_type}</span>
                  </div>

                  <div>
                    <span className="eyebrow block mb-1">Location</span>
                    <span className="text-foreground font-medium">{study.location}</span>
                  </div>

                  <div>
                    <span className="eyebrow block mb-1">Built Area</span>
                    <span className="text-foreground font-medium">
                      {study.area_sqft?.toLocaleString()} Sq Ft
                    </span>
                  </div>

                  <div>
                    <span className="eyebrow block mb-1">Completion</span>
                    <span className="text-foreground font-medium">{study.year}</span>
                  </div>

                  <div>
                    <span className="eyebrow block mb-1">Execution Period</span>
                    <span className="text-foreground font-medium">{study.timeline}</span>
                  </div>

                  <div>
                    <span className="eyebrow block mb-1">Architectural Style</span>
                    <span className="text-foreground font-medium">{study.style}</span>
                  </div>
                </div>

                {study.scope && study.scope.length > 0 && (
                  <div className="pt-3 border-t border-border/60">
                    <span className="eyebrow block mb-2">Scope of Commission</span>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {study.scope.map((s, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="size-1 rounded-full bg-accent" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {study.credits && (
                  <div className="pt-3 border-t border-border/60">
                    <span className="eyebrow block mb-2">Project Credits</span>
                    <div className="space-y-1 text-xs">
                      {Object.entries(study.credits).map(([role, name]) => (
                        <div key={role} className="flex justify-between text-muted-foreground">
                          <span>{role}:</span>
                          <span className="text-foreground font-medium">{String(name)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE BEFORE & AFTER SLIDER (IF AVAILABLE) */}
      {study.before_after && (
        <section className="bg-secondary/20 py-16 sm:py-20 border-b border-border">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
            <div className="max-w-2xl pb-6">
              <p className="eyebrow">Site Metamorphosis</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-display font-light text-foreground">
                Before & After Documentation
              </h2>
            </div>
            <BeforeAfterSlider
              beforeUrl={study.before_after.beforeUrl}
              afterUrl={study.before_after.afterUrl}
              beforeLabel={study.before_after.beforeLabel}
              afterLabel={study.before_after.afterLabel}
              caption={study.before_after.caption}
              aspectRatio="aspect-[16/9] sm:aspect-[21/9]"
            />
          </div>
        </section>
      )}

      {/* 4. ROOM-BY-ROOM DETAILED VISUAL STORYTELLING (Diverse Aspect Ratios) */}
      {study.rooms && study.rooms.length > 0 ? (
        <section className="py-16 sm:py-24 bg-background space-y-20">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
            <p className="eyebrow">Spatial Journey</p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground">
              Room-by-Room Detailing
            </h2>
          </div>

          {study.rooms.map((roomSection, idx) => (
            <div key={idx} className="mx-auto max-w-[1400px] px-5 sm:px-8 space-y-6">
              <div className="border-t border-border pt-6 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
                <div>
                  <span className="eyebrow text-accent font-medium">Zone 0{idx + 1}</span>
                  <h3 className="font-display text-2xl sm:text-3xl text-foreground mt-1 font-light">
                    {roomSection.title}
                  </h3>
                </div>
                <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-muted-foreground font-light">
                  {roomSection.description}
                </p>
              </div>

              {/* Multi-aspect ratio gallery with 16px-24px image spacing */}
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                {(roomSection.images ?? []).map((img: any, imgIdx: number) => {
                  const isPortrait = imgIdx % 2 === 1;
                  return (
                    <div key={imgIdx} className="group overflow-hidden bg-secondary/30">
                      <div
                        className={
                          isPortrait
                            ? "aspect-[4/5] overflow-hidden"
                            : "aspect-[16/11] sm:aspect-[4/3] overflow-hidden"
                        }
                      >
                        <DriveImage
                          src={img.url}
                          alt={img.alt}
                          className="arch-card-img size-full object-cover"
                          wrapperClassName="size-full"
                        />
                      </div>
                      {img.caption && (
                        <p className="mt-2.5 text-xs text-muted-foreground italic font-editorial tracking-wide">
                          {img.caption}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ) : (
        /* Fallback Gallery */
        study.gallery &&
        study.gallery.length > 0 && (
          <section className="py-16 sm:py-24 bg-background">
            <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
              <p className="eyebrow pb-6">Project Gallery</p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {study.gallery.map((g, idx) => (
                  <div key={idx} className="overflow-hidden bg-secondary/30 aspect-[4/3]">
                    <DriveImage
                      src={g.url}
                      alt={g.caption}
                      className="arch-card-img size-full object-cover"
                      wrapperClassName="size-full"
                    />
                    {g.caption && <p className="mt-2 text-xs text-muted-foreground">{g.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      )}

      {/* 5. PREVIOUS / NEXT PROJECT NAVIGATION (Sections 7 & 22 Requirements) */}
      <section className="border-t border-border bg-card/40 py-10 sm:py-14">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Previous Project Link */}
            {prev ? (
              <Link
                to="/portfolio/$slug"
                params={{ slug: prev.slug }}
                className="group flex items-center gap-3 text-left w-full sm:w-auto"
              >
                <ArrowLeft className="size-4 text-accent transition-transform group-hover:-translate-x-1 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">
                    Previous Project
                  </span>
                  <span className="font-display text-base sm:text-lg text-foreground group-hover:text-accent transition-colors font-light">
                    {prev.title}
                  </span>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {/* View All Projects Button */}
            <Link
              to="/portfolio"
              className="px-6 py-2.5 border border-border bg-background text-xs uppercase tracking-[0.2em] text-foreground hover:bg-foreground hover:text-background transition-colors text-center shrink-0 w-full sm:w-auto"
            >
              View All Projects
            </Link>

            {/* Next Project Link */}
            {next ? (
              <Link
                to="/portfolio/$slug"
                params={{ slug: next.slug }}
                className="group flex items-center justify-end gap-3 text-right w-full sm:w-auto"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">
                    Next Project
                  </span>
                  <span className="font-display text-base sm:text-lg text-foreground group-hover:text-accent transition-colors font-light">
                    {next.title}
                  </span>
                </div>
                <ArrowRight className="size-4 text-accent transition-transform group-hover:translate-x-1 shrink-0" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>

      {/* 6. CONSULTATION & SIMILAR COMMISSIONS CTA */}
      <section className="border-t border-border bg-ink text-ink-foreground py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <p className="eyebrow text-accent">Private Consultation</p>
              <h2 className="mt-2 font-display text-2xl sm:text-4xl font-light text-ink-foreground max-w-2xl">
                Interested in creating a residence of similar caliber?
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-ink-foreground/80 max-w-xl leading-relaxed font-light">
                We accept commissions at early architectural stages to align structural planning
                with interior atmosphere and bespoke millwork.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                hash="consultation"
                className="bg-accent px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Inquire About a Commission
              </Link>
              <Link
                to="/portfolio"
                className="border border-ink-foreground/30 px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-ink-foreground hover:border-accent hover:text-accent transition-colors"
              >
                Explore More Projects
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

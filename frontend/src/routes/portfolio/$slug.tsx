import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Compass, Sparkles, Layers, Clock, MapPin } from "lucide-react";
import { getCaseStudy, type FullCaseStudy } from "@/lib/public.functions";
import { PublicShell } from "@/components/site/PublicShell";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { CaseCardItem } from "@/components/site/CaseCardGrid";

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
          This project may be private or unreleased. Return to our portfolio to explore completed commissions.
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

  return (
    <PublicShell overlayHeader>
      {/* 1. CINEMATIC HERO BANNER */}
      <section className="relative isolate min-h-[90vh] overflow-hidden flex flex-col justify-end">
        <img
          src={study.hero_image ?? "/portfolio/hero.jpg"}
          alt={study.title}
          className="absolute inset-0 size-full object-cover brightness-[0.88] slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />

        <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-16 sm:px-8 sm:pb-24">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-foreground/75 hover:text-accent mb-6 transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Projects Archive
          </Link>

          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-accent font-medium mb-3">
              <span>{study.space_type}</span>
              <span>·</span>
              <span>{study.location}</span>
              <span>·</span>
              <span>{study.year}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-8xl text-ink-foreground font-light tracking-tight leading-[1.05]">
              {study.title}
            </h1>

            {study.subtitle && (
              <p className="mt-4 text-lg sm:text-xl text-ink-foreground/80 font-light font-editorial italic">
                {study.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Floating Quick Metadata Strip */}
        <div className="relative border-t border-ink-foreground/15 bg-ink/60 backdrop-blur-md py-4 text-xs text-ink-foreground/80">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-accent" /> {study.location}
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">Area: {study.area_sqft?.toLocaleString()} Sq Ft</span>
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
      <section className="bg-background py-20 sm:py-32 border-b border-border">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-12">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-12">
              <div>
                <p className="eyebrow">The Concept & Context</p>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl text-foreground font-light leading-snug">
                  {study.summary}
                </h2>
              </div>

              {study.brief && (
                <div className="border-l-2 border-accent pl-6 py-1">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">
                    Client Brief
                  </h3>
                  <p className="text-base sm:text-lg leading-relaxed text-foreground font-light font-editorial italic">
                    “{study.brief}”
                  </p>
                </div>
              )}

              {study.solution && (
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-foreground font-semibold">
                    Architectural Solution & Methodology
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-light">
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
                        className="border border-border/80 bg-secondary/30 px-3.5 py-1.5 text-xs text-foreground/90"
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
              <div className="border border-border bg-card/40 p-8 space-y-6">
                <h3 className="font-display text-xl text-foreground pb-4 border-b border-border">
                  Project Dossier
                </h3>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-xs">
                  <div>
                    <span className="eyebrow block mb-1">Typology</span>
                    <span className="text-foreground font-medium text-sm">{study.space_type}</span>
                  </div>

                  <div>
                    <span className="eyebrow block mb-1">Location</span>
                    <span className="text-foreground font-medium text-sm">{study.location}</span>
                  </div>

                  <div>
                    <span className="eyebrow block mb-1">Built Area</span>
                    <span className="text-foreground font-medium text-sm">
                      {study.area_sqft?.toLocaleString()} Sq Ft
                    </span>
                  </div>

                  <div>
                    <span className="eyebrow block mb-1">Completion</span>
                    <span className="text-foreground font-medium text-sm">{study.year}</span>
                  </div>

                  <div>
                    <span className="eyebrow block mb-1">Execution Period</span>
                    <span className="text-foreground font-medium text-sm">{study.timeline}</span>
                  </div>

                  <div>
                    <span className="eyebrow block mb-1">Architectural Style</span>
                    <span className="text-foreground font-medium text-sm">{study.style}</span>
                  </div>
                </div>

                {study.scope && study.scope.length > 0 && (
                  <div className="pt-4 border-t border-border/60">
                    <span className="eyebrow block mb-2.5">Scope of Commission</span>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {study.scope.map((s, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="size-1 rounded-full bg-accent" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {study.credits && (
                  <div className="pt-4 border-t border-border/60">
                    <span className="eyebrow block mb-2">Project Credits</span>
                    <div className="space-y-1.5 text-xs">
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
        <section className="bg-secondary/20 py-20 sm:py-28 border-b border-border">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
            <div className="max-w-2xl pb-8">
              <p className="eyebrow">Site Metamorphosis</p>
              <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground">
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

      {/* 4. ROOM-BY-ROOM DETAILED VISUAL STORYTELLING */}
      {study.rooms && study.rooms.length > 0 ? (
        <section className="py-24 sm:py-36 bg-background space-y-28">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
            <p className="eyebrow">Spatial Journey</p>
            <h2 className="mt-3 text-3xl sm:text-5xl font-display font-light text-foreground">
              Room-by-Room Detailing
            </h2>
          </div>

          {study.rooms.map((roomSection, idx) => (
            <div key={idx} className="mx-auto max-w-[1400px] px-5 sm:px-8 space-y-8">
              <div className="border-t border-border pt-8 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
                <div>
                  <span className="eyebrow text-accent font-medium">Zone 0{idx + 1}</span>
                  <h3 className="font-display text-2xl sm:text-4xl text-foreground mt-1">
                    {roomSection.title}
                  </h3>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground font-light">
                  {roomSection.description}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {roomSection.images.map((img, imgIdx) => (
                  <div key={imgIdx} className="group overflow-hidden bg-secondary/30">
                    <div className="aspect-[4/3] sm:aspect-[16/11] overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.alt}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                    {img.caption && (
                      <p className="mt-3 text-xs text-muted-foreground italic font-editorial tracking-wide">
                        {img.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : (
        /* Fallback Gallery if room sections not structured */
        study.gallery &&
        study.gallery.length > 0 && (
          <section className="py-24 sm:py-36 bg-background">
            <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
              <p className="eyebrow pb-8">Project Gallery</p>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {study.gallery.map((g, idx) => (
                  <div key={idx} className="overflow-hidden bg-secondary/30 aspect-[4/3]">
                    <img
                      src={g.url}
                      alt={g.caption}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                    {g.caption && <p className="mt-2 text-xs text-muted-foreground">{g.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      )}

      {/* 5. CONSULTATION & SIMILAR COMMISSIONS CTA */}
      <section className="border-t border-border bg-ink text-ink-foreground py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div>
              <p className="eyebrow text-accent">Private Consultation</p>
              <h2 className="mt-3 font-display text-3xl sm:text-5xl font-light text-ink-foreground max-w-2xl">
                Interested in creating a residence of similar caliber?
              </h2>
              <p className="mt-4 text-sm sm:text-base text-ink-foreground/80 max-w-xl leading-relaxed font-light">
                We accept commissions at early architectural stages to align structural planning
                with interior atmosphere and bespoke millwork.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                hash="consultation"
                className="bg-accent px-8 py-4 text-xs uppercase tracking-[0.2em] text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Inquire About a Commission
              </Link>
              <Link
                to="/portfolio"
                className="border border-ink-foreground/30 px-6 py-4 text-xs uppercase tracking-[0.2em] text-ink-foreground hover:border-accent hover:text-accent transition-colors"
              >
                Explore More Projects
              </Link>
            </div>
          </div>

          {/* Related Projects */}
          {related.length > 0 && (
            <div className="mt-20 pt-16 border-t border-ink-foreground/20">
              <p className="eyebrow text-ink-foreground/60 mb-8">Related Case Studies</p>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <CaseCardItem key={r.slug} study={r} layoutVariant="standard" />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicShell>
  );
}

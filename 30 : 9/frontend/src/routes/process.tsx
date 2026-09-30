import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock, FileText, Palette, Hammer, Key } from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";

export const Route = createFileRoute("/process")({
  component: ProcessPage,
  head: () => ({
    meta: [
      { title: "Design Process & Methodology | Atelier Vermilion" },
      {
        name: "description",
        content:
          "Understand how Atelier Vermilion delivers bespoke interior architecture: our 7-stage process from discovery and 3D design to material selection and turnkey handover.",
      },
      { property: "og:title", content: "7-Stage Design Process — Atelier Vermilion" },
      {
        property: "og:description",
        content: "From brief to handover: a transparent, predictable interior design methodology.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const DETAILED_STAGES = [
  {
    step: "01",
    title: "Discover & Site Analysis",
    phase: "Phase 1: Discovery",
    timeline: "Weeks 1 – 2",
    icon: Clock,
    summary:
      "We begin by understanding the physical site constraints, daylight orientation, and the daily rhythm of your life.",
    deliverables: [
      "Full 3D laser-measured site survey and dimensional audit",
      "Solar daylight & seasonal sun-path analysis",
      "Structural MEP (electrical, plumbing, HVAC) feasibility report",
      "Lifestyle briefing questionnaire & functional priority matrix",
    ],
    details:
      "Before sketching a single layout, our team spends hours on site during morning and afternoon sun angles. We document ceiling heights, structural columns, masonry tolerances, and acoustic factors to anchor the architectural strategy.",
  },
  {
    step: "02",
    title: "Concept & Spatial Layouts",
    phase: "Phase 2: Concept",
    timeline: "Weeks 3 – 5",
    icon: CompassIcon,
    summary:
      "Circulation planning, volume articulation, and establishing the foundational material palette.",
    deliverables: [
      "Three distinct 2D furniture and spatial flow layout schemes",
      "Atmospheric moodboards establishing stone, timber, and metal accents",
      "Sightline analysis and architectural focal wall identification",
      "Written spatial manifesto & investment budget roadmap",
    ],
    details:
      "We explore wall adjustments, ceiling volumes, and door alignments. Once the optimal plan is finalized, we anchor the scheme in three core materials (e.g. Italian travertine, quarter-sawn oak, and patinated bronze).",
  },
  {
    step: "03",
    title: "Design & Technical Detailing",
    phase: "Phase 3: Design",
    timeline: "Weeks 6 – 10",
    icon: Palette,
    summary:
      "Photorealistic 3D visualisations, physical sample workshops, and exhaustive construction drawings.",
    deliverables: [
      "Room-by-room photorealistic 3D visualisations",
      "Illumination simulations (daylight vs. 2700K evening scenes)",
      "Physical sample tray: actual marble slabs, veneer flitches, and brass swatches",
      "Exhaustive GFC (Good For Construction) drawing set (50+ sheets)",
      "Frozen Bill of Quantities (BOQ) with fixed vendor specifications",
    ],
    details:
      "You will see precisely how textures, shadows, and reflections behave in every room before any physical purchase orders are issued. No material is ordered from a catalog alone; we visit stone yards and flitch ateliers together.",
  },
  {
    step: "04",
    title: "Execute & Turnkey Supervision",
    phase: "Phase 4: Execution",
    timeline: "Months 3 – 8 (Project Dependent)",
    icon: Hammer,
    summary:
      "Managing the site with uncompromising quality checkpoints, skilled joinery craftsmen, and held schedules.",
    deliverables: [
      "Full-time on-site project supervisor and weekly principal site walks",
      "Weekly photographic progress updates via your client portal",
      "Stage-wise inspection checklists for waterproofing, electrical, and joinery",
      "Vendor coordination and single-source contractor management",
    ],
    details:
      "Our team holds the site. We manage contractors, resolve on-site dimensional surprises, and ensure shop drawings are adhered to within millimeter tolerances, preventing budget creep or schedule slippage.",
  },
  {
    step: "05",
    title: "Deliver & White-Glove Handover",
    phase: "Phase 5: Delivery",
    timeline: "Final Month",
    icon: Key,
    summary:
      "Meticulous snag-free verification, deep cleaning, bespoke styling, and formal presentation of your completed sanctuary.",
    deliverables: [
      "Zero-snag final walkthrough inspection",
      "Comprehensive homeowner's maintenance & material care dossier",
      "Warranties, equipment manuals, and touch-up paint formulations",
      "Bespoke styling: artwork mounting, rug placement, and lighting commissioning",
      "Scheduled 90-day post-handover quality review",
    ],
    details:
      "On handover day, your home is thoroughly cleaned, conditioned, and ready to inhabit. We return 90 days later to inspect settlement and ensure total satisfaction.",
  },
];

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function LayersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function ProcessPage() {
  return (
    <PublicShell>
      {/* Editorial Header */}
      <div className="border-b border-border bg-background pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="eyebrow">Methodology & Rigor</p>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl lg:text-7xl font-light text-foreground tracking-tight max-w-4xl">
            A Predictable, Transparent Architectural Journey.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed font-light">
            Exceptional interiors do not happen by chance. Here is the exact 5-step roadmap we
            follow to take your commission from a raw space into an enduring, quiet sanctuary.
          </p>
        </div>
      </div>

      {/* 5-Phase Timeline */}
      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:py-16 sm:px-8">
        <div className="space-y-8 sm:space-y-10">
          {DETAILED_STAGES.map((stage) => {
            return (
              <div
                key={stage.step}
                className="border border-border/80 bg-background p-6 sm:p-10 transition-colors duration-300 hover:border-accent"
              >
                <div className="grid gap-6 lg:grid-cols-12 items-start">
                  {/* Left Column: Stage Identification */}
                  <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-3xl sm:text-4xl font-light text-accent">
                        {stage.step}
                      </span>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        {stage.timeline}
                      </span>
                    </div>

                    <h2 className="font-display text-2xl sm:text-3xl text-foreground font-light">
                      {stage.title}
                    </h2>

                    <p className="text-sm leading-relaxed text-muted-foreground font-light">
                      {stage.summary}
                    </p>
                  </div>

                  {/* Right Column: Narrative & Deliverables */}
                  <div className="lg:col-span-8 lg:pl-8 lg:border-l border-border/60 space-y-5">
                    <p className="text-sm sm:text-base leading-relaxed text-foreground font-light">
                      {stage.details}
                    </p>

                    <div className="border-t border-border/60 pt-5">
                      <h3 className="text-xs uppercase tracking-wider text-foreground font-semibold mb-3">
                        Key Deliverables for this Phase:
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {stage.deliverables.map((item, dIdx) => (
                          <div
                            key={dIdx}
                            className="flex items-start gap-2.5 text-xs text-muted-foreground"
                          >
                            <CheckCircle2 className="size-3.5 text-accent shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Consultation Callout */}
        <div className="mt-14 border border-border bg-card/40 p-8 sm:p-12 text-center">
          <p className="eyebrow">Ready to start?</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-light text-foreground">
            Stage 01 Begins with a Site Walk
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Share your property location and brief parameters. Our design directors will schedule an
            initial discovery session.
          </p>
          <div className="mt-8">
            <Link
              to="/contact"
              hash="consultation"
              className="inline-flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Book Stage 01 Consultation <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

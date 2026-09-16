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
    title: "Discovery & Site Analysis",
    timeline: "Weeks 1 – 2",
    icon: Clock,
    summary:
      "We begin by understanding the physical site constraints and the emotional rhythm of your daily life.",
    deliverables: [
      "Full 3D laser-measured site survey and dimensional audit",
      "Solar daylight & seasonal sun-path analysis",
      "Structural MEP (electrical, plumbing, HVAC) feasibility report",
      "Lifestyle briefing questionnaire & functional priority matrix",
    ],
    details:
      "Before sketching a single layout, our team spends hours on site during morning and afternoon sun angles. We document ceiling heights, beams, masonry tolerances, and views to anchor the architectural strategy.",
  },
  {
    step: "02",
    title: "Consultation & Strategic Brief",
    timeline: "Week 3",
    icon: FileText,
    summary:
      "Synthesizing your requirements into an actionable architectural program and investment budget band.",
    deliverables: [
      "Written spatial manifesto & room-by-room requirement schedule",
      "Feasibility study and statutory building permissions roadmap",
      "Transparent timeline projection and milestone fee schedule",
    ],
    details:
      "We meet at our studio or on site to align expectations. We define which rooms demand expansive public generosity and which require intimate, acoustic sanctuary.",
  },
  {
    step: "03",
    title: "Concept Development & Spatial Layouts",
    timeline: "Weeks 4 – 6",
    icon: CompassIcon,
    summary:
      "Circulation planning, volume articulation, and establishing the fundamental material palette.",
    deliverables: [
      "Three distinct 2D furniture and spatial flow layout options",
      "Atmospheric moodboards establishing stone, wood, and metal accents",
      "Sightline analysis and focal wall identification",
      "Preliminary lighting temperature & mood strategies",
    ],
    details:
      "We explore wall removals, ceiling heights, and door placements. Once the optimal plan is chosen, we anchor the scheme in three foundational materials (e.g. travertine, oak, and antique brass).",
  },
  {
    step: "04",
    title: "3D Visualisation & Spatial Modeling",
    timeline: "Weeks 7 – 9",
    icon: Palette,
    summary:
      "Translating the conceptual plan into photorealistic digital models to eliminate any ambiguity.",
    deliverables: [
      "Room-by-room 3D architectural visualisations",
      "Illumination simulations (daytime natural light vs. 2700K evening scenes)",
      "False ceiling details, cove reveals, and AC grill integrations",
      "Joinery elevation previews with hardware finishes",
    ],
    details:
      "You will see precisely how textures, shadows, and reflections behave in every room before any physical purchase orders are issued.",
  },
  {
    step: "05",
    title: "Material Selection & Technical Documentation",
    timeline: "Weeks 10 – 12",
    icon: LayersIcon,
    summary:
      "Physical flat-lay workshops in our studio and generating rigorous 1:1 scale shop drawings.",
    deliverables: [
      "Physical sample tray: actual marble slabs, veneer flitches, and brass swatches",
      "Exhaustive GFC (Good For Construction) drawing set (50+ sheets)",
      "Joinery detail sections with shadow gaps, hardware, and edge banding",
      "Sanitary, tile, and lighting fixture specification register",
      "Frozen Bill of Quantities (BOQ) with fixed vendor quotes",
    ],
    details:
      "No material is ordered from a digital catalog alone. We visit quarries and timber yards together to hand-select marble book-matches and veneer bundles.",
  },
  {
    step: "06",
    title: "Turnkey Execution & Site Supervision",
    timeline: "Months 4 – 10 (Project Dependent)",
    icon: Hammer,
    summary:
      "Managing the site with uncompromising quality checkpoints, skilled craftsmanship, and strict schedule adherence.",
    deliverables: [
      "Full-time on-site project supervisor and weekly principal site walks",
      "Weekly photographic progress updates accessible via your client portal",
      "Stage-wise inspection checklists for waterproofing, electrical, and joinery",
      "Vendor coordination and white-glove material logistics",
    ],
    details:
      "Our team holds the site. We manage contractors, resolve on-site dimensional surprises, and ensure shop drawings are adhered to within millimeter tolerances.",
  },
  {
    step: "07",
    title: "Final Snagging, Styling & Handover",
    timeline: "Final Month",
    icon: Key,
    summary:
      "Meticulous snag-free verification, deep cleaning, styling, and formal presentation of your completed sanctuary.",
    deliverables: [
      "Zero-snag final walkthrough inspection",
      "Comprehensive homeowner's maintenance & material care dossier",
      "Warranties, equipment manuals, and touch-up paint formulations",
      "Bespoke styling: artwork mounting, rug placement, and lighting commissioning",
      "Scheduled 90-day post-handover review",
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
      <div className="border-b border-border bg-background pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="eyebrow">Methodology & Rigor</p>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl lg:text-7xl font-light text-foreground tracking-tight max-w-4xl">
            A Predictable, Transparent Architectural Journey.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed font-light">
            Exceptional interiors do not happen by chance. Here is the exact roadmap we follow to
            take your commission from a raw space into an enduring, quiet sanctuary.
          </p>
        </div>
      </div>

      {/* 7-Stage Timeline */}
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
        <div className="space-y-16">
          {DETAILED_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="border border-border/80 bg-background p-8 sm:p-12 transition-all duration-300 hover:border-accent"
              >
                <div className="grid gap-8 lg:grid-cols-12 items-start">
                  {/* Left Column: Stage Identification */}
                  <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-4xl sm:text-5xl font-light text-accent">
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
                  <div className="lg:col-span-8 lg:pl-8 lg:border-l border-border/60 space-y-6">
                    <p className="text-sm sm:text-base leading-relaxed text-foreground font-light">
                      {stage.details}
                    </p>

                    <div className="border-t border-border/60 pt-6">
                      <h3 className="text-xs uppercase tracking-wider text-foreground font-semibold mb-3">
                        Key Deliverables for this Phase:
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {stage.deliverables.map((item, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
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
        <div className="mt-20 border border-border bg-card/60 p-10 sm:p-16 text-center">
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

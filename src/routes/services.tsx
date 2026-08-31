import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell, PageHeader } from "@/components/site/PublicShell";

export const Route = createFileRoute("/services")({
  component: Services,
  head: () => ({
    meta: [
      { title: "Services & Process — Atelier Vermilion Interior Design" },
      {
        name: "description",
        content:
          "Full interior design, turnkey execution and hospitality fit-outs. See our six-stage process, deliverables and fee structure.",
      },
      { property: "og:title", content: "Services & Process — Atelier Vermilion" },
      {
        property: "og:description",
        content: "Design, turnkey execution and hospitality interiors — our process and deliverables.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const OFFERS = [
  {
    title: "Full interior design",
    body: "Layouts, joinery, lighting design, material palette, custom furniture and styling — drawn to shop-drawing depth.",
    for: "Apartments, penthouses, villas, farmhouses",
  },
  {
    title: "Turnkey execution",
    body: "We hold the site end to end: contractors, vendors, procurement, quality checks, snagging and handover documentation.",
    for: "Clients who want one accountable party",
  },
  {
    title: "Hospitality & workplace",
    body: "Restaurants, boutique hotels, clinics and offices designed for atmosphere, throughput and maintenance reality.",
    for: "Operators and developers",
  },
];

const STAGES = [
  ["01", "Brief & feasibility", "Site visit, measured survey, daylight study, budget banding and a written brief."],
  ["02", "Concept", "Spatial strategy, moodboards, material direction and first room-wise layouts."],
  ["03", "Design development", "Detailed drawings, joinery sections, lighting layouts and specification register."],
  ["04", "BOQ & procurement", "Frozen bill of quantities, three quotes per package, vendor selection, purchase orders."],
  ["05", "Execution", "Weekly site supervision, quality checkpoints, progress updates published to your portal."],
  ["06", "Handover", "Snag-free walkthrough, care manual, material register and a 90-day revisit."],
];

function Services() {
  return (
    <PublicShell>
      <PageHeader
        eyebrow="Services"
        title="Design that is drawn, costed and then built."
        intro="We take on a limited number of projects each year so every one gets senior attention from brief to handover."
      />

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
        <div className="grid gap-px bg-border md:grid-cols-3">
          {OFFERS.map((o) => (
            <div key={o.title} className="bg-background p-8">
              <h2 className="text-2xl">{o.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{o.body}</p>
              <p className="eyebrow mt-6">{o.for}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40">
        <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
          <p className="eyebrow">How it runs</p>
          <h2 className="mt-4 max-w-2xl text-3xl sm:text-5xl">Six stages, one accountable team.</h2>
          <div className="mt-14 grid gap-x-12 gap-y-12 md:grid-cols-2">
            {STAGES.map(([n, t, b]) => (
              <div key={n} className="border-t border-border pt-6">
                <p className="text-xs tracking-[0.2em] text-accent">{n}</p>
                <h3 className="mt-3 text-xl">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Engagement</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">Fees, plainly.</h2>
            <ul className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="text-foreground">Design fee</span> — charged per sq ft, billed across
                four milestones: retainer, design development, execution milestone, handover balance.
              </li>
              <li>
                <span className="text-foreground">Execution</span> — billed against a frozen bill of
                quantities. Vendor quotes are shared with you; we do not mark up materials silently.
              </li>
              <li>
                <span className="text-foreground">Variations</span> — priced and approved in writing
                before any work proceeds.
              </li>
            </ul>
            <Link
              to="/contact"
              className="mt-10 inline-block bg-accent px-7 py-4 text-xs tracking-[0.2em] text-accent-foreground uppercase"
            >
              Request a fee proposal
            </Link>
          </div>
          <img
            src="/portfolio/p4.jpg"
            alt="Design drawings, stone samples and joinery finishes laid out on a studio table"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      </section>
    </PublicShell>
  );
}

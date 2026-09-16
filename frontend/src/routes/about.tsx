import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell, PageHeader } from "@/components/site/PublicShell";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "The Studio — About Atelier Vermilion Interior Designers" },
      {
        name: "description",
        content:
          "Atelier Vermilion is an interior design studio in Mumbai and Bengaluru, practising since 2011 across residences, villas and hospitality interiors.",
      },
      { property: "og:title", content: "The Studio — Atelier Vermilion" },
      {
        property: "og:description",
        content: "An interior design practice built on daylight, material honesty and held schedules.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const TEAM = [
  ["Ira Kapoor", "Founder & Principal Designer", "Fifteen years detailing residences across India; leads concept and material direction."],
  ["Devanshi Rao", "Design Director", "Runs design development and the drawing sets that make sites predictable."],
  ["Nikhil Menon", "Project Director", "Holds execution: contractors, sequencing, quality checkpoints and handover."],
  ["Sara Qureshi", "Senior Designer", "Joinery, lighting and the small details that decide whether a room works."],
];

function About() {
  return (
    <PublicShell>
      <PageHeader
        eyebrow="The studio · Est. 2011"
        title="A small practice, deliberately."
        intro="Fifteen years, eleven cities, 148 delivered projects — and a team that still walks every site."
      />

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <img
            src="/portfolio/p5.jpg"
            alt="The studio's Mumbai workspace with material samples and drawing boards"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
          <div>
            <p className="font-display text-2xl leading-snug sm:text-3xl">
              We were founded on a simple frustration: beautiful renders that fall apart on site.
            </p>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              So we built the studio backwards from the site. Drawings are made to be built,
              quantities are frozen before work begins, and every client can see progress, approvals
              and money in one place. The result is calmer projects and interiors that age well.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Our work runs from 700 sq ft apartments to 12,000 sq ft hospitality interiors. The
              scale changes; the discipline does not.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary/40">
        <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
          <p className="eyebrow">The team</p>
          <h2 className="mt-4 text-3xl sm:text-5xl">Who you will actually work with.</h2>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map(([name, role, bio]) => (
              <div key={name} className="border-t border-border pt-6">
                <h3 className="text-xl">{name}</h3>
                <p className="eyebrow mt-2">{role}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          {[
            ["Recognition", "Nine national design awards, including three for hospitality interiors."],
            ["Press", "Featured in Architectural Digest India, Elle Decor and Design Pataki."],
            ["Practice", "Studios in Mumbai and Bengaluru; projects delivered in eleven cities."],
          ].map(([t, b]) => (
            <div key={t}>
              <p className="eyebrow">{t}</p>
              <p className="mt-3 text-base leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
        <Link
          to="/contact"
          className="mt-14 inline-block bg-primary px-7 py-4 text-xs tracking-[0.2em] text-primary-foreground uppercase"
        >
          Work with the studio
        </Link>
      </section>
    </PublicShell>
  );
}

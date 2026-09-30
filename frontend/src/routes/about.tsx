import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Layers, ShieldCheck, Award } from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";
import { DriveImage } from "@/components/site/DriveImage";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About The Studio & Team | Atelier Vermilion" },
      {
        name: "description",
        content:
          "Atelier Vermilion is an architectural interior design practice founded in 2011 by Ira Kapoor. Practicing in Mumbai and Bengaluru across bespoke residences, villas, and hospitality commissions.",
      },
      { property: "og:title", content: "About Atelier Vermilion — Architecture & Interiors" },
      {
        property: "og:description",
        content:
          "A focused practice built on daylight, natural stone, and held execution schedules.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const TEAM_MEMBERS = [
  {
    name: "Ira Kapoor",
    role: "Founder & Principal Designer",
    image: GOOGLE_DRIVE_PHOTOS[0]?.url || "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
    bio: "Graduated from CEPT Ahmedabad and Architectural Association, London. Fifteen years detailing residential and hospitality sanctuaries across India; leads conceptual vision and tactile material curation.",
  },
  {
    name: "Devanshi Rao",
    role: "Design Director",
    image: GOOGLE_DRIVE_PHOTOS[1]?.url || "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
    bio: "Specializes in spatial re-planning and daylight engineering. Leads the studio drawing sets, joinery specifications, and 3D visualization team to ensure sites are completely predictable.",
  },
  {
    name: "Nikhil Menon",
    role: "Project Director",
    image: GOOGLE_DRIVE_PHOTOS[2]?.url || "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
    bio: "Civil engineer with twenty years of luxury construction management. Holds on-site contractors, MEP coordination, material sequencing, and single-source schedule guarantees.",
  },
  {
    name: "Sara Qureshi",
    role: "Senior Associate, Detailing",
    image: GOOGLE_DRIVE_PHOTOS[3]?.url || "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
    bio: "Focuses on micro-tolerances: bespoke joinery shadow gaps, architectural hardware casting, custom lighting fixtures, and natural stone book-matching.",
  },
];


const STATISTICS = [
  {
    value: "15+",
    label: "Years in Practice",
    desc: "Founded in 2011 with continuous independent studio leadership.",
  },
  {
    value: "148+",
    label: "Projects Completed",
    desc: "Private residences, coastal villas, penthouses, and bespoke venues.",
  },
  {
    value: "11",
    label: "Cities Commissioned",
    desc: "Mumbai, Bengaluru, Ahmedabad, Goa, Alibaug, Delhi NCR, and London.",
  },
  {
    value: "9",
    label: "National Design Awards",
    desc: "Recognized for excellence in residential detailing and heritage restoration.",
  },
];

function AboutPage() {
  return (
    <PublicShell>
      {/* Editorial Header */}
      <div className="border-b border-border bg-background pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="eyebrow">Studio Origin · Established 2011</p>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl lg:text-7xl font-light text-foreground tracking-tight max-w-4xl">
            A small, senior practice by deliberate intention.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed font-light">
            We limit the number of commissions we accept each year so that our principal designers
            personally walk every site, inspect every stone slab, and detail every joint.
          </p>
        </div>
      </div>

      {/* Story & Manifesto */}
      <section className="mx-auto max-w-[1400px] px-5 py-14 sm:py-20 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 overflow-hidden bg-secondary/30 aspect-[4/5] border border-border/80">
            <DriveImage
              src={GOOGLE_DRIVE_PHOTOS[4]?.url || "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz"}
              alt="Atelier Vermilion studio atmosphere with architectural drawings and stone samples"
              className="size-full object-cover"
              wrapperClassName="size-full"
            />
          </div>



          <div className="lg:col-span-6 space-y-6">
            <p className="eyebrow">Our Beginning</p>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground font-light leading-snug">
              Founded on a simple frustration: beautiful digital renderings that disappoint on site.
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-light">
              In 2011, principal designer Ira Kapoor established Atelier Vermilion to build a studio
              backwards from the site. We believe that an interior is only as good as its executed
              reality: the weight of a solid timber door, the flush alignment of a stone threshold,
              and the acoustic calm of a well-proportioned room.
            </p>

            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-light">
              By combining rigorous architectural drawings with in-house turnkey project management,
              we ensure that our clients never experience contractor friction, surprise costs, or
              compromised finishes.
            </p>

            <div className="pt-4 border-t border-border">
              <p className="font-editorial text-xl italic text-foreground">
                “We do not decorate rooms. We sculpt volumes that welcome daylight and age with
                quiet grace.”
              </p>
              <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                — Ira Kapoor, Principal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Statistics */}
      <section className="border-y border-border bg-card/40 py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STATISTICS.map((s) => (
              <div key={s.label} className="border-l border-border/80 pl-6 py-2">
                <span className="font-display text-4xl sm:text-5xl font-light text-foreground">
                  {s.value}
                </span>
                <p className="font-display text-lg text-foreground mt-1">{s.label}</p>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="max-w-2xl pb-12 sm:pb-16">
            <p className="eyebrow">Studio Leadership</p>
            <h2 className="mt-3 text-3xl sm:text-5xl font-display font-light text-foreground">
              The Architects & Directors on Your Commission
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              You work directly with experienced partners who maintain personal accountability from
              initial sketch through to key handover.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.name} className="group flex flex-col">
                <div className="aspect-[3/4] w-full overflow-hidden bg-secondary/30 mb-5">
                  <DriveImage
                    src={member.image}
                    alt={member.name}
                    className="size-full object-cover grayscale contrast-105 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-[1.025]"
                    wrapperClassName="size-full"
                  />
                </div>
                <h3 className="font-display text-xl text-foreground">{member.name}</h3>
                <p className="text-xs uppercase tracking-widest text-accent font-medium mt-1">
                  {member.role}
                </p>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground font-light">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Locations */}
      <section className="border-t border-border bg-secondary/30 py-14 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="eyebrow">Our Physical Studios</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-display font-light text-foreground mb-12">
            Where We Draw, Prototype & Collaborate
          </h2>

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="border border-border/80 bg-background p-8 sm:p-10 space-y-4">
              <span className="text-[10px] uppercase tracking-[0.24em] text-accent font-medium">
                Headquarters
              </span>
              <h3 className="font-display text-2xl text-foreground">Mumbai Studio</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                14 Sun Mill Compound, Tulsi Pipe Road, Lower Parel, Mumbai 400013
              </p>
              <div className="pt-2 text-xs space-y-1 text-muted-foreground">
                <p>Phone: +91 98200 41100</p>
                <p>Email: mumbai@ateliervermilion.com</p>
              </div>
            </div>

            <div className="border border-border/80 bg-background p-8 sm:p-10 space-y-4">
              <span className="text-[10px] uppercase tracking-[0.24em] text-accent font-medium">
                Southern Practice
              </span>
              <h3 className="font-display text-2xl text-foreground">Bengaluru Studio</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                84 Lavelle Road, Shanthala Nagar, Ashok Nagar, Bengaluru 560001
              </p>
              <div className="pt-2 text-xs space-y-1 text-muted-foreground">
                <p>Phone: +91 80 4120 7800</p>
                <p>Email: blr@ateliervermilion.com</p>
              </div>
            </div>
          </div>

          <div className="mt-14 text-center">
            <Link
              to="/contact"
              hash="consultation"
              className="inline-flex items-center gap-2 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Start an Architectural Consultation <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

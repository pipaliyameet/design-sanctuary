import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ArrowUpRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Interior Design Services & Turnkey Execution | Atelier Vermilion" },
      {
        name: "description",
        content:
          "Comprehensive interior design disciplines by Atelier Vermilion: residential interiors, turnkey execution, modular kitchens, wardrobes, commercial offices, hospitality, and architecture.",
      },
      { property: "og:title", content: "Studio Services — Atelier Vermilion" },
      {
        property: "og:description",
        content: "Design, turnkey execution, modular millwork, and architecture.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  included: string[];
  relatedSlug: string;
  relatedTitle: string;
}

const SERVICES_CATALOGUE: ServiceItem[] = [
  {
    id: "residential",
    title: "Residential Interiors",
    subtitle: "Penthouses, Luxury Apartments & Private Residences",
    image: "/portfolio/hero.jpg",
    description:
      "Full interior architecture and styling for discerning homeowners. We re-plan circulation, study natural light, and craft tailored room-by-room living spaces tailored to family lifestyles.",
    included: [
      "Comprehensive spatial layouts & daylight mapping",
      "Bespoke joinery, door, and window shop drawings",
      "Architectural lighting design & lux level planning",
      "Full sanitaryware, tile, and stone schedules",
      "Custom loose furniture curation & procurement",
    ],
    relatedSlug: "shah-residence-ahmedabad",
    relatedTitle: "The Shah Residence",
  },
  {
    id: "turnkey",
    title: "Turnkey Interior Execution",
    subtitle: "Complete Design + Build Single-Point Accountability",
    image: "/portfolio/p6.jpg",
    description:
      "We take total site custody: vetted MEP contractors, procurement, factory shop-drawing verification, weekly client audits, and a single accountable completion schedule.",
    included: [
      "Frozen bill of quantities (BOQ) with fixed pricing",
      "Weekly on-site quality assurance audits",
      "Direct supervision of electrical, plumbing & HVAC",
      "Client portal with photographic progress updates",
      "Single point of contractual accountability",
    ],
    relatedSlug: "shah-residence-ahmedabad",
    relatedTitle: "The Shah Residence",
  },
  {
    id: "kitchens",
    title: "Modular Kitchens & Pantries",
    subtitle: "Precision European Hardware & Monolithic Islands",
    image: "/portfolio/p7.jpg",
    description:
      "Ergonomic culinary centers balancing heavy Indian cooking demands with sculptural minimalist aesthetics. Solid quartz, leathered granite, and Austrian Blum motion technologies.",
    included: [
      "Wet & dry kitchen workflow zoning",
      "Integrated concealed appliance coordination",
      "2mm solid wood lipping & moisture-proof carcass",
      "Bespoke cutlery trays, spice pull-outs, and pantries",
      "Under-cabinet 3000K continuous task illumination",
    ],
    relatedSlug: "koramangala-minimalist-penthouse",
    relatedTitle: "Koramangala Penthouse",
  },
  {
    id: "wardrobes",
    title: "Wardrobes & Custom Millwork",
    subtitle: "Walk-in Closets, Vanities & Wall Panelling",
    image: "/portfolio/p2.jpg",
    description:
      "Bespoke millwork fabricated with precision tolerances. From glass-encased wardrobe pavilions with diffused LED lighting to integrated vanities carved from solid stone.",
    included: [
      "Personalized clothing, accessory & safe compartmentalization",
      "Integrated sensor LED warm lighting strips",
      "Fumed oak, fluted walnut & hand-rubbed brass handles",
      "Soft-close concealed European hardware",
      "Full 1:1 scale shop drawings prior to cutting",
    ],
    relatedSlug: "shah-residence-ahmedabad",
    relatedTitle: "The Shah Residence",
  },
  {
    id: "architecture",
    title: "Architecture & Spatial Planning",
    subtitle: "Villa Ground-Up Design & Structural Reconfiguration",
    image: "/portfolio/p5.jpg",
    description:
      "Ground-up architectural design and volumetric space planning for independent homes, coastal villas, and structural modifications to large shell properties.",
    included: [
      "Volumetric massing & site sun path alignment",
      "Indoor-outdoor transition & verandah colonnades",
      "Structural engineering & MEP coordination",
      "Fenestration & thermal envelope detailing",
      "Landscape and reflective pool integration",
    ],
    relatedSlug: "alibaug-coastal-villa",
    relatedTitle: "Alibaug Coastal Villa",
  },
  {
    id: "hospitality",
    title: "Hospitality & Restaurant Interiors",
    subtitle: "Atmospheric Dining, Bars & Boutique Hotels",
    image: "/portfolio/p3.jpg",
    description:
      "Spaces designed for evocative atmosphere, operational flow, acoustic comfort, and long-term durability under high footfall conditions.",
    included: [
      "Atmospheric mood & low-glare pin-spot lighting",
      "Acoustic engineering to eliminate harsh dining clatter",
      "Commercial bar & prep counter ergonomics",
      "High-durability stain-resistant natural stones & upholstery",
      "Brand storytelling through tactile materials",
    ],
    relatedSlug: "the-verandah-cafe-dining",
    relatedTitle: "The Verandah Dining & Lounge",
  },
  {
    id: "commercial",
    title: "Commercial & Office Design",
    subtitle: "High-Performance Workplaces & Executive Suites",
    image: "/portfolio/p4.jpg",
    description:
      "Workplaces designed with residential calmness: acoustic wool felt, indirect glare-free cove lighting, biophilic plantings, and collaborative library lounges.",
    included: [
      "Open collaboration vs. deep work zoning",
      "Acoustically isolated boardroom & podcast suites",
      "Ergonomic workstation & task lighting integration",
      "Executive dining & client reception suites",
      "Comprehensive MEP and HVAC balancing",
    ],
    relatedSlug: "ochre-stone-studio-workspace",
    relatedTitle: "Ochre & Stone Studio",
  },
  {
    id: "renovation",
    title: "Heritage Renovation & Restoration",
    subtitle: "Art Deco & Historic Property Rejuvenation",
    image: "/portfolio/p8.jpg",
    description:
      "Sensitive restoration that respects historical architectural bones while retrofitting contemporary concealed electrical, plumbing, and climate control.",
    included: [
      "Terrazzo & historical floor pattern restoration",
      "Timber window casing & louver repair",
      "Traditional mineral lime plaster application",
      "Concealed air-conditioning and smart home conduits",
      "Custom sand-cast vintage reproduction hardware",
    ],
    relatedSlug: "bandra-heritage-loft",
    relatedTitle: "Bandra Heritage Apartment",
  },
  {
    id: "furniture",
    title: "Bespoke Furniture & Styling",
    subtitle: "Custom Fabrication, Rugs & Art Placement",
    image: "/portfolio/p1.jpg",
    description:
      "Designing what cannot be bought off the shelf. We work with master artisans to sculpt solid stone tables, cast bronze credenza handles, and weave natural wool rugs.",
    included: [
      "1-of-1 custom dining & cocktail table designs",
      "Hand-knotted wool and botanical silk rugs",
      "Tactile linen, boucle, and leather upholstery curation",
      "Sculptural ceramic & art object placement",
      "White-glove placement and final scene setting",
    ],
    relatedSlug: "alibaug-coastal-villa",
    relatedTitle: "Alibaug Coastal Villa",
  },
];

function ServicesPage() {
  return (
    <PublicShell>
      {/* Editorial Header */}
      <div className="border-b border-border bg-background pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="eyebrow">Studio Disciplines</p>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl lg:text-7xl font-light text-foreground tracking-tight max-w-4xl">
            Design that is drawn, costed, and built with integrity.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed font-light">
            We provide end-to-end interior architecture and turnkey execution. Every package is
            engineered to eliminate ambiguity and deliver predictable excellence.
          </p>
        </div>
      </div>

      {/* Services Catalogue */}
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 space-y-24">
        {SERVICES_CATALOGUE.map((service, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={service.id}
              id={service.id}
              className="border-b border-border/70 pb-20 scroll-mt-28"
            >
              <div className="grid gap-12 lg:grid-cols-12 items-center">
                {/* Image */}
                <div className={isEven ? "lg:col-span-7" : "lg:col-span-7 lg:order-2"}>
                  <div className="aspect-[16/10] w-full overflow-hidden bg-secondary/30">
                    <img
                      src={service.image}
                      alt={service.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>

                {/* Details */}
                <div
                  className={
                    isEven
                      ? "lg:col-span-5 lg:pl-4"
                      : "lg:col-span-5 lg:order-1 lg:pr-4"
                  }
                >
                  <span className="text-[10px] uppercase tracking-[0.24em] text-accent font-medium">
                    Service 0{idx + 1}
                  </span>
                  <h2 className="mt-2 font-display text-3xl sm:text-4xl text-foreground font-light">
                    {service.title}
                  </h2>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground italic font-editorial">
                    {service.subtitle}
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground font-light">
                    {service.description}
                  </p>

                  {/* Included Deliverables */}
                  <div className="mt-6 border-t border-border/60 pt-6">
                    <p className="text-xs uppercase tracking-wider text-foreground font-semibold mb-3">
                      What Is Included:
                    </p>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {service.included.map((item, incIdx) => (
                        <li key={incIdx} className="flex items-start gap-2.5">
                          <Check className="size-3.5 text-accent shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTAs & Related Project */}
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      to="/contact"
                      hash="consultation"
                      className="inline-flex items-center gap-2 bg-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] text-background font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Discuss Your Project <ArrowRight className="size-3" />
                    </Link>

                    <Link
                      to="/portfolio/$slug"
                      params={{ slug: service.relatedSlug }}
                      className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
                    >
                      View {service.relatedTitle} <ArrowUpRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Philosophy Callout */}
      <section className="border-t border-border bg-card/60 py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 text-center max-w-3xl">
          <p className="eyebrow">Engagement Commitment</p>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-light text-foreground">
            No Hidden Fees. No Ambiguity.
          </h2>
          <p className="mt-6 text-sm sm:text-base leading-relaxed text-muted-foreground font-light">
            We work on transparent milestone fee structures tied to verifiable project stages.
            Before on-site construction begins, every drawing, hardware specification, and bill of
            quantities is locked and agreed upon.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/process"
              className="inline-flex items-center gap-2 border border-foreground/30 px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Examine Our 7-Stage Process <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

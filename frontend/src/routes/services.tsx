import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ArrowUpRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";
import { DriveImage } from "@/components/site/DriveImage";

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
    image: GOOGLE_DRIVE_PHOTOS[0]?.url || "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
    description:
      "Full interior architecture and styling for discerning homeowners. We re-plan circulation, study natural light, and craft tailored room-by-room living spaces tailored to family lifestyles.",
    included: [
      "Comprehensive spatial layouts & daylight mapping",
      "Bespoke joinery, door, and window shop drawings",
      "Architectural lighting design & lux level planning",
      "Full sanitaryware, tile, and stone schedules",
      "Custom loose furniture curation & procurement",
    ],
    relatedSlug: "altamount-penthouse",
    relatedTitle: "The Altamount Penthouse",
  },
  {
    id: "turnkey",
    title: "Turnkey Design & Build",
    subtitle: "Complete Design + Build Single-Point Accountability",
    image: GOOGLE_DRIVE_PHOTOS[1]?.url || "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
    description:
      "We take total site custody: vetted master carpenters, masonry teams, and MEP engineers under continuous senior supervision with frozen milestone budgets.",
    included: [
      "Frozen bill of quantities (BOQ) with fixed pricing",
      "Weekly on-site quality assurance audits",
      "Direct supervision of electrical, plumbing & HVAC",
      "Client portal with photographic progress updates",
      "Single point of contractual accountability",
    ],
    relatedSlug: "alibaug-coastal-villa",
    relatedTitle: "Alibaug Coastal Villa",
  },
  {
    id: "architecture",
    title: "Architecture & Space Planning",
    subtitle: "Villa Ground-Up Design & Structural Reconfiguration",
    image: GOOGLE_DRIVE_PHOTOS[2]?.url || "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
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
    id: "furniture",
    title: "Custom Furniture & Millwork",
    subtitle: "Walk-in Closets, Monolithic Tables & Bespoke Joinery",
    image: GOOGLE_DRIVE_PHOTOS[3]?.url || "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
    description:
      "Bespoke millwork and furniture fabricated with precision tolerances. From glass-encased wardrobe pavilions with diffused LED lighting to integrated vanities carved from solid stone.",
    included: [
      "1-of-1 custom dining and cocktail table designs",
      "Integrated sensor LED warm lighting wardrobe suites",
      "Fumed oak, fluted walnut & hand-rubbed brass handles",
      "Soft-close concealed European hardware",
      "Full 1:1 scale shop drawings prior to cutting",
    ],
    relatedSlug: "altamount-penthouse",
    relatedTitle: "The Altamount Penthouse",
  },
  {
    id: "hospitality",
    title: "Commercial & Hospitality",
    subtitle: "Atmospheric Dining, Executive Suites & Boutique Workplaces",
    image: GOOGLE_DRIVE_PHOTOS[4]?.url || "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
    description:
      "Spaces designed for evocative atmosphere, operational flow, acoustic comfort, and long-term durability under high footfall conditions.",
    included: [
      "Atmospheric mood & low-glare pin-spot lighting",
      "Acoustic engineering to eliminate harsh noise and clatter",
      "Ergonomic workstation & task lighting integration",
      "High-durability stain-resistant natural stones & upholstery",
      "Brand storytelling through tactile materials",
    ],
    relatedSlug: "mehta-executive-suite",
    relatedTitle: "Mehta Executive Suite",
  },
  {
    id: "materials",
    title: "Materials & Lighting",
    subtitle: "Natural Stone, Tactile Textures & Warm Architectural Illumination",
    image: GOOGLE_DRIVE_PHOTOS[5]?.url || "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
    description:
      "Tactile curation of natural stones, lime plasters, solid timbers, and glare-free 2400K–2700K illumination schemes that shape emotional wellbeing.",
    included: [
      "Physical sample workshop tray (actual stone, brass & veneer)",
      "Book-matched slab selection directly at the quarry",
      "Daylight lux-level mapping & night scene programming",
      "Circadian dim-to-warm architectural driver coordination",
      "Zero plastic laminates or cosmetic imitation trims",
    ],
    relatedSlug: "shah-villa",
    relatedTitle: "Shah Courtyard Residence",
  },
];



function ServicesPage() {
  return (
    <PublicShell>
      {/* Editorial Header with controlled vertical breathing room */}
      <div className="border-b border-border bg-background pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="eyebrow">STUDIO DISCIPLINES</p>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl lg:text-6xl font-light text-foreground tracking-tight max-w-4xl leading-[1.12]">
            Design that is drawn, costed, and built with integrity.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-light">
            We provide end-to-end interior architecture and turnkey execution. Every commission is
            engineered to eliminate ambiguity and deliver predictable excellence.
          </p>
        </div>
      </div>

      {/* Services Catalogue */}
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 space-y-16">
        {SERVICES_CATALOGUE.map((service, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={service.id}
              id={service.id}
              className="border-b border-border/70 pb-16 scroll-mt-28"
            >
              <div className="grid gap-10 lg:grid-cols-12 items-center">
                {/* Image */}
                <div className={isEven ? "lg:col-span-7" : "lg:col-span-7 lg:order-2"}>
                  <div className="aspect-[16/10] w-full overflow-hidden bg-secondary/30 group">
                    <DriveImage
                      src={service.image}
                      alt={service.title}
                      className="arch-card-img size-full object-cover"
                      wrapperClassName="size-full"
                    />
                  </div>
                </div>

                {/* Details */}
                <div
                  className={isEven ? "lg:col-span-5 lg:pl-4" : "lg:col-span-5 lg:order-1 lg:pr-4"}
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
      <section className="border-t border-border bg-card/40 py-14 sm:py-20">
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
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/process"
              className="inline-flex items-center gap-2 border border-foreground/30 px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Examine Our 5-Step Process <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PublicShell } from "@/components/site/PublicShell";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";
import { DriveImage } from "@/components/site/DriveImage";
import { listServices, type ServiceItem } from "@/lib/public.functions";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Interior Design Services & Turnkey Execution | Right Angle Design Studio" },
      {
        name: "description",
        content:
          "Comprehensive interior design disciplines by Right Angle Design Studio: residential interiors, turnkey execution, modular kitchens, wardrobes, commercial offices, hospitality, and architecture.",
      },
      { property: "og:title", content: "Studio Services — Right Angle Design Studio" },
      {
        property: "og:description",
        content: "Design, turnkey execution, modular millwork, and architecture.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    _id: "residential",
    number: "01",
    title: "Residential Interiors",
    shortDesc: "Comprehensive spatial planning, circulation optimization, and room-by-room architectural detailing for private homes.",
    fullDesc:
      "Full interior architecture and styling for discerning homeowners. We re-plan circulation, study natural light, and craft tailored room-by-room living spaces tailored to family lifestyles.",
    image: GOOGLE_DRIVE_PHOTOS[0]?.url || "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
    deliverables: [
      "Comprehensive spatial layouts & daylight mapping",
      "Bespoke joinery, door, and window shop drawings",
      "Architectural lighting design & lux level planning",
      "Full sanitaryware, tile, and stone schedules",
      "Custom loose furniture curation & procurement",
    ],
    link: "/services#residential",
    sortOrder: 1,
  },
  {
    _id: "turnkey",
    number: "02",
    title: "Turnkey Design & Build",
    shortDesc: "Single-source accountability from procurement and MEP coordination to final white-glove delivery.",
    fullDesc:
      "We take total site custody: vetted master carpenters, masonry teams, and MEP engineers under continuous senior supervision with frozen milestone budgets.",
    image: GOOGLE_DRIVE_PHOTOS[1]?.url || "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
    deliverables: [
      "Frozen bill of quantities (BOQ) with fixed pricing",
      "Weekly on-site quality assurance audits",
      "Direct supervision of electrical, plumbing & HVAC",
      "Client portal with photographic progress updates",
      "Single point of contractual accountability",
    ],
    link: "/services#turnkey",
    sortOrder: 2,
  },
  {
    _id: "architecture",
    number: "03",
    title: "Architecture & Space Planning",
    shortDesc: "Ground-up villa architecture, structural reconfiguration, and environmental daylight integration.",
    fullDesc:
      "Ground-up architectural design and volumetric space planning for independent homes, coastal villas, and structural modifications to large shell properties.",
    image: GOOGLE_DRIVE_PHOTOS[2]?.url || "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
    deliverables: [
      "Volumetric massing & site sun path alignment",
      "Indoor-outdoor transition & verandah colonnades",
      "Structural engineering & MEP coordination",
      "Fenestration & thermal envelope detailing",
      "Landscape and reflective pool integration",
    ],
    link: "/services#architecture",
    sortOrder: 3,
  },
  {
    _id: "furniture",
    number: "04",
    title: "Custom Furniture & Millwork",
    shortDesc: "Bespoke furniture, wardrobe pavilions, and monolithic joinery crafted specifically for each setting.",
    fullDesc:
      "Bespoke millwork and furniture fabricated with precision tolerances. From glass-encased wardrobe pavilions with diffused LED lighting to integrated vanities carved from solid stone.",
    image: GOOGLE_DRIVE_PHOTOS[3]?.url || "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
    deliverables: [
      "1-of-1 custom dining and cocktail table designs",
      "Integrated sensor LED warm lighting wardrobe suites",
      "Bespoke architectural hardware & patinated brass fittings",
      "Veneer grain matching & hand-rubbed botanical oil finishes",
      "Turnkey installation by master joinery carpenters",
    ],
    link: "/services#furniture",
    sortOrder: 4,
  },
  {
    _id: "commercial",
    number: "05",
    title: "Commercial & Hospitality",
    shortDesc: "Evocative atmosphere, executive suites, and dining spaces designed for long-term acoustic and visual comfort.",
    fullDesc:
      "High-end boutique offices, private family headquarters, and signature restaurant environments designed for brand presence, productivity, and acoustic serenity.",
    image: GOOGLE_DRIVE_PHOTOS[4]?.url || "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
    deliverables: [
      "Acoustic design & sound-dampened meeting alcoves",
      "Bespoke executive boardroom tables with power concealment",
      "Reception statement monolithic stone desks",
      "Commercial-grade durable fabric & finish curation",
      "Brand storytelling through tactile materials",
    ],
    link: "/services#commercial",
    sortOrder: 5,
  },
  {
    _id: "materials",
    number: "06",
    title: "Materials & Lighting",
    shortDesc: "Natural Stone, Tactile Textures & Warm Architectural Illumination.",
    fullDesc:
      "Tactile curation of natural stones, lime plasters, solid timbers, and glare-free 2400K–2700K illumination schemes that shape emotional wellbeing.",
    image: GOOGLE_DRIVE_PHOTOS[5]?.url || "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
    deliverables: [
      "Physical sample workshop tray (actual stone, brass & veneer)",
      "Book-matched slab selection directly at the quarry",
      "Daylight lux-level mapping & night scene programming",
      "Circadian dim-to-warm architectural driver coordination",
      "Zero plastic laminates or cosmetic imitation trims",
    ],
    link: "/services#materials",
    sortOrder: 6,
  },
];

function ServicesPage() {
  const { data: serverServices } = useQuery({
    queryKey: ["public-services"],
    queryFn: listServices,
    staleTime: 60_000,
  });

  const services = serverServices && serverServices.length > 0 ? serverServices : DEFAULT_SERVICES;

  return (
    <PublicShell>
      {/* Editorial Header */}
      <div className="border-b border-border bg-background pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
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

      {/* Services Catalogue with Adaptive Photo Sizing */}
      <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16 py-14 space-y-16">
        {services.map((service, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={service._id || service.number || idx}
              id={service._id || `service-${idx}`}
              className="border-b border-border/70 pb-16 scroll-mt-28"
            >
              <div className="grid gap-10 lg:grid-cols-12 items-center">
                {/* Image */}
                <div className={isEven ? "lg:col-span-7" : "lg:col-span-7 lg:order-2"}>
                  <div className="aspect-[16/10] w-full overflow-hidden bg-stone group rounded border border-border/60 shadow-sm">
                    <DriveImage
                      src={service.image}
                      alt={service.title}
                      className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      wrapperClassName="size-full"
                    />
                  </div>
                </div>

                {/* Details */}
                <div
                  className={isEven ? "lg:col-span-5 lg:pl-4" : "lg:col-span-5 lg:order-1 lg:pr-4"}
                >
                  <span className="text-[10px] uppercase tracking-[0.24em] text-accent font-semibold">
                    Service {service.number || `0${idx + 1}`}
                  </span>
                  <h2 className="mt-2 font-display text-3xl sm:text-4xl text-foreground font-light">
                    {service.title}
                  </h2>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground italic font-editorial">
                    {service.shortDesc}
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground font-light">
                    {service.fullDesc || service.shortDesc}
                  </p>

                  {/* Included Deliverables */}
                  {service.deliverables && service.deliverables.length > 0 && (
                    <div className="mt-6 border-t border-border/60 pt-6">
                      <p className="text-xs uppercase tracking-wider text-foreground font-semibold mb-3">
                        What Is Included:
                      </p>
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        {service.deliverables.map((item, incIdx) => (
                          <li key={incIdx} className="flex items-start gap-2.5">
                            <Check className="size-3.5 text-accent shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      to="/contact"
                      hash="consultation"
                      className="inline-flex items-center gap-2 rounded bg-foreground px-5 py-2.5 text-xs uppercase tracking-widest text-background font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <span>Inquire For Project</span>
                      <ArrowRight className="size-3" />
                    </Link>
                    <Link
                      to="/portfolio"
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent font-medium transition-colors"
                    >
                      <span>View Related Works</span>
                      <ArrowUpRight className="size-3" />
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
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16 text-center max-w-3xl">
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

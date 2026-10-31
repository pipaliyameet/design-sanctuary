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
          "Comprehensive interior design disciplines by Right Angle Design Studio: architecture & interior design, landscape design, project consultancy, and turnkey projects.",
      },
      { property: "og:title", content: "Studio Services — Right Angle Design Studio" },
      {
        property: "og:description",
        content: "Architecture & interior design, landscape design, project consultancy, and turnkey projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    _id: "architecture-interior-design",
    number: "01",
    title: "Architecture & Interior Design",
    shortDesc: "Architectural planning, interior design, space planning, and functional, aesthetically pleasing spaces tailored to each client's requirements.",
    fullDesc:
      "Comprehensive architectural planning, interior design, space planning, and functional, aesthetically pleasing spaces tailored to each client's requirements. We integrate daylight vectors, proportional flow, and material purity from measured site surveys through to comprehensive construction drawings.",
    image: GOOGLE_DRIVE_PHOTOS[0]?.url || "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
    deliverables: [
      "Architectural planning & space optimization",
      "Tailored residential & commercial interior design",
      "Comprehensive Good For Construction (GFC) drawings",
      "Circulation mapping & architectural lighting design",
    ],
    link: "/services#architecture-interior-design",
    sortOrder: 1,
  },
  {
    _id: "landscape-design",
    number: "02",
    title: "Landscape Design",
    shortDesc: "Thoughtfully designed outdoor spaces, gardens, and landscapes that complement the architecture and surrounding environment.",
    fullDesc:
      "Thoughtfully designed outdoor spaces, gardens, and landscapes that complement the architecture and surrounding environment. We harmonize organic greenery, stone hardscaping, ambient exterior illumination, and serene water features with the built structure.",
    image: GOOGLE_DRIVE_PHOTOS[1]?.url || "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
    deliverables: [
      "Custom landscape master planning & outdoor zoning",
      "Courtyard gardens & verandah integration",
      "Natural stone pathways, planters & hardscaping",
      "Exterior atmospheric illumination & irrigation planning",
    ],
    link: "/services#landscape-design",
    sortOrder: 2,
  },
  {
    _id: "project-consultancy",
    number: "03",
    title: "Project Consultancy",
    shortDesc: "Professional guidance, planning, design coordination, material selection, and project management support throughout the project lifecycle.",
    fullDesc:
      "Professional guidance, planning, design coordination, material selection, and project management support throughout the project lifecycle. We act as your expert client advocate—reviewing technical specifications, verifying quality tolerances, and maintaining budget and timeline integrity.",
    image: GOOGLE_DRIVE_PHOTOS[7]?.url || "https://lh3.googleusercontent.com/d/1gk9lNAKNKFDVkDqmVP--Ax4-C3q7aQwu",
    deliverables: [
      "Independent design coordination & technical review",
      "Quarry & mill material selection and verification",
      "MEP, structural & contractor alignment audits",
      "Budget optimization & lifecycle schedule governance",
    ],
    link: "/services#project-consultancy",
    sortOrder: 3,
  },
  {
    _id: "turnkey-projects",
    number: "04",
    title: "Turnkey Projects",
    shortDesc: "End-to-end project execution, from initial planning and design to material selection, construction, finishing, and final handover.",
    fullDesc:
      "End-to-end project execution, from initial planning and design to material selection, construction, finishing, and final handover. Single-source studio accountability with frozen milestone budgets, vetted master craftsmen, rigorous daily site supervision, and white-glove delivery.",
    image: GOOGLE_DRIVE_PHOTOS[2]?.url || "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
    deliverables: [
      "End-to-end single-source execution & site custody",
      "Frozen Bill of Quantities (BOQ) with milestone guarantees",
      "Master carpentry, masonry, finishes & MEP execution",
      "White-glove styling, quality QA, and defect-free handover",
    ],
    link: "/services#turnkey-projects",
    sortOrder: 4,
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
      <div className="border-b border-border bg-background pt-6 pb-6 sm:pt-8 sm:pb-8">
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <p className="eyebrow">STUDIO DISCIPLINES</p>
          <h1 className="mt-2 font-display text-2xl sm:text-4xl lg:text-5xl font-normal text-foreground tracking-tight max-w-4xl leading-[1.12]">
            Design that is drawn, costed, and built with integrity.
          </h1>
          <p className="mt-2 text-sm sm:text-base text-foreground/85 max-w-2xl leading-relaxed font-normal">
            We provide end-to-end interior architecture and turnkey execution. Every commission is
            engineered to eliminate ambiguity and deliver predictable excellence.
          </p>
        </div>
      </div>

      {/* Services Catalogue with Adaptive Photo Sizing */}
      <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16 py-8 space-y-12">
        {services.map((service, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={service._id || service.number || idx}
              id={service._id || `service-${idx}`}
              className="border-b border-border/70 pb-10 scroll-mt-24"
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
                  <span className="text-xs uppercase tracking-[0.08em] text-accent font-semibold">
                    Service {service.number || `0${idx + 1}`}
                  </span>
                  <h2 className="mt-2 font-display text-3xl sm:text-4xl text-foreground font-medium">
                    {service.title}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm uppercase tracking-[0.06em] text-foreground/80 font-medium">
                    {service.shortDesc}
                  </p>

                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-foreground/85 font-normal">
                    {service.fullDesc || service.shortDesc}
                  </p>

                  {/* Included Deliverables */}
                  {service.deliverables && service.deliverables.length > 0 && (
                    <div className="mt-6 border-t border-border/80 pt-6">
                      <p className="text-xs sm:text-sm uppercase tracking-[0.06em] text-foreground font-semibold mb-3">
                        What Is Included:
                      </p>
                      <ul className="space-y-2 text-xs sm:text-sm text-foreground/85 font-normal">
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
                      className="inline-flex items-center gap-2 rounded bg-foreground px-5 py-2.5 text-xs sm:text-sm uppercase tracking-[0.08em] text-background font-semibold hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                    >
                      <span>Inquire For Project</span>
                      <ArrowRight className="size-3" />
                    </Link>
                    <Link
                      to="/portfolio"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm uppercase tracking-[0.08em] text-foreground hover:text-accent font-semibold transition-colors cursor-pointer"
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
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-normal text-foreground">
            No Hidden Fees. No Ambiguity.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-foreground/85 font-normal">
            We work on transparent milestone fee structures tied to verifiable project stages.
            Before on-site construction begins, every drawing, hardware specification, and bill of
            quantities is locked and agreed upon.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/process"
              className="inline-flex items-center gap-2 border border-foreground/30 px-8 py-3.5 text-sm uppercase tracking-[0.08em] text-foreground font-semibold hover:bg-foreground hover:text-background transition-colors cursor-pointer"
            >
              Examine Our 5-Step Process <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

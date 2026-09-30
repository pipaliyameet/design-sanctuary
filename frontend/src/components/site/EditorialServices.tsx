import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";
import { DriveImage } from "./DriveImage";

export interface ServiceItemData {
  number: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  deliverables: string[];
  image: string;
  link: string;
}

export const STUDIO_SERVICES_LIST: ServiceItemData[] = [
  {
    number: "01",
    title: "Residential Interiors",
    shortDesc:
      "Comprehensive spatial planning, circulation optimization, and room-by-room architectural detailing for private homes.",
    fullDesc:
      "We conceive homes from the inside out: analyzing daylight vectors, sightlines, and lifestyle rituals. Every junction, shadow reveal, and threshold is resolved before construction commences.",
    deliverables: [
      "Measured site survey & 3D daylight simulation",
      "Comprehensive spatial layouts & furniture flow",
      "Full room-by-room Good For Construction (GFC) drawings",
    ],
    image: GOOGLE_DRIVE_PHOTOS[0]?.url || "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
    link: "/services#residential",
  },
  {
    number: "02",
    title: "Turnkey Design & Build",
    shortDesc:
      "Single-source accountability from procurement and MEP coordination to final white-glove delivery.",
    fullDesc:
      "We assume full site custody: vetted master carpenters, masonry teams, and MEP engineers under continuous senior supervision with frozen milestone budgets.",
    deliverables: [
      "Frozen Bill of Quantities (BOQ) with fixed pricing",
      "Weekly client progress audits & photographic portal logs",
      "Full on-site supervisor presence & schedule guarantee",
    ],
    image: GOOGLE_DRIVE_PHOTOS[1]?.url || "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
    link: "/services#turnkey",
  },
  {
    number: "03",
    title: "Architecture & Space Planning",
    shortDesc:
      "Ground-up villa architecture, structural reconfiguration, and environmental daylight integration.",
    fullDesc:
      "For independent villas and bare-shell penthouses, we sculpt volumetric massing, indoor-outdoor verandahs, and fenestrations in direct harmony with the site.",
    deliverables: [
      "Volumetric massing & solar orientation studies",
      "Verandah colonnade & courtyard water feature design",
      "Structural modifications & MEP engineering alignment",
    ],
    image: GOOGLE_DRIVE_PHOTOS[2]?.url || "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
    link: "/services#architecture",
  },
  {
    number: "04",
    title: "Custom Furniture & Millwork",
    shortDesc: "Bespoke furniture, wardrobe pavilions, and monolithic joinery crafted specifically for each setting.",
    fullDesc:
      "What cannot be found is crafted: monolithic natural stone dining tables, fumed oak wardrobe pavilions, and hand-rubbed brass hardware detailed with millimeter tolerances.",
    deliverables: [
      "1-of-1 bespoke dining and cocktail tables",
      "Fumed veneer wardrobe suites with sensor illumination",
      "Hand-knotted natural wool rugs and textile curation",
    ],
    image: GOOGLE_DRIVE_PHOTOS[3]?.url || "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
    link: "/services#furniture",
  },
  {
    number: "05",
    title: "Commercial & Hospitality",
    shortDesc:
      "Evocative atmosphere, executive suites, and dining spaces designed for long-term acoustic and visual comfort.",
    fullDesc:
      "Spaces designed for evocative atmosphere, operational flow, acoustic comfort, and long-term durability under high footfall conditions.",
    deliverables: [
      "Atmospheric mood & low-glare pin-spot lighting",
      "Acoustic engineering to eliminate harsh noise",
      "High-durability stain-resistant natural stones & upholstery",
    ],
    image: GOOGLE_DRIVE_PHOTOS[4]?.url || "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
    link: "/services#hospitality",
  },
  {
    number: "06",
    title: "Materials & Lighting",
    shortDesc: "Tactile curation of natural stones, lime plasters, solid timbers, and glare-free 2400K–2700K illumination schemes.",
    fullDesc:
      "No material is specified from a digital catalog alone. We visit quarries and timber flitch yards to inspect stone veining, wood grain alignment, and hand-feel.",
    deliverables: [
      "Physical sample workshop tray (actual stone, brass & veneer)",
      "Book-matched slab selection directly at the quarry",
      "Circadian dim-to-warm architectural lighting coordination",
    ],
    image: GOOGLE_DRIVE_PHOTOS[5]?.url || "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
    link: "/services#materials",
  },
];



export function EditorialServicesSection() {
  const [activeHoverIdx, setActiveHoverIdx] = useState<number | null>(0);
  const [openAccordionIdx, setOpenAccordionIdx] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenAccordionIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div>
      {/* DESKTOP VIEW: Clean Editorial Rows with subtle Hover Image Preview */}
      <div className="hidden md:block">
        <div className="grid grid-cols-12 gap-12 items-start">
          {/* Left Column: Numbered Editorial Rows */}
          <div className="col-span-7 divide-y divide-border">
            {STUDIO_SERVICES_LIST.map((service, idx) => (
              <div
                key={service.number}
                onMouseEnter={() => setActiveHoverIdx(idx)}
                className="group py-8 transition-colors hover:pl-2 duration-300"
              >
                <div className="flex items-baseline justify-between gap-6">
                  <div className="flex items-baseline gap-6">
                    <span className="font-display text-xs text-muted-foreground tracking-widest">
                      {service.number}
                    </span>
                    <h3 className="font-display text-2xl lg:text-3xl font-light text-foreground group-hover:text-accent transition-colors">
                      {service.title}
                    </h3>
                  </div>
                  <Link
                    to={service.link}
                    className="shrink-0 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>

                <p className="mt-3 pl-12 text-sm leading-relaxed text-muted-foreground font-light max-w-xl">
                  {service.shortDesc}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column: Sticky Subtle Image Preview on Desktop */}
          <div className="col-span-5 sticky top-32">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary/30 border border-border/80">
              {STUDIO_SERVICES_LIST.map((service, idx) => (
                <DriveImage
                  key={service.number}
                  src={service.image}
                  alt={service.title}
                  className={cn(
                    "absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out",
                    activeHoverIdx === idx
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-105 pointer-events-none",
                  )}
                  wrapperClassName="absolute inset-0 size-full"
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-ink-foreground pointer-events-none">
                <span className="text-[10px] uppercase tracking-[0.24em] text-accent font-medium">
                  {activeHoverIdx !== null ? STUDIO_SERVICES_LIST[activeHoverIdx]?.number : "01"}
                </span>
                <p className="font-display text-xl text-ink-foreground mt-1">
                  {activeHoverIdx !== null ? STUDIO_SERVICES_LIST[activeHoverIdx]?.title : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW: Clean Accordion Rows (Section 21 Requirement) */}
      <div className="block md:hidden divide-y divide-border">
        {STUDIO_SERVICES_LIST.map((service, idx) => {
          const isOpen = openAccordionIdx === idx;
          return (
            <div key={service.number} className="py-5">
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="flex w-full items-center justify-between text-left gap-4 select-none"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-xs text-accent">{service.number}</span>
                  <span className="font-display text-lg font-light text-foreground">
                    {service.title}
                  </span>
                </div>
                <div className="p-1 text-muted-foreground">
                  {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="mt-4 pt-2 pl-7 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-xs leading-relaxed text-muted-foreground font-light">
                    {service.fullDesc}
                  </p>

                  <div className="aspect-[16/10] w-full overflow-hidden bg-secondary/30">
                    <DriveImage
                      src={service.image}
                      alt={service.title}
                      className="size-full object-cover"
                      wrapperClassName="size-full"
                    />
                  </div>

                  <ul className="space-y-1.5 text-xs text-muted-foreground pt-1">
                    {service.deliverables.map((item, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-2">
                        <span className="size-1 rounded-full bg-accent shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2">
                    <Link
                      to={service.link}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-accent font-medium"
                    >
                      Explore Service Details <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

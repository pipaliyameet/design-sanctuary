import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceItem } from "@/lib/public.functions";
import { DriveImage } from "./DriveImage";

export function EditorialServicesSection({
  services,
}: {
  services?: ServiceItem[];
}) {
  const [activeHoverIdx, setActiveHoverIdx] = useState<number | null>(0);
  const [openAccordionIdx, setOpenAccordionIdx] = useState<number | null>(0);

  if (!services || services.length === 0) {
    return null;
  }

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
            {services.map((service, idx) => (
              <div
                key={service.number || idx}
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
                    to={service.link || "/services"}
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

          {/* Right Column: Sticky Image Preview on Desktop */}
          <div className="col-span-5 sticky top-32">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone border border-border/80 rounded-sm shadow-md">
              {(() => {
                const currentService =
                  (activeHoverIdx !== null && services[activeHoverIdx]) || services[0]!;
                return (
                  <div key={currentService.number || currentService.title} className="relative size-full animate-in fade-in duration-300">
                    <DriveImage
                      src={currentService.image}
                      alt={currentService.title}
                      className="size-full object-cover"
                      wrapperClassName="size-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-6 left-6 right-6 text-ink-foreground pointer-events-none">
                      <span className="text-[10px] uppercase tracking-[0.24em] text-accent font-semibold">
                        {currentService.number}
                      </span>
                      <p className="font-display text-2xl text-ink-foreground mt-1 font-light">
                        {currentService.title}
                      </p>
                      {currentService.shortDesc && (
                        <p className="text-xs text-ink-foreground/80 font-light mt-1.5 line-clamp-2 leading-relaxed">
                          {currentService.shortDesc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW: Clean Accordion Rows */}
      <div className="block md:hidden divide-y divide-border">
        {services.map((service, idx) => {
          const isOpen = openAccordionIdx === idx;
          return (
            <div key={service.number || idx} className="py-5">
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
                    {service.fullDesc || service.shortDesc}
                  </p>

                  {service.image && (
                    <div className="aspect-[16/10] w-full overflow-hidden bg-stone">
                      <DriveImage
                        src={service.image}
                        alt={service.title}
                        className="size-full object-cover"
                        wrapperClassName="size-full"
                      />
                    </div>
                  )}

                  {service.deliverables && service.deliverables.length > 0 && (
                    <ul className="space-y-1.5 text-xs text-muted-foreground pt-1">
                      {service.deliverables.map((item, dIdx) => (
                        <li key={dIdx} className="flex items-center gap-2">
                          <span className="size-1 rounded-full bg-accent shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="pt-2">
                    <Link
                      to={service.link || "/services"}
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

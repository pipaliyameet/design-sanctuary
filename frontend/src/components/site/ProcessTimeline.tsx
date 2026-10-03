import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ProcessStepItem } from "@/lib/public.functions";

export function ProcessTimeline({
  steps,
}: {
  steps?: ProcessStepItem[];
}) {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div>
      {/* DESKTOP VIEW: Clean Horizontal Editorial Timeline */}
      <div className="hidden lg:grid grid-cols-5 gap-6 relative">
        {/* Continuous horizontal editorial connecting line */}
        <div className="absolute top-5 left-6 right-6 h-px bg-border/80 z-0" />

        {steps.map((step) => (
          <div key={step.number} className="relative z-10 flex flex-col justify-between pt-0">
            <div>
              {/* Step indicator dot */}
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center border border-border bg-background font-display text-sm font-light text-accent">
                  {step.number}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                  {step.timeline}
                </span>
              </div>

              <h4 className="mt-6 font-display text-xl text-foreground font-light tracking-tight">
                {step.title}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-light">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* TABLET VIEW: 2-3 Column Grid */}
      <div className="hidden sm:grid lg:hidden grid-cols-2 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="border-l-2 border-accent/70 pl-5 py-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-display text-base text-accent">{step.number}</span>
              <span className="font-mono text-[10px] tracking-wider uppercase">
                {step.timeline}
              </span>
            </div>
            <h4 className="mt-2 font-display text-lg text-foreground font-light">{step.title}</h4>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed font-light">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* MOBILE VIEW: Compact Vertical Timeline */}
      <div className="block sm:hidden space-y-6">
        {steps.map((step, idx) => (
          <div key={step.number} className="relative flex items-start gap-4">
            {/* Number Pill & Vertical Connecting Line */}
            <div className="flex flex-col items-center">
              <div className="flex size-8 items-center justify-center border border-accent/60 bg-background text-accent font-display text-xs">
                {step.number}
              </div>
              {idx < steps.length - 1 && (
                <div className="w-px h-12 bg-border/80 my-1" />
              )}
            </div>

            {/* Content */}
            <div className="pt-0.5 pb-2">
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="font-display text-base text-foreground font-light">{step.title}</h4>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-mono">
                  {step.timeline}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed font-light">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-end">
        <Link
          to="/process"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent hover:underline font-medium"
        >
          Explore Detailed Process Documentation <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}

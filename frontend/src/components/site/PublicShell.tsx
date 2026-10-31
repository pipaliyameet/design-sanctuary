import { type ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { STUDIO_DETAILS } from "@/lib/public.functions";
import { cn } from "@/lib/utils";

export function WhatsAppIcon({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 2C8.268 2 2 8.268 2 16c0 2.65.735 5.13 2.012 7.254L2.6 29.4l6.33-1.378A13.935 13.935 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2z"
        fill="#25D366"
      />
      <path
        d="M23.518 19.822c-.412-.206-2.438-1.203-2.815-1.34-.378-.137-.653-.206-.928.206-.275.412-1.066 1.34-1.306 1.614-.24.275-.481.309-.893.103-.412-.206-1.74-.641-3.315-2.045-1.226-1.093-2.054-2.443-2.295-2.855-.24-.412-.025-.635.18-.84.185-.185.412-.481.618-.722.206-.24.275-.412.412-.687.137-.275.069-.515-.034-.722-.103-.206-.928-2.235-1.272-3.06-.334-.803-.674-.694-.928-.707-.24-.012-.515-.015-.79-.015-.275 0-.722.103-1.1.515-.378.412-1.443 1.41-1.443 3.438s1.478 3.987 1.684 4.262c.206.275 2.908 4.44 7.045 6.225.984.425 1.753.679 2.352.869.988.314 1.888.27 2.6.164.794-.118 2.438-.997 2.782-1.959.344-.962.344-1.787.24-1.959-.103-.172-.378-.275-.79-.481z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function PublicShell({
  children,
  overlayHeader = false,
  hideFloatingWhatsApp = false,
}: {
  children: ReactNode;
  overlayHeader?: boolean;
  hideFloatingWhatsApp?: boolean;
}) {
  const whatsappUrl = `https://wa.me/${STUDIO_DETAILS.whatsappNumber}?text=${encodeURIComponent("Hello Right-Angle-Design-Studio, I would like to discuss an interior design project.")}`;

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col bg-background text-foreground selection:bg-accent/25 selection:text-foreground overflow-x-clip">
      <SiteHeader overlay={overlayHeader} />
      <main className={cn("w-full max-w-full overflow-x-clip", overlayHeader ? "flex-1" : "flex-1 pt-20")}>
        {children}
      </main>
      <SiteFooter />

      {/* Floating Edge WhatsApp Action (Livspace-style flush right-edge tab) */}
      {!hideFloatingWhatsApp && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Right Angle Design Studio on WhatsApp"
          className="group fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center rounded-l-lg bg-white p-2 sm:p-2.5 shadow-[-2px_4px_14px_rgba(0,0,0,0.15)] border-y border-l border-black/10 cursor-pointer transition-shadow duration-200 hover:shadow-[-4px_6px_20px_rgba(0,0,0,0.22)] active:scale-95"
        >
          <WhatsAppIcon className="size-6 sm:size-7 drop-shadow-xs transition-transform duration-200 group-hover:scale-110" />

          {/* Hover Tooltip (slides out cleanly to the left while button stays locked to screen edge) */}
          <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-stone-900/95 text-white px-3 py-1.5 text-xs font-sans font-medium tracking-wide opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 shadow-lg">
            Chat on WhatsApp
          </span>
        </a>
      )}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16 py-16 sm:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal text-foreground tracking-tight leading-[1.08]">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-foreground/85 font-normal">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}


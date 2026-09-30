import type { ReactNode } from "react";
import { MessageSquare } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { STUDIO_DETAILS } from "@/lib/public.functions";

export function PublicShell({
  children,
  overlayHeader = false,
}: {
  children: ReactNode;
  overlayHeader?: boolean;
}) {
  const whatsappUrl = `https://wa.me/${STUDIO_DETAILS.whatsappNumber}?text=${encodeURIComponent("Hello Atelier Vermilion, I would like to discuss an interior design project.")}`;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-accent/30 selection:text-foreground">
      <SiteHeader overlay={overlayHeader} />
      <main className={overlayHeader ? "flex-1" : "flex-1 pt-20"}>{children}</main>
      <SiteFooter />

      {/* Single Controlled Floating WhatsApp Action for Mobile (Requirement 24) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Atelier Vermilion on WhatsApp"
        className="fixed bottom-5 right-5 z-40 md:hidden flex size-12 items-center justify-center rounded-full bg-foreground text-background border border-accent/60 shadow-xl transition-transform active:scale-95 hover:bg-accent hover:text-accent-foreground"
      >
        <MessageSquare className="size-5 text-accent" />
      </a>
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
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-3xl sm:text-5xl lg:text-6xl font-light text-foreground tracking-tight leading-[1.12]">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-muted-foreground font-light">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}


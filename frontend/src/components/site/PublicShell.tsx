import { useEffect, type ReactNode } from "react";
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
  const whatsappUrl = `https://wa.me/${STUDIO_DETAILS.whatsappNumber}?text=${encodeURIComponent("Hello Right-Angle-Design-Studio, I would like to discuss an interior design project.")}`;

  // Content & Inspection Protection for Customer-facing pages
  useEffect(() => {
    // 1. Disable Right-Click Context Menu (Prevents Inspect & Save As)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable DevTools & Inspect Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + Shift + I/J/C (Inspect, Console, Elements)
      if (
        (isCmdOrCtrl && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67))
      ) {
        e.preventDefault();
        return false;
      }

      // Ctrl/Cmd + Option/Alt + I/J/C (Safari/Chrome DevTools on Mac)
      if (isCmdOrCtrl && e.altKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) {
        e.preventDefault();
        return false;
      }

      // Ctrl/Cmd + U (View Source)
      if ((isCmdOrCtrl && (e.key === "u" || e.key === "U")) || (e.ctrlKey && e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }

      // Ctrl/Cmd + S (Save Page)
      if ((isCmdOrCtrl && (e.key === "s" || e.key === "S")) || (e.ctrlKey && e.keyCode === 83)) {
        e.preventDefault();
        return false;
      }

      // Ctrl/Cmd + P (Print / Save PDF)
      if ((isCmdOrCtrl && (e.key === "p" || e.key === "P")) || (e.ctrlKey && e.keyCode === 80)) {
        e.preventDefault();
        return false;
      }

      // Ctrl/Cmd + C / X / A (Copy / Cut / Select All - only allow inside real form inputs)
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === "input" || targetTag === "textarea";
      if (
        isCmdOrCtrl &&
        ["c", "C", "x", "X", "a", "A"].includes(e.key) &&
        !isInput
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Disable Image / Video Dragging (Prevents dragging to desktop or browser tab)
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "IMG" ||
        target?.tagName === "PICTURE" ||
        target?.tagName === "VIDEO" ||
        target?.closest("img") ||
        target?.closest("picture") ||
        target?.closest("video")
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 4. Disable Copy Event on page text
    const handleCopy = (e: ClipboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      const isInput = activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA";
      if (!isInput) {
        e.preventDefault();
      }
    };

    // 5. Disable Text Selection Start
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (!isInput) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu, { capture: true });
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("dragstart", handleDragStart, { capture: true });
    document.addEventListener("copy", handleCopy, { capture: true });
    document.addEventListener("selectstart", handleSelectStart, { capture: true });

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("dragstart", handleDragStart, { capture: true });
      document.removeEventListener("copy", handleCopy, { capture: true });
      document.removeEventListener("selectstart", handleSelectStart, { capture: true });
    };
  }, []);

  return (
    <div className="public-site-guard select-none flex min-h-screen flex-col bg-background text-foreground selection:bg-transparent selection:text-transparent">
      <SiteHeader overlay={overlayHeader} />
      <main className={overlayHeader ? "flex-1" : "flex-1 pt-20"}>{children}</main>
      <SiteFooter />

      {/* Single Controlled Floating WhatsApp Action for Mobile (Requirement 24) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Right-Angle-Design-Studio on WhatsApp"
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
      <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16 py-16 sm:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-foreground tracking-tight leading-[1.08]">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground font-light">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}


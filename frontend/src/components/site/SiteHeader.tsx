import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight, MessageSquare, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { STUDIO_DETAILS } from "@/lib/public.functions";

const NAV = [
  { to: "/portfolio", label: "Projects" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/process", label: "Process" },
  { to: "/journal", label: "Journal" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const solid = !overlay || scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "bg-background/90 border-b border-border/70 backdrop-blur-md shadow-xs py-0"
          : "bg-gradient-to-b from-ink/70 via-ink/30 to-transparent py-2",
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-5 sm:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          className="group flex flex-col items-start leading-none tracking-tight transition-transform hover:opacity-90"
        >
          <span
            className={cn(
              "font-display text-xl sm:text-2xl font-light tracking-wide transition-colors",
              solid ? "text-foreground" : "text-ink-foreground",
            )}
          >
            Atelier <span className="font-normal italic text-accent">Vermilion</span>
          </span>
          <span
            className={cn(
              "text-[9px] uppercase tracking-[0.26em] transition-colors mt-1 font-sans",
              solid ? "text-muted-foreground" : "text-ink-foreground/70",
            )}
          >
            Architecture & Interiors
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 lg:gap-9 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "text-xs uppercase tracking-[0.18em] transition-colors hover:text-accent font-medium relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-accent after:scale-x-0 after:transition-transform hover:after:scale-x-100",
                solid ? "text-foreground/80" : "text-ink-foreground/90",
              )}
              activeProps={{ className: "text-accent after:scale-x-100 font-semibold" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Action CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/auth"
            className={cn(
              "text-xs tracking-wider transition-colors hover:text-accent px-2",
              solid ? "text-muted-foreground" : "text-ink-foreground/70",
            )}
          >
            Portal
          </Link>
          <Link
            to="/contact"
            hash="consultation"
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.18em] uppercase transition-all duration-300 font-medium",
              solid
                ? "bg-foreground text-background hover:bg-accent hover:text-accent-foreground"
                : "bg-accent text-accent-foreground hover:bg-ink-foreground hover:text-ink",
            )}
          >
            Book a Consultation <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "p-2 md:hidden transition-colors focus:outline-none",
            solid ? "text-foreground" : "text-ink-foreground",
          )}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Fullscreen Slide-out Menu */}
      {open && (
        <div className="fixed inset-x-0 top-20 bottom-0 z-40 bg-background/98 backdrop-blur-2xl flex flex-col justify-between px-6 py-8 md:hidden overflow-y-auto border-t border-border">
          <nav className="flex flex-col space-y-5 pt-2">
            {NAV.map((item, idx) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-border/50 pb-4 text-2xl font-display text-foreground hover:text-accent transition-colors"
              >
                <span>{item.label}</span>
                <span className="text-xs font-sans tracking-widest text-muted-foreground">
                  0{idx + 1}
                </span>
              </Link>
            ))}
          </nav>

          <div className="space-y-6 pt-8 border-t border-border">
            <Link
              to="/contact"
              hash="consultation"
              onClick={() => setOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 bg-foreground px-6 py-4 text-xs tracking-[0.2em] uppercase text-background font-medium"
            >
              Book a Consultation <ArrowRight className="size-3.5" />
            </Link>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <a
                href={`https://wa.me/${STUDIO_DETAILS.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-border p-3 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <MessageSquare className="size-3.5 text-accent" /> WhatsApp
              </a>
              <a
                href="tel:+919820041100"
                className="flex items-center justify-center gap-2 border border-border p-3 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <Phone className="size-3.5 text-accent" /> Call Studio
              </a>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>Mumbai · Bengaluru</span>
              <Link to="/auth" onClick={() => setOpen(false)} className="hover:text-accent">
                Client / Studio Portal →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

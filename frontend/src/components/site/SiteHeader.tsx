import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight, MessageSquare, Phone, User } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";
import { STUDIO_DETAILS } from "@/lib/public.functions";

// Refined Primary Navigation
const PRIMARY_NAV = [
  { to: "/gallery", label: "Gallery" },
  { to: "/services", label: "Services" },
  { to: "/process", label: "Process" },
  { to: "/about", label: "Studio" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [currentPath]);

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
          ? "bg-background/95 border-b border-border/70 backdrop-blur-md shadow-xs py-0"
          : "bg-gradient-to-b from-ink/75 via-ink/30 to-transparent py-2",
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1720px] items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Brand Vector Logo */}
        <Link
          to="/"
          aria-label="Right Angle Design Studio — Home"
          className="group flex items-center transition-opacity hover:opacity-90"
        >
          <BrandLogo
            variant="horizontal"
            theme={solid ? "dark" : "light"}
            size="sm"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-6 lg:gap-8 md:flex">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "text-xs uppercase tracking-[0.18em] transition-colors hover:text-accent font-medium relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-accent after:scale-x-0 after:transition-transform hover:after:scale-x-100",
                solid ? "text-foreground/85" : "text-ink-foreground/90",
              )}
              activeProps={{ className: "text-accent after:scale-x-100 font-semibold" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Action CTAs */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <Link
            to="/auth"
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-2 text-xs tracking-[0.16em] uppercase transition-colors font-medium border rounded-none",
              solid
                ? "border-border/80 text-foreground hover:border-accent hover:text-accent bg-transparent"
                : "border-ink-foreground/30 text-ink-foreground hover:border-accent hover:text-accent bg-ink/20 backdrop-blur-xs",
            )}
          >
            <User className="size-3.5" />
            <span>Owner Login</span>
          </Link>

          <Link
            to="/contact"
            hash="consultation"
            className={cn(
              "inline-flex items-center gap-2 px-5 lg:px-6 py-2.5 text-xs tracking-[0.18em] uppercase transition-all duration-300 font-medium",
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
            "p-2 min-h-[44px] min-w-[44px] flex items-center justify-center md:hidden transition-colors focus:outline-none cursor-pointer",
            solid ? "text-foreground" : "text-ink-foreground",
          )}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Fullscreen Slide-out Menu */}
      {open && (
        <div className="fixed inset-x-0 top-20 bottom-0 z-40 bg-background/98 backdrop-blur-2xl flex flex-col justify-between px-6 py-8 md:hidden overflow-y-auto border-t border-border animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col space-y-3 pt-2">
            {PRIMARY_NAV.map((item, idx) => {
              const isActive = currentPath.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between border-b border-border/50 pb-3.5 text-2xl font-display transition-colors min-h-[44px]",
                    isActive ? "text-accent font-normal" : "text-foreground hover:text-accent font-light",
                  )}
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-sans tracking-widest text-muted-foreground">
                    0{idx + 1}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="space-y-4 pt-5 border-t border-border">
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 border border-border bg-card/60 px-6 py-3 text-xs tracking-[0.2em] uppercase text-foreground font-medium hover:border-accent hover:text-accent transition-colors"
            >
              <User className="size-3.5 text-accent" />
              <span>Owner / Studio Login</span>
            </Link>

            <Link
              to="/contact"
              hash="consultation"
              onClick={() => setOpen(false)}
              className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 bg-foreground px-6 py-3.5 text-xs tracking-[0.2em] uppercase text-background font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Book a Consultation <ArrowRight className="size-3.5" />
            </Link>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <a
                href={`https://wa.me/${STUDIO_DETAILS.whatsappNumber}?text=${encodeURIComponent("Hello Right Angle Design Studio, I would like to discuss an interior design project.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] flex items-center justify-center gap-2 border border-border p-3 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
              >
                <MessageSquare className="size-3.5 text-accent" /> WhatsApp
              </a>
              <a
                href="tel:+919820041100"
                className="min-h-[44px] flex items-center justify-center gap-2 border border-border p-3 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
              >
                <Phone className="size-3.5 text-accent" /> Call Studio
              </a>
            </div>

            <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border/40">
              <span>Mumbai · Bengaluru · Pan-India</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


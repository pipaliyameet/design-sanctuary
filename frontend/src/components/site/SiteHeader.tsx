import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight, MessageSquare, Phone, User } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";
import { STUDIO_DETAILS } from "@/lib/public.functions";

// Refined Primary Navigation
const PRIMARY_NAV = [
  { to: "/", label: "Portfolio" },
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
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        open
          ? "inset-0 h-dvh h-screen bg-background flex flex-col overflow-hidden"
          : solid
            ? "bg-background/95 border-b border-border/70 backdrop-blur-md shadow-xs py-0"
            : "bg-gradient-to-b from-black/85 via-black/45 to-transparent py-2",
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-20 w-full max-w-[1720px] items-center justify-between gap-3 lg:gap-6 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 shrink-0 transition-colors",
          open && "border-b border-border/80",
        )}
      >
        {/* Brand Vector Logo */}
        <Link
          to="/"
          aria-label="Right Angle Design Studio — Home"
          onClick={() => setOpen(false)}
          className="group flex items-center transition-opacity hover:opacity-90 shrink-0"
        >
          <BrandLogo
            variant="horizontal"
            theme={solid || open ? "dark" : "light"}
            size="sm"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-3 xl:gap-6 2xl:gap-8 lg:flex shrink-0">
          {PRIMARY_NAV.map((item) => {
            const isActive =
              item.to === "/"
                ? currentPath === "/" || currentPath === "/portfolio" || currentPath.startsWith("/portfolio/")
                : currentPath.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "text-[11px] xl:text-xs uppercase tracking-[0.14em] xl:tracking-[0.18em] relative py-1 whitespace-nowrap shrink-0 transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-transform",
                  solid
                    ? isActive
                      ? "text-accent font-semibold after:bg-accent after:scale-x-100"
                      : "text-foreground/80 hover:text-accent font-medium after:bg-accent after:scale-x-0 hover:after:scale-x-100"
                    : isActive
                      ? "text-white font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] after:bg-white after:scale-x-100 after:shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                      : "text-stone-300 hover:text-white font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] after:bg-white after:scale-x-0 hover:after:scale-x-100 hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action CTAs (Desktop & Tablet) */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-3.5 xl:gap-4 shrink-0">
          <Link
            to="/auth"
            className={cn(
              "hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] xl:text-xs tracking-[0.14em] uppercase transition-all duration-200 font-medium border rounded-none min-h-[38px] whitespace-nowrap shrink-0",
              solid
                ? "border-border/80 text-foreground hover:border-accent hover:text-accent hover:bg-accent/5 bg-transparent"
                : "border-white/50 text-white hover:border-white hover:text-white hover:bg-white/15 bg-black/25 backdrop-blur-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]",
            )}
          >
            <User className="size-3.5" />
            <span>Login</span>
          </Link>

          <Link
            to="/contact"
            hash="consultation"
            className={cn(
              "hidden md:inline-flex items-center gap-1.5 lg:gap-2 px-3.5 xl:px-5 py-2 lg:py-2.5 text-[11px] xl:text-xs tracking-[0.14em] xl:tracking-[0.18em] uppercase transition-all duration-300 min-h-[38px] whitespace-nowrap shrink-0 shadow-sm",
              solid
                ? "bg-foreground text-background font-medium hover:bg-accent hover:text-white"
                : "bg-stone-100 text-stone-900 font-medium hover:bg-white hover:text-black shadow-lg shadow-black/35",
            )}
          >
            <span className="hidden xl:inline">Book a </span>Consultation <ArrowRight className="size-3 shrink-0" />
          </Link>

          {/* Tablet / Mobile Hamburger Button */}
          <button
            type="button"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "p-2 min-h-[44px] min-w-[44px] flex items-center justify-center lg:hidden transition-colors focus:outline-none cursor-pointer rounded shrink-0",
              solid || open
                ? "text-foreground hover:text-accent"
                : "text-white hover:text-stone-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]",
            )}
          >
            {open ? <X className="size-6 text-foreground" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Fullscreen Menu Drawer Body */}
      {open && (
        <div className="flex-1 min-h-0 w-full overflow-y-auto px-5 sm:px-8 py-6 flex flex-col justify-between lg:hidden bg-background animate-in fade-in duration-200">
          <nav className="flex flex-col space-y-1 pt-1">
            {PRIMARY_NAV.map((item, idx) => {
              const isActive = currentPath === item.to || (item.to !== "/" && currentPath.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between border-b border-border/50 py-3 text-2xl font-display transition-colors min-h-[48px]",
                    isActive ? "text-accent font-normal" : "text-foreground hover:text-accent font-light",
                  )}
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-sans tracking-widest text-muted-foreground font-mono">
                    0{idx + 1}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="space-y-3.5 pt-6 pb-6 border-t border-border mt-6 shrink-0">
            <Link
              to="/contact"
              hash="consultation"
              onClick={() => setOpen(false)}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 bg-foreground px-4 py-3.5 text-xs tracking-[0.2em] uppercase text-background font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Book a Consultation <ArrowRight className="size-3.5" />
            </Link>

            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 border border-border bg-card/70 px-4 py-3 text-xs tracking-[0.18em] uppercase text-foreground font-medium hover:border-accent hover:text-accent transition-colors"
            >
              <User className="size-3.5 text-accent" />
              <span>Login</span>
            </Link>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <a
                href={`https://wa.me/${STUDIO_DETAILS.whatsappNumber}?text=${encodeURIComponent("Hello Right Angle Design Studio, I would like to discuss an interior design project.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] flex items-center justify-center gap-1.5 border border-border bg-card/40 p-2.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-accent transition-colors text-center"
              >
                <MessageSquare className="size-3.5 text-accent shrink-0" /> <span className="truncate">WhatsApp</span>
              </a>
              <a
                href={`tel:${STUDIO_DETAILS.phone}`}
                className="min-h-[44px] flex items-center justify-center gap-1.5 border border-border bg-card/40 p-2.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-accent transition-colors text-center"
              >
                <Phone className="size-3.5 text-accent shrink-0" /> <span className="truncate">Call Studio</span>
              </a>
            </div>

            <div className="text-center text-[11px] text-muted-foreground pt-2 border-t border-border/40">
              <span>Mumbai · Bengaluru · Pan-India</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


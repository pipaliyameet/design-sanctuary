import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/portfolio", label: "Portfolio" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "Studio" },
  { to: "/journal", label: "Journal" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !overlay || scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        solid ? "bg-background/92 border-b border-border backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <Link
          to="/"
          className={cn(
            "font-display text-lg tracking-tight transition-colors",
            solid ? "text-foreground" : "text-ink-foreground",
          )}
        >
          Atelier <span className="text-accent">Vermilion</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "text-[0.8125rem] tracking-wide transition-colors hover:text-accent",
                solid ? "text-muted-foreground" : "text-ink-foreground/80",
              )}
              activeProps={{ className: "text-accent" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/auth"
            className={cn(
              "border px-4 py-2 text-[0.75rem] tracking-[0.18em] uppercase transition-colors",
              solid
                ? "border-foreground/25 text-foreground hover:border-accent hover:text-accent"
                : "border-ink-foreground/40 text-ink-foreground hover:border-accent hover:text-accent",
            )}
          >
            Sign in
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className={cn("md:hidden", solid ? "text-foreground" : "text-ink-foreground")}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-5 pb-6 md:hidden">
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-border py-4 text-sm text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="mt-5 bg-primary px-4 py-3 text-center text-xs tracking-[0.18em] text-primary-foreground uppercase"
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

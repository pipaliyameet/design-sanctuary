import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  Menu,
  X,
  Search,
  MapPin,
  Heart,
  ShoppingBag,
  ArrowRight,
  MessageSquare,
  Phone,
  ChevronDown,
  Check,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";
import { STUDIO_DETAILS } from "@/lib/public.functions";

const STUDIO_LOCATIONS = [
  { name: "Jetpur / Rajkot", pincode: "360380", address: "Near Mayo Hospital, Jetpur, Rajkot" },
  { name: "Mumbai", pincode: "400013", address: "Lower Parel Studio" },
  { name: "Bengaluru", pincode: "560038", address: "Indiranagar Studio" },
  { name: "Ahmedabad", pincode: "380054", address: "Bodakdev Studio" },
  { name: "Delhi NCR", pincode: "110001", address: "Connaught Place Hub" },
  { name: "Pune", pincode: "411001", address: "Koregaon Park Studio" },
  { name: "Hyderabad", pincode: "500034", address: "Jubilee Hills Hub" },
];

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(STUDIO_LOCATIONS[0]);
  const locationRef = useRef<HTMLDivElement>(null);

  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname ?? "/";
  const navigate = useNavigate();

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setLocationOpen(false);
  }, [currentPath]);

  // Click outside listener for location dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({
        to: "/gallery",
        search: { search: searchQuery.trim() } as any,
      });
      setOpen(false);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white border-b border-stone-200/90 shadow-xs transition-all">
      {/* =======================================================================
          MAIN HEADER (Livspace Reference: Logo + Tabs + Search + Location + Icons)
          ======================================================================= */}
      <div className="mx-auto flex h-[72px] w-full max-w-[1720px] items-center justify-between gap-4 lg:gap-8 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 shrink-0">
        {/* Left: Brand Logo & Primary Tabs */}
        <div className="flex items-center gap-6 xl:gap-8 shrink-0">
          <Link
            to="/"
            aria-label="Right Angle Design Studio — Home"
            onClick={() => setOpen(false)}
            className="group flex items-center transition-opacity hover:opacity-90 shrink-0"
          >
            <BrandLogo variant="horizontal" theme="dark" size="sm" />
          </Link>

          {/* Primary Category Links next to Logo (EXACT City Blueprint font, Made Deep Dark & Thick) */}
          <nav className="hidden lg:flex items-center gap-7 text-lg xl:text-xl font-display font-bold tracking-wide">
            <Link
              to="/services"
              className={cn(
                "relative py-1 transition-colors whitespace-nowrap",
                currentPath.startsWith("/services")
                  ? "text-accent font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent"
                  : "text-black hover:text-accent font-bold"
              )}
              style={{
                WebkitTextStroke: "0.55px currentColor",
              }}
            >
              Interiors
            </Link>

            <Link
              to="/gallery"
              className={cn(
                "relative py-1 transition-colors whitespace-nowrap",
                currentPath.startsWith("/gallery")
                  ? "text-accent font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent"
                  : "text-black hover:text-accent font-bold"
              )}
              style={{
                WebkitTextStroke: "0.55px currentColor",
              }}
            >
              Gallery
            </Link>

            <Link
              to="/contact"
              className={cn(
                "relative py-1 transition-colors whitespace-nowrap",
                currentPath.startsWith("/contact")
                  ? "text-accent font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent"
                  : "text-black hover:text-accent font-bold"
              )}
              style={{
                WebkitTextStroke: "0.55px currentColor",
              }}
            >
              Find a Studio
            </Link>
          </nav>
        </div>

        {/* Center / Right: Search Input + Location + Icons */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-1 justify-end">
          {/* Functional Search Bar with Dark Text & Bold Icon */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden sm:flex items-center w-[220px] md:w-[280px] lg:w-[320px] xl:w-[380px]"
          >
            <Search className="absolute left-3.5 size-4 text-stone-700 pointer-events-none stroke-[2.3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search living room, modular kitchen, materials..."
              className="w-full h-10 pl-10 pr-3.5 text-xs font-sans font-semibold bg-stone-50 border border-stone-300 rounded-md text-stone-950 placeholder:text-stone-500 placeholder:font-medium focus:outline-none focus:border-stone-900 focus:bg-white transition-all shadow-xs"
            />
          </form>

          {/* Location Selector (Livspace Style: Pin + City & Pincode with Bold Dark Text) */}
          <div ref={locationRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setLocationOpen((v) => !v)}
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-stone-100 transition-colors text-left cursor-pointer group"
              aria-label="Select Studio Location"
            >
              <MapPin className="size-4.5 text-stone-900 shrink-0 stroke-[2.3] group-hover:text-accent transition-colors" />
              <div className="flex flex-col leading-tight font-sans">
                <div className="flex items-center gap-1 text-xs font-bold text-stone-950">
                  <span>{selectedCity.name}</span>
                  <ChevronDown className="size-3.5 text-stone-900 stroke-[2.5]" />
                </div>
                <span className="text-[10px] text-stone-600 font-mono font-bold">{selectedCity.pincode}</span>
              </div>
            </button>

            {/* City Dropdown Menu */}
            {locationOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-stone-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <p className="px-2.5 py-1 text-[10px] font-mono tracking-widest text-stone-500 uppercase border-b border-stone-100 font-bold">
                  Select Studio City
                </p>
                <div className="mt-1 space-y-0.5">
                  {STUDIO_LOCATIONS.map((loc) => {
                    const isSelected = selectedCity.name === loc.name;
                    return (
                      <button
                        key={loc.name}
                        type="button"
                        onClick={() => {
                          setSelectedCity(loc);
                          setLocationOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-md text-left transition-colors cursor-pointer font-sans",
                          isSelected
                            ? "bg-accent/10 text-accent font-bold"
                            : "text-stone-900 font-semibold hover:bg-stone-50"
                        )}
                      >
                        <div>
                          <p className="font-bold">{loc.name}</p>
                          <p className="text-[10px] text-stone-500 font-medium">{loc.address}</p>
                        </div>
                        {isSelected && <Check className="size-3.5 text-accent stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Icons (Wishlist, Consultation Quote / Cart, User Profile) with Bold Strokes */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Wishlist / Inspirations */}
            <Link
              to="/gallery"
              aria-label="Saved Inspirations"
              title="Saved Inspirations"
              className="size-9 rounded-full flex items-center justify-center text-stone-900 hover:text-accent hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <Heart className="size-5 stroke-[2.2]" />
            </Link>

            {/* Project Quote / Cart */}
            <Link
              to="/contact"
              hash="consultation"
              aria-label="Project Inquiry & Free Quote"
              title="Get Free Quote"
              className="size-9 rounded-full flex items-center justify-center text-stone-900 hover:text-accent hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <ShoppingBag className="size-5 stroke-[2.2]" />
            </Link>

            {/* Mobile / Tablet Menu Trigger */}
            <button
              type="button"
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setOpen((v) => !v)}
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center lg:hidden transition-colors cursor-pointer text-stone-900 hover:text-accent rounded"
            >
              {open ? <X className="size-6 stroke-[2.5]" /> : <Menu className="size-6 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </div>

      {/* =======================================================================
          MOBILE & TABLET DRAWER
          ======================================================================= */}
      {open && (
        <div className="fixed inset-x-0 top-[108px] bottom-0 z-50 overflow-y-auto px-6 py-6 flex flex-col justify-between lg:hidden bg-background animate-in fade-in duration-200 border-t border-border">
          <div className="space-y-6">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms, styles, materials..."
                className="w-full h-11 pl-10 pr-4 text-xs bg-stone-50 dark:bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground"
              />
            </form>

            {/* Mobile Location Selector */}
            <div className="border border-border rounded-lg p-3 bg-card/40">
              <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-2">
                Selected Studio Location
              </p>
              <div className="grid grid-cols-2 gap-2">
                {STUDIO_LOCATIONS.map((loc) => {
                  const isSelected = selectedCity.name === loc.name;
                  return (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => setSelectedCity(loc)}
                      className={cn(
                        "p-2 text-xs rounded border text-left flex items-center justify-between",
                        isSelected
                          ? "border-accent bg-accent/10 text-accent font-medium"
                          : "border-border text-foreground hover:bg-stone-50"
                      )}
                    >
                      <span>{loc.name}</span>
                      <span className="font-mono text-[10px] opacity-60">{loc.pincode}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col space-y-1 border-t border-border pt-4">
              {[
                { to: "/", label: "Home Page" },
                { to: "/services", label: "Interiors & Offerings" },
                { to: "/gallery", label: "Design Ideas & Gallery" },
                { to: "/contact", label: "Find a Studio & Contact" },
              ].map((item, idx) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-stone-200/80 py-3 text-2xl font-display font-bold text-black hover:text-accent transition-colors"
                  style={{
                    WebkitTextStroke: "0.45px currentColor",
                  }}
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-mono text-stone-500 font-bold">0{idx + 1}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Action CTAs in Mobile Drawer */}
          <div className="space-y-3 pt-6 border-t border-border mt-6 shrink-0">
            <Link
              to="/contact"
              hash="consultation"
              onClick={() => setOpen(false)}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 bg-foreground text-background px-4 py-3.5 text-xs tracking-[0.2em] uppercase font-semibold hover:bg-accent hover:text-white transition-colors rounded"
            >
              Get Free Quote & Consultation <ArrowRight className="size-3.5" />
            </Link>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <a
                href={`https://wa.me/${STUDIO_DETAILS.whatsappNumber}?text=${encodeURIComponent("Hello Right Angle Design Studio, I would like to get a quote for my interiors.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] flex items-center justify-center gap-1.5 border border-border bg-card/60 p-2.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-accent transition-colors rounded text-center"
              >
                <MessageSquare className="size-3.5 text-accent shrink-0" /> <span>WhatsApp</span>
              </a>
              <a
                href={`tel:${STUDIO_DETAILS.phone}`}
                className="min-h-[44px] flex items-center justify-center gap-1.5 border border-border bg-card/60 p-2.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-accent transition-colors rounded text-center"
              >
                <Phone className="size-3.5 text-accent shrink-0" /> <span>Call Studio</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

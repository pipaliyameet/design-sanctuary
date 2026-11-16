import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  Menu,
  X,
  Search,
  MapPin,
  Heart,
  ShoppingBag,
  User,
  ArrowRight,
  MessageSquare,
  Phone,
  ChevronDown,
  Check,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";
import { STUDIO_DETAILS } from "@/lib/public.functions";
import { useSession } from "@/hooks/useSession";

const STUDIO_LOCATIONS = [
  {
    name: "Jetpur (HQ)",
    pincode: "360370",
    address: "1st Floor, Shree Nathji Complex, Junagadh Road, Jetpur",
    phone: "+91 95375 86804",
    tag: "Main Studio",
    mapsUrl:
      "https://www.google.com/maps/place/Right+Angle+Design+Studio/@21.7478479,70.6124044,17z/data=!4m14!1m7!3m6!1s0x3957f3217145c5a9:0x5511871d3726d602!2sRight+Angle+Design+Studio!8m2!3d21.7478479!4d70.6149793!16s%2Fg%2F11svbd8k13!3m5!1s0x3957f3217145c5a9:0x5511871d3726d602!8m2!3d21.7478479!4d70.6149793!16s%2Fg%2F11svbd8k13?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",
  },
  {
    name: "Rajkot",
    pincode: "360004",
    address: "919, RK Empire, Near Mavdi Bridge, 150 Ft. Ring Road, Rajkot",
    phone: "+91 95375 86804",
    tag: "Design Studio",
    mapsUrl:
      "https://www.google.com/maps/place/RK+Empire/@22.2627491,70.7839947,17z/data=!3m1!4b1!4m6!3m5!1s0x3959ca5dbe7afda3:0x6d8e1af5be0f4126!8m2!3d22.2627491!4d70.7865696!16s%2Fg%2F11gd7l319v?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",
  },
  {
    name: "Ahmedabad",
    pincode: "380054",
    address: "On-Site Booking & Consultation (By Appointment · No Office)",
    phone: "+91 95375 86804",
    tag: "Site Bookings Only",
  },
];

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(STUDIO_LOCATIONS[0]);
  const locationRef = useRef<HTMLDivElement>(null);

  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname ?? "/";
  const navigate = useNavigate();
  const { data: session } = useSession();
  const authTarget = "/auth";
  const authLabel = session?.email ? `Studio Account (${session.email})` : "Sign In / Studio Portal";

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setMobileSearchOpen(false);
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
          DESKTOP HEADER (Logo + Tabs + Search + Location + Icons)
          ======================================================================= */}
      <div className="mx-auto hidden lg:flex h-[72px] w-full max-w-[1720px] items-center justify-between gap-4 lg:gap-8 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 shrink-0">
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
          <nav className="flex items-center gap-7 text-lg xl:text-xl font-display font-bold tracking-wide">
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
            className="relative flex items-center w-[220px] md:w-[280px] lg:w-[320px] xl:w-[380px]"
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
          <div ref={locationRef} className="relative">
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
              <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-stone-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <p className="px-2.5 py-1 text-[10px] font-mono tracking-widest text-stone-500 uppercase border-b border-stone-100 font-bold">
                  Select Studio Location
                </p>
                <div className="mt-1 space-y-1">
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
                          "w-full flex items-start justify-between p-2 text-xs rounded-md text-left transition-colors cursor-pointer font-sans",
                          isSelected
                            ? "bg-accent/10 text-accent font-bold"
                            : "text-stone-900 font-semibold hover:bg-stone-50"
                        )}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-foreground">{loc.name}</p>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-medium">
                              {loc.tag}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500 font-medium leading-tight">{loc.address}</p>
                          <div className="flex items-center justify-between pt-0.5">
                            <p className="text-[10px] text-accent font-mono font-bold">📞 {loc.phone}</p>
                            {loc.mapsUrl && (
                              <a
                                href={loc.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] text-stone-700 hover:text-accent font-semibold underline underline-offset-2 flex items-center gap-0.5 ml-2"
                              >
                                Map ↗
                              </a>
                            )}
                          </div>
                        </div>
                        {isSelected && <Check className="size-3.5 text-accent stroke-[2.5] shrink-0 mt-0.5" />}
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

            {/* Login / Studio Portal (Livspace Style User Profile) */}
            <Link
              to={authTarget}
              aria-label={authLabel}
              title={authLabel}
              className={cn(
                "size-9 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                session?.email
                  ? "bg-accent/15 text-accent hover:bg-accent hover:text-white"
                  : "text-stone-900 hover:text-accent hover:bg-stone-100"
              )}
            >
              <User className="size-5 stroke-[2.2]" />
            </Link>
          </div>
        </div>
      </div>

      {/* =======================================================================
          MOBILE HEADER ROW (Livspace Reference: Menu+Search | Logo | Heart+Bag+User)
          ======================================================================= */}
      <div className="flex lg:hidden h-[54px] w-full items-center justify-between px-3 sm:px-4">
        {/* Left: Hamburger Menu + Search Trigger */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setOpen((v) => !v);
              setMobileSearchOpen(false);
            }}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            className="p-1.5 text-stone-900 hover:text-accent rounded-md transition-colors"
          >
            {open ? <X className="size-6 stroke-[2.3]" /> : <Menu className="size-6 stroke-[2.3]" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((v) => !v);
              if (open) setOpen(false);
            }}
            aria-label="Toggle mobile search"
            className="p-1.5 text-stone-900 hover:text-accent rounded-md transition-colors"
          >
            <Search className="size-5 stroke-[2.3]" />
          </button>
        </div>

        {/* Center: Brand Logo */}
        <Link
          to="/"
          aria-label="Right Angle Design Studio — Home"
          onClick={() => {
            setOpen(false);
            setMobileSearchOpen(false);
          }}
          className="flex items-center justify-center shrink-0"
        >
          <BrandLogo variant="horizontal" theme="dark" size="xs" />
        </Link>

        {/* Right: Wishlist (Heart), Quote (Bag), Profile (User) */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Link
            to="/gallery"
            aria-label="Saved Inspirations"
            className="p-1.5 text-stone-900 hover:text-accent transition-colors"
          >
            <Heart className="size-5 stroke-[2.2]" />
          </Link>
          <Link
            to="/contact"
            hash="consultation"
            aria-label="Project Inquiry & Free Quote"
            className="p-1.5 text-stone-900 hover:text-accent transition-colors"
          >
            <ShoppingBag className="size-5 stroke-[2.2]" />
          </Link>
          <Link
            to={authTarget}
            aria-label={authLabel}
            className={cn(
              "p-1.5 rounded transition-colors",
              session?.email ? "text-accent font-bold" : "text-stone-900 hover:text-accent"
            )}
          >
            <User className="size-5 stroke-[2.2]" />
          </Link>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-stone-50 px-3.5 py-2 animate-in slide-in-from-top-1 duration-150">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <Search className="absolute left-3 size-4 text-stone-500 pointer-events-none stroke-[2.3]" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search living room, modular kitchen, materials..."
              className="w-full h-9 pl-9 pr-8 text-xs font-sans font-semibold bg-white border border-stone-300 rounded-md text-stone-950 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="size-3.5" />
              </button>
            )}
          </form>
        </div>
      )}

      {/* =======================================================================
          MOBILE & TABLET DRAWER
          ======================================================================= */}
      {open && (
        <div className="fixed inset-x-0 top-[54px] bottom-0 z-50 overflow-y-auto px-6 py-6 flex flex-col justify-between lg:hidden bg-background animate-in fade-in duration-200 border-t border-border">
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
              <div className="grid grid-cols-1 gap-2">
                {STUDIO_LOCATIONS.map((loc) => {
                  const isSelected = selectedCity.name === loc.name;
                  return (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => setSelectedCity(loc)}
                      className={cn(
                        "p-2.5 text-xs rounded border text-left flex flex-col justify-between gap-1",
                        isSelected
                          ? "border-accent bg-accent/10 text-accent font-semibold"
                          : "border-border text-foreground hover:bg-stone-50"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold">{loc.name}</span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-medium">
                          {loc.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-normal leading-tight">{loc.address}</p>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[10px] text-accent font-mono font-medium">📞 {loc.phone}</span>
                        {loc.mapsUrl && (
                          <a
                            href={loc.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-stone-700 hover:text-accent font-semibold underline underline-offset-2 flex items-center gap-0.5 ml-2"
                          >
                            Map ↗
                          </a>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col space-y-1 border-t border-border pt-4">
              {[
                { to: "/", label: "Home Page" },
                { to: "/gallery", label: "Design Ideas & Gallery" },
                { to: "/services", label: "Interiors & Offerings" },
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

            <Link
              to={authTarget}
              onClick={() => setOpen(false)}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 border border-border bg-stone-50 text-stone-900 px-4 py-3 text-xs tracking-[0.16em] uppercase font-semibold hover:border-accent hover:text-accent transition-colors rounded"
            >
              <User className="size-4 text-accent" />
              <span>{session?.email ? `Studio Account (${session.email})` : "Sign In / Studio Portal"}</span>
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

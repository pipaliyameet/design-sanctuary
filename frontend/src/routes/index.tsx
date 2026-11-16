import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  Clock,
  ClipboardCheck,
  BadgePercent,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Award,
  Building2,
  Maximize2,
} from "lucide-react";
import {
  getHomeContent,
  CURATED_STUDIO_PROJECTS,
  CURATED_STUDIO_SERVICES,
  CURATED_STUDIO_PROCESS,
  CURATED_STUDIO_TESTIMONIALS,
  CURATED_STUDIO_MATERIALS,
  STUDIO_DETAILS,
  type CaseCard,
  type ServiceItem,
  type ProcessStepItem,
  type TestimonialItem,
  type MaterialItem,
  type GoogleDrivePhoto,
} from "@/lib/public.functions";
import { PublicShell } from "@/components/site/PublicShell";
import { DriveImage } from "@/components/site/DriveImage";
import { PhotoLightboxModal } from "@/components/site/PhotoLightboxModal";
import { ArchitecturalFilmsSection } from "@/components/site/ArchitecturalFilmsSection";
import { useCmsLiveSync } from "@/lib/cms-live-sync";
import { cn } from "@/lib/utils";

const homeQuery = queryOptions({
  queryKey: ["home-content"],
  queryFn: () => getHomeContent(),
  staleTime: 0,
  refetchOnMount: "always",
  refetchOnWindowFocus: true,
  refetchInterval: false,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    try {
      return context.queryClient.ensureQueryData(homeQuery);
    } catch {
      return null;
    }
  },
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Right Angle Design Studio — Turnkey Interior Architecture & Living Sanctuaries" },
      {
        name: "description",
        content:
          "India's premier turnkey interior architecture studio. 10-year craftsmanship guarantee, 45-day move-in assurance, and 154+ quality checks across bespoke residences, penthouses, and executive spaces.",
      },
      { property: "og:title", content: "Right Angle Design Studio — Turnkey Architecture & Interiors" },
      {
        property: "og:description",
        content:
          "End-to-end luxury interiors, modular kitchens, wardrobes, and architectural execution across Mumbai, Bengaluru, and Pan-India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

export function HomePage() {
  useCmsLiveSync();
  const { data: rawData } = useQuery(homeQuery);
  const data = rawData || {
    heroTitle: "Introducing India's first",
    heroSubtitle:
      "Spaces shaped by light, authentic stone and quiet millwork. Bespoke residential, commercial and turnkey interiors with 10-year warranty and 45-day move-in guarantee.",
    heroImage: "https://lh3.googleusercontent.com/d/13MLCbdqy_mWAY2Rg1EYFWOh9iO38Wvwu",
    ctaText: "BOOK FREE CONSULTATION",
    ctaLink: "/contact",
    studies: CURATED_STUDIO_PROJECTS,
    featuredProjects: CURATED_STUDIO_PROJECTS,
    services: CURATED_STUDIO_SERVICES,
    processSteps: CURATED_STUDIO_PROCESS,
    testimonials: CURATED_STUDIO_TESTIMONIALS,
    materials: CURATED_STUDIO_MATERIALS,
    settings: {},
  };

  const studies: CaseCard[] = data.studies && data.studies.length > 0 ? data.studies : CURATED_STUDIO_PROJECTS;

  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<GoogleDrivePhoto | null>(null);

  // Carousel refs for smooth horizontal scrolling
  const offeringsScrollRef = useRef<HTMLDivElement>(null);
  const deliveredScrollRef = useRef<HTMLDivElement>(null);
  const [offeringsPaused, setOfferingsPaused] = useState(false);
  const [deliveredPaused, setDeliveredPaused] = useState(false);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Auto-scroll for One-Stop Shop Offerings (every 5.5s, pauses on hover)
  useEffect(() => {
    if (offeringsPaused) return;
    const interval = setInterval(() => {
      if (offeringsScrollRef.current) {
        const el = offeringsScrollRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 15) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: 340, behavior: "smooth" });
        }
      }
    }, 5500);
    return () => clearInterval(interval);
  }, [offeringsPaused]);

  // Auto-scroll for Delivered Homes Gallery (every 4.5s, pauses on hover)
  useEffect(() => {
    if (deliveredPaused) return;
    const interval = setInterval(() => {
      if (deliveredScrollRef.current) {
        const el = deliveredScrollRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 15) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: 340, behavior: "smooth" });
        }
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [deliveredPaused]);

  // Hero image selection
  const heroImageSrc =
    data?.heroImage ||
    studies[0]?.hero_image ||
    "https://lh3.googleusercontent.com/d/13MLCbdqy_mWAY2Rg1EYFWOh9iO38Wvwu";

  // Multi-Slide Hero Carousel (Auto-advancing with Livspace structure)
  const heroSlides = [
    {
      id: "slide-1",
      eyebrow: "Turnkey Architecture & Interior Craft",
      titleLine1: "Introducing India's first",
      titleHighlight: "lifetime craftsmanship warranty",
      subtitle:
        "Spaces shaped by light, authentic stone and quiet millwork. Bespoke residential, penthouse and commercial interiors with a 10-year warranty and 45-day move-in guarantee.",
      image: heroImageSrc,
      ctaText: "Book Free Consultation",
      ctaLink: "/contact",
      secondaryText: "Explore Studio Solutions ↓",
      secondaryLink: "#one-stop-shop",
    },
    {
      id: "slide-2",
      eyebrow: "Curated Living Sanctuaries",
      titleLine1: "Spaces crafted around",
      titleHighlight: "how you truly live",
      subtitle:
        "Double-height living pavilions framed by vein-cut silver travertine, European oak joinery and single-source turnkey accountability.",
      image: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
      ctaText: "Explore Delivered Homes",
      ctaLink: "#delivered-homes",
      secondaryText: "View Gallery →",
      secondaryLink: "/gallery",
    },
    {
      id: "slide-3",
      eyebrow: "Private Residential Retreats",
      titleLine1: "Quiet luxury refined with",
      titleHighlight: "tactile stone & warm daylight",
      subtitle:
        "Bespoke walk-in dressing suites, fluted acoustic panelling and concealed ambient luminaire layers engineered for evening calm.",
      image: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
      ctaText: "View Master Suites",
      ctaLink: "/gallery",
      secondaryText: "Book Consultation →",
      secondaryLink: "/contact",
    },
    {
      id: "slide-4",
      eyebrow: "Precision Modular Homes",
      titleLine1: "Engineered German precision with",
      titleHighlight: "45-day move-in assurance",
      subtitle:
        "Laser-banded cabinetry, Blum motion systems, and 154+ rigorous factory quality checks before white-glove handover.",
      image: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
      ctaText: "Book Free Consultation",
      ctaLink: "/contact",
      secondaryText: "Explore Offerings ↓",
      secondaryLink: "#one-stop-shop",
    },
  ];

  // Hero Carousel State & Auto-scroll (5000ms duration)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    if (heroPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroPaused, heroSlides.length]);

  // Livspace Structure Reference:
  // 1. "One-stop shop for all things interiors" (Offerings Showcase)
  const offerings = [
    {
      title: "Modular Interiors",
      subtitle: "Functional kitchen, wardrobe and storage",
      image: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
      link: "/services",
      tag: "PRECISION JOINERY",
    },
    {
      title: "Full Home Interiors",
      subtitle: "Turnkey interior solutions for your home",
      image: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
      link: "/services",
      tag: "END-TO-END",
    },
    {
      title: "Luxury Interiors",
      subtitle: "Tailored interiors that redefine elegance",
      image: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
      link: "/services",
      tag: "BESPOKE FINISHES",
    },
    {
      title: "Value Interiors",
      subtitle: "Quality interiors crafted for modern living",
      image: "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
      link: "/services",
      tag: "SMART EXECUTION",
    },
  ];

  // Livspace Structure Reference:
  // 2. "DESIGN IDEAS — Inspiration for home interior designs" (Bento Grid)
  const designIdeas = {
    livingRoom: {
      title: "Living Room",
      badge: "LIVING ROOM",
      image: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
      caption: "Double-height living pavilion with silver travertine & bespoke low-slung seating",
    },
    masterBedroom: {
      title: "Master Bedroom",
      badge: "MASTER BEDROOM",
      image: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
      caption: "Serene bedroom sanctuary detailed in fumed oak, fluted panels and raw linen",
    },
    lighting: {
      title: "Ceiling & Lighting",
      badge: "CEILING & LIGHTING",
      image: "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
      caption: "Concealed architectural cove profiles & 2400K ambient luminaires",
    },
    signatureLounge: {
      title: "Signature Lounge",
      badge: "SIGNATURE LOUNGE",
      image: "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
      caption: "Sunlit daylight living with biophilic connections and custom velvet chaise",
    },
    kitchen: {
      title: "Kitchen",
      badge: "KITCHEN",
      image: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
      caption: "Minimalist modular show kitchen with quartzite island and fluted cabinetry",
    },
    wardrobe: {
      title: "Wardrobe & Dressing",
      badge: "WARDROBE & DRESSING",
      image: "https://lh3.googleusercontent.com/d/13MLCbdqy_mWAY2Rg1EYFWOh9iO38Wvwu",
      caption: "Full-height tinted glass wardrobes with integrated sensor warm backlighting",
    },
  };

  // Livspace Structure Reference:
  // 3. "DELIVERED HOMES GALLERY — Get a glimpse of Right Angle homes"
  const deliveredHomes = [
    {
      title: "Modern 4 BHK Penthouse",
      location: "Bengaluru",
      area: "5,800 sq ft",
      image: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
      slug: "altamount-penthouse",
    },
    {
      title: "Contemporary 4 BHK Sky Villa",
      location: "Mumbai",
      area: "6,400 sq ft",
      image: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
      slug: "oberoi-sea-facing-duplex",
    },
    {
      title: "Elegant Ancestral Estate",
      location: "Ahmedabad",
      area: "7,200 sq ft",
      image: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
      slug: "shah-courtyard-residence",
    },
    {
      title: "Coastal Sanctuary Villa",
      location: "Alibaug",
      area: "8,500 sq ft",
      image: "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
      slug: "alibaug-coastal-villa",
    },
  ];

  // Livspace Structure Reference:
  // 4. "The Studio Advantage / Warranty & Guarantees"
  const guarantees = [
    {
      icon: ShieldCheck,
      title: "10-Year Warranty",
      description: "Comprehensive craftsmanship assurance on all factory-pressed modular cabinetry, hardware and millwork.",
    },
    {
      icon: Clock,
      title: "45-Day Handover Guarantee",
      description: "Fixed delivery timeline commitment with penalty clauses to ensure you move in without delays.",
    },
    {
      icon: ClipboardCheck,
      title: "154+ Quality Checks",
      description: "Rigorous factory and on-site audit protocols inspecting millimeter joinery, laser leveling, and moisture resistance.",
    },
    {
      icon: BadgePercent,
      title: "Zero Hidden Costs",
      description: "Transparent, line-item Bill of Quantities (BOQ) locked before project kickoff. What you see is what you pay.",
    },
  ];

  // Livspace Structure Reference:
  // 5. "Step-by-Step Turnkey Process"
  const processStepsList = [
    {
      step: "01",
      title: "Meet Your Architect",
      desc: "Discuss your floor plan, lifestyle nuances, and aesthetic aspirations at our experience studio or over a digital call.",
    },
    {
      step: "02",
      title: "3D Walkthrough & Final BOQ",
      desc: "Explore photorealistic 3D renders, tactile stone and timber samples, and a guaranteed price proposal.",
    },
    {
      step: "03",
      title: "Off-Site CNC Fabrication",
      desc: "Precision factory pressing, laser edge-banding and strict on-site civil preparation running in parallel.",
    },
    {
      step: "04",
      title: "White-Glove Handover",
      desc: "154-point quality inspection, deep cleaning, and formal delivery of your 10-year warranty certificate.",
    },
  ];

  // Livspace Structure Reference:
  // 6. "Stay updated with trending home interior designs!" (Design Journal / Articles)
  const articles = [
    {
      title: "Festive & Ambient Lighting: Traditional Brass, Modern Warmth and Low-Glare Luminaires",
      date: "Nov 2026",
      image: "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
      readTime: "4 min read",
    },
    {
      title: "Kitchen Island vs. Parallel Layout: Choosing the Right Modular Flow for Your Apartment",
      date: "Nov 2026",
      image: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
      readTime: "5 min read",
    },
    {
      title: "Living Room Proportions: How to Blend Natural Stone, Low Seating & Afternoon Sunlight",
      date: "Oct 2026",
      image: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
      readTime: "6 min read",
    },
    {
      title: "Storage Solutions & Walk-In Wardrobe Design Ideas for 2BHK and 3BHK Flats",
      date: "Oct 2026",
      image: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
      readTime: "4 min read",
    },
  ];


  const activeSlide = heroSlides[currentSlide] || heroSlides[0];

  return (
    <PublicShell>
      {/* =========================================================================
          SECTION 01 — FULL-SCREEN / CINEMATIC HERO (Livspace Reference: Screenshot 1)
          AUTOSCROLLING / AUTO-ADVANCING SLIDER (5-second duration, pause on hover)
          ========================================================================= */}
      <section
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
        className="group/hero relative isolate h-[calc(100vh-130px)] min-h-[480px] max-h-[700px] overflow-hidden flex flex-col justify-end pt-4 pb-4 sm:pb-6 select-none"
      >
        {/* Background Images with Smooth Crossfade */}
        {heroSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 size-full transition-opacity duration-1000 ease-in-out",
              currentSlide === idx ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
            )}
          >
            <DriveImage
              src={slide.image}
              alt={slide.titleHighlight}
              className="size-full object-cover brightness-[0.92] contrast-[1.03]"
              wrapperClassName="size-full cursor-pointer"
              onOpenZoom={() =>
                setActiveLightboxPhoto({
                  id: slide.id,
                  index: idx,
                  fileName: `${slide.titleHighlight}.jpg`,
                  title: slide.titleLine1,
                  caption: slide.subtitle,
                  url: slide.image,
                  thumbnailUrl: slide.image,
                  driveViewUrl: slide.image,
                  category: "Living",
                  tags: ["Hero"],
                  projectId: "",
                  projectTitle: "Right Angle Design Studio",
                  projectCode: "RADS",
                  location: "Mumbai",
                })
              }
            />
          </div>
        ))}

        {/* Ambient Gradient Overlays for High-Contrast Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 z-1 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/35 z-1 pointer-events-none" />

        {/* Hero Content Box (Centered, Livspace Style with Animated Transitions) */}
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 sm:px-8 text-center flex flex-col items-center">
          {/* Main Headline with Highlight */}
          <h1
            key={`title-${currentSlide}`}
            className="animate-in fade-in slide-in-from-bottom-3 duration-600 font-display text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight font-light leading-[1.12] max-w-4xl drop-shadow-md"
          >
            {activeSlide.titleLine1}{" "}
            <span className="italic font-normal text-amber-200/95 font-serif block sm:inline">
              {activeSlide.titleHighlight}
            </span>
          </h1>

          {/* Positioning Statement */}
          <p
            key={`sub-${currentSlide}`}
            className="animate-in fade-in slide-in-from-bottom-4 duration-700 mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-stone-200/90 font-light drop-shadow-sm"
          >
            {activeSlide.subtitle}
          </p>

          {/* Centered CTA Button (Single Primary Button, Livspace Style: Rectangular with subtle rounded corners) */}
          <div className="mt-5 sm:mt-6 flex items-center justify-center">
            <Link
              to={activeSlide.ctaLink}
              hash="consultation"
              className="inline-flex items-center justify-center bg-white text-stone-900 px-7 sm:px-9 py-2.5 sm:py-3 text-xs font-semibold tracking-[0.18em] uppercase rounded-sm shadow-md hover:bg-stone-100 hover:text-black transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span>{activeSlide.ctaText}</span>
            </Link>
          </div>

          {/* Interactive Carousel Slide Indicators with Livspace Styling */}
          <div className="mt-3.5 sm:mt-4 flex items-center justify-center gap-1.5 z-20">
            {heroSlides.map((_, idx) => {
              const isActive = currentSlide === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Jump to slide ${idx + 1}`}
                  className={cn(
                    "h-1.5 transition-all duration-300 cursor-pointer rounded-full",
                    isActive
                      ? "w-6 bg-accent"
                      : "w-2 bg-white/60 hover:bg-white hover:w-3"
                  )}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 02 — ONE-STOP SHOP FOR ALL THINGS INTERIORS (Livspace Reference: Screenshot 2 & img2)
          ========================================================================= */}
      <section
        id="one-stop-shop"
        onMouseEnter={() => setOfferingsPaused(true)}
        onMouseLeave={() => setOfferingsPaused(false)}
        className="pt-6 sm:pt-8 pb-10 sm:pb-14 bg-[#FBF9F6] dark:bg-card/40 border-b border-border/60"
      >
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          {/* Centered Eyebrow & Section Header (Livspace Reference: img2 bottom peek) */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase text-accent/90 font-medium mb-2.5">
              YOUR HOME, ENDLESS POSSIBILITIES
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight leading-tight">
              One-stop shop for{" "}
              <span className="italic font-normal text-accent font-serif">all things interiors</span>
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
              Be it end-to-end interiors, renovation or modular solutions, we have it all for your home or office. With a wide range of furniture & decor, we have your back from start to finish.
            </p>
          </div>

          {/* Offerings 4-Card Horizontal Carousel with Controls */}
          <div className="relative">
            <div
              ref={offeringsScrollRef}
              className="flex gap-5 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory scroll-smooth"
            >
              {offerings.map((item, idx) => (
                <div
                  key={idx}
                  className="w-[280px] sm:w-[320px] lg:w-[calc(25%-18px)] shrink-0 snap-start bg-white dark:bg-card rounded-2xl overflow-hidden border border-border/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone">
                    <DriveImage
                      src={item.image}
                      alt={item.title}
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                      wrapperClassName="size-full cursor-pointer"
                      onOpenZoom={() =>
                        setActiveLightboxPhoto({
                          id: `offering-${idx}`,
                          index: idx,
                          fileName: `${item.title}.jpg`,
                          title: item.title,
                          caption: item.subtitle,
                          url: item.image,
                          thumbnailUrl: item.image,
                          driveViewUrl: item.image,
                          category: "Offerings",
                          tags: [item.title],
                          projectId: "",
                          projectTitle: "Right Angle Design Studio",
                          projectCode: "RADS",
                          location: "Mumbai",
                        })
                      }
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-sm">
                      {item.tag}
                    </div>
                  </div>

                  {/* Text Container */}
                  <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
                    <div>
                      <h3 className="font-display text-lg sm:text-xl text-foreground font-light group-hover:text-accent transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground font-light leading-relaxed">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Circular Action Arrow */}
                    <div className="pt-2 flex items-center justify-between">
                      <Link
                        to={item.link}
                        aria-label={`Explore ${item.title}`}
                        className="size-8.5 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground group-hover:border-accent group-hover:bg-accent group-hover:text-white transition-all cursor-pointer shadow-2xs"
                      >
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/80">
                        Explore
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          ARCHITECTURAL FILMS & SPATIAL MOTION STUDY (Live Video Section)
          ========================================================================= */}
      <ArchitecturalFilmsSection films={data?.architecturalFilms} />

      {/* =========================================================================
          SECTION 03 — DESIGN IDEAS (Livspace Reference: Screenshot 3)
          ========================================================================= */}
      <section className="py-10 sm:py-14 bg-background border-b border-border/60">
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 sm:mb-9">
            <div>
              <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-accent font-medium mb-1.5">
                DESIGN IDEAS
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight leading-tight">
                Inspiration for home interior{" "}
                <span className="italic font-normal text-accent font-serif">designs</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground font-light max-w-xl">
                Give your home a new look with these interior design ideas curated for you.
              </p>
            </div>

            <Link
              to="/gallery"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-foreground hover:text-accent border-b border-foreground/30 pb-0.5 transition-colors self-start sm:self-auto shrink-0"
            >
              <span>View All</span>
              <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Bento Grid (Livspace Reference: 3-column layout with Living Room, Master Bedroom, Lighting, Tall Center Lounge, Kitchen, Wardrobe) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-2.5">
            {/* Left Column (4 Cols): Living Room + Master Bedroom + False Ceiling */}
            <div className="md:col-span-4 flex flex-col gap-2 sm:gap-2.5">
              {/* Card 1: Living Room */}
              <div
                onClick={() =>
                  setActiveLightboxPhoto({
                    id: "bento-lr",
                    index: 1,
                    fileName: "living-room.jpg",
                    title: designIdeas.livingRoom.title,
                    caption: designIdeas.livingRoom.caption,
                    url: designIdeas.livingRoom.image,
                    thumbnailUrl: designIdeas.livingRoom.image,
                    driveViewUrl: designIdeas.livingRoom.image,
                    category: "Living",
                    tags: ["Living Room"],
                    projectId: "",
                    projectTitle: "Right Angle Design Studio",
                    projectCode: "RADS",
                    location: "Mumbai",
                  })
                }
                className="group relative aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-stone border border-border/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <DriveImage
                  src={designIdeas.livingRoom.image}
                  alt={designIdeas.livingRoom.title}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  wrapperClassName="size-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-mono tracking-[0.16em] uppercase px-2.5 py-1 rounded-sm">
                  {designIdeas.livingRoom.badge}
                </span>
                <span className="absolute top-2.5 right-2.5 size-7 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="size-3.5" />
                </span>
              </div>

              {/* Card 2: Master Bedroom */}
              <div
                onClick={() =>
                  setActiveLightboxPhoto({
                    id: "bento-mbr",
                    index: 2,
                    fileName: "master-bedroom.jpg",
                    title: designIdeas.masterBedroom.title,
                    caption: designIdeas.masterBedroom.caption,
                    url: designIdeas.masterBedroom.image,
                    thumbnailUrl: designIdeas.masterBedroom.image,
                    driveViewUrl: designIdeas.masterBedroom.image,
                    category: "Bedroom",
                    tags: ["Master Bedroom"],
                    projectId: "",
                    projectTitle: "Right Angle Design Studio",
                    projectCode: "RADS",
                    location: "Bengaluru",
                  })
                }
                className="group relative aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-stone border border-border/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <DriveImage
                  src={designIdeas.masterBedroom.image}
                  alt={designIdeas.masterBedroom.title}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  wrapperClassName="size-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-mono tracking-[0.16em] uppercase px-2.5 py-1 rounded-sm">
                  {designIdeas.masterBedroom.badge}
                </span>
                <span className="absolute top-2.5 right-2.5 size-7 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="size-3.5" />
                </span>
              </div>

              {/* Card 3: False Ceiling & Lighting */}
              <div
                onClick={() =>
                  setActiveLightboxPhoto({
                    id: "bento-lighting",
                    index: 3,
                    fileName: "ceiling-lighting.jpg",
                    title: designIdeas.lighting.title,
                    caption: designIdeas.lighting.caption,
                    url: designIdeas.lighting.image,
                    thumbnailUrl: designIdeas.lighting.image,
                    driveViewUrl: designIdeas.lighting.image,
                    category: "Lighting",
                    tags: ["Lighting", "Ceiling"],
                    projectId: "",
                    projectTitle: "Right Angle Design Studio",
                    projectCode: "RADS",
                    location: "Ahmedabad",
                  })
                }
                className="group relative aspect-[16/9] rounded-lg sm:rounded-xl overflow-hidden bg-stone border border-border/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <DriveImage
                  src={designIdeas.lighting.image}
                  alt={designIdeas.lighting.title}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  wrapperClassName="size-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-mono tracking-[0.16em] uppercase px-2.5 py-1 rounded-sm">
                  {designIdeas.lighting.badge}
                </span>
                <span className="absolute top-2.5 right-2.5 size-7 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="size-3.5" />
                </span>
              </div>
            </div>

            {/* Center Column (4 Cols): Tall Featured Signature Lounge */}
            <div className="md:col-span-4 flex flex-col">
              <div
                onClick={() =>
                  setActiveLightboxPhoto({
                    id: "bento-lounge",
                    index: 4,
                    fileName: "signature-lounge.jpg",
                    title: designIdeas.signatureLounge.title,
                    caption: designIdeas.signatureLounge.caption,
                    url: designIdeas.signatureLounge.image,
                    thumbnailUrl: designIdeas.signatureLounge.image,
                    driveViewUrl: designIdeas.signatureLounge.image,
                    category: "Living",
                    tags: ["Lounge", "Daylight"],
                    projectId: "",
                    projectTitle: "Right Angle Design Studio",
                    projectCode: "RADS",
                    location: "Mumbai",
                  })
                }
                className="group relative h-full min-h-[380px] sm:min-h-[460px] rounded-lg sm:rounded-xl overflow-hidden bg-stone border border-border/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <DriveImage
                  src={designIdeas.signatureLounge.image}
                  alt={designIdeas.signatureLounge.title}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  wrapperClassName="size-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div>
                    <span className="inline-block bg-black/75 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-mono tracking-[0.16em] uppercase px-2.5 py-1 rounded-sm mb-1.5">
                      {designIdeas.signatureLounge.badge}
                    </span>
                    <p className="text-white text-xs sm:text-sm font-light leading-snug drop-shadow-sm max-w-xs hidden sm:block">
                      {designIdeas.signatureLounge.caption}
                    </p>
                  </div>
                  <span className="size-8.5 rounded-full bg-white/25 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shrink-0">
                    <Maximize2 className="size-4" />
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column (4 Cols): Kitchen + Wardrobe & Dressing */}
            <div className="md:col-span-4 flex flex-col gap-2 sm:gap-2.5">
              {/* Card 5: Kitchen */}
              <div
                onClick={() =>
                  setActiveLightboxPhoto({
                    id: "bento-kitchen",
                    index: 5,
                    fileName: "kitchen.jpg",
                    title: designIdeas.kitchen.title,
                    caption: designIdeas.kitchen.caption,
                    url: designIdeas.kitchen.image,
                    thumbnailUrl: designIdeas.kitchen.image,
                    driveViewUrl: designIdeas.kitchen.image,
                    category: "Kitchen",
                    tags: ["Modular Kitchen"],
                    projectId: "",
                    projectTitle: "Right Angle Design Studio",
                    projectCode: "RADS",
                    location: "Pune",
                  })
                }
                className="group relative aspect-[16/9] rounded-lg sm:rounded-xl overflow-hidden bg-stone border border-border/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <DriveImage
                  src={designIdeas.kitchen.image}
                  alt={designIdeas.kitchen.title}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  wrapperClassName="size-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-mono tracking-[0.16em] uppercase px-2.5 py-1 rounded-sm">
                  {designIdeas.kitchen.badge}
                </span>
                <span className="absolute top-2.5 right-2.5 size-7 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="size-3.5" />
                </span>
              </div>

              {/* Card 6: Wardrobe & Dressing */}
              <div
                onClick={() =>
                  setActiveLightboxPhoto({
                    id: "bento-wardrobe",
                    index: 6,
                    fileName: "wardrobe.jpg",
                    title: designIdeas.wardrobe.title,
                    caption: designIdeas.wardrobe.caption,
                    url: designIdeas.wardrobe.image,
                    thumbnailUrl: designIdeas.wardrobe.image,
                    driveViewUrl: designIdeas.wardrobe.image,
                    category: "Wardrobe",
                    tags: ["Wardrobe", "Dressing"],
                    projectId: "",
                    projectTitle: "Right Angle Design Studio",
                    projectCode: "RADS",
                    location: "Worli, Mumbai",
                  })
                }
                className="group relative aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-stone border border-border/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex-1"
              >
                <DriveImage
                  src={designIdeas.wardrobe.image}
                  alt={designIdeas.wardrobe.title}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  wrapperClassName="size-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-mono tracking-[0.16em] uppercase px-2.5 py-1 rounded-sm">
                  {designIdeas.wardrobe.badge}
                </span>
                <span className="absolute top-2.5 right-2.5 size-7 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="size-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 04 — DELIVERED HOMES GALLERY (Livspace Reference: Screenshot 4)
          ========================================================================= */}
      <section
        id="delivered-homes"
        onMouseEnter={() => setDeliveredPaused(true)}
        onMouseLeave={() => setDeliveredPaused(false)}
        className="py-10 sm:py-14 bg-[#FBF9F6] dark:bg-card/30 border-b border-border/60"
      >
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 sm:mb-9">
            <div>
              <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-accent font-medium mb-1.5">
                DELIVERED HOMES GALLERY
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight leading-tight">
                Get a glimpse of{" "}
                <span className="italic font-normal text-accent font-serif">Right Angle homes</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground font-light max-w-xl">
                Latest dream home interiors delivered the hassle-free way.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/contact"
                hash="consultation"
                className="inline-flex items-center justify-center bg-stone-900 text-white dark:bg-white dark:text-stone-900 px-6 py-2.5 text-xs font-semibold tracking-[0.18em] uppercase rounded-full shadow-sm hover:bg-accent hover:text-white transition-all cursor-pointer"
              >
                Get Free Quote
              </Link>
            </div>
          </div>

          {/* 4-Column Showcase with Tall Aspect Ratio Cards */}
          <div className="relative">
            <div
              ref={deliveredScrollRef}
              className="flex gap-5 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory scroll-smooth"
            >
              {deliveredHomes.map((home, idx) => (
                <div
                  key={idx}
                  className="w-[280px] sm:w-[320px] lg:w-[calc(25%-18px)] shrink-0 snap-start group relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone border border-border shadow-xs hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  onClick={() =>
                    setActiveLightboxPhoto({
                      id: `delivered-${idx}`,
                      index: idx,
                      fileName: `${home.title}.jpg`,
                      title: home.title,
                      caption: `${home.location} · ${home.area}`,
                      url: home.image,
                      thumbnailUrl: home.image,
                      driveViewUrl: home.image,
                      category: "Delivered",
                      tags: [home.location],
                      projectId: home.slug,
                      projectTitle: home.title,
                      projectCode: `RADS-0${idx + 1}`,
                      location: home.location,
                    })
                  }
                >
                  <DriveImage
                    src={home.image}
                    alt={home.title}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    wrapperClassName="size-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Bottom Text & Circular Arrow Link */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div>
                      <h3 className="font-display text-base sm:text-lg text-white font-light group-hover:text-accent transition-colors leading-snug">
                        {home.title}
                      </h3>
                      <p className="text-xs text-stone-300 font-light mt-1 flex items-center gap-1.5 font-mono">
                        <MapPin className="size-3 text-accent shrink-0" />
                        <span>{home.location}</span>
                        <span className="opacity-40">·</span>
                        <span>{home.area}</span>
                      </p>
                    </div>

                    <div className="size-8.5 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-white group-hover:text-stone-900 transition-all shrink-0">
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Next/Prev Navigation Buttons */}
            <div className="hidden sm:flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => scrollCarousel(deliveredScrollRef, "left")}
                aria-label="Previous homes"
                className="size-8 rounded-full border border-border bg-white dark:bg-card flex items-center justify-center text-foreground hover:bg-accent hover:text-white hover:border-accent transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel(deliveredScrollRef, "right")}
                aria-label="Next homes"
                className="size-8 rounded-full border border-border bg-white dark:bg-card flex items-center justify-center text-foreground hover:bg-accent hover:text-white hover:border-accent transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 05 — THE STUDIO ADVANTAGE / GUARANTEES (Livspace Reference: Lifetime Warranty & 45-Day Handover)
          ========================================================================= */}
      <section className="py-10 sm:py-14 bg-background border-b border-border/60">
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-accent font-medium mb-1.5">
              THE STUDIO ADVANTAGE
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight leading-tight">
              Why homeowners choose{" "}
              <span className="italic font-normal text-accent font-serif">Right Angle Studio</span>
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
              We have eliminated the contractor headaches, unexpected escalations, and design compromises to deliver single-source turnkey accountability.
            </p>
          </div>

          {/* 4 Feature Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {guarantees.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-card/40 dark:bg-card/70 border border-border/80 rounded-2xl p-5 sm:p-6 hover:border-accent hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="size-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl text-foreground font-light mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-mono uppercase tracking-wider text-accent font-medium">
                    Guaranteed Protection
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 06 — HOW IT WORKS / 4-STEP JOURNEY (Livspace Reference: Process)
          ========================================================================= */}
      <section className="py-10 sm:py-14 bg-[#FBF9F6] dark:bg-card/40 border-b border-border/60">
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-accent font-medium mb-1.5">
              THE JOURNEY
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight leading-tight">
              Your dream home in{" "}
              <span className="italic font-normal text-accent font-serif">4 simple steps</span>
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
              From your initial design brief to the moment you unlock your finished home.
            </p>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {processStepsList.map((step, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-card border border-border/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group"
              >
                <div>
                  <div className="font-mono text-3xl sm:text-4xl font-light text-accent/80 mb-3 group-hover:text-accent transition-colors">
                    {step.step}
                  </div>
                  <h3 className="font-display text-lg sm:text-xl text-foreground font-light mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>Phase {idx + 1}</span>
                  <CheckCircle2 className="size-4 text-emerald-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 07 — TRENDING INTERIOR DESIGNS & ARTICLES (Livspace Reference: Screenshot 5)
          ========================================================================= */}
      <section className="py-10 sm:py-14 bg-background border-b border-border/60">
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 sm:mb-9">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight leading-tight">
                Stay updated with trending home interior{" "}
                <span className="italic font-normal text-accent font-serif">designs!</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground font-light max-w-xl">
                Expert insights, material provenance, and design guides from our studio architects.
              </p>
            </div>

            <Link
              to="/services"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-foreground hover:text-accent border-b border-foreground/30 pb-0.5 transition-colors self-start sm:self-auto shrink-0"
            >
              <span>See more</span>
              <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 4 Article Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {articles.map((art, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                onClick={() =>
                  setActiveLightboxPhoto({
                    id: `art-${idx}`,
                    index: idx,
                    fileName: `${art.title}.jpg`,
                    title: art.title,
                    caption: `${art.date} · ${art.readTime}`,
                    url: art.image,
                    thumbnailUrl: art.image,
                    driveViewUrl: art.image,
                    category: "Journal",
                    tags: ["Article"],
                    projectId: "",
                    projectTitle: "Right Angle Design Studio",
                    projectCode: "RADS",
                    location: "Mumbai",
                  })
                }
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-stone">
                  <DriveImage
                    src={art.image}
                    alt={art.title}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    wrapperClassName="size-full"
                  />
                </div>

                <div className="p-4 flex flex-col justify-between flex-1 space-y-2">
                  <h3 className="font-display text-sm sm:text-base font-normal text-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h3>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span>{art.date}</span>
                    <span>{art.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION 09 — FINAL CONSULTATION BANNER
          ========================================================================= */}
      <section id="consultation" className="py-10 sm:py-14 bg-card/60 border-t border-border">
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            <div className="lg:col-span-8 space-y-4">
              <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-accent font-medium">
                INITIATE AN ARCHITECTURAL COMMISSION
              </p>
              <h3 className="font-display text-2xl sm:text-4xl text-foreground font-light leading-tight">
                {data.consultationHeading || "Ready to begin your architectural sanctuary?"}
              </h3>
              <p className="text-sm text-muted-foreground font-light max-w-xl">
                Founded and directed by Principal Architect <strong className="text-foreground font-medium">Ravi Pipaliya</strong>, Right Angle Design Studio provides single-source turnkey accountability across India.
              </p>
              <div className="pt-2 flex flex-wrap gap-6 text-xs uppercase tracking-wider text-foreground font-medium">
                <a
                  href={`tel:${(data.consultationPhone || STUDIO_DETAILS.phone).replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Phone className="size-3.5 text-accent" />
                  <span>{data.consultationPhone || STUDIO_DETAILS.phone}</span>
                </a>
                <a
                  href={`mailto:${data.consultationEmail || STUDIO_DETAILS.email}`}
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Mail className="size-3.5 text-accent" />
                  <span>{data.consultationEmail || STUDIO_DETAILS.email}</span>
                </a>
              </div>
            </div>
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2.5 bg-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] text-background hover:bg-accent hover:text-accent-foreground transition-all font-medium rounded-full shadow-md"
              >
                <span>Book Free Consultation</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Fullscreen Photo Exploration */}
      <PhotoLightboxModal
        photo={activeLightboxPhoto}
        photosList={[]}
        isOpen={!!activeLightboxPhoto}
        onClose={() => setActiveLightboxPhoto(null)}
        onSelectPhoto={(photo) => setActiveLightboxPhoto(photo)}
      />
    </PublicShell>
  );
}

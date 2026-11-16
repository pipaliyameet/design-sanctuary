import { createFileRoute } from "@tanstack/react-router";
import { PublicShell, WhatsAppIcon } from "@/components/site/PublicShell";
import { ConsultationForm } from "@/components/site/ConsultationForm";
import { STUDIO_DETAILS } from "@/lib/public.functions";
import {
  Phone,
  Mail,
  Instagram,
  Facebook,
  MapPin,
  Clock,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  Building2,
  Calendar,
  Sparkles,
  Award,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Find a Studio & Book a Consultation | Right Angle Design Studio" },
      {
        name: "description",
        content:
          "Connect with Right Angle Design Studio, led by Ravi Pipaliya. Studios in Jetpur and Rajkot, and on-site consultations across Ahmedabad and Gujarat.",
      },
      { property: "og:title", content: "Find a Studio — Right Angle Design Studio" },
      {
        property: "og:description",
        content:
          "Visit our studios in Jetpur (HQ) and Rajkot, or schedule an on-site consultation in Ahmedabad. 10-year warranty & turnkey luxury interiors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const FAQS = [
  {
    q: "At what stage of our property purchase should we contact the studio?",
    a: "Ideally before architectural partition walls are erected or during structural shell handover. Early engagement allows us to optimize daylight angles, plumbing runs, and AC routing without costly demolition.",
  },
  {
    q: "Do you undertake complete turnkey execution or only design drawings?",
    a: "We offer both. However, over 85% of our commissions are delivered as complete turnkey design-and-build projects, where we hold single-point accountability for fabrication, contractors, procurement, and handover.",
  },
  {
    q: "Do you take up projects outside Jetpur, Rajkot and Ahmedabad?",
    a: "Yes. We manage turnkey residential, penthouse, villa, and commercial interior commissions across Gujarat and pan-India with dedicated on-site supervision.",
  },
  {
    q: "What is your typical project timeline?",
    a: "A comprehensive turnkey residential interior (3,000–6,000 sq ft) typically spans 6 to 10 months from initial conceptual sketches through to off-site CNC pressing, on-site civil prep, and white-glove handover.",
  },
  {
    q: "How does your pricing and billing structure work?",
    a: "We operate on clear, itemized Bill of Quantities (BOQ) with transparent stage-linked payment milestones. There are zero hidden costs, and all specifications are locked before procurement begins.",
  },
  {
    q: "What quality assurances and warranty do you offer?",
    a: "Every turnkey project is backed by our studio's 10-year structural & hardware warranty, a 154-point quality inspection checklist, and dedicated post-handover maintenance support.",
  },
];

export function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Exact prefilled WhatsApp message:
  const whatsappUrl = `https://wa.me/${STUDIO_DETAILS.whatsappNumber}?text=${encodeURIComponent(
    "Hello, I would like to discuss my interior design project.",
  )}`;

  const jetpurMapsUrl =
    "https://www.google.com/maps/place/Right+Angle+Design+Studio/@21.7478479,70.6124044,17z/data=!4m14!1m7!3m6!1s0x3957f3217145c5a9:0x5511871d3726d602!2sRight+Angle+Design+Studio!8m2!3d21.7478479!4d70.6149793!16s%2Fg%2F11svbd8k13!3m5!1s0x3957f3217145c5a9:0x5511871d3726d602!8m2!3d21.7478479!4d70.6149793!16s%2Fg%2F11svbd8k13?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D";
  const rajkotMapsUrl =
    "https://www.google.com/maps/place/RK+Empire/@22.2627491,70.7839947,17z/data=!3m1!4b1!4m6!3m5!1s0x3959ca5dbe7afda3:0x6d8e1af5be0f4126!8m2!3d22.2627491!4d70.7865696!16s%2Fg%2F11gd7l319v?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D";

  return (
    <PublicShell hideFloatingWhatsApp>
      {/* =========================================================================
          HERO / PAGE HEADER (Properly Padded, No Clip Behind Header)
          ========================================================================= */}
      <section className="border-b border-border/80 bg-stone-50/70 dark:bg-card/30 py-8 sm:py-12">
        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono tracking-[0.22em] uppercase text-accent font-semibold mb-1.5">
                FIND A STUDIO · GUJARAT & PAN-INDIA
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground tracking-tight leading-tight">
                Visit Our Studios or Book Consultation
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground font-light max-w-2xl leading-relaxed">
                Connect with Right Angle Design Studio. Explore our experience studios in Jetpur and Rajkot, or schedule an on-site consultation anywhere across Ahmedabad.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-mono text-stone-700 dark:text-stone-300 bg-white dark:bg-card px-4 py-2.5 rounded-lg border border-border shadow-xs shrink-0 self-start md:self-auto">
              <ShieldCheck className="size-4 text-accent stroke-[2.2]" />
              <span>Founder & Principal: <strong>Ravi Pipaliya</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PROMINENT 3-STUDIO LOCATION CARDS (Full Width Showcase, No Squeezing)
          ========================================================================= */}
      <section id="studios" className="border-b border-border/70 bg-white dark:bg-background py-8 sm:py-10">
        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <MapPin className="size-4.5 text-accent stroke-[2.3]" />
              <h2 className="text-xs font-mono uppercase tracking-[0.18em] font-bold text-foreground">
                Studio Locations & Experience Hubs
              </h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
              Jetpur · Rajkot · Ahmedabad
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {/* 1. Jetpur Studio (HQ) */}
            <div className="rounded-xl border-2 border-accent/25 bg-[#FBF9F6] dark:bg-card p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-accent hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">Jetpur Studio</h3>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-accent text-white font-bold tracking-wider">
                    HQ Studio
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                  1st Floor, Shree Nathji Complex, Junagadh Road, Jetpur, Gujarat - 360370
                </p>
                <p className="mt-2.5 text-[11px] text-stone-500 font-mono flex items-center gap-1.5">
                  <Clock className="size-3.5 text-accent" /> Mon – Sat: 10:00 AM – 7:00 PM
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                <a
                  href="tel:+919537586804"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-accent hover:underline"
                >
                  📞 +91 95375 86804
                </a>
                <a
                  href={jetpurMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-sans font-semibold text-stone-700 dark:text-stone-300 hover:text-accent flex items-center gap-1"
                >
                  <span>Map</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>

            {/* 2. Rajkot Studio (Design Hub) */}
            <div className="rounded-xl border border-border bg-[#FBF9F6] dark:bg-card p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-accent hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">Rajkot Studio</h3>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold tracking-wider">
                    Design Studio
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                  919, RK Empire, Near Mavdi Bridge, 150 Ft. Ring Road, Rajkot - 360004
                </p>
                <p className="mt-2.5 text-[11px] text-stone-500 font-mono flex items-center gap-1.5">
                  <Clock className="size-3.5 text-accent" /> Mon – Sat: 10:00 AM – 7:00 PM
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                <a
                  href="tel:+919537586804"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-accent hover:underline"
                >
                  📞 +91 95375 86804
                </a>
                <a
                  href={rajkotMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-sans font-semibold text-stone-700 dark:text-stone-300 hover:text-accent flex items-center gap-1"
                >
                  <span>Map</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>

            {/* 3. Ahmedabad (On-Site Client Visits Only) */}
            <div className="rounded-xl border border-border bg-[#FBF9F6] dark:bg-card p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-accent hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">Ahmedabad</h3>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold tracking-wider">
                    Site Bookings Only
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                  On-Site Client Consultations & Project Bookings (By Appointment · No Walk-In Office)
                </p>
                <p className="mt-2 text-[11px] text-stone-500 font-mono italic">
                  *Senior team visits your site directly for measurements & turnkey planning
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                <a
                  href="tel:+919537586804"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-accent hover:underline"
                >
                  📞 +91 95375 86804
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-sans font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Book Site Visit</span>
                  <ArrowUpRight className="size-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BALANCED WORKSPACE: LEFT CONTACT CHANNELS + RIGHT INQUIRY FORM
          Both columns now have equal vertical height — ZERO empty void!
          ========================================================================= */}
      <section id="consultation" className="py-10 sm:py-14 bg-stone-50/50 dark:bg-card/20">
        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* ===================================================================
                LEFT COLUMN: FAST CONTACT CHANNELS & STUDIO CREDENTIALS
                =================================================================== */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* 1. WhatsApp Priority Card */}
              <div className="rounded-xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-white to-white dark:via-card dark:to-card p-5 sm:p-6 shadow-sm hover:border-emerald-500/50 transition-all">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/70">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Fastest Response · Online</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                    Instant Chat
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                    <WhatsAppIcon className="size-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono font-medium">
                      Direct WhatsApp
                    </p>
                    <p className="text-lg sm:text-xl font-bold font-mono text-foreground">
                      {STUDIO_DETAILS.whatsappFormatted}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    <WhatsAppIcon className="size-4" />
                    <span>Chat on WhatsApp Now</span>
                    <ArrowUpRight className="size-4" />
                  </a>
                </div>
              </div>

              {/* 2. Direct Phone & Studio Email (2-Column Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Phone */}
                <div className="rounded-xl border border-border bg-white dark:bg-card p-4 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 mb-1">
                      <Phone className="size-4 text-accent stroke-[2.3]" />
                      <span className="text-xs font-mono uppercase font-bold tracking-wider">Direct Phone</span>
                    </div>
                    <p className="text-sm font-bold font-mono text-foreground mt-1">
                      {STUDIO_DETAILS.phone}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Mon – Sat, 10am – 7pm</p>
                  </div>
                  <a
                    href={`tel:${STUDIO_DETAILS.phone.replace(/\s+/g, "")}`}
                    className="mt-3.5 w-full inline-flex items-center justify-center rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-900 hover:text-white px-3 py-1.5 text-xs font-semibold text-foreground transition-colors"
                  >
                    Call Now
                  </a>
                </div>

                {/* Email */}
                <div className="rounded-xl border border-border bg-white dark:bg-card p-4 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 mb-1">
                      <Mail className="size-4 text-accent stroke-[2.3]" />
                      <span className="text-xs font-mono uppercase font-bold tracking-wider">Studio Email</span>
                    </div>
                    <p className="text-xs font-bold font-mono text-foreground mt-1 truncate">
                      {STUDIO_DETAILS.email}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Replies within 24h</p>
                  </div>
                  <a
                    href={`mailto:${STUDIO_DETAILS.email}?subject=${encodeURIComponent("Interior Design Project Inquiry — Right Angle Design Studio")}`}
                    className="mt-3.5 w-full inline-flex items-center justify-center rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-900 hover:text-white px-3 py-1.5 text-xs font-semibold text-foreground transition-colors"
                  >
                    Send Email
                  </a>
                </div>
              </div>

              {/* 3. Instagram & Facebook (Side-by-Side Clean Grid) */}
              <div className="grid grid-cols-2 gap-3.5">
                <a
                  href={STUDIO_DETAILS.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-border bg-white dark:bg-card p-3.5 flex items-center justify-between group hover:border-accent hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600">
                      <Instagram className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-foreground group-hover:text-accent truncate">Instagram</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">@right_angle</p>
                    </div>
                  </div>
                  <ExternalLink className="size-3 text-muted-foreground group-hover:text-accent shrink-0" />
                </a>

                <a
                  href={STUDIO_DETAILS.facebookUrl || "https://www.facebook.com/rightangle919"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-border bg-white dark:bg-card p-3.5 flex items-center justify-between group hover:border-accent hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                      <Facebook className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-foreground group-hover:text-accent truncate">Facebook</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">@rightangle919</p>
                    </div>
                  </div>
                  <ExternalLink className="size-3 text-muted-foreground group-hover:text-accent shrink-0" />
                </a>
              </div>

              {/* 4. Studio Guarantee & Standards Card */}
              <div className="rounded-xl border border-border/80 bg-white dark:bg-card p-4.5 space-y-2.5 shadow-2xs">
                <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground font-bold">
                  The Right Angle Commitment
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-lg bg-stone-50 dark:bg-background border border-border/60">
                    <p className="text-sm sm:text-base font-bold text-accent font-display">10-Yr</p>
                    <p className="text-[9px] font-mono uppercase text-muted-foreground">Warranty</p>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 dark:bg-background border border-border/60">
                    <p className="text-sm sm:text-base font-bold text-accent font-display">45-Day</p>
                    <p className="text-[9px] font-mono uppercase text-muted-foreground">Handover</p>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 dark:bg-background border border-border/60">
                    <p className="text-sm sm:text-base font-bold text-accent font-display">154+</p>
                    <p className="text-[9px] font-mono uppercase text-muted-foreground">QC Checks</p>
                  </div>
                </div>
              </div>

            </div>

            {/* ===================================================================
                RIGHT COLUMN: INQUIRY FORM (BALANCED HEIGHT)
                =================================================================== */}
            <div className="lg:col-span-7">
              <ConsultationForm />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          FREQUENTLY ASKED QUESTIONS SECTION
          ========================================================================= */}
      <section className="py-12 sm:py-16 bg-white dark:bg-background border-t border-border">
        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-8">
            <div>
              <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-accent font-bold mb-1">
                COMMON QUERIES
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-normal text-foreground">
                What to Expect When Working With Us
              </h2>
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              Clear timelines · Turnkey accountability · Fixed BOQ
            </p>
          </div>

          {/* Mobile Single Column Stack */}
          <div className="flex flex-col gap-3 md:hidden">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={cn(
                    "rounded-xl border transition-all duration-200 overflow-hidden self-start h-fit w-full",
                    isOpen
                      ? "border-accent/50 bg-[#FBF9F6] dark:bg-card shadow-xs"
                      : "border-border bg-stone-50/70 dark:bg-card/50 hover:border-accent/30 hover:bg-stone-50 dark:hover:bg-card"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between text-left p-4 select-none cursor-pointer gap-3"
                  >
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-semibold leading-snug transition-colors",
                        isOpen ? "text-accent font-bold" : "text-foreground"
                      )}
                    >
                      {faq.q}
                    </span>
                    <div
                      className={cn(
                        "size-6 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200",
                        isOpen
                          ? "bg-accent text-white border-accent rotate-180"
                          : "border-border text-stone-500 bg-white dark:bg-stone-900"
                      )}
                    >
                      <ChevronDown className="size-3.5" />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="pt-2.5 border-t border-border/80">
                        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop 2 Independent Columns (Prevents Cross-Card Stretching) */}
          <div className="hidden md:grid md:grid-cols-2 gap-4 items-start">
            {/* Column 1 (Left: 0, 2, 4) */}
            <div className="flex flex-col gap-3.5">
              {FAQS.filter((_, idx) => idx % 2 === 0).map((faq, i) => {
                const actualIdx = i * 2;
                const isOpen = openFaq === actualIdx;
                return (
                  <div
                    key={actualIdx}
                    className={cn(
                      "rounded-xl border transition-all duration-200 overflow-hidden self-start h-fit w-full",
                      isOpen
                        ? "border-accent/50 bg-[#FBF9F6] dark:bg-card shadow-xs"
                        : "border-border bg-stone-50/70 dark:bg-card/50 hover:border-accent/30 hover:bg-stone-50 dark:hover:bg-card"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : actualIdx)}
                      className="flex w-full items-center justify-between text-left p-4 sm:p-4.5 select-none cursor-pointer gap-3"
                    >
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-semibold leading-snug transition-colors",
                          isOpen ? "text-accent font-bold" : "text-foreground"
                        )}
                      >
                        {faq.q}
                      </span>
                      <div
                        className={cn(
                          "size-6 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200",
                          isOpen
                            ? "bg-accent text-white border-accent rotate-180"
                            : "border-border text-stone-500 bg-white dark:bg-stone-900"
                        )}
                      >
                        <ChevronDown className="size-3.5" />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="pt-2.5 border-t border-border/80">
                          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Column 2 (Right: 1, 3, 5) */}
            <div className="flex flex-col gap-3.5">
              {FAQS.filter((_, idx) => idx % 2 === 1).map((faq, i) => {
                const actualIdx = i * 2 + 1;
                const isOpen = openFaq === actualIdx;
                return (
                  <div
                    key={actualIdx}
                    className={cn(
                      "rounded-xl border transition-all duration-200 overflow-hidden self-start h-fit w-full",
                      isOpen
                        ? "border-accent/50 bg-[#FBF9F6] dark:bg-card shadow-xs"
                        : "border-border bg-stone-50/70 dark:bg-card/50 hover:border-accent/30 hover:bg-stone-50 dark:hover:bg-card"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : actualIdx)}
                      className="flex w-full items-center justify-between text-left p-4 sm:p-4.5 select-none cursor-pointer gap-3"
                    >
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-semibold leading-snug transition-colors",
                          isOpen ? "text-accent font-bold" : "text-foreground"
                        )}
                      >
                        {faq.q}
                      </span>
                      <div
                        className={cn(
                          "size-6 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200",
                          isOpen
                            ? "bg-accent text-white border-accent rotate-180"
                            : "border-border text-stone-500 bg-white dark:bg-stone-900"
                        )}
                      >
                        <ChevronDown className="size-3.5" />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="pt-2.5 border-t border-border/80">
                          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

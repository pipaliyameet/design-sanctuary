import { createFileRoute } from "@tanstack/react-router";
import { PublicShell, WhatsAppIcon } from "@/components/site/PublicShell";
import { ConsultationForm } from "@/components/site/ConsultationForm";
import { STUDIO_DETAILS } from "@/lib/public.functions";
import {
  Phone,
  Mail,
  Instagram,
  MapPin,
  Clock,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Us & Book a Consultation | Right Angle Design Studio" },
      {
        name: "description",
        content:
          "Connect with Right Angle Design Studio, led by Ravi Pipaliya. Reach out via WhatsApp, phone, email, or schedule a design consultation for bespoke residential and turnkey interiors.",
      },
      { property: "og:title", content: "Contact Right Angle Design Studio" },
      {
        property: "og:description",
        content: "Chat on WhatsApp, call, or email our senior design team for your architectural interior project.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const FAQS = [
  {
    q: "At what stage of our property purchase should we contact the studio?",
    a: "Ideally before architectural partition walls are erected or during structural shell handover. Early engagement allows us to optimize daylight angles, plumbing runs, and AC routing without demolition.",
  },
  {
    q: "Do you undertake complete turnkey execution or only design drawings?",
    a: "We offer both. However, over 85% of our commissions are delivered as complete turnkey design-and-build projects, where we hold single-point accountability for contractors, procurement, and handover.",
  },
  {
    q: "Do you take up projects outside Mumbai and Bengaluru?",
    a: "Yes. We have completed residential, villa, and hospitality commissions across Ahmedabad, Surat, Goa, Alibaug, and Delhi NCR. Our project directors manage regular site rotations pan-India.",
  },
  {
    q: "What is your typical project timeline?",
    a: "A comprehensive turnkey residential interior (3,000–6,000 sq ft) typically spans 8 to 12 months from initial conceptual sketches through to white-glove styling and final handover.",
  },
];

export function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Exact prefilled WhatsApp message per requirements:
  // "Hello, I would like to discuss my interior design project."
  const whatsappUrl = `https://wa.me/${STUDIO_DETAILS.whatsappNumber}?text=${encodeURIComponent(
    "Hello, I would like to discuss my interior design project.",
  )}`;

  const mumbaiMapsUrl = "https://www.google.com/maps/search/?api=1&query=14+Sun+Mill+Compound+Tulsi+Pipe+Road+Lower+Parel+Mumbai+400013";
  const bengaluruMapsUrl = "https://www.google.com/maps/search/?api=1&query=84+Lavelle+Road+Shanthala+Nagar+Ashok+Nagar+Bengaluru+560001";

  return (
    <PublicShell hideFloatingWhatsApp>
      {/* =========================================================================
          COMPACT PAGE INTRODUCTION
          ========================================================================= */}
      <div className="border-b border-border bg-card/25 pt-24 pb-8 sm:pt-28 sm:pb-10">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="eyebrow">
                RIGHT ANGLE DESIGN STUDIO
              </p>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground tracking-tight">
                Let's Create Something Beautiful
              </h1>
              <p className="mt-2 text-sm sm:text-base text-foreground/85 max-w-2xl leading-relaxed font-normal">
                Have a project in mind? Connect with us to discuss your ideas, requirements, and design possibilities.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-foreground/75 font-mono">
              <ShieldCheck className="size-4 text-accent" />
              <span>Owner & Principal: Ravi Pipaliya</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN CONTACT WORKSPACE (BALANCED 12-COLUMN RESPONSIVE LAYOUT)
          ========================================================================= */}
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* =====================================================================
              LEFT COLUMN: CONTACT OPTIONS (WHATSAPP PRIMARY + CALL/EMAIL/IG/MAPS)
              ===================================================================== */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* 1. PRIMARY WHATSAPP CARD (MOST PROMINENT CONTACT METHOD) */}
            <div className="relative overflow-hidden rounded-xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-card to-card p-5 sm:p-6 shadow-sm transition-all hover:border-emerald-500/60 hover:shadow-md">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>Fastest Response · Online</span>
                </div>
                <span className="text-xs uppercase tracking-[0.06em] text-accent font-mono font-semibold">
                  Primary Action
                </span>
              </div>

              <div className="mt-4 flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md">
                  <WhatsAppIcon className="size-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.06em] text-foreground/70 font-semibold font-mono">
                    Direct WhatsApp Chat
                  </p>
                  <p className="mt-0.5 text-lg sm:text-xl font-bold font-mono text-foreground">
                    {STUDIO_DETAILS.whatsappFormatted}
                  </p>
                  <p className="mt-1 text-xs text-foreground/80 leading-relaxed font-normal">
                    Prefilled: <span className="italic">"Hello, I would like to discuss my interior design project."</span>
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 text-xs sm:text-sm font-semibold tracking-[0.06em] shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.99]"
                >
                  <WhatsAppIcon className="size-4" />
                  <span>Chat on WhatsApp</span>
                  <ArrowUpRight className="size-4" />
                </a>
              </div>
            </div>

            {/* 2. DIRECT CONTACT METHODS (PHONE, EMAIL, INSTAGRAM GRID) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
              
              {/* Phone Card */}
              <div className="rounded-lg border border-border/80 bg-card p-4 transition-all hover:border-accent/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent border border-accent/30">
                      <Phone className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.06em] text-foreground/70 font-semibold font-mono">
                        Direct Phone
                      </p>
                      <p className="mt-0.5 text-base font-bold font-mono text-foreground">
                        {STUDIO_DETAILS.phone}
                      </p>
                      <p className="mt-0.5 text-xs text-foreground/60 flex items-center gap-1">
                        <Clock className="size-3 text-accent" /> Mon – Sat, 10:00 AM – 7:00 PM
                      </p>
                    </div>
                  </div>
                  <a
                    href={`tel:${STUDIO_DETAILS.phone.replace(/\s+/g, "")}`}
                    className="shrink-0 inline-flex items-center gap-1 rounded bg-secondary hover:bg-accent hover:text-accent-foreground px-3 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer border border-border"
                  >
                    <span>Call Now</span>
                  </a>
                </div>
              </div>

              {/* Email Card */}
              <div className="rounded-lg border border-border/80 bg-card p-4 transition-all hover:border-accent/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent border border-accent/30">
                      <Mail className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.06em] text-foreground/70 font-semibold font-mono">
                        Official Studio Email
                      </p>
                      <p className="mt-0.5 text-sm sm:text-base font-semibold text-foreground truncate">
                        {STUDIO_DETAILS.email}
                      </p>
                      <p className="mt-0.5 text-xs text-foreground/60">
                        Inquiries reviewed within 24 business hours
                      </p>
                    </div>
                  </div>
                  <a
                    href={`mailto:${STUDIO_DETAILS.email}?subject=${encodeURIComponent("Interior Design Project Inquiry — Right Angle Design Studio")}`}
                    className="shrink-0 inline-flex items-center gap-1 rounded bg-secondary hover:bg-accent hover:text-accent-foreground px-3 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer border border-border"
                  >
                    <span>Send Email</span>
                  </a>
                </div>
              </div>

              {/* Instagram Card */}
              <div className="rounded-lg border border-border/80 bg-card p-4 transition-all hover:border-accent/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent border border-accent/30">
                      <Instagram className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.06em] text-foreground/70 font-semibold font-mono">
                        Instagram
                      </p>
                      <p className="mt-0.5 text-sm sm:text-base font-semibold text-foreground truncate">
                        {STUDIO_DETAILS.instagramHandle}
                      </p>
                      <p className="mt-0.5 text-xs text-foreground/60">
                        Daily site dispatches & spatial reels
                      </p>
                    </div>
                  </div>
                  <a
                    href={STUDIO_DETAILS.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 rounded bg-secondary hover:bg-accent hover:text-accent-foreground px-3 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer border border-border"
                  >
                    <span>Visit Instagram</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

            </div>

            {/* 3. STUDIO OFFICE & GOOGLE MAPS LOCATION */}
            <div className="rounded-lg border border-border/80 bg-card p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-accent" />
                  <p className="text-xs uppercase tracking-[0.06em] text-foreground/70 font-semibold font-mono">
                    Studio Location
                  </p>
                </div>
                <span className="text-xs font-mono text-accent font-semibold">HQ</span>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">Mumbai Practice</p>
                <p className="mt-1 text-xs sm:text-sm text-foreground/80 leading-relaxed font-normal">
                  14 Sun Mill Compound, Tulsi Pipe Road, Lower Parel, Mumbai, Maharashtra 400013
                </p>
              </div>

              <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-foreground/60">
                  Bengaluru: 84 Lavelle Road, Ashok Nagar
                </span>
                <a
                  href={mumbaiMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline cursor-pointer"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>

          </div>

          {/* =====================================================================
              RIGHT COLUMN: COMPACT ESSENTIAL INQUIRY FORM
              ===================================================================== */}
          <div className="lg:col-span-7">
            <ConsultationForm />
          </div>

        </div>

        {/* =======================================================================
            COMPACT FREQUENTLY ASKED QUESTIONS (ACCORDION / CLEAN GRID)
            ======================================================================= */}
        <div className="mt-16 sm:mt-20 border-t border-border pt-10">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
            <div>
              <p className="eyebrow">COMMON QUERIES</p>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-normal text-foreground">
                What to Expect When Working With Us
              </h2>
            </div>
            <p className="text-xs text-foreground/60">
              Clear timelines · Turnkey accountability · Transparent milestones
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-border/80 bg-card/60 p-4 transition-colors hover:border-accent/40"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-start justify-between text-left gap-3 select-none cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-foreground/60 transition-transform duration-200 mt-0.5",
                        isOpen && "rotate-180 text-accent",
                      )}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2.5 text-xs sm:text-sm text-foreground/80 leading-relaxed font-normal pt-2 border-t border-border/60 animate-in fade-in duration-200">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </PublicShell>
  );
}

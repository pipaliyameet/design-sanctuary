import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/site/PublicShell";
import { ConsultationForm } from "@/components/site/ConsultationForm";
import { STUDIO_DETAILS } from "@/lib/public.functions";
import { Phone, Mail, MapPin, Clock, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact & Book a Consultation | Atelier Vermilion" },
      {
        name: "description",
        content:
          "Book an architectural consultation with Atelier Vermilion. Offices in Lower Parel Mumbai and Lavelle Road Bengaluru. Inquiries reviewed by senior partners within two business days.",
      },
      { property: "og:title", content: "Contact Studio — Atelier Vermilion" },
      {
        property: "og:description",
        content: "Initiate an interior architecture commission with our senior design partners.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const FAQS = [
  {
    q: "At what stage of our property purchase should we contact the studio?",
    a: "Ideally, before architectural partition walls are built or during structural shell handover. Early engagement allows us to optimize daylight angles, plumbing locations, and AC ducting without costly demolition.",
  },
  {
    q: "Do you undertake turnkey execution or only design drawings?",
    a: "We offer both. However, 85% of our commissions are delivered as complete turnkey design-and-build projects, where we hold single-point accountability for contractors, procurement, and handover.",
  },
  {
    q: "Do you take up projects outside Mumbai and Bengaluru?",
    a: "Yes. We have completed residential and hospitality commissions in Ahmedabad, Goa, Alibaug, Delhi NCR, and internationally. Our project directors manage regular site rotations pan-India.",
  },
  {
    q: "What is your typical project timeline?",
    a: "A comprehensive residential interior (3,000–6,000 sq ft) typically requires 10 to 14 months from initial conceptual sketches through to white-glove styling and handover.",
  },
];

function ContactPage() {
  return (
    <PublicShell>
      {/* Editorial Header */}
      <div className="border-b border-border bg-background pt-28 pb-12 sm:pt-36 sm:pb-16">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="eyebrow">Initiate a Commission</p>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl lg:text-7xl font-light text-foreground tracking-tight max-w-4xl">
            Let’s create something beautiful.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed font-light">
            Tell us about your space. Whether you are commissioning a new villa, a sky penthouse, or
            an executive workplace, share your parameters below. Every brief is reviewed personally
            by our principal team.
          </p>
        </div>
      </div>

      {/* Main Consultation Section */}
      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:py-16 sm:px-8">
        <ConsultationForm />
      </div>

      {/* Studio Locations Grid */}
      <section className="border-t border-border bg-card/40 py-14 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="eyebrow">Studio Addresses</p>
          <h2 className="mt-3 font-display text-2xl sm:text-4xl font-light text-foreground mb-12">
            Visit Our Studios in Mumbai & Bengaluru
          </h2>

          <div className="grid gap-8 sm:grid-cols-2">
            {/* Mumbai Studio */}
            <div className="border border-border/80 bg-background p-8 space-y-5">
              <span className="text-[10px] uppercase tracking-[0.24em] text-accent font-medium">
                Mumbai Practice
              </span>
              <h3 className="font-display text-2xl text-foreground">Lower Parel Studio</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                14 Sun Mill Compound, Tulsi Pipe Road, Lower Parel, Mumbai, Maharashtra 400013
              </p>

              <div className="space-y-2 text-xs text-muted-foreground border-t border-border/60 pt-4">
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-accent" /> +91 98200 41100
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-accent" /> mumbai@ateliervermilion.com
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-accent" /> Monday – Saturday, 10:00 AM – 7:00 PM
                </div>
              </div>
            </div>

            {/* Bengaluru Studio */}
            <div className="border border-border/80 bg-background p-8 space-y-5">
              <span className="text-[10px] uppercase tracking-[0.24em] text-accent font-medium">
                Bengaluru Practice
              </span>
              <h3 className="font-display text-2xl text-foreground">Lavelle Road Studio</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                84 Lavelle Road, Shanthala Nagar, Ashok Nagar, Bengaluru, Karnataka 560001
              </p>

              <div className="space-y-2 text-xs text-muted-foreground border-t border-border/60 pt-4">
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-accent" /> +91 80 4120 7800
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-accent" /> blr@ateliervermilion.com
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-accent" /> Monday – Saturday, 10:00 AM – 7:00 PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation FAQ */}
      <section className="border-t border-border bg-background py-14 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="max-w-2xl pb-12">
            <p className="eyebrow">Frequently Addressed Questions</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-light text-foreground">
              What to Expect During Your Engagement
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="border border-border/80 p-8 bg-card/30">
                <h3 className="font-display text-lg text-foreground mb-3">{faq.q}</h3>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground font-light">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

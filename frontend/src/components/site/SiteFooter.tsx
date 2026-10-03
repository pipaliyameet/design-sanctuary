import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Instagram, MessageSquare, Phone, Mail } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { STUDIO_DETAILS } from "@/lib/public.functions";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/60 text-foreground transition-colors">
      <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16 py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* Studio Brand & Bio */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="inline-block">
              <BrandLogo variant="horizontal" size="md" />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground font-light">
              A private interior architecture and design studio detailing residences, sky penthouses, and
              bespoke commercial venues around daylight, natural stone and quiet craft.
            </p>
            <p className="text-xs text-muted-foreground/80 tracking-wide font-light">
              Mumbai · Bengaluru · Pan-India
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={STUDIO_DETAILS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex size-9 items-center justify-center border border-border/80 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href={`https://wa.me/${STUDIO_DETAILS.whatsappNumber}?text=${encodeURIComponent("Hello Right Angle Design Studio, I would like to discuss an interior design project.")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex size-9 items-center justify-center border border-border/80 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <MessageSquare className="size-4" />
              </a>
              <a
                href="mailto:contact@rightangle.design"
                aria-label="Email"
                className="flex size-9 items-center justify-center border border-border/80 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          {/* Clean Primary Navigation */}
          <div className="lg:col-span-3">
            <p className="eyebrow text-foreground/80">Navigation</p>
            <ul className="mt-4 space-y-2.5 text-xs uppercase tracking-[0.16em]">
              <li>
                <Link to="/gallery" className="text-muted-foreground hover:text-accent transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-accent transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-accent transition-colors">
                  Studio
                </Link>
              </li>
              <li>
                <Link to="/process" className="text-muted-foreground hover:text-accent transition-colors">
                  Process
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Studios & Consultation */}
          <div className="lg:col-span-4 space-y-6 text-sm">
            <div>
              <p className="eyebrow text-foreground/80">Studios</p>
              <div className="mt-3 space-y-4 text-xs leading-relaxed text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">Mumbai Studio</p>
                  <p>14 Sun Mill Compound, Lower Parel, Mumbai 400013</p>
                  <a href="tel:+919820041100" className="mt-0.5 inline-block text-accent hover:underline">
                    +91 98200 41100
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Bengaluru Studio</p>
                  <p>84 Lavelle Road, Ashok Nagar, Bengaluru 560001</p>
                  <a href="tel:+918041207800" className="mt-0.5 inline-block text-accent hover:underline">
                    +91 80 4120 7800
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <Link
                to="/contact"
                hash="consultation"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground font-semibold hover:text-accent transition-colors"
              >
                Book a Consultation <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-6 text-xs text-muted-foreground">
          <p>© {currentYear} Right Angle Design Studio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-muted-foreground/80">Interior Architecture & Design Practice</span>
            <Link to="/auth" className="hover:text-accent text-[11px] underline">
              Client & Studio Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


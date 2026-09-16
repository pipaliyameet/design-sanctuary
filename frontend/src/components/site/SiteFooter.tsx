import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Instagram, MessageSquare, Phone, Mail } from "lucide-react";
import { STUDIO_DETAILS } from "@/lib/public.functions";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/60 text-foreground transition-colors">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Studio Brand & Bio */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl tracking-tight text-foreground">
                Atelier <span className="font-normal italic text-accent">Vermilion</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              A private interior design and architecture practice detailing residences, villas and
              boutique commercial spaces around daylight, natural stone and quiet craft.
            </p>
            <p className="text-xs text-muted-foreground/80 tracking-wide">
              Founded 2011 · Practicing in Mumbai, Bengaluru & Pan-India.
            </p>

            <div className="flex items-center gap-4 pt-4">
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
                href={`https://wa.me/${STUDIO_DETAILS.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex size-9 items-center justify-center border border-border/80 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <MessageSquare className="size-4" />
              </a>
              <a
                href="mailto:studio@ateliervermilion.com"
                aria-label="Email"
                className="flex size-9 items-center justify-center border border-border/80 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <div>
              <p className="eyebrow text-foreground/80">Exploration</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/portfolio" className="text-muted-foreground hover:text-accent">
                    All Projects
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-muted-foreground hover:text-accent">
                    Studio Services
                  </Link>
                </li>
                <li>
                  <Link to="/process" className="text-muted-foreground hover:text-accent">
                    7-Stage Process
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-accent">
                    Studio & Philosophy
                  </Link>
                </li>
                <li>
                  <Link to="/journal" className="text-muted-foreground hover:text-accent">
                    Journal & Essays
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="eyebrow text-foreground/80">Services</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/services" className="text-muted-foreground hover:text-accent">
                    Residential Architecture
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-muted-foreground hover:text-accent">
                    Turnkey Site Execution
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-muted-foreground hover:text-accent">
                    Modular Joinery & Kitchens
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-muted-foreground hover:text-accent">
                    Heritage Restoration
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-muted-foreground hover:text-accent">
                    Hospitality & Offices
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="eyebrow text-foreground/80">Portal</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-accent">
                    Book Consultation
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-muted-foreground hover:text-accent">
                    Client Portal Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-muted-foreground hover:text-accent">
                    Studio Team Access
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Locations & Direct Contact */}
          <div className="lg:col-span-3 space-y-6 text-sm">
            <div>
              <p className="eyebrow text-foreground/80">Studios</p>
              <div className="mt-3 space-y-4 text-xs leading-relaxed text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">Mumbai Studio</p>
                  <p>14 Sun Mill Compound, Lower Parel, Mumbai 400013</p>
                  <p className="mt-1 text-foreground/70">+91 98200 41100</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Bengaluru Studio</p>
                  <p>84 Lavelle Road, Ashok Nagar, Bengaluru 560001</p>
                  <p className="mt-1 text-foreground/70">+91 80 4120 7800</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-8 text-xs text-muted-foreground">
          <p>© {currentYear} Atelier Vermilion LLP. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-foreground/70">Architectural & Interior Design Practice</span>
            <Link to="/contact" className="hover:text-accent">
              Inquiries & Commissions <ArrowUpRight className="inline size-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Instagram, Facebook, MessageSquare, Phone, Mail } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { STUDIO_DETAILS } from "@/lib/public.functions";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/60 text-foreground transition-colors">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-8 lg:px-12 xl:px-16 py-12 sm:py-20">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-12 items-start">
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
              Jetpur · Rajkot · Ahmedabad
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={STUDIO_DETAILS.facebookUrl || "https://www.facebook.com/rightangle919"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex size-9 items-center justify-center border border-border/80 text-muted-foreground transition-colors hover:border-[#1877F2] hover:text-[#1877F2]"
              >
                <Facebook className="size-4" />
              </a>
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
                href={`mailto:${STUDIO_DETAILS.email || "rightangle011@gmail.com"}`}
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
                <Link to="/" className="text-muted-foreground hover:text-accent transition-colors">
                  Home Page
                </Link>
              </li>
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
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-foreground">Jetpur Studio (HQ)</p>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-accent/15 text-accent font-semibold">HQ</span>
                  </div>
                  <p>
                    <a
                      href="https://www.google.com/maps/place/Right+Angle+Design+Studio/@21.7478479,70.6124044,17z/data=!4m14!1m7!3m6!1s0x3957f3217145c5a9:0x5511871d3726d602!2sRight+Angle+Design+Studio!8m2!3d21.7478479!4d70.6149793!16s%2Fg%2F11svbd8k13!3m5!1s0x3957f3217145c5a9:0x5511871d3726d602!8m2!3d21.7478479!4d70.6149793!16s%2Fg%2F11svbd8k13?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent transition-colors"
                      title="Open Jetpur Studio on Google Maps"
                    >
                      1st Floor, Shree Nathji Complex, Junagadh Road, Jetpur ↗
                    </a>
                  </p>
                  <a href={`tel:${STUDIO_DETAILS.phone}`} className="mt-0.5 inline-block text-accent font-mono font-semibold hover:underline">
                    📞 {STUDIO_DETAILS.phone}
                  </a>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-foreground">Rajkot Studio</p>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-800 text-foreground font-semibold">Studio</span>
                  </div>
                  <p>
                    <a
                      href={STUDIO_DETAILS.rajkotMapsUrl || "https://www.google.com/maps/place/RK+Empire/@22.2627491,70.7839947,17z/data=!3m1!4b1!4m6!3m5!1s0x3959ca5dbe7afda3:0x6d8e1af5be0f4126!8m2!3d22.2627491!4d70.7865696!16s%2Fg%2F11gd7l319v?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent transition-colors"
                      title="Open Rajkot Studio on Google Maps"
                    >
                      919, RK Empire, Near Mavdi Bridge, 150 Ft. Ring Road, Rajkot - 360004 ↗
                    </a>
                  </p>
                  <a href={`tel:${STUDIO_DETAILS.phone}`} className="mt-0.5 inline-block text-accent font-mono font-semibold hover:underline">
                    📞 {STUDIO_DETAILS.phone}
                  </a>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-foreground">Ahmedabad</p>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold">Site Bookings Only</span>
                  </div>
                  <p>On-Site Client Consultations & Project Bookings (By Appointment · No Office)</p>
                  <a href={`tel:${STUDIO_DETAILS.phone}`} className="mt-0.5 inline-block text-accent font-mono font-semibold hover:underline">
                    📞 {STUDIO_DETAILS.phone}
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
            <Link to="/auth" search={{ redirect: "/studio" }} className="hover:text-accent text-[11px] underline">
              Client & Studio Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


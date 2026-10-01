import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl">
              Atelier <span className="text-accent">Vermilion</span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-foreground/70">
              An interior design studio detailing homes and hospitality around daylight, stone and
              quiet craft. Mumbai and Bengaluru, working across India.
            </p>
          </div>

          <div>
            <p className="eyebrow text-ink-foreground/50">Explore</p>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { to: "/portfolio", label: "Portfolio" },
                { to: "/services", label: "Services" },
                { to: "/about", label: "The studio" },
                { to: "/journal", label: "Journal" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-ink-foreground/75 transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-ink-foreground/50">Studio</p>
            <ul className="mt-4 space-y-3 text-sm text-ink-foreground/75">
              <li>studio@ateliervermilion.example</li>
              <li>+91 98200 41100</li>
              <li>Mumbai · Bengaluru</li>
              <li>
                <Link to="/contact" className="text-accent hover:underline">
                  Start a project
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-ink-foreground/15 pt-6 text-xs text-ink-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Atelier Vermilion. All rights reserved.</p>
          <Link to="/auth" className="hover:text-accent">
            Client &amp; studio sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}

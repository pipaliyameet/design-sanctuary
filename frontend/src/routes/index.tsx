import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, Compass, Layers, ShieldCheck, CheckCircle2 } from "lucide-react";
import { getHomeContent, FALLBACK_CASE_STUDIES } from "@/lib/public.functions";
import { PublicShell } from "@/components/site/PublicShell";
import { EditorialProjectGrid } from "@/components/site/CaseCardGrid";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { MaterialGallery } from "@/components/site/MaterialGallery";
import { ConsultationForm } from "@/components/site/ConsultationForm";
import { InstagramFeedSection } from "@/components/site/InstagramFeedSection";

const homeQuery = queryOptions({
  queryKey: ["home-content"],
  queryFn: () => getHomeContent(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Atelier Vermilion — Interior Design, Architecture & Turnkey Execution" },
      {
        name: "description",
        content:
          "Spaces designed around the way you live. Atelier Vermilion creates bespoke residential, villa, and hospitality interiors detailed around daylight, natural stone, and quiet craft in Mumbai & Bengaluru.",
      },
      { property: "og:title", content: "Atelier Vermilion — Interior Design Studio" },
      {
        property: "og:description",
        content:
          "Spaces designed around the way you live. Interior design, architecture and turnkey execution.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => (
    <PublicShell>
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="text-3xl font-display">Atelier Vermilion</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Refreshing studio parameters. Please reload to view our portfolio.
        </p>
      </div>
    </PublicShell>
  ),
});

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Discovery",
    body: "Site visit, comprehensive measured survey, solar daylight analysis, and structured lifestyle brief.",
  },
  {
    step: "02",
    title: "Consultation",
    body: "Collaborative spatial strategy, timeline projection, and feasibility assessment with our principal team.",
  },
  {
    step: "03",
    title: "Concept Development",
    body: "Atmospheric moodboards, volume articulation, circulation mapping, and primary material palette selection.",
  },
  {
    step: "04",
    title: "3D Design & Visualisation",
    body: "Photorealistic spatial perspectives, lighting temperature studies, and full room-by-room walkthroughs.",
  },
  {
    step: "05",
    title: "Material Selection",
    body: "Full physical flat-lay boards: natural stone slabs, veneer grain sequencing, hardware and textile hand-feel.",
  },
  {
    step: "06",
    title: "Execution",
    body: "Strict on-site management, weekly quality audits, milestone checklists, and dedicated project manager oversight.",
  },
  {
    step: "07",
    title: "Final Handover",
    body: "White-glove styling, operational care manual, warranties dossier, and scheduled 90-day post-settling review.",
  },
];

const TESTIMONIALS = [
  {
    client: "Rajesh & Priya Shah",
    project: "The Shah Residence",
    location: "Ahmedabad",
    text: "Atelier Vermilion completely reimagined our relationship with natural light. The honed travertine courtyard feels like a private sanctuary in the middle of the city. Every single millwork joint aligns with absolute perfection.",
  },
  {
    client: "Sameer Nambiar",
    project: "Koramangala Sky Penthouse",
    location: "Bengaluru",
    text: "As an art collector, I needed museum-grade acoustic calm and precise lighting. The studio’s architectural discipline and turnkey execution meant zero stress during the 11-month build. The result is pure understated luxury.",
  },
  {
    client: "Tarun & Alisha Mehta",
    project: "Alibaug Coastal Villa",
    location: "Alibaug",
    text: "Building by the coast is notorious for contractor delays and weathering issues. Ira and Nikhil held the site with total accountability. Two monsoons later, the teak and basalt have aged even more beautifully.",
  },
];

function HomePage() {
  const { data } = useSuspenseQuery(homeQuery);
  const studies = data?.studies && data.studies.length > 0 ? data.studies : FALLBACK_CASE_STUDIES;
  const posts = data?.posts ?? [];

  return (
    <PublicShell overlayHeader>
      {/* 2. CINEMATIC HERO SECTION */}
      <section className="relative isolate min-h-[95vh] overflow-hidden flex flex-col justify-end">
        {/* Background Image with Slow Subtle Ambient Zoom */}
        <img
          src="/portfolio/hero.jpg"
          alt="Architectural sunlit living room detailed in honed travertine, fumed oak and antique brass"
          className="absolute inset-0 size-full object-cover slow-zoom brightness-[0.88]"
        />

        {/* Ambient Architectural Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/20 to-transparent" />

        {/* Content Box */}
        <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="max-w-4xl">
            <p className="eyebrow text-ink-foreground/80 flex items-center gap-2 mb-4">
              <span className="inline-block size-1.5 rounded-full bg-accent" />
              Atelier Vermilion · Architecture & Interior Design
            </p>

            <h1 className="reveal font-display text-4xl leading-[1.04] sm:text-6xl lg:text-7xl xl:text-8xl text-ink-foreground tracking-tight font-light">
              Spaces designed around the way{" "}
              <span className="italic font-normal text-accent">you live.</span>
            </h1>

            <p className="reveal mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-ink-foreground/85 font-light">
              Interior design, architecture and turnkey execution for thoughtful residential and
              commercial spaces. Detailed room by room around daylight, stone and quiet craft.
            </p>

            <div className="reveal mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2.5 bg-accent px-8 py-4 text-xs font-semibold tracking-[0.2em] text-accent-foreground uppercase transition-transform hover:scale-[1.02] shadow-lg"
              >
                Explore Projects <ArrowRight className="size-3.5" />
              </Link>
              <Link
                to="/contact"
                hash="consultation"
                className="inline-flex items-center gap-2.5 border border-ink-foreground/50 bg-ink/30 backdrop-blur-md px-8 py-4 text-xs font-semibold tracking-[0.2em] text-ink-foreground uppercase transition-colors hover:border-accent hover:text-accent"
              >
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Hero Ribbon */}
        <div className="relative border-t border-ink-foreground/15 bg-ink/60 backdrop-blur-md py-4 text-ink-foreground/75 text-xs">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-6">
              <span>Mumbai · Bengaluru</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">15 Years in Practice</span>
            </div>
            <div className="flex items-center gap-6">
              <span>148+ Completed Residences & Villas</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">Turnkey Site Accountability</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PHILOSOPHY & MANIFESTO */}
      <section className="border-b border-border/80 bg-background py-20 sm:py-32">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7">
              <p className="eyebrow">Design Philosophy</p>
              <h2 className="mt-4 font-display text-3xl sm:text-5xl lg:text-6xl font-light text-foreground leading-[1.12]">
                “Good interiors are not only beautiful.
                <br />
                <span className="italic text-accent font-normal">
                  They should feel natural to live in.”
                </span>
              </h2>
              <p className="mt-8 text-base sm:text-lg leading-relaxed text-muted-foreground font-light max-w-2xl">
                Every project we undertake starts by stripping away the non-essential. We avoid
                flashy trends and disposable materials in pursuit of architecture that breathes:
                natural stone with tactile depth, hand-plastered surfaces that catch the changing sun,
                and bespoke millwork resolved with millimeter precision.
              </p>
            </div>

            <div className="lg:col-span-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              <div className="border border-border/80 p-6 bg-card/40">
                <div className="flex items-center gap-3 text-accent mb-2">
                  <Compass className="size-4" />
                  <h4 className="font-display text-lg text-foreground">Daylight-First Geometry</h4>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Solar mapping aligns living spaces with afternoon warmth and sleeping chambers
                  with serene morning clarity.
                </p>
              </div>

              <div className="border border-border/80 p-6 bg-card/40">
                <div className="flex items-center gap-3 text-accent mb-2">
                  <Layers className="size-4" />
                  <h4 className="font-display text-lg text-foreground">Material Restraint</h4>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Three foundational finishes detailed harder — no artificial plastic trims,
                  imitation veneers, or cosmetic disguises.
                </p>
              </div>

              <div className="border border-border/80 p-6 bg-card/40">
                <div className="flex items-center gap-3 text-accent mb-2">
                  <ShieldCheck className="size-4" />
                  <h4 className="font-display text-lg text-foreground">Held Turnkey Execution</h4>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Single accountable design-and-build delivery with weekly client walkthroughs and a
                  frozen bill of quantities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROJECTS (EDITORIAL ASYMMETRIC GRID) */}
      <section className="py-24 sm:py-36 bg-background">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 pb-14 border-b border-border">
            <div>
              <p className="eyebrow">Curated Portfolio</p>
              <h2 className="mt-3 text-3xl sm:text-5xl font-display font-light text-foreground">
                Featured Architectural Commissions
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground hover:text-accent font-semibold transition-colors"
            >
              View All Projects <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="pt-14">
            <EditorialProjectGrid projects={studies} />
          </div>

          <div className="mt-20 text-center">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-3 border border-foreground/30 px-10 py-4 text-xs uppercase tracking-[0.22em] text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Explore Full Projects Archive ({studies.length}+) <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE BEFORE & AFTER TRANSFORMATION */}
      <section className="border-y border-border bg-card/40 py-24 sm:py-36">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="max-w-2xl pb-12">
            <p className="eyebrow">Transformation & Renovation</p>
            <h2 className="mt-3 text-3xl sm:text-5xl font-display font-light text-foreground">
              Before & After: The Power of Architectural Execution
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Drag the divider below to reveal the metamorphosis of The Shah Residence from a bare
              concrete shell into an acoustically cushioned, travertine-clad living pavilion.
            </p>
          </div>

          <BeforeAfterSlider
            beforeUrl="/portfolio/p8.jpg"
            afterUrl="/portfolio/hero.jpg"
            beforeLabel="Raw Concrete Site Shell"
            afterLabel="Completed Living Pavilion"
            caption="The Shah Residence, Ahmedabad · 6,400 sq ft transformation"
            aspectRatio="aspect-[16/9] sm:aspect-[21/10]"
          />
        </div>
      </section>

      {/* 7. SERVICES SUMMARY */}
      <section className="py-24 sm:py-36 bg-background">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 pb-12 border-b border-border">
            <div>
              <p className="eyebrow">Studio Capabilities</p>
              <h2 className="mt-3 text-3xl sm:text-5xl font-display font-light text-foreground">
                Disciplines & Scope of Work
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground hover:text-accent font-semibold transition-colors"
            >
              Detailed Service Specifications <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Residential Interior Architecture",
                desc: "Full bespoke interiors for penthouses, luxury villas, and expansive apartments. Comprehensive space re-planning, joinery, and lighting.",
                image: "/portfolio/p1.jpg",
                link: "/services",
              },
              {
                title: "Turnkey Interior Execution",
                desc: "We take total site custody: vetted MEP contractors, procurement, factory shop-drawing verification, and single-source schedule guarantees.",
                image: "/portfolio/p6.jpg",
                link: "/services",
              },
              {
                title: "Modular Kitchens & Wardrobes",
                desc: "Engineered German & Austrian hardware, 2mm solid wood lippings, fumed veneers, and bespoke quartzite island counters.",
                image: "/portfolio/p7.jpg",
                link: "/services",
              },
              {
                title: "Boutique Commercial & Offices",
                desc: "Workplaces and executive suites designed with residential acoustic calm, indirect glare-free illumination, and bespoke conference tables.",
                image: "/portfolio/p4.jpg",
                link: "/services",
              },
              {
                title: "Heritage Restoration & Adaptive Reuse",
                desc: "Authentic lime-wash masonry, terrazzo restoration, and vintage hardware casting for period residences and historic properties.",
                image: "/portfolio/p2.jpg",
                link: "/services",
              },
              {
                title: "Bespoke Furniture & Art Curation",
                desc: "Custom dining tables, hand-knotted wool rugs, sculptural brass hardware, and fine art placement in dialogue with spatial geometry.",
                image: "/portfolio/p5.jpg",
                link: "/services",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="group flex flex-col justify-between bg-background p-8 transition-colors hover:bg-secondary/20"
              >
                <div>
                  <div className="aspect-[16/10] w-full overflow-hidden mb-6 bg-secondary/30">
                    <img
                      src={s.image}
                      alt={s.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-display text-xl text-foreground group-hover:text-accent transition-colors">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
                <Link
                  to={s.link}
                  className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accent font-medium"
                >
                  Learn More <ArrowRight className="size-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. DESIGN PROCESS (7 STAGES) */}
      <section className="border-t border-border bg-card/40 py-24 sm:py-36">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="max-w-3xl pb-16">
            <p className="eyebrow">Clear & Transparent Journey</p>
            <h2 className="mt-3 text-3xl sm:text-5xl font-display font-light text-foreground">
              Our 7-Stage Architectural Process
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              From your initial consultation through to white-glove handover, here is exactly how we
              guide your commission with meticulous structure and complete accountability.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((p, idx) => (
              <div
                key={p.step}
                className="relative flex flex-col justify-between border border-border/80 bg-background p-6 transition-all duration-300 hover:border-accent"
              >
                <div>
                  <span className="font-display text-3xl font-light text-accent/80">{p.step}</span>
                  <h4 className="mt-4 font-display text-lg font-normal text-foreground">
                    {p.title}
                  </h4>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 text-[11px] uppercase tracking-widest text-muted-foreground/80 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3 text-accent" /> Phase 0{idx + 1}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-end">
            <Link
              to="/process"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent hover:underline font-semibold"
            >
              Detailed Step-by-Step Methodology <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. MATERIALS & CRAFTSMANSHIP GALLERY */}
      <section className="py-24 sm:py-36 bg-background">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="max-w-2xl pb-12">
            <p className="eyebrow">Tactile Honesty</p>
            <h2 className="mt-3 text-3xl sm:text-5xl font-display font-light text-foreground">
              Materials, Finishes & Detailing
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Explore the raw, natural finishes that define our signature interior language.
              Click any finish to view completed projects featuring that material.
            </p>
          </div>

          <MaterialGallery />
        </div>
      </section>

      {/* 13. CLIENT TESTIMONIALS */}
      <section className="border-y border-border bg-secondary/30 py-24 sm:py-36">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="max-w-2xl pb-14">
            <p className="eyebrow">Client Endorsements</p>
            <h2 className="mt-3 text-3xl sm:text-5xl font-display font-light text-foreground">
              Reflections on Working Together
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between border border-border/80 bg-background p-8 relative"
              >
                <div>
                  <div className="flex text-accent mb-4">
                    <Sparkles className="size-4" />
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/90 font-light italic font-editorial">
                    “{t.text}”
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-border/60">
                  <p className="font-display text-base text-foreground">{t.client}</p>
                  <p className="text-xs text-muted-foreground tracking-wider uppercase mt-0.5">
                    {t.project} · {t.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. JOURNAL & INSIGHTS */}
      {posts.length > 0 && (
        <section className="py-24 sm:py-36 bg-background">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6 pb-12 border-b border-border">
              <div>
                <p className="eyebrow">Design Authority & Insights</p>
                <h2 className="mt-3 text-3xl sm:text-5xl font-display font-light text-foreground">
                  From the Studio Journal
                </h2>
              </div>
              <Link
                to="/journal"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground hover:text-accent font-semibold transition-colors"
              >
                All Articles ({posts.length}) <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 3).map((post) => (
                <Link
                  key={post.slug}
                  to="/journal/$slug"
                  params={{ slug: post.slug }}
                  className="group flex flex-col"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-secondary/30">
                    <img
                      src={post.cover_image ?? "/portfolio/p6.jpg"}
                      alt={post.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-5 flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground">
                    <span className="text-accent font-medium">{post.category}</span>
                    <span>{post.read_minutes} min read</span>
                  </div>
                  <h3 className="mt-2.5 font-display text-xl text-foreground group-hover:text-accent transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-foreground group-hover:text-accent font-medium">
                    Read Essay <ArrowRight className="size-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 15. INSTAGRAM FEED SECTION */}
      <InstagramFeedSection />

      {/* 16. CONSULTATION & CONTACT FORM SECTION */}
      <section className="bg-card/70 py-24 sm:py-36 border-t border-border">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <ConsultationForm />
        </div>
      </section>
    </PublicShell>
  );
}

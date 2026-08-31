import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { getHomeContent } from "@/lib/public.functions";
import { PublicShell } from "@/components/site/PublicShell";
import { CaseCardItem } from "@/components/site/CaseCardGrid";

const homeQuery = queryOptions({
  queryKey: ["home-content"],
  queryFn: () => getHomeContent(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: Home,
  head: () => ({
    meta: [
      { title: "Atelier Vermilion — Interior Design Studio, Mumbai & Bengaluru" },
      {
        name: "description",
        content:
          "Atelier Vermilion designs residences, villas and hospitality interiors detailed around daylight, stone and quiet craft. View the portfolio and start a project.",
      },
      { property: "og:title", content: "Atelier Vermilion — Interior Design Studio" },
      {
        property: "og:description",
        content:
          "Residential and hospitality interiors detailed around daylight, stone and quiet craft. Mumbai and Bengaluru.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => (
    <PublicShell>
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="text-3xl">We couldn't load the studio</h1>
        <p className="mt-3 text-sm text-muted-foreground">Please refresh to try again.</p>
      </div>
    </PublicShell>
  ),
});

const SERVICES = [
  {
    title: "Full interior design",
    body: "Concept to handover for residences, villas and penthouses — layouts, joinery, lighting, styling.",
  },
  {
    title: "Turnkey execution",
    body: "We hold the site: contractors, vendors, quality checks and a single accountable schedule.",
  },
  {
    title: "Hospitality & workplace",
    body: "Restaurants, boutique hotels and offices designed for atmosphere and operational reality.",
  },
];

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  const [hero, ...rest] = data.studies;
  const stats = (data.settings["stats"] ?? {}) as Record<string, number>;

  return (
    <PublicShell overlayHeader>
      {/* Hero */}
      <section className="relative isolate min-h-[92vh] overflow-hidden">
        <img
          src="/portfolio/hero.jpg"
          alt="A sunlit living room with travertine floors, oak joinery and brass detailing"
          className="absolute inset-0 size-full object-cover slow-zoom"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-ink)", opacity: 0.95 }}
        />
        <div className="relative mx-auto flex min-h-[92vh] max-w-[1400px] flex-col justify-end px-5 pb-20 sm:px-8 sm:pb-28">
          <p className="eyebrow reveal text-ink-foreground/70">Interior design · Since 2011</p>
          <h1 className="reveal mt-6 max-w-4xl text-4xl leading-[1.02] text-ink-foreground sm:text-6xl lg:text-7xl">
            Interiors detailed around light, stone and quiet craft.
          </h1>
          <p className="reveal mt-7 max-w-xl text-base leading-relaxed text-ink-foreground/80">
            We design and deliver a small number of considered projects each year — homes, villas and
            hospitality spaces resolved room by room, drawing by drawing.
          </p>
          <div className="reveal mt-10 flex flex-wrap gap-4">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 bg-accent px-6 py-3 text-xs tracking-[0.2em] text-accent-foreground uppercase transition-opacity hover:opacity-90"
            >
              View portfolio <ArrowRight className="size-3.5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-ink-foreground/40 px-6 py-3 text-xs tracking-[0.2em] text-ink-foreground uppercase transition-colors hover:border-accent hover:text-accent"
            >
              Start a project
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-y-10 px-5 py-14 sm:px-8 lg:grid-cols-4">
          {[
            { label: "Projects delivered", value: stats["projects"] ?? 148 },
            { label: "Cities", value: stats["cities"] ?? 11 },
            { label: "Years in practice", value: stats["years"] ?? 15 },
            { label: "Design awards", value: stats["awards"] ?? 9 },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl text-foreground">{s.value}</p>
              <p className="eyebrow mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Signature work */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 className="mt-4 max-w-2xl text-3xl sm:text-5xl">
              Projects we return to for their detailing.
            </h2>
          </div>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-accent"
          >
            All projects <ArrowRight className="size-4" />
          </Link>
        </div>

        {hero && (
          <div className="mt-14">
            <CaseCardItem study={hero} large />
          </div>
        )}
        <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {rest.slice(0, 6).map((s) => (
            <CaseCardItem key={s.slug} study={s} />
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-secondary/50">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center">
          <img
            src="/portfolio/p6.jpg"
            alt="Detail of lime plaster wall, brass shadow gap and fumed oak joinery"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
          <div>
            <p className="eyebrow">The studio</p>
            <h2 className="mt-4 text-3xl sm:text-5xl">
              Fewer materials. Harder detailing. Sites we actually stand on.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Every scheme begins with a stone, a timber and a metal. Everything else answers to
              them. We draw joinery as shop drawings before a single panel is cut, and we walk each
              site weekly until handover.
            </p>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {[
                ["01", "Light first", "Daylight studies reorder the plan before furniture appears."],
                ["02", "Material honesty", "Five materials, resolved junctions, no disguises."],
                ["03", "Held schedules", "One accountable programme from brief to handover."],
              ].map(([n, t, b]) => (
                <div key={n}>
                  <p className="text-accent text-xs tracking-[0.2em]">{n}</p>
                  <p className="mt-3 font-display text-lg">{t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
        <p className="eyebrow">What we do</p>
        <h2 className="mt-4 max-w-2xl text-3xl sm:text-5xl">Three ways studios engage with us.</h2>
        <div className="mt-14 grid gap-px bg-border sm:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.title} className="bg-background p-8">
              <h3 className="text-xl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
        <Link
          to="/services"
          className="mt-10 inline-flex items-center gap-2 text-sm hover:text-accent"
        >
          How the process works <ArrowRight className="size-4" />
        </Link>
      </section>

      {/* Journal */}
      {data.posts.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
            <div className="flex items-end justify-between gap-6">
              <h2 className="text-3xl sm:text-4xl">From the journal</h2>
              <Link to="/journal" className="text-sm hover:text-accent">
                All writing
              </Link>
            </div>
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {data.posts.map((p) => (
                <Link key={p.slug} to="/journal/$slug" params={{ slug: p.slug }} className="group">
                  <img
                    src={p.cover_image ?? "/portfolio/p2.jpg"}
                    alt={p.title}
                    loading="lazy"
                    className="aspect-[3/2] w-full object-cover"
                  />
                  <p className="eyebrow mt-4">
                    {p.category} · {p.read_minutes} min
                  </p>
                  <h3 className="mt-2 text-xl group-hover:text-accent">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="max-w-2xl text-3xl sm:text-5xl">
              Tell us about the space you're thinking about.
            </h2>
            <p className="mt-4 max-w-xl text-sm text-ink-foreground/70">
              Share the brief, the city and a rough budget band. We reply within two working days.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-accent px-7 py-4 text-xs tracking-[0.2em] text-accent-foreground uppercase"
          >
            Start an enquiry <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getCaseStudy } from "@/lib/public.functions";
import { PublicShell, PageHeader } from "@/components/site/PublicShell";
import { CaseCardItem } from "@/components/site/CaseCardGrid";

const studyQuery = (slug: string) =>
  queryOptions({
    queryKey: ["case-study", slug],
    queryFn: () => getCaseStudy({ data: { slug } }),
  });

export const Route = createFileRoute("/portfolio/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(studyQuery(params.slug));
    if (!result) throw notFound();
    return result;
  },
  component: CaseStudyPage,
  head: ({ loaderData }) => {
    const study = loaderData?.study;
    if (!study) return {};
    const title = study.seo_title ?? `${study.title} — Atelier Vermilion`;
    const description =
      study.seo_description ?? study.summary ?? "An interior design project by Atelier Vermilion.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: study.title,
            description,
            locationCreated: study.location,
            dateCreated: study.year ? String(study.year) : undefined,
            creator: { "@type": "Organization", name: "Atelier Vermilion" },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicShell>
      <PageHeader
        eyebrow="Portfolio"
        title="That project isn't published"
        intro="It may have been moved. Browse the full portfolio instead."
      />
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
        <Link to="/portfolio" className="text-sm text-accent hover:underline">
          Back to portfolio
        </Link>
      </div>
    </PublicShell>
  ),
  errorComponent: () => (
    <PublicShell>
      <PageHeader eyebrow="Portfolio" title="We couldn't load this project" />
    </PublicShell>
  ),
});

type GalleryItem = { url?: string; caption?: string };

function CaseStudyPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(studyQuery(slug));
  if (!data) return null;
  const { study, related } = data;
  const gallery = (Array.isArray(study.gallery) ? study.gallery : []) as GalleryItem[];
  const credits = (study.credits ?? {}) as Record<string, string>;

  return (
    <PublicShell overlayHeader>
      <section className="relative isolate">
        <img
          src={study.hero_image ?? "/portfolio/hero.jpg"}
          alt={`${study.title}, a ${study.style ?? ""} ${study.space_type ?? "interior"} in ${study.location ?? "India"}`}
          className="h-[78vh] w-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-ink)" }} />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-5 pb-16 sm:px-8">
          <p className="eyebrow text-ink-foreground/70">
            {[study.space_type, study.location, study.year].filter(Boolean).join(" · ")}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-[1.03] text-ink-foreground sm:text-6xl">
            {study.title}
          </h1>
          {study.subtitle && (
            <p className="mt-4 max-w-xl text-base text-ink-foreground/80">{study.subtitle}</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[2fr_1fr]">
          <div>
            <p className="font-display text-2xl leading-snug sm:text-3xl">{study.summary}</p>

            {study.brief && (
              <div className="mt-14">
                <p className="eyebrow">The brief</p>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{study.brief}</p>
              </div>
            )}
            {study.solution && (
              <div className="mt-12">
                <p className="eyebrow">Our approach</p>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {study.solution}
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-8 border-t border-border pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <Detail label="Space" value={study.space_type} />
            <Detail label="Style" value={study.style} />
            <Detail label="Location" value={study.location} />
            <Detail label="Area" value={study.area_sqft ? `${study.area_sqft} sq ft` : null} />
            {study.materials?.length > 0 && (
              <div>
                <p className="eyebrow">Materials</p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {study.materials.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {Object.keys(credits).length > 0 && (
              <div>
                <p className="eyebrow">Credits</p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {Object.entries(credits).map(([k, v]) => (
                    <li key={k} className="text-muted-foreground">
                      <span className="text-foreground">{k}:</span> {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pb-24 sm:px-8">
          <div className="space-y-16">
            {gallery.map((item, i) => (
              <figure key={`${item.url}-${i}`} className={i % 2 === 1 ? "lg:ml-[16%]" : ""}>
                <img
                  src={item.url ?? "/portfolio/hero.jpg"}
                  alt={item.caption ?? `${study.title} interior view`}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
                {item.caption && (
                  <figcaption className="mt-3 text-sm text-muted-foreground">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-3xl">More projects</h2>
            <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm hover:text-accent">
              <ArrowLeft className="size-4" /> All portfolio
            </Link>
          </div>
          <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-3">
            {related.map((s) => (
              <CaseCardItem key={s.slug} study={s} />
            ))}
          </div>
          <Link
            to="/contact"
            className="mt-16 inline-flex items-center gap-2 bg-primary px-7 py-4 text-xs tracking-[0.2em] text-primary-foreground uppercase"
          >
            Start a project like this <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-sm">{value}</p>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listCaseStudies } from "@/lib/public.functions";
import { PublicShell, PageHeader } from "@/components/site/PublicShell";
import { CaseCardGrid } from "@/components/site/CaseCardGrid";
import { cn } from "@/lib/utils";

const portfolioQuery = queryOptions({
  queryKey: ["case-studies"],
  queryFn: () => listCaseStudies(),
});

export const Route = createFileRoute("/portfolio/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(portfolioQuery),
  component: Portfolio,
  head: () => ({
    meta: [
      { title: "Portfolio — Interior Design Projects | Atelier Vermilion" },
      {
        name: "description",
        content:
          "Browse completed interior design projects by Atelier Vermilion: penthouses, villas, apartments, hospitality and workplace, filtered by space, style and city.",
      },
      { property: "og:title", content: "Portfolio — Atelier Vermilion" },
      {
        property: "og:description",
        content: "Completed residential and hospitality interiors, room by room.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => (
    <PublicShell>
      <PageHeader eyebrow="Portfolio" title="We couldn't load the portfolio" />
    </PublicShell>
  ),
});

type FilterKey = "space_type" | "style" | "location";

function Portfolio() {
  const { data: studies } = useSuspenseQuery(portfolioQuery);
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    space_type: "All",
    style: "All",
    location: "All",
  });

  const options = useMemo(() => {
    const build = (key: FilterKey) => [
      "All",
      ...Array.from(new Set(studies.map((s) => s[key]).filter(Boolean) as string[])).sort(),
    ];
    return {
      space_type: build("space_type"),
      style: build("style"),
      location: build("location"),
    };
  }, [studies]);

  const filtered = studies.filter((s) =>
    (["space_type", "style", "location"] as FilterKey[]).every(
      (k) => filters[k] === "All" || s[k] === filters[k],
    ),
  );

  return (
    <PublicShell>
      <PageHeader
        eyebrow={`Portfolio · ${studies.length} published projects`}
        title="Every project, resolved room by room."
        intro="Filter by space, style or city. Each case study documents the brief, the material palette and the rooms as built."
      />

      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8">
        <div className="space-y-5">
          {(
            [
              ["space_type", "Space"],
              ["style", "Style"],
              ["location", "City"],
            ] as [FilterKey, string][]
          ).map(([key, label]) => (
            <div key={key} className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="eyebrow w-14">{label}</span>
              {options[key].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, [key]: opt }))}
                  className={cn(
                    "border px-3 py-1.5 text-xs transition-colors",
                    filters[key] === opt
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Showing {filtered.length} of {studies.length} projects
        </p>

        <div className="mt-8 pb-24">
          {filtered.length > 0 ? (
            <CaseCardGrid studies={filtered} />
          ) : (
            <div className="border border-dashed border-border py-24 text-center">
              <p className="font-display text-2xl">No projects match those filters</p>
              <button
                type="button"
                onClick={() => setFilters({ space_type: "All", style: "All", location: "All" })}
                className="mt-4 text-sm text-accent hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyPortal } from "@/lib/portal.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
  STAGE_LABELS,
  inr,
  shortDate,
} from "@/components/app/AppShell";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/portal/")({
  component: PortalHome,
  head: () => ({
    meta: [
      { title: "Your project — Atelier Vermilion" },
      {
        name: "description",
        content: "Follow your interior project: progress, designs to approve, documents and payments.",
      },
      { property: "og:title", content: "Your project — Atelier Vermilion" },
      { property: "og:description", content: "Your private project portal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function PortalHome() {
  const fetchPortal = useServerFn(getMyPortal);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["portal", "home"],
    queryFn: () => fetchPortal(),
  });

  return (
    <AppShell variant="portal">
      <PageTitle
        eyebrow={data?.client ? `Welcome, ${data.client.name}` : "Client portal"}
        title="Your projects"
      />

      {isLoading && <LoadingBlock label="Loading your project…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {data && data.projects.length === 0 && (
        <EmptyState message="Your project isn’t linked to this account yet. Your design lead will connect it — please write to us if it doesn’t appear." />
      )}

      {data && data.projects.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {data.projects.map((p) => (
            <Link
              key={p.id}
              to="/portal/$id"
              params={{ id: p.id }}
              className="group border border-border bg-card transition-colors hover:border-accent"
            >
              {p.cover_image && (
                <img
                  src={p.cover_image}
                  alt={`${p.title} interior`}
                  loading="lazy"
                  className="h-56 w-full object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow">{p.code}</p>
                    <h2 className="mt-2 font-display text-2xl leading-tight group-hover:text-accent">
                      {p.title}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.city} · with {p.lead_designer_name ?? "our studio team"}
                    </p>
                  </div>
                  <Badge variant="secondary">{STAGE_LABELS[p.stage] ?? p.stage}</Badge>
                </div>

                <Progress value={p.progress} className="mt-5 h-1" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {p.progress}% complete · handover {shortDate(p.target_date)}
                </p>

                <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Waiting for you</dt>
                    <dd className={p.pendingApprovals > 0 ? "text-accent" : ""}>
                      {p.pendingApprovals} approval{p.pendingApprovals === 1 ? "" : "s"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Balance due</dt>
                    <dd>{inr(p.outstanding)}</dd>
                  </div>
                </dl>

                {p.lastUpdate && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Latest from site: {p.lastUpdate.title} ({shortDate(p.lastUpdate.created_at)})
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

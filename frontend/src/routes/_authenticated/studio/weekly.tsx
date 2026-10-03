import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { listWeeklySummaries, runWeeklySummary } from "@/lib/weekly.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
  Panel,
  STAGE_LABELS,
  StatCard,
  inr,
  shortDate,
} from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/studio/weekly")({
  component: WeeklyPage,
  head: () => ({
    meta: [
      { title: "Monday summary — Right-Angle-Design-Studio" },
      {
        name: "description",
        content:
          "Weekly studio digest compiled every Monday morning: KPIs, new enquiries and projects awaiting client approval.",
      },
      { property: "og:title", content: "Monday summary — Right-Angle-Design-Studio" },
      { property: "og:description", content: "Weekly studio digest and delivery status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function WeeklyPage() {
  const fetchSummaries = useServerFn(listWeeklySummaries);
  const runNow = useServerFn(runWeeklySummary);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["studio", "weekly"],
    queryFn: () => fetchSummaries(),
  });

  const generate = useMutation({
    mutationFn: () => runNow(),
    onSuccess: () => {
      toast.success("Summary recompiled from live data.");
      queryClient.invalidateQueries({ queryKey: ["studio", "weekly"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const latest = data?.summaries[0];

  return (
    <AppShell>
      <PageTitle
        eyebrow="Weekly digest"
        title="Monday morning summary"
        actions={
          <Button size="sm" disabled={generate.isPending} onClick={() => generate.mutate()}>
            {generate.isPending ? "Compiling…" : "Compile now"}
          </Button>
        }
      />

      {isLoading && <LoadingBlock label="Loading digests…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {data && (
        <div className="space-y-6">
          <Panel title="Delivery">
            {data.email.configured ? (
              <p className="text-sm text-muted-foreground">
                Digests are emailed from your verified sending domain{" "}
                <span className="text-foreground">{data.email.domain}</span> every Monday at 8:00 am
                (Asia/Kolkata).
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm">
                  No verified sending domain is connected yet, so nothing is emailed — the digest is
                  compiled and stored here every Monday at 8:00 am (Asia/Kolkata) instead.
                </p>
                <p className="text-sm text-muted-foreground">
                  To receive it by email, verify your studio&rsquo;s sending domain in project
                  settings; the Monday job will then deliver to your inbox automatically.
                </p>
              </div>
            )}
          </Panel>

          {!latest && (
            <EmptyState message="No digest has been compiled yet. Use “Compile now” to build this week’s summary." />
          )}

          {latest && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow">Week of {shortDate(latest.week_start)}</p>
                <Badge variant="outline">{latest.delivery_status}</Badge>
                <span className="text-xs text-muted-foreground">
                  compiled {shortDate(latest.generated_at)}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard label="Active projects" value={latest.payload.active_projects ?? 0} />
                <StatCard
                  label="New enquiries"
                  value={latest.payload.new_enquiries ?? 0}
                  tone="accent"
                />
                <StatCard label="New leads" value={latest.payload.new_leads ?? 0} />
                <StatCard
                  label="Pending approvals"
                  value={latest.payload.pending_approvals ?? 0}
                  tone={(latest.payload.pending_approvals ?? 0) > 0 ? "warn" : "default"}
                />
                <StatCard
                  label="Overdue tasks"
                  value={latest.payload.overdue_tasks ?? 0}
                  hint={`${latest.payload.upcoming_tasks ?? 0} due this week`}
                  tone={(latest.payload.overdue_tasks ?? 0) > 0 ? "warn" : "default"}
                />
                <StatCard
                  label="Receivables"
                  value={inr(latest.payload.receivables)}
                  hint={`${inr(latest.payload.collected_week)} collected`}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <Panel title="Projects by stage">
                  {Object.keys(latest.payload.projects_by_stage ?? {}).length === 0 ? (
                    <EmptyState message="No active projects." />
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {Object.entries(latest.payload.projects_by_stage ?? {}).map(([k, v]) => (
                        <li key={k} className="flex justify-between">
                          <span>{STAGE_LABELS[k] ?? k}</span>
                          <span className="text-muted-foreground">{String(v)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>

                <Panel title="New enquiries this week">
                  {(latest.payload.enquiry_list ?? []).length === 0 ? (
                    <EmptyState message="No new enquiries." />
                  ) : (
                    <ul className="divide-y divide-border">
                      {(latest.payload.enquiry_list ?? []).map((e: any) => (
                        <li key={e.id} className="py-3">
                          <p className="text-sm">{e.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {[e.city, e.space_type, e.budget_band].filter(Boolean).join(" · ") ||
                              "Details pending"}{" "}
                            · {shortDate(e.created_at)} · {e.status}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>

                <Panel title="Projects awaiting client approval">
                  {(latest.payload.approval_projects ?? []).length === 0 ? (
                    <EmptyState message="Nothing waiting on a client." />
                  ) : (
                    <ul className="divide-y divide-border">
                      {(latest.payload.approval_projects ?? []).map((p: any) => (
                        <li key={p.project_id} className="py-3">
                          <Link
                            to="/studio/projects/$id"
                            params={{ id: p.project_id }}
                            className="text-sm hover:text-accent"
                          >
                            {p.title}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {p.code} · {p.client} · {p.pending} pending
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>
            </>
          )}

          {data.summaries.length > 1 && (
            <Panel title="Earlier weeks">
              <ul className="divide-y divide-border">
                {data.summaries.slice(1).map((s: any) => (
                  <li key={s.id} className="flex flex-wrap items-baseline gap-x-4 py-3 text-sm">
                    <span className="w-40 text-muted-foreground">{shortDate(s.week_start)}</span>
                    <span>{s.payload.active_projects ?? 0} active</span>
                    <span>{s.payload.new_enquiries ?? 0} enquiries</span>
                    <span>{s.payload.pending_approvals ?? 0} approvals pending</span>
                    <span className="text-xs text-muted-foreground">
                      {inr(s.payload.receivables)}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}
    </AppShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStudioDashboard } from "@/lib/studio.functions";
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
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/studio/")({
  component: StudioDashboard,
  head: () => ({
    meta: [
      { title: "Studio dashboard — Atelier Vermilion" },
      {
        name: "description",
        content:
          "Live studio operations: active projects, enquiries, pending client approvals, task load and receivables.",
      },
      { property: "og:title", content: "Studio dashboard — Atelier Vermilion" },
      { property: "og:description", content: "Live studio operations overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function StudioDashboard() {
  const fetchDashboard = useServerFn(getStudioDashboard);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["studio", "dashboard"],
    queryFn: () => fetchDashboard(),
  });

  return (
    <AppShell>
      <PageTitle
        eyebrow="Studio workspace"
        title="Operations dashboard"
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/studio/leads">Leads</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/studio/projects">Projects</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/studio/approvals">Approvals</Link>
            </Button>
          </>
        }
      />

      {isLoading && <LoadingBlock label="Compiling live studio numbers…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              label="Active projects"
              value={data.kpis.activeProjects}
              hint={`${data.kpis.totalProjects} total on record`}
            />
            <StatCard
              label="New enquiries"
              value={data.kpis.newEnquiries}
              hint="Last 7 days"
              tone="accent"
            />
            <StatCard
              label="Open leads"
              value={data.kpis.openLeads}
              hint={`${inr(data.kpis.pipelineValue)} pipeline`}
            />
            <StatCard
              label="Pending approvals"
              value={data.kpis.pendingApprovals}
              hint="Waiting on clients"
              tone={data.kpis.pendingApprovals > 0 ? "warn" : "default"}
            />
            <StatCard
              label="Overdue tasks"
              value={data.kpis.overdueTasks}
              hint={`${data.kpis.upcomingTasks} due in 7 days`}
              tone={data.kpis.overdueTasks > 0 ? "warn" : "default"}
            />
            <StatCard
              label="Receivables"
              value={inr(data.kpis.receivables)}
              hint={`${inr(data.kpis.overdueValue)} overdue · ${inr(data.kpis.collected30)} in 30 days`}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Stage funnel">
              {Object.keys(data.stageCounts).length === 0 ? (
                <EmptyState message="No active projects yet." />
              ) : (
                <ul className="space-y-4">
                  {Object.entries(STAGE_LABELS).map(([key, label]) => {
                    const count = data.stageCounts[key] ?? 0;
                    const pct = data.kpis.activeProjects
                      ? Math.round((count / data.kpis.activeProjects) * 100)
                      : 0;
                    return (
                      <li key={key}>
                        <div className="flex items-baseline justify-between text-sm">
                          <span>{label}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                        <Progress value={pct} className="mt-2 h-1" />
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>

            <Panel
              title="Approvals waiting"
              action={
                <Link to="/studio/approvals" className="text-xs text-accent">
                  View all
                </Link>
              }
            >
              {data.approvals.length === 0 ? (
                <EmptyState message="Nothing is waiting on a client right now." />
              ) : (
                <ul className="divide-y divide-border">
                  {data.approvals.map((a) => (
                    <li key={a.id} className="py-3">
                      <Link
                        to="/studio/projects/$id"
                        params={{ id: a.project_id }}
                        className="text-sm hover:text-accent"
                      >
                        {a.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {a.projects?.code} · {a.projects?.title} · sent {shortDate(a.requested_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              title="New enquiries"
              action={
                <Link to="/studio/leads" className="text-xs text-accent">
                  Open CRM
                </Link>
              }
            >
              {data.enquiries.length === 0 ? (
                <EmptyState message="No enquiries in the last 7 days." />
              ) : (
                <ul className="divide-y divide-border">
                  {data.enquiries.slice(0, 8).map((e) => (
                    <li key={e.id} className="py-3">
                      <p className="text-sm">{e.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[e.city, e.space_type, e.budget_band].filter(Boolean).join(" · ") ||
                          "Details pending"}{" "}
                        · {shortDate(e.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Overdue tasks">
              {data.overdue.length === 0 ? (
                <EmptyState message="Nothing overdue. " />
              ) : (
                <TaskList items={data.overdue} tone="warn" />
              )}
            </Panel>
            <Panel title="Due in the next 7 days">
              {data.upcoming.length === 0 ? (
                <EmptyState message="No tasks scheduled this week." />
              ) : (
                <TaskList items={data.upcoming} />
              )}
            </Panel>
          </div>

          <Panel title="Recent activity">
            {data.activity.length === 0 ? (
              <EmptyState message="No activity recorded yet." />
            ) : (
              <ul className="divide-y divide-border">
                {data.activity.map((a) => (
                  <li key={a.id} className="flex flex-wrap gap-x-3 py-2 text-sm">
                    <span className="text-muted-foreground">{shortDate(a.created_at)}</span>
                    <span>{a.detail || a.action.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground">— {a.actor_label}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </AppShell>
  );
}

type TaskRow = {
  id: string;
  title: string;
  due_date: string | null;
  priority: string;
  assignee_name: string | null;
  project_id: string | null;
  projects?: { title: string; code: string } | null;
};

function TaskList({ items, tone }: { items: TaskRow[]; tone?: "warn" }) {
  return (
    <ul className="divide-y divide-border">
      {items.map((t) => (
        <li key={t.id} className="flex flex-wrap items-baseline gap-x-3 py-3 text-sm">
          <span className={tone === "warn" ? "text-destructive" : "text-muted-foreground"}>
            {shortDate(t.due_date)}
          </span>
          {t.project_id ? (
            <Link to="/studio/projects/$id" params={{ id: t.project_id }} className="hover:text-accent">
              {t.title}
            </Link>
          ) : (
            <span>{t.title}</span>
          )}
          <span className="text-xs text-muted-foreground">
            {t.projects?.code ?? "Unassigned"} · {t.assignee_name ?? "Unassigned"} · {t.priority}
          </span>
        </li>
      ))}
    </ul>
  );
}

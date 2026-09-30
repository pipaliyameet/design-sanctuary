import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowUpRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  FolderKanban,
  UserPlus,
  Plus,
  Camera,
  Receipt,
  CircleDollarSign,
  HardHat,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
} from "lucide-react";
import { getOwnerCommandOverview } from "@/lib/studio-admin.functions";
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
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/studio/")({
  component: OwnerDashboard,
  head: () => ({
    meta: [
      { title: "Owner Command Center — Atelier Vermilion Studio" },
      {
        name: "description",
        content:
          "Unified executive command center for Atelier Vermilion interior design operations.",
      },
      { property: "og:title", content: "Owner Command Center — Atelier Vermilion" },
      { property: "og:description", content: "Live studio operations overview." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function OwnerDashboard() {
  const fetchOverview = useServerFn(getOwnerCommandOverview);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["studio", "owner-overview"],
    queryFn: () => fetchOverview(),
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppShell>
      {/* Top Owner Welcome Header */}
      <div className="mb-8 border-b border-border/70 pb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            Studio Executive Command
          </p>
          <h1 className="mt-1.5 font-display text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
            {getGreeting()}, Ira.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is what is happening across your studio today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to="/studio/projects">All Projects</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to="/studio/leads">Leads Pipeline</Link>
          </Button>
          <Button asChild size="sm" className="text-xs bg-primary text-primary-foreground">
            <Link to="/studio/quotations">New Estimate</Link>
          </Button>
        </div>
      </div>

      {isLoading && <LoadingBlock label="Syncing live studio operations…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {data && (
        <div className="space-y-8">
          {/* Top 6 KPI Cards */}
          <div className="grid gap-3.5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              label="Active Projects"
              value={data.kpis.activeProjectsCount}
              hint="6 on record · 100% turnkey"
              tone="default"
            />
            <StatCard
              label="Ongoing Sites"
              value={data.kpis.ongoingSitesCount}
              hint="Under active execution"
              tone="accent"
            />
            <StatCard
              label="Pending Approvals"
              value={data.kpis.pendingApprovalsCount}
              hint="Awaiting client decision"
              tone={data.kpis.pendingApprovalsCount > 0 ? "warn" : "default"}
            />
            <StatCard
              label="Open Leads"
              value={data.kpis.openLeadsCount}
              hint={`${inr(data.kpis.pipelineValue)} pipeline`}
              tone="default"
            />
            <StatCard
              label="Payments Due"
              value={inr(data.kpis.paymentsDueAmount)}
              hint="Outstanding receivables"
              tone={data.kpis.paymentsDueAmount > 0 ? "warn" : "default"}
            />
            <StatCard
              label="Revenue (Month)"
              value={inr(data.kpis.thisMonthRevenueAmount)}
              hint="Collected this cycle"
              tone="success"
            />
          </div>

          {/* PROJECT PULSE SECTION */}
          <section className="rounded border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/20">
              <div>
                <h2 className="text-sm font-semibold tracking-[0.16em] uppercase text-foreground">
                  Project Pulse
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Live health, execution progress, and financial exposure across active commissions.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link to="/studio/projects">View Register ({data.activeProjects.length})</Link>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/10 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3">Project & Client</th>
                    <th className="px-4 py-3">Type & City</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3 w-44">Progress</th>
                    <th className="px-4 py-3 text-right">Budget</th>
                    <th className="px-4 py-3 text-right">Spent</th>
                    <th className="px-4 py-3 text-right">Pending Recv.</th>
                    <th className="px-4 py-3">Target Date</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.activeProjects.map((p) => (
                    <tr key={p.id} className="group transition-colors hover:bg-muted/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.cover_image}
                            alt={p.title}
                            className="h-10 w-14 rounded object-cover border border-border shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {p.code}
                              </span>
                              <Link
                                to="/studio/projects/$id"
                                params={{ id: p.id }}
                                className="font-display font-medium text-sm text-foreground hover:text-accent group-hover:text-accent transition-colors"
                              >
                                {p.title}
                              </Link>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{p.client_name}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-muted-foreground">
                        <div className="text-foreground">{p.space_type}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {p.city}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            p.stage === "execution" || p.stage === "installation"
                              ? "default"
                              : "secondary"
                          }
                          className="text-[10px] uppercase tracking-wider font-semibold"
                        >
                          {STAGE_LABELS[p.stage] ?? p.stage}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-semibold text-foreground">{p.progress}%</span>
                            <span
                              className={
                                p.health === "delayed"
                                  ? "text-destructive font-medium"
                                  : p.health === "ahead"
                                    ? "text-emerald-600 font-medium"
                                    : "text-muted-foreground"
                              }
                            >
                              {p.health === "delayed"
                                ? "Delayed"
                                : p.health === "ahead"
                                  ? "Ahead"
                                  : "On Track"}
                            </span>
                          </div>
                          <Progress value={p.progress} className="h-1.5" />
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-medium text-foreground font-mono">
                        {inr(p.budget_amount)}
                      </td>

                      <td className="px-4 py-3.5 text-right text-muted-foreground font-mono">
                        {inr(p.spent_amount)}
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono font-medium text-accent">
                        {inr(p.pendingAmount)}
                      </td>

                      <td className="px-4 py-3.5 text-muted-foreground text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {shortDate(p.target_date)}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs hover:text-accent"
                        >
                          <Link to="/studio/projects/$id" params={{ id: p.id }}>
                            Inspect
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* TWO-COLUMN COMMAND GRID: TODAY'S ATTENTION & RECENT ACTIVITY */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* TODAY'S ATTENTION */}
            <Panel
              title="Today's Attention (Owner Actions)"
              action={
                <span className="rounded bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent uppercase tracking-wider">
                  {data.attentionItems.length} Actions Required
                </span>
              }
            >
              <div className="space-y-3">
                {data.attentionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 rounded border border-border/80 bg-background/50 p-3.5 transition-colors hover:border-accent/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded bg-accent/15 text-accent">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-xs hover:border-accent hover:text-accent"
                    >
                      <Link to={item.actionUrl as never}>{item.actionLabel}</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </Panel>

            {/* RECENT ACTIVITY TIMELINE */}
            <Panel
              title="Studio Activity Timeline"
              action={
                <Link to="/studio/settings" className="text-xs text-accent hover:underline">
                  Full Audit Log
                </Link>
              }
            >
              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                {data.recentActivity.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium text-foreground">{act.action}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {act.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{act.detail}</p>
                      <span className="text-[10px] text-muted-foreground/80 font-mono">
                        — {act.user_name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* RECENT SITE UPDATES LOG */}
          <section className="rounded border border-border bg-card p-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div>
                <h3 className="text-xs font-semibold tracking-[0.16em] uppercase text-muted-foreground">
                  Latest Site Execution Logs
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Direct photographic progress feeds from on-site supervisors.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link to="/studio/sites">Open Site Feed</Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {data.recentSiteUpdates.map((site) => (
                <div
                  key={site.id}
                  className="rounded border border-border bg-background p-4 space-y-3 hover:border-accent/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {shortDate(site.date)}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {site.project_title}
                    </Badge>
                  </div>
                  <h4 className="font-display font-medium text-sm text-foreground leading-snug line-clamp-2">
                    {site.title}
                  </h4>
                  {site.photos.length > 0 && (
                    <img
                      src={site.photos[0]}
                      alt={site.title}
                      className="h-32 w-full rounded object-cover border border-border"
                    />
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {site.work_completed}
                  </p>
                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{site.uploaded_by}</span>
                    <Link
                      to="/studio/sites"
                      className="text-accent hover:underline flex items-center gap-1"
                    >
                      Details <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}

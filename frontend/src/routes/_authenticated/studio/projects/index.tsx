import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProjects } from "@/lib/studio.functions";
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/studio/projects/")({
  component: ProjectsIndex,
  head: () => ({
    meta: [
      { title: "Project register — Atelier Vermilion Studio" },
      {
        name: "description",
        content: "Every studio project with stage, progress, task load, approvals pending and outstanding money.",
      },
      { property: "og:title", content: "Project register — Atelier Vermilion Studio" },
      { property: "og:description", content: "Studio-wide project register and health." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ProjectsIndex() {
  const fetchProjects = useServerFn(listProjects);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["studio", "projects"],
    queryFn: () => fetchProjects(),
  });

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const [health, setHealth] = useState("all");

  const cities = useMemo(
    () => Array.from(new Set((data ?? []).map((p) => p.city))).sort(),
    [data],
  );
  const [city, setCity] = useState("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((p) => {
      if (stage !== "all" && p.stage !== stage) return false;
      if (city !== "all" && p.city !== city) return false;
      if (health === "attention" && p.metrics.overdueTasks === 0 && p.metrics.pendingApprovals === 0)
        return false;
      if (health === "active" && !p.is_active) return false;
      if (!q) return true;
      return [p.title, p.code, p.city, p.clients?.name, p.space_type, p.style]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [data, search, stage, city, health]);

  return (
    <AppShell>
      <PageTitle eyebrow="Projects" title={`Register${data ? ` · ${rows.length}` : ""}`} />

      {isLoading && <LoadingBlock label="Loading projects…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {data && (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <Input
              placeholder="Search project, code, client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {Object.entries(STAGE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={health} onValueChange={setHealth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everything</SelectItem>
                <SelectItem value="active">Active only</SelectItem>
                <SelectItem value="attention">Needs attention</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {rows.length === 0 ? (
            <EmptyState message="No projects match these filters." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rows.map((p) => (
                <Link
                  key={p.id}
                  to="/studio/projects/$id"
                  params={{ id: p.id }}
                  className="group border border-border bg-card p-5 transition-colors hover:border-accent"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="eyebrow">{p.code}</p>
                      <h2 className="mt-2 font-display text-xl leading-tight group-hover:text-accent">
                        {p.title}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.clients?.name} · {p.city}
                      </p>
                    </div>
                    <Badge variant={p.is_active ? "secondary" : "outline"}>
                      {STAGE_LABELS[p.stage] ?? p.stage}
                    </Badge>
                  </div>

                  <Progress value={p.progress} className="mt-4 h-1" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {p.progress}% · target {shortDate(p.target_date)}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Open tasks</dt>
                      <dd className={p.metrics.overdueTasks > 0 ? "text-destructive" : ""}>
                        {p.metrics.openTasks}
                        {p.metrics.overdueTasks > 0 && ` (${p.metrics.overdueTasks} overdue)`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Approvals pending</dt>
                      <dd className={p.metrics.pendingApprovals > 0 ? "text-accent" : ""}>
                        {p.metrics.pendingApprovals}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Budget</dt>
                      <dd>{inr(p.budget_amount)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Outstanding</dt>
                      <dd>{inr(p.metrics.outstanding)}</dd>
                    </div>
                  </dl>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

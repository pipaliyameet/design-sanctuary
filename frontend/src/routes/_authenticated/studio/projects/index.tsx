import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutGrid,
  List as ListIcon,
  Table as TableIcon,
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  CircleDollarSign,
} from "lucide-react";
import { getStudioProjects } from "@/lib/studio-admin.functions";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/studio/projects/")({
  component: ProjectsRegister,
  head: () => ({
    meta: [
      { title: "Project Management Register — Atelier Vermilion Studio" },
      {
        name: "description",
        content:
          "Master register of all active, execution, and completed interior architecture commissions.",
      },
    ],
  }),
});

function ProjectsRegister() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["studio", "projects-register"],
    queryFn: () => getStudioProjects(),
  });

  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");

  const cities = useMemo(() => {
    return Array.from(new Set((data ?? []).map((p) => p.city))).sort();
  }, [data]);

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((p) => {
      if (stageFilter !== "all" && p.stage !== stageFilter) return false;
      if (cityFilter !== "all" && p.city !== cityFilter) return false;
      if (healthFilter !== "all" && p.health !== healthFilter) return false;
      if (!q) return true;
      return [p.title, p.code, p.client_name, p.city, p.space_type, p.lead_designer_name]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q));
    });
  }, [data, search, stageFilter, cityFilter, healthFilter]);

  return (
    <AppShell>
      <PageTitle
        eyebrow="Studio Commissions"
        title={`Projects Register (${filteredProjects.length})`}
        actions={
          <div className="flex items-center gap-2">
            {/* View Switchers */}
            <div className="flex items-center rounded border border-border bg-card p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded p-1.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="List View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`rounded p-1.5 transition-colors ${
                  viewMode === "table"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Compact Table"
              >
                <TableIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, code, client, designer, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {Object.entries(STAGE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[170px] h-9 text-xs">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={healthFilter} onValueChange={setHealthFilter}>
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <SelectValue placeholder="Health Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Health</SelectItem>
            <SelectItem value="on_track">On Track</SelectItem>
            <SelectItem value="attention">Needs Attention</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
            <SelectItem value="ahead">Ahead of Schedule</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <LoadingBlock label="Loading project registers…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {data && filteredProjects.length === 0 && (
        <EmptyState message="No interior projects match your selected search or filter criteria." />
      )}

      {/* 1. GRID VIEW */}
      {viewMode === "grid" && filteredProjects.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="group rounded border border-border bg-card overflow-hidden flex flex-col transition-all hover:border-accent/60"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={p.cover_image}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-white font-medium">
                    {p.code}
                  </span>
                  {p.is_featured_on_website && (
                    <span className="text-[10px] bg-accent/90 text-accent-foreground px-2 py-0.5 rounded font-medium">
                      Website Featured
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-display text-lg font-medium tracking-tight group-hover:text-accent transition-colors leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    {p.client_name} · {p.city}
                  </p>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                      {STAGE_LABELS[p.stage] ?? p.stage}
                    </Badge>
                    <span className="text-muted-foreground font-mono text-[11px]">
                      {p.area_sqft} sq ft
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Execution Progress</span>
                      <span className="font-semibold text-foreground font-mono">{p.progress}%</span>
                    </div>
                    <Progress value={p.progress} className="h-1.5" />
                  </div>
                </div>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Contract Budget
                    </span>
                    <p className="font-mono font-medium text-foreground mt-0.5">
                      {inr(p.budget_amount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Pending Amount
                    </span>
                    <p className="font-mono font-medium text-accent mt-0.5">
                      {inr(p.pendingAmount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Target Handover
                    </span>
                    <p className="text-muted-foreground mt-0.5">{shortDate(p.target_date)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Lead Architect
                    </span>
                    <p className="text-muted-foreground mt-0.5">{p.lead_designer_name}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button asChild className="w-full text-xs" variant="outline">
                    <Link to="/studio/projects/$id" params={{ id: p.id }}>
                      Open Project Workspace
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. LIST VIEW */}
      {viewMode === "list" && filteredProjects.length > 0 && (
        <div className="space-y-3">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col md:flex-row items-center justify-between gap-5 rounded border border-border bg-card p-4 transition-all hover:border-accent/60"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <img
                  src={p.cover_image}
                  alt={p.title}
                  className="h-16 w-24 rounded object-cover border border-border shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">{p.code}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {STAGE_LABELS[p.stage]}
                    </Badge>
                  </div>
                  <Link
                    to="/studio/projects/$id"
                    params={{ id: p.id }}
                    className="font-display text-base font-medium text-foreground hover:text-accent group-hover:text-accent transition-colors"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.client_name} · {p.city} · {p.space_type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end text-xs">
                <div className="w-32 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="h-1" />
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase">Budget</span>
                  <p className="font-mono font-medium text-foreground">{inr(p.budget_amount)}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase">Pending</span>
                  <p className="font-mono font-medium text-accent">{inr(p.pendingAmount)}</p>
                </div>

                <Button asChild size="sm" variant="outline" className="text-xs">
                  <Link to="/studio/projects/$id" params={{ id: p.id }}>
                    Inspect
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. COMPACT TABLE VIEW */}
      {viewMode === "table" && filteredProjects.length > 0 && (
        <div className="rounded border border-border bg-card overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Code & Project</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3 text-right">Budget</th>
                <th className="px-4 py-3 text-right">Pending</th>
                <th className="px-4 py-3">Target Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">
                    <span className="font-mono text-muted-foreground mr-2">{p.code}</span>
                    <Link
                      to="/studio/projects/$id"
                      params={{ id: p.id }}
                      className="hover:text-accent font-display text-sm"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.client_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.city}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10px]">
                      {STAGE_LABELS[p.stage]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold">{p.progress}%</td>
                  <td className="px-4 py-3 text-right font-mono font-medium">
                    {inr(p.budget_amount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-accent">
                    {inr(p.pendingAmount)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{shortDate(p.target_date)}</td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs hover:text-accent"
                    >
                      <Link to="/studio/projects/$id" params={{ id: p.id }}>
                        Open
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

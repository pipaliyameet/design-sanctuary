import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FolderKanban,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Globe,
  Share2,
  FileText,
  Image as ImageIcon,
  HardHat,
  Receipt,
  CircleDollarSign,
  Package,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Edit,
  Sliders,
} from "lucide-react";
import {
  getStudioProjectById,
  updateProjectStageAndProgress,
  updateMediaPublishStatus,
} from "@/lib/studio-admin.functions";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/studio/projects/$id")({
  component: SingleProjectWorkspace,
  head: () => ({
    meta: [
      { title: "Project Workspace — Right-Angle-Design-Studio" },
      {
        name: "description",
        content:
          "Comprehensive project workspace covering rooms, 3D renders, BOQ, timeline, daily site logs, and finances.",
      },
    ],
  }),
});

const TIMELINE_STAGES = [
  { key: "brief", label: "Client Brief" },
  { key: "site_visit", label: "Site Survey" },
  { key: "concept", label: "Concept & Mood" },
  { key: "design_development", label: "Design Development" },
  { key: "client_approval", label: "Client Approval" },
  { key: "quotation", label: "Quotation & BOQ" },
  { key: "execution", label: "On-Site Execution" },
  { key: "installation", label: "Joinery & Installation" },
  { key: "final_inspection", label: "Snagging & Inspection" },
  { key: "handover", label: "Final Handover" },
  { key: "completed", label: "Completed Project" },
] as const;

function SingleProjectWorkspace() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["studio", "project", id],
    queryFn: () => getStudioProjectById({ data: { id } }),
  });

  const [activeTab, setActiveTab] = useState("overview");

  const stageMutation = useMutation({
    mutationFn: (input: { stage?: string; progress?: number; is_featured_on_website?: boolean }) =>
      updateProjectStageAndProgress({ data: { id, ...input } }),
    onSuccess: () => {
      toast.success("Project updated.");
      queryClient.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  if (isLoading) {
    return (
      <AppShell>
        <LoadingBlock label="Retrieving project workspace…" />
      </AppShell>
    );
  }

  if (error || !data || !data.project) {
    return (
      <AppShell>
        <ErrorBlock error={error || new Error("Project not found")} onRetry={() => refetch()} />
      </AppShell>
    );
  }

  const {
    project,
    rooms,
    media,
    documents,
    quotations,
    materials,
    siteUpdates,
    invoices,
    expenses,
    activity,
    financials,
  } = data;

  const currentStageIndex = TIMELINE_STAGES.findIndex((s) => s.key === project.stage);

  return (
    <AppShell>
      {/* PROJECT HEADER BANNER */}
      <div className="relative mb-8 overflow-hidden rounded-lg border border-border bg-card">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-muted">
          <img
            src={project.cover_image}
            alt={project.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Top floating metadata */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider bg-black/70 backdrop-blur-md px-2.5 py-1 rounded font-semibold">
                {project.code}
              </span>
              <Badge variant="secondary" className="text-xs uppercase tracking-wider font-semibold">
                {STAGE_LABELS[project.stage] ?? project.stage}
              </Badge>
              {project.is_featured_on_website && (
                <span className="text-xs bg-accent text-accent-foreground px-2.5 py-0.5 rounded font-medium flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Published to Website
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-black/50 backdrop-blur border-white/20 text-white hover:bg-white hover:text-black text-xs"
                onClick={() =>
                  stageMutation.mutate({
                    is_featured_on_website: !project.is_featured_on_website,
                  })
                }
              >
                <Globe className="h-3.5 w-3.5 mr-1" />
                {project.is_featured_on_website ? "Unpublish Website" : "Publish to Website"}
              </Button>
            </div>
          </div>

          {/* Bottom Title & Details */}
          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium">
                {project.space_type} · {project.style}
              </p>
              <h1 className="mt-1 font-display text-3xl sm:text-4xl font-normal tracking-tight">
                {project.title}
              </h1>
              <p className="text-sm text-white/80 mt-1 flex items-center gap-3">
                <span>
                  Client: <strong>{project.client_name}</strong>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-accent" /> {project.city}
                </span>
                <span>·</span>
                <span>{project.area_sqft} sq ft</span>
              </p>
            </div>

            {/* Stage Quick Changer */}
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-2 rounded border border-white/10">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-white/70">Stage</p>
                <p className="text-xs font-semibold text-accent">{STAGE_LABELS[project.stage]}</p>
              </div>
              <Select
                value={project.stage}
                onValueChange={(val) => stageMutation.mutate({ stage: val })}
              >
                <SelectTrigger className="w-[170px] h-8 bg-card text-foreground text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMELINE_STAGES.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Header Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border border-t border-border bg-card p-4 text-xs">
          <div className="px-4 py-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Contract Budget
            </span>
            <p className="font-mono font-medium text-foreground text-base mt-0.5">
              {inr(project.budget_amount)}
            </p>
          </div>
          <div className="px-4 py-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Received / Paid
            </span>
            <p className="font-mono font-medium text-foreground text-base mt-0.5">
              {inr(project.received_amount)}
            </p>
          </div>
          <div className="px-4 py-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Pending Balance
            </span>
            <p className="font-mono font-medium text-accent text-base mt-0.5">
              {inr(project.budget_amount - project.received_amount)}
            </p>
          </div>
          <div className="px-4 py-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Target Handover
            </span>
            <p className="font-medium text-foreground text-base mt-0.5">
              {shortDate(project.target_date)}
            </p>
          </div>
        </div>
      </div>

      {/* 12-TAB PROJECT NAVIGATION */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 bg-card border border-border p-1.5 overflow-x-auto">
          <TabsTrigger value="overview" className="text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs">
            Timeline & Stages
          </TabsTrigger>
          <TabsTrigger value="rooms" className="text-xs">
            Rooms ({rooms.length})
          </TabsTrigger>
          <TabsTrigger value="designs" className="text-xs">
            Designs & 3D (
            {
              documents.filter((d) => d.category === "3D Designs" || d.category === "2D Drawings")
                .length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="media" className="text-xs">
            Media Gallery ({media.length})
          </TabsTrigger>
          <TabsTrigger value="materials" className="text-xs">
            Materials & BOQ ({materials.length})
          </TabsTrigger>
          <TabsTrigger value="sites" className="text-xs">
            Site Execution ({siteUpdates.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="quotations" className="text-xs">
            Quotations ({quotations.length})
          </TabsTrigger>
          <TabsTrigger value="finances" className="text-xs">
            Profitability & Margins
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">
            Activity Trail
          </TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Progress & Health */}
            <Panel title="Execution Health & Milestones" className="lg:col-span-2">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-1.5">
                    <span>Overall Project Completion</span>
                    <span className="font-mono text-accent">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Current: {STAGE_LABELS[project.stage]}</span>
                    <span>Started: {shortDate(project.start_date)}</span>
                  </div>
                </div>

                <div className="rounded border border-border bg-muted/20 p-4 space-y-3">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Project Architectural Scope
                  </h4>
                  <p className="text-xs text-foreground leading-relaxed">{project.description}</p>
                </div>

                {/* Team on project */}
                <div className="grid grid-cols-3 gap-3 border-t border-border pt-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      Lead Architect
                    </span>
                    <p className="font-medium text-foreground mt-0.5">
                      {project.lead_designer_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      Project Director
                    </span>
                    <p className="font-medium text-foreground mt-0.5">
                      {project.project_manager_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      Site Supervisor
                    </span>
                    <p className="font-medium text-foreground mt-0.5">
                      {project.site_supervisor_name}
                    </p>
                  </div>
                </div>
              </div>
            </Panel>

            {/* Financial Overview Card */}
            <Panel title="Executive Finance Summary">
              <div className="space-y-4 text-xs">
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Contract Value</span>
                  <span className="font-mono font-medium">{inr(financials.budget)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Invoiced to Client</span>
                  <span className="font-mono font-medium">{inr(financials.invoiced)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Collected</span>
                  <span className="font-mono font-medium text-emerald-600">
                    {inr(financials.collected)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Pending Invoices</span>
                  <span className="font-mono font-medium text-accent">
                    {inr(financials.pendingReceivable)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Recorded Expenses</span>
                  <span className="font-mono font-medium">{inr(financials.expensesTotal)}</span>
                </div>
                <div className="flex justify-between py-2 bg-muted/40 px-2 rounded font-medium">
                  <span>Gross Margin</span>
                  <span className="font-mono text-accent">
                    {financials.grossMarginPercent}% ({inr(financials.estimatedProfit)})
                  </span>
                </div>
              </div>
            </Panel>
          </div>

          {/* Recent Site Updates Snippet */}
          <Panel
            title="Recent Site Progress Snippet"
            action={
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActiveTab("sites")}
                className="text-xs text-accent"
              >
                View all logs
              </Button>
            }
          >
            {siteUpdates.length === 0 ? (
              <EmptyState message="No site execution logs recorded yet." />
            ) : (
              <div className="space-y-4">
                {siteUpdates.slice(0, 2).map((site) => (
                  <div
                    key={site.id}
                    className="flex flex-col sm:flex-row gap-4 border border-border p-4 rounded bg-background"
                  >
                    {site.photos.length > 0 && (
                      <img
                        src={site.photos[0]}
                        alt={site.title}
                        className="h-28 w-44 rounded object-cover border border-border shrink-0"
                      />
                    )}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {shortDate(site.date)}
                        </span>
                        <span className="text-muted-foreground">{site.uploaded_by}</span>
                      </div>
                      <h4 className="font-display font-medium text-sm text-foreground">
                        {site.title}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">{site.work_completed}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </TabsContent>

        {/* 2. TIMELINE & STAGES TAB */}
        <TabsContent value="timeline" className="space-y-6">
          <Panel title="Commission Milestone Stages">
            <div className="space-y-6 py-4">
              <div className="relative border-l-2 border-border ml-4 pl-6 space-y-8">
                {TIMELINE_STAGES.map((s, idx) => {
                  const isDone = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={s.key} className="relative">
                      {/* Circle Dot */}
                      <span
                        className={`absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                          isDone
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : isCurrent
                              ? "border-accent bg-accent text-accent-foreground animate-pulse"
                              : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </span>

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3
                            className={`font-display text-base font-medium ${isCurrent ? "text-accent" : "text-foreground"}`}
                          >
                            {s.label}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isDone
                              ? "Stage successfully executed and verified."
                              : isCurrent
                                ? "Currently active on-site / in-studio."
                                : "Upcoming stage scheduled."}
                          </p>
                        </div>

                        {!isCurrent && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => stageMutation.mutate({ stage: s.key })}
                          >
                            Set Active
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* 3. ROOMS TAB */}
        <TabsContent value="rooms" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="rounded border border-border bg-card p-4 space-y-3 hover:border-accent/50 transition-colors"
              >
                {room.hero_image && (
                  <img
                    src={room.hero_image}
                    alt={room.name}
                    className="h-36 w-full rounded object-cover border border-border"
                  />
                )}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-medium text-foreground">
                      {room.name}
                    </h3>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {room.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {room.area_sqft} sq ft · {room.items_count} joinery items
                  </p>
                </div>
                <div className="pt-2 border-t border-border flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Allocated Budget</span>
                  <span className="font-medium text-foreground">{inr(room.budget)}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 4. DESIGNS & 3D TAB */}
        <TabsContent value="designs" className="space-y-6">
          <Panel title="Photorealistic Visualizations & Architectural Sets">
            <div className="grid gap-6 md:grid-cols-2">
              {media
                .filter((m) => m.category === "3d_renders" || m.category === "floor_plans")
                .map((asset) => (
                  <div
                    key={asset.id}
                    className="rounded border border-border bg-background overflow-hidden group"
                  >
                    <img
                      src={asset.url}
                      alt={asset.title}
                      className="h-60 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground text-sm">{asset.title}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {asset.visibility}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{asset.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {asset.tags.map((t: string) => (
                          <span
                            key={t}
                            className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Panel>
        </TabsContent>

        {/* 5. MEDIA GALLERY TAB */}
        <TabsContent value="media" className="space-y-6">
          <Panel
            title="Project Media Vault"
            action={
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link to="/studio/media">Open Media Library</Link>
              </Button>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="rounded border border-border bg-background overflow-hidden"
                >
                  <img src={item.url} alt={item.title} className="h-44 w-full object-cover" />
                  <div className="p-3 text-xs space-y-1">
                    <p className="font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.category.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>

        {/* 6. MATERIALS & BOQ TAB */}
        <TabsContent value="materials" className="space-y-6">
          <Panel title="Bill of Quantities (BOQ) & Procurement Specifications">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Material & Brand</th>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3 text-right">Total Cost</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {materials.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{m.name}</span>
                        <div className="text-[10px] text-muted-foreground">{m.brand}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.room_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.vendor_name}</td>
                      <td className="px-4 py-3 font-mono">
                        {m.quantity} {m.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        {inr(m.total_cost)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                          {m.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </TabsContent>

        {/* 7. SITE EXECUTION TAB */}
        <TabsContent value="sites" className="space-y-6">
          <Panel title="Daily Photographic Site Feed">
            <div className="space-y-6">
              {siteUpdates.map((update) => (
                <div
                  key={update.id}
                  className="rounded border border-border bg-background p-5 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {shortDate(update.date)}
                      </span>
                      <h3 className="font-display text-base font-medium text-foreground mt-0.5">
                        {update.title}
                      </h3>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      — {update.uploaded_by}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 text-xs">
                    <div>
                      <h4 className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                        Work Completed
                      </h4>
                      <p className="text-muted-foreground mt-1 leading-relaxed">
                        {update.work_completed}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                        Next Scheduled Action
                      </h4>
                      <p className="text-muted-foreground mt-1 leading-relaxed">
                        {update.next_action}
                      </p>
                    </div>
                  </div>

                  {update.photos.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-2">
                      {update.photos.map((p: string, idx: number) => (
                        <img
                          key={idx}
                          src={p}
                          alt="Site snapshot"
                          className="h-32 w-48 rounded object-cover border border-border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>

        {/* 8. DOCUMENTS TAB */}
        <TabsContent value="documents" className="space-y-6">
          <Panel title="Architectural Contracts & CAD Sets">
            <div className="divide-y divide-border">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between py-3 text-xs">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium text-foreground">{doc.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {doc.category} · {doc.file_size} · Version {doc.version}
                      </p>
                    </div>
                  </div>
                  <Badge variant={doc.is_approved ? "default" : "outline"} className="text-[10px]">
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>

        {/* 9. QUOTATIONS TAB */}
        <TabsContent value="quotations" className="space-y-6">
          <Panel title="Project Cost Estimates & Quotations">
            <div className="divide-y divide-border">
              {quotations.map((q) => (
                <div key={q.id} className="flex items-center justify-between py-4 text-xs">
                  <div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {q.number} · {q.version}
                    </span>
                    <h4 className="font-display font-medium text-base text-foreground mt-0.5">
                      Client Estimate ({q.items.length} item lines)
                    </h4>
                    <p className="text-muted-foreground mt-0.5">{q.payment_terms}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-base font-semibold text-accent">
                      {inr(q.grand_total)}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-[10px] uppercase">
                      {q.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>

        {/* 10. FINANCES TAB */}
        <TabsContent value="finances" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <StatCard label="Total Contract Value" value={inr(financials.budget)} tone="default" />
            <StatCard label="Total Invoiced" value={inr(financials.invoiced)} tone="accent" />
            <StatCard
              label="Estimated Gross Margin"
              value={`${financials.grossMarginPercent}%`}
              hint={inr(financials.estimatedProfit)}
              tone="success"
            />
          </div>

          <Panel title="Invoices Issued">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5">Invoice #</th>
                  <th className="px-4 py-2.5">Issued Date</th>
                  <th className="px-4 py-2.5">Due Date</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5 text-right">Paid</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-3 font-mono font-medium">{inv.number}</td>
                    <td className="px-4 py-3 text-muted-foreground">{shortDate(inv.issued_at)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{shortDate(inv.due_date)}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      {inr(inv.amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600 font-medium">
                      {inr(inv.amount_paid)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={inv.status === "paid" ? "default" : "outline"}
                        className="text-[10px] uppercase"
                      >
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </TabsContent>

        {/* 11. ACTIVITY TAB */}
        <TabsContent value="activity" className="space-y-6">
          <Panel title="Project Audit Trail">
            <div className="space-y-3">
              {activity.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 text-xs border-b border-border/50 pb-2.5"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-accent shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{act.action}</span>
                      <span className="text-[10px] text-muted-foreground">{act.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">{act.detail}</p>
                    <span className="text-[10px] text-muted-foreground/80 font-mono">
                      — {act.user_name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

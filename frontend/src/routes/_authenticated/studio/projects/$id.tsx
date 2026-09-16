import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  createFollowUpTask,
  getProjectWorkspace,
  requestApproval,
  setDesignVisibility,
  updateProjectStage,
  updateTask,
} from "@/lib/studio.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
  Panel,
  STAGE_LABELS,
  StatCard,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  inr,
  shortDate,
} from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  component: ProjectWorkspace,
  head: () => ({
    meta: [
      { title: "Project workspace — Atelier Vermilion Studio" },
      {
        name: "description",
        content: "Rooms, tasks, design milestones, approvals, documents and money for a single project.",
      },
      { property: "og:title", content: "Project workspace — Atelier Vermilion Studio" },
      { property: "og:description", content: "Single-project studio workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ProjectWorkspace() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const fetchWorkspace = useServerFn(getProjectWorkspace);
  const patchTask = useServerFn(updateTask);
  const patchProject = useServerFn(updateProjectStage);
  const toggleVisibility = useServerFn(setDesignVisibility);
  const askApproval = useServerFn(requestApproval);
  const addTask = useServerFn(createFollowUpTask);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["studio", "project", id],
    queryFn: () => fetchWorkspace({ data: { id } }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["studio"] });
  const onError = (e: Error) => toast.error(e.message);

  const taskStatus = useMutation({
    mutationFn: (input: { id: string; status: (typeof TASK_STATUSES)[number] }) =>
      patchTask({ data: input }),
    onSuccess: () => {
      toast.success("Task updated.");
      invalidate();
    },
    onError,
  });

  const taskAssign = useMutation({
    mutationFn: (input: { id: string; assignee_id: string | null; assignee_name: string | null }) =>
      patchTask({ data: input }),
    onSuccess: () => {
      toast.success("Task reassigned.");
      invalidate();
    },
    onError,
  });

  const stageChange = useMutation({
    mutationFn: (input: { stage?: string; progress?: number }) =>
      patchProject({ data: { id, ...input } as never }),
    onSuccess: () => {
      toast.success("Project updated.");
      invalidate();
    },
    onError,
  });

  const visibility = useMutation({
    mutationFn: (input: { id: string; visible_to_client: boolean }) =>
      toggleVisibility({ data: input }),
    onSuccess: () => {
      toast.success("Client visibility updated.");
      invalidate();
    },
    onError,
  });

  const newApproval = useMutation({
    mutationFn: (input: { title: string; design_file_id: string | null; room_id: string | null }) =>
      askApproval({ data: { project_id: id, ...input } }),
    onSuccess: () => {
      toast.success("Approval requested from the client.");
      invalidate();
    },
    onError,
  });

  const [task, setTask] = useState({ title: "", due_date: "", assignee: "", room: "none" });
  const createTask = useMutation({
    mutationFn: () =>
      addTask({
        data: {
          title: task.title,
          due_date: task.due_date,
          assignee_name: task.assignee || null,
          priority: "medium" as const,
          project_id: id,
          room_id: task.room === "none" ? null : task.room,
        },
      }),
    onSuccess: () => {
      toast.success("Task added.");
      setTask({ title: "", due_date: "", assignee: "", room: "none" });
      invalidate();
    },
    onError,
  });

  const metrics = useMemo(() => {
    if (!data) return null;
    const today = new Date().toISOString().slice(0, 10);
    const open = data.tasks.filter((t) => t.status !== "done");
    return {
      open: open.length,
      overdue: open.filter((t) => t.due_date && t.due_date < today).length,
      pending: data.approvals.filter((a) => a.status === "pending").length,
      invoiced: data.invoices.reduce((s, i) => s + Number(i.total), 0),
      paid: data.invoices.reduce((s, i) => s + Number(i.amount_paid), 0),
      boq: data.boq.reduce((s, b) => s + Number(b.amount ?? 0), 0),
    };
  }, [data]);

  return (
    <AppShell>
      {isLoading && <LoadingBlock label="Opening project…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}
      {data === null && <EmptyState message="This project no longer exists." />}

      {data && metrics && (
        <>
          <PageTitle
            eyebrow={`${data.project.code} · ${data.project.clients?.name ?? "Client"}`}
            title={data.project.title}
            actions={
              <Button asChild variant="outline" size="sm">
                <Link to="/studio/projects">All projects</Link>
              </Button>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Stage" value={STAGE_LABELS[data.project.stage] ?? data.project.stage} />
            <StatCard label="Progress" value={`${data.project.progress}%`} />
            <StatCard
              label="Open tasks"
              value={metrics.open}
              hint={`${metrics.overdue} overdue`}
              tone={metrics.overdue > 0 ? "warn" : "default"}
            />
            <StatCard
              label="Approvals pending"
              value={metrics.pending}
              tone={metrics.pending > 0 ? "accent" : "default"}
            />
            <StatCard
              label="Outstanding"
              value={inr(metrics.invoiced - metrics.paid)}
              hint={`${inr(metrics.invoiced)} invoiced`}
            />
          </div>

          <Tabs defaultValue="overview" className="mt-8">
            <TabsList className="flex h-auto flex-wrap justify-start">
              {["overview", "tasks", "rooms", "designs", "approvals", "money", "activity"].map((t) => (
                <TabsTrigger key={t} value={t} className="capitalize">
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-6 grid gap-6 lg:grid-cols-3">
              <Panel title="Brief" className="lg:col-span-2">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {data.project.brief || "No brief recorded yet."}
                </p>
                <dl className="mt-6 grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
                  <Field label="City" value={data.project.city} />
                  <Field label="Space" value={data.project.space_type} />
                  <Field label="Style" value={data.project.style} />
                  <Field label="Area" value={`${data.project.area_sqft} sq ft`} />
                  <Field label="Budget" value={inr(data.project.budget_amount)} />
                  <Field label="Lead designer" value={data.project.lead_designer_name ?? "—"} />
                  <Field label="Start" value={shortDate(data.project.start_date)} />
                  <Field label="Target handover" value={shortDate(data.project.target_date)} />
                  <Field label="BOQ value" value={inr(metrics.boq)} />
                </dl>
              </Panel>

              <div className="space-y-6">
                <Panel title="Move the project">
                  <div className="space-y-4">
                    <div>
                      <Label className="eyebrow">Stage</Label>
                      <Select
                        value={data.project.stage}
                        onValueChange={(v) => stageChange.mutate({ stage: v })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STAGE_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <ProgressEditor
                      initial={data.project.progress}
                      pending={stageChange.isPending}
                      onSave={(v) => stageChange.mutate({ progress: v })}
                    />
                  </div>
                </Panel>
                <Panel title="Client">
                  <p className="text-sm">{data.project.clients?.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{data.project.clients?.email}</p>
                  <p className="text-xs text-muted-foreground">{data.project.clients?.phone ?? "—"}</p>
                </Panel>
                <Panel title="Site updates">
                  {data.updates.length === 0 ? (
                    <EmptyState message="No site updates posted." />
                  ) : (
                    <ul className="space-y-3">
                      {data.updates.slice(0, 5).map((u) => (
                        <li key={u.id}>
                          <p className="text-sm">{u.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {shortDate(u.created_at)} · {u.created_by_name ?? "Studio"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-6 space-y-6">
              <Panel title="Add a task">
                <form
                  className="grid gap-4 sm:grid-cols-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (task.title.trim().length < 3 || !task.due_date) {
                      toast.error("A task needs a title and a due date.");
                      return;
                    }
                    createTask.mutate();
                  }}
                >
                  <div className="sm:col-span-2">
                    <Label htmlFor="nt-title" className="eyebrow">
                      Task
                    </Label>
                    <Input
                      id="nt-title"
                      value={task.title}
                      onChange={(e) => setTask({ ...task, title: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nt-due" className="eyebrow">
                      Due
                    </Label>
                    <Input
                      id="nt-due"
                      type="date"
                      value={task.due_date}
                      onChange={(e) => setTask({ ...task, due_date: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" size="sm" disabled={createTask.isPending}>
                      Add task
                    </Button>
                  </div>
                </form>
              </Panel>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {TASK_STATUSES.map((status) => {
                  const items = data.tasks.filter((t) => t.status === status);
                  return (
                    <section key={status} className="border border-border bg-card">
                      <header className="flex items-center justify-between border-b border-border px-4 py-3">
                        <h3 className="text-sm tracking-[0.14em] uppercase">
                          {TASK_STATUS_LABELS[status]}
                        </h3>
                        <Badge variant="secondary">{items.length}</Badge>
                      </header>
                      <div className="space-y-3 p-4">
                        {items.length === 0 && (
                          <p className="text-xs text-muted-foreground">Nothing here.</p>
                        )}
                        {items.map((t) => (
                          <article key={t.id} className="border border-border p-3">
                            <p className="text-sm">{t.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {shortDate(t.due_date)} · {t.assignee_name ?? "Unassigned"} · {t.priority}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {TASK_STATUSES.filter((s) => s !== status).map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  disabled={taskStatus.isPending}
                                  onClick={() => taskStatus.mutate({ id: t.id, status: s })}
                                  className="border border-border px-2 py-1 text-[10px] tracking-[0.1em] uppercase text-muted-foreground hover:border-accent hover:text-accent"
                                >
                                  {TASK_STATUS_LABELS[s]}
                                </button>
                              ))}
                            </div>
                            <Select
                              value={t.assignee_id ?? "none"}
                              onValueChange={(v) => {
                                const staff = data.staff.find((s) => s.id === v);
                                taskAssign.mutate({
                                  id: t.id,
                                  assignee_id: v === "none" ? null : v,
                                  assignee_name: staff?.full_name ?? null,
                                });
                              }}
                            >
                              <SelectTrigger className="mt-3 h-8 text-xs">
                                <SelectValue placeholder="Unassigned" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Unassigned</SelectItem>
                                {data.staff.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </article>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>

              <Panel title="Schedule — by due date">
                {data.tasks.filter((t) => t.due_date).length === 0 ? (
                  <EmptyState message="No dated tasks yet." />
                ) : (
                  <ul className="divide-y divide-border">
                    {[...data.tasks]
                      .filter((t) => t.due_date)
                      .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
                      .map((t) => (
                        <li key={t.id} className="flex flex-wrap items-baseline gap-x-3 py-2 text-sm">
                          <span className="w-32 text-muted-foreground">{shortDate(t.due_date)}</span>
                          <span>{t.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {TASK_STATUS_LABELS[t.status]} · {t.assignee_name ?? "Unassigned"}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="rooms" className="mt-6">
              <Panel title={`Rooms (${data.rooms.length})`}>
                {data.rooms.length === 0 ? (
                  <EmptyState message="No rooms defined for this project." />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {data.rooms.map((r) => {
                      const roomTasks = data.tasks.filter((t) => t.room_id === r.id);
                      const done = roomTasks.filter((t) => t.status === "done").length;
                      return (
                        <article key={r.id} className="border border-border p-4">
                          <p className="text-sm">{r.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {r.room_type} · {r.area_sqft} sq ft · {r.status}
                          </p>
                          <Progress
                            value={roomTasks.length ? Math.round((done / roomTasks.length) * 100) : 0}
                            className="mt-3 h-1"
                          />
                          <p className="mt-2 text-xs text-muted-foreground">
                            {done}/{roomTasks.length} tasks ·{" "}
                            {data.designs.filter((d) => d.room_id === r.id).length} design files
                          </p>
                        </article>
                      );
                    })}
                  </div>
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="designs" className="mt-6 space-y-6">
              <Panel title={`Design files (${data.designs.length})`}>
                {data.designs.length === 0 ? (
                  <EmptyState message="No design files uploaded yet." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.designs.map((d) => (
                      <li key={d.id} className="flex flex-wrap items-center gap-4 py-3">
                        <div className="min-w-[220px] flex-1">
                          <a
                            href={d.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm hover:text-accent"
                          >
                            {d.title}
                          </a>
                          <p className="text-xs text-muted-foreground">
                            {d.kind} · v{d.version} · {shortDate(d.created_at)} ·{" "}
                            {data.rooms.find((r) => r.id === d.room_id)?.name ?? "Whole project"}
                          </p>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Switch
                            checked={d.visible_to_client}
                            onCheckedChange={(v) =>
                              visibility.mutate({ id: d.id, visible_to_client: v })
                            }
                          />
                          Visible to client
                        </label>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          disabled={newApproval.isPending}
                          onClick={() =>
                            newApproval.mutate({
                              title: `Approval: ${d.title}`,
                              design_file_id: d.id,
                              room_id: d.room_id ?? null,
                            })
                          }
                        >
                          Send for approval
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel title={`Documents (${data.documents.length})`}>
                {data.documents.length === 0 ? (
                  <EmptyState message="No documents attached." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.documents.map((doc) => (
                      <li key={doc.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 hover:text-accent"
                        >
                          {doc.title}
                        </a>
                        <span className="text-xs text-muted-foreground">
                          {doc.kind} · {doc.visible_to_client ? "Shared with client" : "Internal"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="approvals" className="mt-6">
              <Panel title={`Approvals (${data.approvals.length})`}>
                {data.approvals.length === 0 ? (
                  <EmptyState message="No approvals raised for this project." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.approvals.map((a) => (
                      <li key={a.id} className="py-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="flex-1 text-sm">{a.title}</p>
                          <Badge
                            variant={
                              a.status === "approved"
                                ? "secondary"
                                : a.status === "pending"
                                  ? "outline"
                                  : "destructive"
                            }
                          >
                            {a.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Sent {shortDate(a.requested_at)}
                          {a.decided_at
                            ? ` · decided ${shortDate(a.decided_at)} by ${a.decided_by_name ?? "client"}`
                            : ""}
                        </p>
                        {a.approval_comments?.length > 0 && (
                          <ul className="mt-3 space-y-2 border-l border-border pl-4">
                            {a.approval_comments.map((c) => (
                              <li key={c.id} className="text-xs text-muted-foreground">
                                <span className="text-foreground">{c.author_name}</span>: {c.body}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="money" className="mt-6 grid gap-6 lg:grid-cols-2">
              <Panel title="Invoices">
                {data.invoices.length === 0 ? (
                  <EmptyState message="No invoices raised." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.invoices.map((i) => (
                      <li key={i.id} className="flex flex-wrap items-baseline gap-x-3 py-3 text-sm">
                        <span className="w-28 text-muted-foreground">{i.number}</span>
                        <span className="flex-1">{i.milestone}</span>
                        <span>{inr(i.total)}</span>
                        <span className="text-xs text-muted-foreground">
                          {inr(i.amount_paid)} paid · {i.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel title={`Bill of quantities — ${inr(metrics.boq)}`}>
                {data.boq.length === 0 ? (
                  <EmptyState message="No BOQ lines yet." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.boq.map((b) => (
                      <li key={b.id} className="flex flex-wrap items-baseline gap-x-3 py-2 text-sm">
                        <span className="w-32 text-muted-foreground">{b.category}</span>
                        <span className="flex-1">{b.description}</span>
                        <span className="text-xs text-muted-foreground">
                          {b.quantity} {b.unit} × {inr(b.rate)}
                        </span>
                        <span>{inr(b.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Panel title="Project activity">
                {data.activity.length === 0 ? (
                  <EmptyState message="No activity recorded." />
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
            </TabsContent>
          </Tabs>
        </>
      )}
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}

function ProgressEditor({
  initial,
  onSave,
  pending,
}: {
  initial: number;
  onSave: (v: number) => void;
  pending: boolean;
}) {
  const [value, setValue] = useState(String(initial));
  return (
    <div>
      <Label htmlFor="progress" className="eyebrow">
        Progress (%)
      </Label>
      <div className="mt-2 flex gap-2">
        <Input
          id="progress"
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => onSave(Math.max(0, Math.min(100, Number(value || 0))))}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

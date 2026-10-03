import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  convertLeadToProject,
  createFollowUpTask,
  getLead,
  updateLead,
} from "@/lib/studio.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  LoadingBlock,
  PageTitle,
  Panel,
  inr,
  shortDate,
} from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/studio/leads/$id")({
  component: LeadDetail,
  head: () => ({
    meta: [
      { title: "Lead detail — Right-Angle-Design-Studio" },
      {
        name: "description",
        content: "Qualify a lead, assign an owner and convert it into a live project.",
      },
      { property: "og:title", content: "Lead detail — Right-Angle-Design-Studio" },
      { property: "og:description", content: "Lead qualification and conversion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function LeadDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchLead = useServerFn(getLead);
  const patchLead = useServerFn(updateLead);
  const convert = useServerFn(convertLeadToProject);
  const addTask = useServerFn(createFollowUpTask);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["studio", "lead", id],
    queryFn: () => fetchLead({ data: { id } }),
  });

  const save = useMutation({
    mutationFn: (patch: Record<string, unknown>) => patchLead({ data: { id, ...patch } }),
    onSuccess: () => {
      toast.success("Lead updated.");
      queryClient.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [task, setTask] = useState({ title: "", due_date: "", assignee: "" });
  const createTask = useMutation({
    mutationFn: () =>
      addTask({
        data: {
          title: task.title,
          due_date: task.due_date,
          assignee_name: task.assignee || null,
          priority: "medium" as const,
          description: `Follow-up for lead ${data?.lead.name ?? ""}`,
        },
      }),
    onSuccess: () => {
      toast.success("Follow-up task created.");
      setTask({ title: "", due_date: "", assignee: "" });
      queryClient.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [form, setForm] = useState({
    title: "",
    city: "",
    space_type: "",
    style: "Contemporary",
    area_sqft: "1500",
    budget_amount: "3500000",
    budget_band: "₹25–50 L",
    target_date: "",
  });

  const convertMutation = useMutation({
    mutationFn: () =>
      convert({
        data: {
          leadId: id,
          title: form.title,
          city: form.city,
          space_type: form.space_type,
          style: form.style,
          area_sqft: Number(form.area_sqft),
          budget_amount: Number(form.budget_amount),
          budget_band: form.budget_band,
          target_date: form.target_date || null,
        },
      }),
    onSuccess: (res) => {
      toast.success("Project created.");
      queryClient.invalidateQueries({ queryKey: ["studio"] });
      navigate({ to: "/studio/projects/$id", params: { id: res.projectId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      {isLoading && <LoadingBlock />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}
      {data === null && <EmptyState message="This lead no longer exists." />}

      {data && (
        <>
          <PageTitle
            eyebrow={LEAD_STAGE_LABELS[data.lead.stage] ?? "Lead"}
            title={data.lead.name}
            actions={
              <Button asChild variant="outline" size="sm">
                <Link to="/studio/leads">Back to pipeline</Link>
              </Button>
            }
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Enquiry" className="lg:col-span-2">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" value={data.lead.email} />
                <Field label="Phone" value={data.lead.phone ?? "—"} />
                <Field label="City" value={data.lead.city ?? "—"} />
                <Field label="Space" value={data.lead.space_type ?? "—"} />
                <Field label="Budget band" value={data.lead.budget_band ?? "—"} />
                <Field label="Estimated value" value={inr(data.lead.value_estimate)} />
                <Field label="Source" value={data.lead.enquiries?.source ?? "Direct"} />
                <Field label="Received" value={shortDate(data.lead.created_at)} />
              </dl>
              {(data.lead.notes || data.lead.enquiries?.message) && (
                <div className="mt-6 border-t border-border pt-4">
                  <p className="eyebrow">Brief in their words</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {data.lead.notes || data.lead.enquiries?.message}
                  </p>
                </div>
              )}
            </Panel>

            <Panel title="Qualify">
              <div className="space-y-4">
                <div>
                  <Label className="eyebrow">Stage</Label>
                  <Select value={data.lead.stage} onValueChange={(v) => save.mutate({ stage: v })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STAGES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {LEAD_STAGE_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="eyebrow">Owner</Label>
                  <Select
                    value={data.lead.owner_id ?? "none"}
                    onValueChange={(v) => save.mutate({ owner_id: v === "none" ? null : v })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {data.staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.full_name}
                          {s.title ? ` — ${s.title}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ValueEditor
                  initial={Number(data.lead.value_estimate ?? 0)}
                  onSave={(v) => save.mutate({ value_estimate: v })}
                  pending={save.isPending}
                />
              </div>
            </Panel>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Panel title="Create a follow-up task">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (task.title.trim().length < 3 || !task.due_date) {
                    toast.error("Add a task title and a due date.");
                    return;
                  }
                  createTask.mutate();
                }}
              >
                <div>
                  <Label htmlFor="t-title" className="eyebrow">
                    Task
                  </Label>
                  <Input
                    id="t-title"
                    value={task.title}
                    onChange={(e) => setTask({ ...task, title: e.target.value })}
                    placeholder="Call to schedule a studio visit"
                    className="mt-2"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="t-due" className="eyebrow">
                      Due
                    </Label>
                    <Input
                      id="t-due"
                      type="date"
                      value={task.due_date}
                      onChange={(e) => setTask({ ...task, due_date: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="eyebrow">Assign to</Label>
                    <Select
                      value={task.assignee || "none"}
                      onValueChange={(v) => setTask({ ...task, assignee: v === "none" ? "" : v })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {data.staff.map((s) => (
                          <SelectItem key={s.id} value={s.full_name}>
                            {s.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" size="sm" disabled={createTask.isPending}>
                  {createTask.isPending ? "Saving…" : "Add task"}
                </Button>
              </form>
            </Panel>

            <Panel title="Convert to a project">
              {data.lead.stage === "lost" ? (
                <EmptyState message="This lead is marked lost. Move it back into the pipeline to convert it." />
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (form.title.trim().length < 3 || !form.city || !form.space_type) {
                      toast.error("Project name, city and space type are required.");
                      return;
                    }
                    convertMutation.mutate();
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                      id="p-title"
                      label="Project name"
                      value={form.title}
                      onChange={(v) => setForm({ ...form, title: v })}
                    />
                    <TextField
                      id="p-city"
                      label="City"
                      value={form.city || data.lead.city || ""}
                      onChange={(v) => setForm({ ...form, city: v })}
                    />
                    <TextField
                      id="p-space"
                      label="Space type"
                      value={form.space_type || data.lead.space_type || ""}
                      onChange={(v) => setForm({ ...form, space_type: v })}
                    />
                    <TextField
                      id="p-style"
                      label="Style"
                      value={form.style}
                      onChange={(v) => setForm({ ...form, style: v })}
                    />
                    <TextField
                      id="p-area"
                      label="Area (sq ft)"
                      value={form.area_sqft}
                      onChange={(v) => setForm({ ...form, area_sqft: v })}
                      type="number"
                    />
                    <TextField
                      id="p-budget"
                      label="Budget (₹)"
                      value={form.budget_amount}
                      onChange={(v) => setForm({ ...form, budget_amount: v })}
                      type="number"
                    />
                    <TextField
                      id="p-band"
                      label="Budget band"
                      value={form.budget_band}
                      onChange={(v) => setForm({ ...form, budget_band: v })}
                    />
                    <TextField
                      id="p-target"
                      label="Target handover"
                      value={form.target_date}
                      onChange={(v) => setForm({ ...form, target_date: v })}
                      type="date"
                    />
                  </div>
                  <Button type="submit" size="sm" disabled={convertMutation.isPending}>
                    {convertMutation.isPending ? "Creating…" : "Create client & project"}
                  </Button>
                </form>
              )}
            </Panel>
          </div>

          <Panel title="Lead history" className="mt-6">
            {data.activity.length === 0 ? (
              <EmptyState message="No changes recorded yet." />
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

function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="eyebrow">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2"
      />
    </div>
  );
}

function ValueEditor({
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
      <Label htmlFor="lead-value" className="eyebrow">
        Estimated value (₹)
      </Label>
      <div className="mt-2 flex gap-2">
        <Input
          id="lead-value"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => onSave(Number(value || 0))}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

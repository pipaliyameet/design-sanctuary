import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { addApprovalComment, getPortalProject, respondToApproval } from "@/lib/portal.functions";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/portal/$id")({
  component: PortalProject,
  head: () => ({
    meta: [
      { title: "Project progress — Atelier Vermilion" },
      {
        name: "description",
        content:
          "Your project in detail: progress, design sets to approve, documents, BOQ and payments.",
      },
      { property: "og:title", content: "Project progress — Atelier Vermilion" },
      { property: "og:description", content: "Your private project detail." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function PortalProject() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const fetchProject = useServerFn(getPortalProject);
  const respond = useServerFn(respondToApproval);
  const comment = useServerFn(addApprovalComment);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["portal", "project", id],
    queryFn: () => fetchProject({ data: { id } }),
  });

  const [notes, setNotes] = useState<Record<string, string>>({});
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["portal"] });

  const decide = useMutation({
    mutationFn: (input: {
      id: string;
      decision: "approved" | "changes_requested";
      comment?: string;
    }) => respond({ data: input }),
    onSuccess: (_r, vars) => {
      toast.success(
        vars.decision === "approved"
          ? "Approved — thank you."
          : "Change request sent to the studio.",
      );
      setNotes((n) => ({ ...n, [vars.id]: "" }));
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const postComment = useMutation({
    mutationFn: (input: { approvalId: string; body: string }) => comment({ data: input }),
    onSuccess: (_r, vars) => {
      toast.success("Comment added.");
      setNotes((n) => ({ ...n, [vars.approvalId]: "" }));
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const boqCsv = (
    rows: {
      category: string;
      description: string;
      unit: string;
      quantity: number;
      rate: number;
      amount: number | null;
    }[],
  ) => {
    const header = "Category,Description,Unit,Quantity,Rate,Amount\n";
    const body = rows
      .map((r) =>
        [r.category, r.description, r.unit, r.quantity, r.rate, r.amount ?? 0]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([header + body], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `boq-${data?.project.code ?? "project"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell variant="portal">
      {isLoading && <LoadingBlock label="Loading your project…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}
      {data === null && <EmptyState message="We couldn’t find this project on your account." />}

      {data && (
        <>
          <PageTitle
            eyebrow={`${data.project.code} · ${data.project.city}`}
            title={data.project.title}
            actions={
              <Button asChild variant="outline" size="sm">
                <Link to="/portal">All my projects</Link>
              </Button>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Stage"
              value={STAGE_LABELS[data.project.stage as any] ?? data.project.stage ?? "In Progress"}
              hint={`Handover ${shortDate(data.project.target_date)}`}
            />
            <StatCard label="Progress" value={`${data.project.progress}%`} />
            <StatCard
              label="Waiting for you"
              value={data.approvals.filter((a) => a.status === "pending").length}
              tone="accent"
            />
            <StatCard
              label="Balance due"
              value={inr(
                data.invoices.reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid)), 0),
              )}
            />
          </div>

          <Progress value={data.project.progress} className="mt-6 h-1" />

          <Tabs defaultValue="progress" className="mt-8">
            <TabsList className="flex h-auto flex-wrap justify-start">
              {["progress", "designs", "approvals", "documents", "payments"].map((t) => (
                <TabsTrigger key={t} value={t} className="capitalize">
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="progress" className="mt-6 grid gap-6 lg:grid-cols-3">
              <Panel title="Site updates" className="lg:col-span-2">
                {data.updates.length === 0 ? (
                  <EmptyState message="No updates posted yet. Your project lead will share progress here." />
                ) : (
                  <ol className="space-y-6">
                    {data.updates.map((u) => (
                      <li key={u.id} className="border-l border-border pl-5">
                        <p className="eyebrow">{shortDate(u.created_at)}</p>
                        <h3 className="mt-2 font-display text-xl leading-tight">{u.title}</h3>
                        {u.body && (
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {u.body}
                          </p>
                        )}
                        {u.image_url && (
                          <img
                            src={u.image_url}
                            alt={u.title}
                            loading="lazy"
                            className="mt-4 w-full object-cover"
                          />
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                          {u.created_by_name ?? "Studio"}
                          {u.progress != null ? ` · project at ${u.progress}%` : ""}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </Panel>

              <div className="space-y-6">
                <Panel title="Your brief">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {data.project.brief || "Brief to be recorded."}
                  </p>
                </Panel>
                <Panel title="Rooms">
                  {data.rooms.length === 0 ? (
                    <EmptyState message="Rooms are being planned." />
                  ) : (
                    <ul className="space-y-3 text-sm">
                      {data.rooms.map((r) => (
                        <li key={r.id} className="flex items-baseline justify-between gap-3">
                          <span>{r.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {r.area_sqft} sq ft · {r.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>
            </TabsContent>

            <TabsContent value="designs" className="mt-6">
              <Panel title={`Design sets shared with you (${data.designs.length})`}>
                {data.designs.length === 0 ? (
                  <EmptyState message="No design sets have been shared yet." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.designs.map((d) => (
                      <li key={d.id} className="flex flex-wrap items-center gap-3 py-3">
                        <a
                          href={d.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 text-sm hover:text-accent"
                        >
                          {d.title}
                        </a>
                        <span className="text-xs text-muted-foreground">
                          {d.kind} · v{d.version} ·{" "}
                          {data.rooms.find((r) => r.id === d.room_id)?.name ?? "Whole home"} ·{" "}
                          {shortDate(d.created_at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="approvals" className="mt-6">
              <Panel title="Approvals">
                {data.approvals.length === 0 ? (
                  <EmptyState message="Nothing needs your decision right now." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.approvals.map((a) => (
                      <li key={a.id} className="py-5">
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
                          Shared {shortDate(a.requested_at)}
                          {a.decided_at ? ` · you responded ${shortDate(a.decided_at)}` : ""}
                        </p>
                        {a.notes && <p className="mt-2 text-sm text-muted-foreground">{a.notes}</p>}

                        {a.approval_comments?.length > 0 && (
                          <ul className="mt-4 space-y-2 border-l border-border pl-4">
                            {a.approval_comments.map((c: any) => (
                              <li key={c.id} className="text-xs text-muted-foreground">
                                <span className="text-foreground">{c.author_name}</span>: {c.body}
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-4 space-y-3">
                          <Textarea
                            value={notes[a.id] ?? ""}
                            onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value })}
                            placeholder={
                              a.status === "pending"
                                ? "Add a note with your decision (optional)"
                                : "Add a comment for the studio"
                            }
                            rows={3}
                          />
                          <div className="flex flex-wrap gap-3">
                            {a.status === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  disabled={decide.isPending}
                                  onClick={() =>
                                    decide.mutate({
                                      id: a.id,
                                      decision: "approved",
                                      comment: notes[a.id]?.trim() || undefined,
                                    })
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={decide.isPending}
                                  onClick={() => {
                                    if (!notes[a.id]?.trim()) {
                                      toast.error("Please tell us what you'd like changed.");
                                      return;
                                    }
                                    decide.mutate({
                                      id: a.id,
                                      decision: "changes_requested",
                                      comment: notes[a.id]!.trim(),
                                    });
                                  }}
                                >
                                  Request changes
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={postComment.isPending}
                                onClick={() => {
                                  const body = notes[a.id]?.trim();
                                  if (!body) {
                                    toast.error("Write a comment first.");
                                    return;
                                  }
                                  postComment.mutate({ approvalId: a.id, body });
                                }}
                              >
                                Add comment
                              </Button>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="documents" className="mt-6 grid gap-6 lg:grid-cols-2">
              <Panel title={`Documents (${data.documents.length})`}>
                {data.documents.length === 0 ? (
                  <EmptyState message="No documents shared yet." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.documents.map((d) => (
                      <li key={d.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                        <a
                          href={d.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 hover:text-accent"
                        >
                          {d.title}
                        </a>
                        <span className="text-xs text-muted-foreground">
                          {d.kind} · {shortDate(d.created_at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel
                title={`Bill of quantities (${data.boq.length} lines)`}
                action={
                  data.boq.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => boqCsv(data.boq)}
                      className="text-xs text-accent"
                    >
                      Download
                    </button>
                  ) : undefined
                }
              >
                {data.boq.length === 0 ? (
                  <EmptyState message="The BOQ is being prepared." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.boq.map((b) => (
                      <li key={b.id} className="flex flex-wrap items-baseline gap-x-3 py-2 text-sm">
                        <span className="w-28 text-xs text-muted-foreground">{b.category}</span>
                        <span className="flex-1">{b.description}</span>
                        <span className="text-xs text-muted-foreground">
                          {b.quantity} {b.unit}
                        </span>
                        <span>{inr(b.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="payments" className="mt-6 grid gap-6 lg:grid-cols-2">
              <Panel title="Invoices">
                {data.invoices.length === 0 ? (
                  <EmptyState message="No invoices raised yet." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.invoices.map((i) => (
                      <li key={i.id} className="py-3 text-sm">
                        <div className="flex flex-wrap items-baseline gap-x-3">
                          <span className="text-muted-foreground">{i.number}</span>
                          <span className="flex-1">{i.milestone}</span>
                          <span>{inr(i.total)}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {inr(i.amount_paid)} received · {i.status} · due {shortDate(i.due_at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel title="Payments received">
                {data.payments.length === 0 ? (
                  <EmptyState message="No payments recorded yet." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.payments.map((p) => (
                      <li key={p.id} className="flex flex-wrap items-baseline gap-x-3 py-2 text-sm">
                        <span className="w-28 text-muted-foreground">{shortDate(p.paid_at)}</span>
                        <span className="flex-1">
                          {p.method}
                          {p.reference ? ` · ${p.reference}` : ""}
                        </span>
                        <span>{inr(p.amount)}</span>
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

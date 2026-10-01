import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  createLeadFromEnquiry,
  listLeadsBoard,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/studio/leads/")({
  component: LeadsPage,
  head: () => ({
    meta: [
      { title: "Lead CRM — Atelier Vermilion Studio" },
      {
        name: "description",
        content:
          "Studio lead pipeline: capture website enquiries, qualify, assign owners and convert to live projects.",
      },
      { property: "og:title", content: "Lead CRM — Atelier Vermilion Studio" },
      { property: "og:description", content: "Enquiry to project pipeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function LeadsPage() {
  const fetchBoard = useServerFn(listLeadsBoard);
  const convertEnquiry = useServerFn(createLeadFromEnquiry);
  const patchLead = useServerFn(updateLead);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const [owner, setOwner] = useState("all");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["studio", "leads"],
    queryFn: () => fetchBoard(),
  });

  const capture = useMutation({
    mutationFn: (enquiryId: string) => convertEnquiry({ data: { enquiryId } }),
    onSuccess: () => {
      toast.success("Enquiry captured as a lead.");
      queryClient.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const moveStage = useMutation({
    mutationFn: (input: { id: string; stage: (typeof LEAD_STAGES)[number] }) =>
      patchLead({ data: input }),
    onSuccess: () => {
      toast.success("Pipeline updated.");
      queryClient.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const staffById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of data?.staff ?? []) map.set(s.id, s.full_name);
    return map;
  }, [data?.staff]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.leads ?? []).filter((l) => {
      if (stage !== "all" && l.stage !== stage) return false;
      if (owner === "unassigned" && l.owner_id) return false;
      if (owner !== "all" && owner !== "unassigned" && l.owner_id !== owner) return false;
      if (!q) return true;
      return [l.name, l.email, l.city, l.space_type, l.budget_band]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [data?.leads, search, stage, owner]);

  return (
    <AppShell>
      <PageTitle eyebrow="CRM" title="Lead pipeline" />

      {isLoading && <LoadingBlock label="Loading pipeline…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {data && (
        <div className="space-y-6">
          <Panel title={`Website enquiries not yet in the pipeline (${data.unconverted.length})`}>
            {data.unconverted.length === 0 ? (
              <EmptyState message="Every enquiry has been captured as a lead." />
            ) : (
              <ul className="divide-y divide-border">
                {data.unconverted.slice(0, 12).map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-[220px] flex-1">
                      <p className="text-sm">{e.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.email} · {[e.city, e.space_type, e.budget_band].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{shortDate(e.created_at)}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      disabled={capture.isPending}
                      onClick={() => capture.mutate(e.id)}
                    >
                      Capture as lead
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search name, email, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {LEAD_STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {LEAD_STAGE_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={owner} onValueChange={setOwner}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All owners</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {data.staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {LEAD_STAGES.map((s) => {
              const items = filtered.filter((l) => l.stage === s);
              return (
                <section key={s} className="border border-border bg-card">
                  <header className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h2 className="text-sm tracking-[0.14em] uppercase">{LEAD_STAGE_LABELS[s]}</h2>
                    <Badge variant="secondary">{items.length}</Badge>
                  </header>
                  <div className="space-y-3 p-4">
                    {items.length === 0 && (
                      <p className="text-xs text-muted-foreground">No leads here.</p>
                    )}
                    {items.map((l) => (
                      <article key={l.id} className="border border-border p-3">
                        <Link
                          to="/studio/leads/$id"
                          params={{ id: l.id }}
                          className="text-sm hover:text-accent"
                        >
                          {l.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[l.city, l.space_type].filter(Boolean).join(" · ") || "Brief pending"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {inr(l.value_estimate)} ·{" "}
                          {l.owner_id ? (staffById.get(l.owner_id) ?? "Assigned") : "Unassigned"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {LEAD_STAGES.filter((next) => next !== s).map((next) => (
                            <button
                              key={next}
                              type="button"
                              disabled={moveStage.isPending}
                              onClick={() => moveStage.mutate({ id: l.id, stage: next })}
                              className="border border-border px-2 py-1 text-[10px] tracking-[0.1em] uppercase text-muted-foreground hover:border-accent hover:text-accent"
                            >
                              {LEAD_STAGE_LABELS[next]}
                            </button>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}

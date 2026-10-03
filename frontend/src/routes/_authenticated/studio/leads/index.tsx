import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UserCheck,
  Search,
  Filter,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  TrendingUp,
  FolderPlus,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  getStudioLeads,
  updateLeadStage,
  convertLeadToClientAndProject,
} from "@/lib/studio-admin.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
  LEAD_STAGE_LABELS,
  LEAD_STAGES,
  inr,
  shortDate,
} from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { type StudioLead } from "@/lib/studio-mock-data";

export const Route = createFileRoute("/_authenticated/studio/leads/")({
  component: LeadsPipelinePage,
  head: () => ({
    meta: [
      { title: "Leads & Pipeline CRM — Atelier Vermilion Studio" },
      {
        name: "description",
        content:
          "Track client inquiries through consultation, site visits, proposals, and project conversion.",
      },
    ],
  }),
});

function LeadsPipelinePage() {
  const queryClient = useQueryClient();

  const {
    data: leads,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["studio", "leads"],
    queryFn: () => getStudioLeads(),
  });

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [convertModalLead, setConvertModalLead] = useState<StudioLead | null>(null);
  const [convertForm, setConvertForm] = useState({
    project_title: "",
    budget: 2500000,
    area_sqft: 2800,
    city: "",
  });

  const stageMutation = useMutation({
    mutationFn: (input: { id: string; stage: (typeof LEAD_STAGES)[number] }) =>
      updateLeadStage({ data: input }),
    onSuccess: () => {
      toast.success("Lead stage updated.");
      queryClient.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update stage"),
  });

  const convertMutation = useMutation({
    mutationFn: () => {
      if (!convertModalLead) throw new Error("No lead selected");
      return convertLeadToClientAndProject({
        data: {
          lead_id: convertModalLead.id,
          project_title: convertForm.project_title || `${convertModalLead.name} Residence`,
          budget: convertForm.budget,
          area_sqft: convertForm.area_sqft,
          city: convertForm.city || convertModalLead.city,
        },
      });
    },
    onSuccess: () => {
      toast.success("Lead successfully converted to Client and Active Project!");
      setConvertModalLead(null);
      queryClient.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Conversion failed"),
  });

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (leads ?? []).filter((l) => {
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (!q) return true;
      return [l.name, l.city, l.email, l.phone, l.property_type, l.notes]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [leads, search, sourceFilter]);

  const totalPipelineValue = useMemo(() => {
    return (leads ?? [])
      .filter((l) => l.stage !== "lost")
      .reduce((s, l) => s + l.estimated_value, 0);
  }, [leads]);

  const openConvertModal = (lead: StudioLead) => {
    setConvertModalLead(lead);
    setConvertForm({
      project_title: `${lead.name} Residence`,
      budget: lead.estimated_value || 2500000,
      area_sqft: 2800,
      city: lead.city,
    });
  };

  return (
    <AppShell>
      <PageTitle
        eyebrow="Studio CRM"
        title="Leads & Opportunity Pipeline"
        actions={
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Active Pipeline
              </span>
              <p className="font-mono text-sm font-semibold text-accent">
                {inr(totalPipelineValue)}
              </p>
            </div>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name, city, property type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "Website", "Instagram", "Referral", "WhatsApp"].map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={`rounded border px-2.5 py-1.5 text-xs transition-colors ${
                sourceFilter === src
                  ? "border-accent bg-accent/15 text-foreground font-medium"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {src === "all" ? "All Sources" : src}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <LoadingBlock label="Retrieving inquiry pipeline…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {/* 7-STAGE PIPELINE BOARD */}
      {leads && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 overflow-x-auto pb-4">
          {LEAD_STAGES.map((stageKey) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stageKey);
            const stageTotal = stageLeads.reduce((s, l) => s + l.estimated_value, 0);

            return (
              <div
                key={stageKey}
                className="flex flex-col rounded border border-border bg-card/60 min-w-[220px]"
              >
                {/* Stage Column Header */}
                <div className="border-b border-border p-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      {LEAD_STAGE_LABELS[stageKey]}
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium">
                      {stageLeads.length}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] font-mono text-muted-foreground">
                    {inr(stageTotal)}
                  </p>
                </div>

                {/* Cards Container */}
                <div className="p-2 space-y-2.5 flex-1 min-h-[300px]">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="group rounded border border-border bg-background p-3.5 space-y-3 hover:border-accent/60 transition-all shadow-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-display font-medium text-sm text-foreground group-hover:text-accent transition-colors">
                            {lead.name}
                          </h4>
                          <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {lead.source}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {lead.city}
                        </p>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="text-foreground font-medium text-[11px]">
                          {lead.property_type}
                        </div>
                        <div className="text-accent font-mono text-[11px]">
                          {inr(lead.estimated_value)}
                        </div>
                      </div>

                      {lead.notes && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed bg-muted/30 p-1.5 rounded">
                          {lead.notes}
                        </p>
                      )}

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-border flex items-center justify-between gap-1">
                        {stageKey !== "won" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-[10px] hover:border-accent hover:text-accent"
                            onClick={() => openConvertModal(lead)}
                          >
                            <FolderPlus className="h-3 w-3 mr-1" /> Convert
                          </Button>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Project Live
                          </span>
                        )}

                        {/* Move stage quick dropdown */}
                        <Select
                          value={lead.stage}
                          onValueChange={(val: (typeof LEAD_STAGES)[number]) =>
                            stageMutation.mutate({ id: lead.id, stage: val })
                          }
                        >
                          <SelectTrigger className="h-6 w-20 text-[9px] bg-card p-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LEAD_STAGES.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {LEAD_STAGE_LABELS[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-muted-foreground/60 italic">
                      No leads
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONVERT LEAD TO CLIENT + PROJECT MODAL */}
      <Dialog open={Boolean(convertModalLead)} onOpenChange={() => setConvertModalLead(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Convert Lead → Client + Active Project
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This creates an official Client record for {convertModalLead?.name} and spins up a
              dedicated project workspace with tracking codes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Project Commission Title
              </Label>
              <Input
                value={convertForm.project_title}
                onChange={(e) => setConvertForm({ ...convertForm, project_title: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Contract Budget (₹ INR)
                </Label>
                <Input
                  type="number"
                  value={convertForm.budget}
                  onChange={(e) =>
                    setConvertForm({ ...convertForm, budget: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Area (Sq Ft)
                </Label>
                <Input
                  type="number"
                  value={convertForm.area_sqft}
                  onChange={(e) =>
                    setConvertForm({ ...convertForm, area_sqft: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                City / Site Location
              </Label>
              <Input
                value={convertForm.city}
                onChange={(e) => setConvertForm({ ...convertForm, city: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConvertModalLead(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => convertMutation.mutate()}
              disabled={convertMutation.isPending}
              className="bg-primary text-primary-foreground"
            >
              {convertMutation.isPending ? "Creating Records..." : "Confirm & Launch Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

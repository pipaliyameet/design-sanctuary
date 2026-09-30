import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Users2,
  Mail,
  Phone,
  FolderKanban,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Award,
} from "lucide-react";
import { getStudioTeamAndMembers } from "@/lib/studio-admin.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
} from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/studio/team/")({
  component: StudioTeamPage,
  head: () => ({
    meta: [
      { title: "Studio Team & Resource Allocation — Atelier Vermilion Studio" },
      {
        name: "description",
        content:
          "Studio staff directory, architectural project assignments, site supervisor workloads, and role permissions.",
      },
    ],
  }),
});

function StudioTeamPage() {
  const fetchTeam = useServerFn(getStudioTeamAndMembers);
  const {
    data: team,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["studio", "team"],
    queryFn: () => fetchTeam(),
  });

  return (
    <AppShell>
      <PageTitle eyebrow="Human Resources & Practice" title="Studio Team & Workload" />

      {isLoading && <LoadingBlock label="Loading studio personnel roster…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {team && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <div
              key={member.id}
              className="rounded border border-border bg-card p-5 space-y-4 hover:border-accent/60 transition-colors"
            >
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent font-display font-medium text-sm border border-accent/30">
                    {member.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-medium text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-xs text-accent font-medium mt-0.5">{member.role}</p>
                  </div>
                </div>

                <Badge
                  variant={
                    member.status === "active"
                      ? "default"
                      : member.status === "on_site"
                        ? "secondary"
                        : "outline"
                  }
                  className="text-[10px] uppercase font-semibold"
                >
                  {member.status.replace(/_/g, " ")}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-accent shrink-0" /> {member.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-accent shrink-0" /> {member.phone}
                </p>
              </div>

              <div className="pt-2 border-t border-border space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground uppercase text-[10px]">
                    Assigned Commissions
                  </span>
                  <span className="font-semibold text-foreground">
                    {member.assigned_projects.length} Active
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {member.assigned_projects.map((proj: string) => (
                    <span
                      key={proj}
                      className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {proj}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

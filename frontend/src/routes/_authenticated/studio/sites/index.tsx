import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  HardHat,
  Camera,
  Calendar,
  AlertTriangle,
  Package,
  ArrowRight,
  Search,
  Plus,
} from "lucide-react";
import { getStudioSiteUpdates } from "@/lib/studio-admin.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
  shortDate,
} from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/studio/sites/")({
  component: SiteManagementPage,
  head: () => ({
    meta: [
      { title: "Site Execution & Daily Progress Logs — Right-Angle-Design-Studio" },
      {
        name: "description",
        content:
          "Live timeline of on-site construction updates, milestone verifications, and supervisor logs.",
      },
    ],
  }),
});

function SiteManagementPage() {
  const fetchUpdates = useServerFn(getStudioSiteUpdates);
  const {
    data: siteUpdates,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["studio", "sites"],
    queryFn: () => fetchUpdates(),
  });

  return (
    <AppShell>
      <PageTitle eyebrow="On-Site Execution Feed" title="Live Construction & Site Logs" />

      {isLoading && <LoadingBlock label="Fetching live site execution reports…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {siteUpdates && (
        <div className="space-y-6 max-w-4xl">
          {siteUpdates.map((log) => (
            <div
              key={log.id}
              className="rounded border border-border bg-card p-6 space-y-5 hover:border-accent/60 transition-colors shadow-xs"
            >
              {/* Log Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                      {log.project_title}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      {shortDate(log.date)}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-medium text-foreground mt-1">
                    {log.title}
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                  Logged by {log.uploaded_by}
                </span>
              </div>

              {/* Log Details Grid */}
              <div className="grid gap-4 md:grid-cols-2 text-xs">
                <div className="rounded bg-muted/20 p-3.5 space-y-1">
                  <h4 className="font-semibold uppercase tracking-wider text-[10px] text-foreground">
                    Work Completed
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">{log.work_completed}</p>
                </div>

                <div className="rounded bg-muted/20 p-3.5 space-y-1">
                  <h4 className="font-semibold uppercase tracking-wider text-[10px] text-foreground">
                    Next Scheduled Step
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">{log.next_action}</p>
                </div>
              </div>

              {/* Issues / Materials Notice */}
              {(log.issues || log.materials_received) && (
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  {log.issues && (
                    <div className="flex items-start gap-2 text-destructive bg-destructive/5 p-3 rounded border border-destructive/20">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Site Notice / Delay:</span>
                        <p className="text-[11px] text-destructive/90 mt-0.5">{log.issues}</p>
                      </div>
                    </div>
                  )}

                  {log.materials_received && (
                    <div className="flex items-start gap-2 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded border border-emerald-200 dark:border-emerald-800">
                      <Package className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Materials Received On-Site:</span>
                        <p className="text-[11px] mt-0.5">{log.materials_received}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Photos Gallery */}
              {log.photos.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Camera className="h-3 w-3" /> Photographic Verification ({log.photos.length})
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {log.photos.map((photo: string, idx: number) => (
                      <img
                        key={idx}
                        src={photo}
                        alt="Site verification log"
                        className="h-36 w-52 rounded object-cover border border-border shadow-xs hover:opacity-90 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Filter,
} from "lucide-react";
import { getStudioNotificationsList, markNotificationRead } from "@/lib/studio-admin.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
} from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/studio/notifications/")({
  component: NotificationCenterPage,
  head: () => ({
    meta: [
      { title: "Notification Center — Atelier Vermilion Studio" },
      {
        name: "description",
        content:
          "Centralized action alerts for client approvals, payments, leads, and site delays.",
      },
    ],
  }),
});

function NotificationCenterPage() {
  const queryClient = useQueryClient();
  const fetchNotifs = useServerFn(getStudioNotificationsList);
  const markReadFn = useServerFn(markNotificationRead);

  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["studio", "notifications"],
    queryFn: () => fetchNotifs(),
  });

  const [filterType, setFilterType] = useState<string>("all");

  const readMutation = useMutation({
    mutationFn: (id: string) => markReadFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio"] });
    },
  });

  const filtered = (notifications ?? []).filter((n) => {
    if (filterType === "unread") return !n.read;
    if (filterType !== "all" && n.type !== filterType) return false;
    return true;
  });

  return (
    <AppShell>
      <PageTitle
        eyebrow="Studio Alerts & Triggers"
        title="Notification Center"
        actions={
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => {
              (notifications ?? []).forEach((n) => readMutation.mutate(n.id));
              toast.success("All notifications marked as read.");
            }}
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> Mark All as Read
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {[
          { key: "all", label: "All Alerts" },
          { key: "unread", label: "Unread Only" },
          { key: "approval", label: "Approvals" },
          { key: "payment", label: "Payments" },
          { key: "lead", label: "Leads" },
          { key: "material_delay", label: "Materials" },
          { key: "site_update", label: "Site Logs" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`rounded border px-3 py-1.5 text-xs transition-colors ${
              filterType === tab.key
                ? "border-accent bg-accent/15 text-foreground font-medium"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingBlock label="Fetching studio notifications…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {notifications && (
        <div className="space-y-3 max-w-4xl">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`flex items-start justify-between gap-4 rounded border p-4 transition-colors ${
                !item.read
                  ? "border-accent/40 bg-card shadow-xs"
                  : "border-border bg-card/60 opacity-80"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded ${
                    !item.read ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {item.timestamp}
                    </span>
                    {!item.read && <span className="h-2 w-2 rounded-full bg-accent" />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  {item.project_title && (
                    <Badge variant="outline" className="mt-2 text-[10px]">
                      {item.project_title}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs hover:border-accent hover:text-accent"
                  onClick={() => readMutation.mutate(item.id)}
                >
                  <Link to={item.action_url as never}>
                    {item.action_label} <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <EmptyState message="No notifications match the selected filter." />
          )}
        </div>
      )}
    </AppShell>
  );
}

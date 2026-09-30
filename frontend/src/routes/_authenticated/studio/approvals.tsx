import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPendingApprovals } from "@/lib/studio.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
  Panel,
  shortDate,
} from "@/components/app/AppShell";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/studio/approvals")({
  component: ApprovalsPage,
  head: () => ({
    meta: [
      { title: "Client approvals — Atelier Vermilion Studio" },
      {
        name: "description",
        content: "Every design set awaiting a client decision, with comments and decision history.",
      },
      { property: "og:title", content: "Client approvals — Atelier Vermilion Studio" },
      { property: "og:description", content: "Approval queue across all projects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ApprovalsPage() {
  const fetchApprovals = useServerFn(listPendingApprovals);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["studio", "approvals"],
    queryFn: () => fetchApprovals(),
  });
  const [status, setStatus] = useState("pending");

  const rows: any[] = useMemo(
    () => (data ?? []).filter((a: any) => status === "all" || a.status === status),
    [data, status],
  );

  return (
    <AppShell>
      <PageTitle
        eyebrow="Approvals"
        title="Waiting on clients"
        actions={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="changes_requested">Changes requested</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="all">Everything</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {isLoading && <LoadingBlock label="Loading approvals…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {data && (
        <Panel title={`${rows.length} approval${rows.length === 1 ? "" : "s"}`}>
          {rows.length === 0 ? (
            <EmptyState message="Nothing in this state right now." />
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((a) => (
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
                    {a.projects?.code} ·{" "}
                    {a.projects?.id ? (
                      <Link
                        to="/studio/projects/$id"
                        params={{ id: a.projects.id }}
                        className="hover:text-accent"
                      >
                        {a.projects.title}
                      </Link>
                    ) : (
                      a.projects?.title
                    )}{" "}
                    · {a.projects?.clients?.name} · sent {shortDate(a.requested_at)}
                    {a.decided_at
                      ? ` · decided ${shortDate(a.decided_at)} by ${a.decided_by_name ?? "client"}`
                      : ""}
                  </p>
                  {a.notes && <p className="mt-2 text-sm text-muted-foreground">{a.notes}</p>}
                  {a.approval_comments && a.approval_comments.length > 0 && (
                    <ul className="mt-3 space-y-2 border-l border-border pl-4">
                      {a.approval_comments.map((c: any) => (
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
      )}
    </AppShell>
  );
}

import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STUDIO_NAV = [
  { to: "/studio", label: "Dashboard" },
  { to: "/studio/leads", label: "Leads" },
  { to: "/studio/projects", label: "Projects" },
  { to: "/studio/approvals", label: "Approvals" },
  { to: "/studio/weekly", label: "Weekly summary" },
] as const;

const PORTAL_NAV = [{ to: "/portal", label: "My projects" }] as const;

export function AppShell({
  children,
  variant = "studio",
}: {
  children: ReactNode;
  variant?: "studio" | "portal";
}) {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const nav = variant === "studio" ? STUDIO_NAV : PORTAL_NAV;

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-8 gap-y-3 px-5 py-3 sm:px-8">
          <Link to="/" className="font-display text-lg tracking-tight">
            Atelier&nbsp;Vermilion
          </Link>
          <span className="eyebrow hidden sm:inline">
            {variant === "studio" ? "Studio workspace" : "Client portal"}
          </span>
          <nav className="order-3 flex w-full flex-wrap gap-x-6 gap-y-2 text-sm sm:order-none sm:w-auto">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/studio" || item.to === "/portal" }}
                className="text-muted-foreground transition-colors hover:text-foreground [&.active]:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden text-xs text-muted-foreground md:inline">
              {session?.fullName || session?.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut} className="text-xs">
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}

export function PageTitle({
  eyebrow,
  title,
  actions,
}: {
  eyebrow?: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warn" | "accent";
}) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="eyebrow">{label}</p>
      <p
        className={cn(
          "mt-3 font-display text-3xl leading-none",
          tone === "warn" && "text-destructive",
          tone === "accent" && "text-accent",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 className="text-sm tracking-[0.14em] uppercase">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="py-6 text-sm text-muted-foreground">{message}</p>;
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="space-y-3 py-8">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="h-1 w-40 animate-pulse bg-border" />
    </div>
  );
}

export function ErrorBlock({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="border border-destructive/40 bg-destructive/5 p-5">
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Something went wrong loading this view."}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export const STAGE_LABELS: Record<string, string> = {
  brief: "Brief",
  concept: "Concept",
  design_development: "Design development",
  execution: "Execution",
  handover: "Handover",
  completed: "Completed",
};

export const LEAD_STAGES = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;

export const LEAD_STAGE_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export const TASK_STATUSES = ["todo", "in_progress", "blocked", "done"] as const;

export const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
};

export function inr(value: number | null | undefined) {
  const n = Number(value ?? 0);
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function shortDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Bell,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  FolderPlus,
  UserPlus,
  ImagePlus,
  Receipt,
  CircleDollarSign,
  HardHat,
  Compass,
  Settings,
  LogOut,
  User,
  Image as ImageIcon,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { logoutUser } from "@/lib/session.functions";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./AppSidebar";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { QuickActionModal, type QuickActionType } from "./QuickActionModal";
import { INITIAL_NOTIFICATIONS } from "@/lib/studio-mock-data";
import { BrandLogo } from "@/components/brand/BrandLogo";

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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickActionModal, setQuickActionModal] = useState<{
    open: boolean;
    type: QuickActionType;
  }>({
    open: false,
    type: "project",
  });

  const unreadNotifs = INITIAL_NOTIFICATIONS.filter((n) => !n.read);

  async function signOut() {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    api.clearToken();
    await queryClient.resetQueries();
    await queryClient.invalidateQueries();
    navigate({ to: "/auth" });
  }

  const openQuickAction = (type: QuickActionType) => {
    setQuickActionModal({ open: true, type });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans antialiased">
      {/* Desktop Architectural Sidebar (Static / Fixed Non-Scrollable) */}
      <div className="hidden md:flex h-full shrink-0 z-30">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transition-transform duration-300 md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link
            to="/studio"
            className="flex items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <BrandLogo variant="horizontal" size="xs" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-3">
          <AppSidebar collapsed={false} onToggleCollapse={() => {}} />
        </div>
      </div>

      {/* Main Command Workspace Area (Independently Scrollable) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        {/* Top Command Bar */}
        <header className="sticky top-0 z-30 shrink-0 flex h-16 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded p-1.5 text-muted-foreground hover:bg-muted md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Global Search Trigger (Cmd + K) */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="group flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent hover:bg-muted"
            >
              <Search className="h-3.5 w-3.5 group-hover:text-accent transition-colors" />
              <span className="hidden sm:inline">Search projects, leads, BOQ, materials...</span>
              <span className="sm:hidden">Search studio...</span>
              <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Action Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 px-3 text-xs bg-primary text-primary-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">New Action</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Quick Create
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openQuickAction("project")}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <FolderPlus className="h-4 w-4 text-accent" />
                  <span>New Interior Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openQuickAction("lead")}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <UserPlus className="h-4 w-4 text-accent" />
                  <span>Add Lead Enquiry</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openQuickAction("media")}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <ImagePlus className="h-4 w-4 text-accent" />
                  <span>Upload Media / Render</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openQuickAction("quotation")}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <Receipt className="h-4 w-4 text-accent" />
                  <span>Create Quotation / BOQ</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openQuickAction("expense")}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <CircleDollarSign className="h-4 w-4 text-accent" />
                  <span>Record Studio Expense</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openQuickAction("site_update")}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <HardHat className="h-4 w-4 text-accent" />
                  <span>Post Daily Site Update</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notification Center Trigger */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Bell className="h-4 w-4" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-popover border-border p-0">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Notifications ({unreadNotifs.length})
                  </span>
                  <Link
                    to="/studio/notifications"
                    className="text-[11px] text-accent hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                  {INITIAL_NOTIFICATIONS.slice(0, 4).map((n) => (
                    <Link
                      key={n.id}
                      to={n.action_url as never}
                      className={cn(
                        "block p-3 text-xs transition-colors hover:bg-muted/50",
                        !n.read && "bg-accent/5 font-medium",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-foreground">{n.title}</span>
                        <span className="text-[10px] text-muted-foreground">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {n.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Owner Profile Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-2 border-l border-border hover:opacity-85 transition-opacity cursor-pointer text-left focus:outline-none">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 border border-accent/40 text-accent font-medium text-xs">
                    {session?.fullName
                      ? session.fullName
                          .trim()
                          .split(/\s+/)
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "SO"}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-medium text-foreground leading-none">
                      {session?.fullName || "Studio Owner"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {session?.title || (session?.isStaff ? "Studio Principal" : "Studio Member")}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
                <DropdownMenuLabel className="font-normal py-2">
                  <p className="text-xs font-semibold text-foreground">
                    {session?.fullName || "Studio Owner"}
                  </p>
                  {session?.email && (
                    <p className="text-[10px] text-muted-foreground truncate">{session.email}</p>
                  )}
                  <span className="inline-block mt-1 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/30 font-semibold">
                    {session?.title || (session?.isStaff ? "Studio Principal" : "Studio Member")}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/studio/settings" className="gap-2 cursor-pointer text-xs">
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Studio Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/studio/media" className="gap-2 cursor-pointer text-xs">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Drive Media Vault</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="gap-2 cursor-pointer text-xs text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      {/* Universal Quick Action Modal */}
      <QuickActionModal
        isOpen={quickActionModal.open}
        actionType={quickActionModal.type}
        onClose={() => setQuickActionModal({ open: false, type: "project" })}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["studio"] })}
      />
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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl sm:text-3xl font-normal font-display tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
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
  tone?: "default" | "warn" | "accent" | "success";
}) {
  return (
    <div className="rounded border border-border bg-card p-4 transition-all hover:border-accent/40">
      <p className="eyebrow">{label}</p>
      <p
        className={cn(
          "mt-2.5 font-display text-2xl sm:text-3xl leading-none text-foreground",
          tone === "warn" && "text-destructive",
          tone === "accent" && "text-accent",
          tone === "success" && "text-emerald-600",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>}
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
    <section className={cn("rounded border border-border bg-card overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/20">
        <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-muted-foreground">
          {title}
        </h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="py-8 text-center text-xs text-muted-foreground italic">{message}</p>;
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="space-y-3 py-12 text-center">
      <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
      <div className="h-0.5 w-36 mx-auto animate-pulse bg-accent" />
    </div>
  );
}

export function ErrorBlock({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="rounded border border-destructive/40 bg-destructive/5 p-5 text-center">
      <p className="text-xs text-destructive">
        {error instanceof Error ? error.message : "Something went wrong loading this studio view."}
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
  brief: "Client Brief",
  site_visit: "Site Survey",
  concept: "Concept & Mood",
  design_development: "Design Development",
  client_approval: "Client Approval",
  quotation: "Quotation & BOQ",
  execution: "On-Site Execution",
  installation: "Joinery & Installation",
  final_inspection: "Snagging & Inspection",
  handover: "Final Handover",
  completed: "Completed Project",
};

export const LEAD_STAGES = [
  "new",
  "contacted",
  "site_visit",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;

export const LEAD_STAGE_LABELS: Record<string, string> = {
  new: "New Inquiry",
  contacted: "Contacted",
  site_visit: "Site Consultation",
  proposal: "Proposal Sent",
  negotiation: "In Negotiation",
  won: "Converted (Won)",
  lost: "Archived / Lost",
};

export const TASK_STATUSES = ["todo", "in_progress", "blocked", "done"] as const;

export const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Completed",
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

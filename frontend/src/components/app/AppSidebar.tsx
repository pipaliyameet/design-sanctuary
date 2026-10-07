import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FolderKanban,
  UserCheck,
  Users,
  Image as ImageIcon,
  FileText,
  Receipt,
  CircleDollarSign,
  Package,
  HardHat,
  Users2,
  Globe,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  HelpCircle,
  Sparkles,
  Compass,
} from "lucide-react";
import { logoutUser } from "@/lib/session.functions";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BrandLogo } from "@/components/brand/BrandLogo";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  exact?: boolean;
}

const PRIMARY_STUDIO_NAV: NavItem[] = [
  { to: "/studio", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/studio/website", label: "Customer Homepage", icon: Globe, badge: "Live" },
  { to: "/studio/media", label: "Drive Media Vault", icon: ImageIcon },
  { to: "/studio/leads", label: "Enquiries", icon: UserCheck, badge: "New" },
  { to: "/studio/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "relative flex flex-col h-screen h-full border-r border-border bg-card transition-all duration-300 ease-in-out shrink-0 select-none z-30",
          collapsed ? "w-[72px]" : "w-[275px]",
        )}
      >
        {/* Top Studio Brand / Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/studio" className="flex items-center gap-2.5 overflow-hidden">
            <BrandLogo variant={collapsed ? "symbol" : "horizontal"} size="xs" showTagline={!collapsed} />
          </Link>

          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsed Toggle Button when closed */}
        {collapsed && (
          <div className="flex justify-center py-2.5 border-b border-border/50">
            <button
              onClick={onToggleCollapse}
              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {PRIMARY_STUDIO_NAV.map((item) => {
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className={cn(
                  "group relative flex items-center gap-3.5 rounded-md px-3.5 py-3 text-[15px] font-medium transition-colors min-h-[48px] cursor-pointer",
                  "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                  "[&.active]:bg-accent/15 [&.active]:text-foreground [&.active]:font-semibold",
                )}
              >
                <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105 group-[.active]:text-accent" />

                {!collapsed && (
                  <>
                    <span className="truncate flex-1 leading-tight">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide",
                          typeof item.badge === "number"
                            ? "bg-muted text-muted-foreground"
                            : "bg-accent/20 text-accent border border-accent/30",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Left brass accent bar on active */}
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r bg-accent opacity-0 group-[.active]:opacity-100 transition-opacity" />
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={12}
                    className="text-sm bg-popover text-popover-foreground border-border font-medium px-3 py-1.5"
                  >
                    {item.label}
                    {item.badge && ` (${item.badge})`}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </div>

        {/* Bottom Status & Actions */}
        <div className="border-t border-border p-3.5 space-y-2.5 bg-muted/20">
          {!collapsed && (
            <div className="rounded-md border border-border/80 bg-background/60 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-foreground">Live Studio Mode</span>
                </div>
                <span className="text-xs text-muted-foreground">All Synced</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-tight">
                Operating Right Angle Studio HQ
              </p>
            </div>
          )}

          {/* Quick links & public site */}
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              target="_blank"
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                collapsed && "justify-center",
              )}
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">View Public Website</span>}
            </Link>

            <button
              onClick={signOut}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-left w-full",
                collapsed && "justify-center",
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

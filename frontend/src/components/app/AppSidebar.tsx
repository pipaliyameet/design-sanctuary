import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Image as ImageIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  Sparkles,
  Globe,
} from "lucide-react";
import { logoutUser } from "@/lib/session.functions";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  exact?: boolean;
}

const PRIMARY_STUDIO_NAV: NavItem[] = [
  { to: "/studio/media", label: "Drive Media Vault", icon: ImageIcon },
  { to: "/studio/services", label: "Services Control", icon: Sparkles, badge: "Live" },
  { to: "/studio/website", label: "Customer Homepage", icon: Globe, badge: "Live" },
  { to: "/studio/settings", label: "Settings", icon: Settings },
];

const DEFAULT_WIDTH = 275;
const MIN_WIDTH = 200;
const MAX_WIDTH = 520;
const COLLAPSE_THRESHOLD = 140;

export function AppSidebar({
  collapsed: propCollapsed,
  onToggleCollapse: propOnToggleCollapse,
  resizable = true,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  resizable?: boolean;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Width state with localStorage persistence
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("studio_sidebar_width");
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= MIN_WIDTH && val <= MAX_WIDTH) {
          return val;
        }
      }
    }
    return DEFAULT_WIDTH;
  });

  // Collapsed state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (propCollapsed !== undefined) return propCollapsed;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("studio_sidebar_collapsed");
      if (saved !== null) return saved === "true";
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Keep synced with propCollapsed if parent overrides
  useEffect(() => {
    if (propCollapsed !== undefined) {
      setIsCollapsed(propCollapsed);
    }
  }, [propCollapsed]);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartWidthRef = useRef<number>(DEFAULT_WIDTH);

  // Set global body cursor & selection styles when dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  const handleToggleCollapse = useCallback(() => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("studio_sidebar_collapsed", next ? "true" : "false");
    propOnToggleCollapse?.();
  }, [isCollapsed, propOnToggleCollapse]);

  // Mouse drag handler for LeetCode / Antigravity style resizer
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!resizable) return;
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      dragStartXRef.current = e.clientX;
      dragStartWidthRef.current = isCollapsed ? 72 : sidebarWidth;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - dragStartXRef.current;
        const currentTargetWidth = dragStartWidthRef.current + delta;

        if (currentTargetWidth < COLLAPSE_THRESHOLD) {
          setIsCollapsed(true);
        } else {
          setIsCollapsed(false);
          const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, currentTargetWidth));
          setSidebarWidth(clamped);
        }
      };

      const onMouseUp = (upEvent: MouseEvent) => {
        setIsDragging(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);

        const delta = upEvent.clientX - dragStartXRef.current;
        const finalTargetWidth = dragStartWidthRef.current + delta;

        if (finalTargetWidth < COLLAPSE_THRESHOLD) {
          setIsCollapsed(true);
          localStorage.setItem("studio_sidebar_collapsed", "true");
          propOnToggleCollapse?.();
        } else {
          setIsCollapsed(false);
          const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, finalTargetWidth));
          setSidebarWidth(clamped);
          localStorage.setItem("studio_sidebar_width", clamped.toString());
          localStorage.setItem("studio_sidebar_collapsed", "false");
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [isCollapsed, sidebarWidth, resizable, propOnToggleCollapse]
  );

  // Double click resets to default or toggles
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isCollapsed) {
        setIsCollapsed(false);
        setSidebarWidth(DEFAULT_WIDTH);
        localStorage.setItem("studio_sidebar_collapsed", "false");
        localStorage.setItem("studio_sidebar_width", DEFAULT_WIDTH.toString());
      } else if (sidebarWidth !== DEFAULT_WIDTH) {
        setSidebarWidth(DEFAULT_WIDTH);
        localStorage.setItem("studio_sidebar_width", DEFAULT_WIDTH.toString());
      } else {
        handleToggleCollapse();
      }
    },
    [isCollapsed, sidebarWidth, handleToggleCollapse]
  );

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  async function handleConfirmSignOut() {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    api.clearToken();
    await queryClient.resetQueries();
    await queryClient.invalidateQueries();
    navigate({ to: "/auth", search: { redirect: "/studio" } });
  }

  const effectiveWidth = isCollapsed ? 72 : sidebarWidth;

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        style={{ width: `${effectiveWidth}px` }}
        className={cn(
          "relative flex flex-col h-screen h-full border-r border-border bg-card shrink-0 select-none z-30",
          isDragging ? "transition-none select-none" : "transition-[width] duration-200 ease-out"
        )}
      >
        {/* Top Studio Brand / Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/studio" className="flex items-center gap-2.5 overflow-hidden">
            <BrandLogo variant={isCollapsed ? "symbol" : "horizontal"} size="xs" showTagline={!isCollapsed} />
          </Link>

          {!isCollapsed && (
            <button
              onClick={handleToggleCollapse}
              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsed Toggle Button when closed */}
        {isCollapsed && (
          <div className="flex justify-center py-2.5 border-b border-border/50">
            <button
              onClick={handleToggleCollapse}
              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
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
                  "text-foreground/80 hover:bg-muted/80 hover:text-foreground",
                  "[&.active]:bg-accent/15 [&.active]:text-foreground [&.active]:font-semibold"
                )}
              >
                <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105 group-[.active]:text-accent" />

                {!isCollapsed && (
                  <>
                    <span className="truncate flex-1 leading-tight">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide",
                          typeof item.badge === "number"
                            ? "bg-muted text-foreground/75"
                            : "bg-accent/20 text-accent border border-accent/30"
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

            if (isCollapsed) {
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
          {!isCollapsed && (
            <div className="rounded-md border border-border/80 bg-background/60 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-foreground">Live Studio Mode</span>
                </div>
                <span className="text-xs text-foreground/75 font-medium">All Synced</span>
              </div>
              <p className="mt-1 text-xs text-foreground/70 leading-tight font-normal">
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
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-foreground font-medium transition-colors",
                isCollapsed && "justify-center"
              )}
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="truncate">View Public Website</span>}
            </Link>

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-destructive/10 hover:text-destructive font-medium transition-colors text-left w-full cursor-pointer",
                isCollapsed && "justify-center"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Sign Out</span>}
            </button>
          </div>
        </div>

        {/* Sign Out Confirmation Modal */}
        <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
          <AlertDialogContent className="max-w-md bg-card border-border shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-serif tracking-tight text-foreground flex items-center gap-2">
                <LogOut className="h-5 w-5 text-destructive" />
                Confirm Sign Out
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
                Are you sure you want to sign out of Right Angle Design Studio? You will need to enter your email and password to access the studio dashboard again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-5 gap-2 sm:gap-3">
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmSignOut}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer font-medium"
              >
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* =====================================================================
            LEETCODE & ANTIGRAVITY STYLE SLIDING RESIZER HANDLE
            ===================================================================== */}
        {resizable && (
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={effectiveWidth}
            aria-valuemin={MIN_WIDTH}
            aria-valuemax={MAX_WIDTH}
            tabIndex={0}
            className={cn(
              "hidden md:flex absolute top-0 -right-2 w-4 h-full cursor-col-resize z-40 select-none items-center justify-center group touch-none",
              isDragging && "cursor-col-resize"
            )}
          >
            {/* Visual separator line: clean neutral border tone (no orange/brown color) */}
            <div
              className={cn(
                "w-[2px] h-full transition-all duration-150",
                isDragging
                  ? "w-[2px] bg-muted-foreground/40 opacity-100"
                  : "bg-transparent group-hover:bg-border group-hover:w-[2px]"
              )}
            />
          </div>
        )}
      </aside>

      {/* Global Transparent Drag Overlay (Ensures smooth drag over iframes & prevents losing pointer focus) */}
      {isDragging && (
        <div
          className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent"
          aria-hidden="true"
        />
      )}
    </TooltipProvider>
  );
}

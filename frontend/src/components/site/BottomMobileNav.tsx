import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Layers, LayoutGrid, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  hash?: string;
  isSpecial?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    label: "Home",
    icon: Home,
  },
  {
    to: "/services",
    label: "Interiors",
    icon: Layers,
  },
  {
    to: "/gallery",
    label: "Gallery",
    icon: LayoutGrid,
  },
  {
    to: "/contact",
    label: "Studios",
    icon: MapPin,
  },
  {
    to: "/contact",
    hash: "consultation",
    label: "Estimate",
    icon: Sparkles,
    isSpecial: true,
  },
];

export function BottomMobileNav() {
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname ?? "/";
  const currentHash = routerState?.location?.hash ?? "";

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.isSpecial
              ? currentPath === "/contact" && currentHash === "consultation"
              : item.to === "/"
                ? currentPath === "/"
                : currentPath.startsWith(item.to) && currentHash !== "consultation";

          if (item.isSpecial) {
            return (
              <Link
                key={item.label}
                to={item.to}
                hash={item.hash}
                className="group flex flex-col items-center justify-center -mt-3 focus:outline-none"
              >
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-full shadow-md transition-transform duration-200 group-active:scale-95",
                    isActive
                      ? "bg-accent text-white ring-2 ring-accent/30 ring-offset-2"
                      : "bg-stone-900 text-amber-300 hover:bg-stone-800"
                  )}
                >
                  <Icon className="size-5 stroke-[2.2]" />
                </div>
                <span
                  className={cn(
                    "mt-0.5 text-[10px] font-sans font-bold tracking-tight transition-colors",
                    isActive ? "text-accent" : "text-stone-700"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "group relative flex flex-1 flex-col items-center justify-center py-1 transition-colors focus:outline-none",
                isActive ? "text-accent" : "text-stone-600 hover:text-stone-950"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "size-5.5 transition-transform duration-150 group-active:scale-90",
                    isActive ? "stroke-[2.4]" : "stroke-[1.8]"
                  )}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-accent" />
                )}
              </div>
              <span
                className={cn(
                  "mt-1 text-[10px] font-sans transition-colors tracking-tight",
                  isActive ? "font-bold text-accent" : "font-medium text-stone-600"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

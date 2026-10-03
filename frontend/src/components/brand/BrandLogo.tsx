import React from "react";
import { cn } from "@/lib/utils";

export interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: "full" | "horizontal" | "stacked" | "symbol";
  theme?: "light" | "dark" | "auto";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}

/**
 * Geometric RIGHT ANGLE Symbol
 * Pure vector SVG representation of the brand mark:
 * - Black outer top-right right-angle bracket
 * - Orange inner left-top right-angle bracket
 */
export function RightAngleSymbol({
  className,
  theme = "auto",
  size = 36,
  ...props
}: {
  className?: string;
  theme?: "light" | "dark" | "auto";
  size?: number | string;
} & React.SVGProps<SVGSVGElement>) {
  // Theme color for black/dark stroke: adapts to dark backgrounds when specified
  const primaryColor =
    theme === "light"
      ? "#FFFFFF"
      : theme === "dark"
        ? "#000000"
        : "currentColor";

  const orangeColor = "#F58220";

  const numHeight = typeof size === "number" ? size : parseInt(String(size), 10) || 36;
  const numWidth = Math.round((numHeight * 100) / 160);

  return (
    <svg
      viewBox="0 0 100 160"
      width={numWidth}
      height={numHeight}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-label="Right Angle Design Studio Symbol"
      {...props}
    >
      {/* Outer Top-Right Black Right Angle Bracket (Bold Rectangular Proportion) */}
      <path
        d="M 0 0 H 100 V 160 H 80 V 20 H 0 Z"
        fill={primaryColor}
      />

      {/* Inner Left-Top Architectural Orange Right Angle Bracket (Thick, Descending to Base) */}
      <path
        d="M 0 38 H 62 V 58 H 20 V 160 H 0 Z"
        fill={orangeColor}
      />
    </svg>
  );
}

/**
 * Complete Responsive Brand Logo Component
 * Supports:
 * - variant="horizontal" (Symbol + RIGHT ANGLE DESIGN STUDIO side-by-side)
 * - variant="full" or "stacked" (Symbol + Two-line Wordmark)
 * - variant="symbol" (Icon mark only)
 */
export function BrandLogo({
  variant = "horizontal",
  theme = "auto",
  size = "md",
  showTagline = true,
  className,
  ...props
}: BrandLogoProps) {
  const sizeMap = {
    xs: { symbol: 24, text: "text-xs", subtext: "text-[8px]", gap: "gap-2" },
    sm: { symbol: 30, text: "text-sm", subtext: "text-[9px]", gap: "gap-2.5" },
    md: { symbol: 38, text: "text-base", subtext: "text-[10px]", gap: "gap-3" },
    lg: { symbol: 48, text: "text-xl", subtext: "text-xs", gap: "gap-3.5" },
    xl: { symbol: 64, text: "text-2xl", subtext: "text-sm", gap: "gap-4" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (variant === "symbol") {
    return (
      <div className={cn("inline-flex items-center", className)}>
        <RightAngleSymbol size={currentSize.symbol} theme={theme} />
      </div>
    );
  }

  if (variant === "stacked" || variant === "full") {
    return (
      <div className={cn("inline-flex flex-col items-start gap-2", className)}>
        <RightAngleSymbol size={currentSize.symbol} theme={theme} />
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-medium tracking-[0.14em] uppercase",
              currentSize.text,
              theme === "light" ? "text-white" : "text-foreground"
            )}
          >
            RIGHT ANGLE
          </span>
          {showTagline && (
            <span
              className={cn(
                "font-sans font-normal tracking-[0.28em] uppercase text-accent mt-1",
                currentSize.subtext
              )}
            >
              DESIGN STUDIO
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal Layout
  return (
    <div className={cn("inline-flex items-center", currentSize.gap, className)}>
      <RightAngleSymbol size={currentSize.symbol} theme={theme} />
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-medium tracking-[0.12em] uppercase transition-colors",
            currentSize.text,
            theme === "light" ? "text-white" : "text-foreground"
          )}
        >
          RIGHT ANGLE
        </span>
        {showTagline && (
          <span
            className={cn(
              "font-sans font-normal tracking-[0.24em] uppercase text-accent mt-1 transition-colors",
              currentSize.subtext
            )}
          >
            DESIGN STUDIO
          </span>
        )}
      </div>
    </div>
  );
}

export default BrandLogo;

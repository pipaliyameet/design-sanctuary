import React from "react";
import { cn } from "@/lib/utils";

export interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: "full" | "horizontal" | "stacked" | "symbol";
  theme?: "light" | "dark" | "auto";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
  bracketColor?: string;
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
  bracketColor,
  showDesign = true,
  ...props
}: {
  className?: string;
  theme?: "light" | "dark" | "auto";
  size?: number | string;
  bracketColor?: string;
  showDesign?: boolean;
} & React.SVGProps<SVGSVGElement>) {
  // Brand color for outer right-angle bracket and DESIGN text: Solid Black (#000000)
  const primaryColor = bracketColor || "#000000";
  const orangeColor = "#F58220";

  const numHeight = typeof size === "number" ? size : parseInt(String(size), 10) || 36;
  const numWidth = Math.round((numHeight * 100) / 215);

  return (
    <svg
      viewBox="0 0 100 215"
      width={numWidth}
      height={numHeight}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none overflow-visible", className)}
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

      {/* Handcrafted Architectural 'DESIGN' Under Symbol */}
      {showDesign && (
        <text
          x="50"
          y="202"
          textAnchor="middle"
          fill={primaryColor}
          style={{
            fontFamily: "'City Blueprint', 'CityBlueprint', 'Caveat', cursive, sans-serif",
            fontSize: "36px",
            letterSpacing: "0.14em",
            fontWeight: 400,
          }}
        >
          DESIGN
        </text>
      )}
    </svg>
  );
}

/**
 * Complete Responsive Brand Logo Component
 * Supports:
 * - variant="horizontal" (Symbol + RIGHT ANGLE DESIGN STUDIO in one single line)
 * - variant="stacked" or "full" (Symbol + RIGHT ANGLE DESIGN STUDIO in one single line)
 * - variant="symbol" (Icon mark with DESIGN under it)
 */
export function BrandLogo({
  variant = "horizontal",
  theme = "auto",
  size = "md",
  showTagline = true,
  className,
  bracketColor,
  ...props
}: BrandLogoProps) {
  const sizeMap = {
    xs: { symbol: 28, text: "text-xs", gap: "gap-2" },
    sm: { symbol: 34, text: "text-sm", gap: "gap-2.5" },
    md: { symbol: 42, text: "text-base", gap: "gap-3" },
    lg: { symbol: 54, text: "text-xl", gap: "gap-3.5" },
    xl: { symbol: 70, text: "text-2xl", gap: "gap-4" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (variant === "symbol") {
    return (
      <div className={cn("inline-flex items-center", className)}>
        <RightAngleSymbol size={currentSize.symbol} theme={theme} bracketColor={bracketColor} />
      </div>
    );
  }

  if (variant === "stacked" || variant === "full") {
    return (
      <div className={cn("inline-flex flex-col items-start gap-2.5", className)}>
        <RightAngleSymbol size={currentSize.symbol} theme={theme} bracketColor={bracketColor} />
        <div className="inline-flex items-baseline gap-1.5 sm:gap-2 whitespace-nowrap leading-none select-none">
          <span
            className={cn(
              "font-display font-bold tracking-[0.14em] uppercase whitespace-nowrap transition-colors text-black",
              currentSize.text,
              theme === "light" ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]" : "text-black"
            )}
            style={{
              WebkitTextStroke: theme === "light" ? "0.4px #ffffff" : "0.55px #000000",
            }}
          >
            RIGHT ANGLE
          </span>
          {showTagline && (
            <span
              className={cn(
                "font-display font-bold tracking-[0.14em] uppercase whitespace-nowrap transition-colors text-accent",
                currentSize.text,
                theme === "light" ? "text-stone-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]" : "text-accent"
              )}
              style={{
                WebkitTextStroke: theme === "light" ? "0.4px #d6d3d1" : "0.5px currentColor",
              }}
            >
              DESIGN STUDIO
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal Layout (RIGHT ANGLE DESIGN STUDIO in ONE single line)
  return (
    <div className={cn("inline-flex items-center", currentSize.gap, className)}>
      <RightAngleSymbol size={currentSize.symbol} theme={theme} bracketColor={bracketColor} />
      <div className="inline-flex items-baseline gap-1.5 sm:gap-2 whitespace-nowrap leading-none select-none">
        <span
          className={cn(
            "font-display font-bold tracking-[0.12em] uppercase transition-colors whitespace-nowrap text-black",
            currentSize.text,
            theme === "light" ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]" : "text-black"
          )}
          style={{
            WebkitTextStroke: theme === "light" ? "0.4px #ffffff" : "0.55px #000000",
          }}
        >
          RIGHT ANGLE
        </span>
        {showTagline && (
          <span
            className={cn(
              "font-display font-bold tracking-[0.12em] uppercase transition-colors whitespace-nowrap text-accent",
              currentSize.text,
              theme === "light" ? "text-stone-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]" : "text-accent"
            )}
            style={{
              WebkitTextStroke: theme === "light" ? "0.4px #d6d3d1" : "0.5px currentColor",
            }}
          >
            DESIGN STUDIO
          </span>
        )}
      </div>
    </div>
  );
}

export default BrandLogo;

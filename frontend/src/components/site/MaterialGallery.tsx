import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MaterialItem {
  id: string;
  name: string;
  category: "Stone" | "Wood" | "Metal" | "Glass" | "Fabric" | "Lighting";
  image: string;
  description: string;
  provenance: string;
  projectSlug: string;
  projectTitle: string;
}

export const MATERIALS_DATA: MaterialItem[] = [
  {
    id: "travertine",
    name: "Honed Roman Travertine",
    category: "Stone",
    image: "/portfolio/p1.jpg",
    description:
      "Unfilled, soft-honed surface that absorbs harsh glare and records footsteps into a natural living patina.",
    provenance: "Tivoli quarries, Italy",
    projectSlug: "shah-residence-ahmedabad",
    projectTitle: "The Shah Residence",
  },
  {
    id: "white-oak",
    name: "Fumed European Oak",
    category: "Wood",
    image: "/portfolio/p6.jpg",
    description:
      "Ammonia-fumed heartwood with deep, warm taupe undertones and 2mm solid wood lippings for lifelong durability.",
    provenance: "Spessart Forest, Germany",
    projectSlug: "koramangala-minimalist-penthouse",
    projectTitle: "Koramangala Sky Penthouse",
  },
  {
    id: "antique-brass",
    name: "Unlacquered Antique Brass",
    category: "Metal",
    image: "/portfolio/hero.jpg",
    description:
      "Hand-rubbed architectural bronze and brass that oxidizes gradually with handling, celebrating the passage of time.",
    provenance: "Bespoke Sand-Casting Foundry, Moradabad",
    projectSlug: "shah-residence-ahmedabad",
    projectTitle: "The Shah Residence",
  },
  {
    id: "lime-plaster",
    name: "Hand-Trowelled Lime Plaster",
    category: "Stone",
    image: "/portfolio/p4.jpg",
    description:
      "Breathable, non-toxic mineral lime wash with undulating soft texture that dances with morning and evening daylight.",
    provenance: "Rajasthan mineral limestone slaked 24 months",
    projectSlug: "bandra-heritage-loft",
    projectTitle: "Bandra Heritage Apartment",
  },
  {
    id: "fluted-glass",
    name: "Low-Iron Fluted Reeded Glass",
    category: "Glass",
    image: "/portfolio/p7.jpg",
    description:
      "Diffuses visual clutter into soft architectural silhouettes while allowing pure, unhindered daylight to traverse rooms.",
    provenance: "Precision annealed architectural glass",
    projectSlug: "ochre-stone-studio-workspace",
    projectTitle: "Ochre & Stone Studio",
  },
  {
    id: "belgian-linen",
    name: "Pure Washed Belgian Linen",
    category: "Fabric",
    image: "/portfolio/p2.jpg",
    description:
      "Heavyweight raw flax weave providing acoustic dampening, tactile warmth, and graceful, effortless drape.",
    provenance: "Flanders Flax Mills, Belgium",
    projectSlug: "alibaug-coastal-villa",
    projectTitle: "Alibaug Coastal Villa",
  },
];

export function MaterialGallery() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem>(MATERIALS_DATA[0]);

  const categories = ["All", "Stone", "Wood", "Metal", "Glass", "Fabric"];

  const filtered =
    activeCategory === "All"
      ? MATERIALS_DATA
      : MATERIALS_DATA.filter((m) => m.category === activeCategory);

  return (
    <div className="space-y-12">
      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={cn(
              "px-4 py-1.5 text-xs tracking-[0.18em] uppercase transition-colors",
              activeCategory === c
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid of Materials */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const isSelected = selectedMaterial.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedMaterial(item)}
              className={cn(
                "group relative cursor-pointer border p-5 transition-all duration-300",
                isSelected
                  ? "border-accent bg-secondary/30"
                  : "border-border/70 hover:border-foreground/40 bg-background",
              )}
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-accent font-medium">
                    {item.category}
                  </span>
                  <h4 className="mt-1 font-display text-lg tracking-tight text-foreground">
                    {item.name}
                  </h4>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {item.description}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-[11px]">
                <span className="text-muted-foreground italic">{item.provenance}</span>
                <Link
                  to="/portfolio/$slug"
                  params={{ slug: item.projectSlug }}
                  className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  Featured in {item.projectTitle} <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

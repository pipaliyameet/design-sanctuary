import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  Columns,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  Info,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  FolderOpen,
} from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import {
  GOOGLE_DRIVE_PHOTOS,
  getPaginatedGoogleDrivePhotos,
  PUBLIC_DRIVE_FOLDER_URL,
  type GoogleDrivePhoto,
  PHOTO_CATEGORIES,
} from "@/lib/google-drive-photos";
import { getPublicGalleryPhotos } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DriveImage } from "@/components/site/DriveImage";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  head: () => ({
    meta: [
      { title: "Architectural Photo Vault & Media Gallery | Right Angle Design Studio" },
      {
        name: "description",
        content:
          "Explore high-resolution architectural interior photographs from our archive: living salons, master retreats, fluted stone foyers, and bespoke joinery.",
      },
    ],
  }),
});

type LayoutMode = "masonry" | "grid" | "cinematic";

function GalleryPage() {
  const [category, setCategory] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12);
  const [sortBy, setSortBy] = useState<"default" | "newest" | "title" | "project">("default");
  const [layout, setLayout] = useState<LayoutMode>("masonry");
  const [lightboxPhoto, setLightboxPhoto] = useState<GoogleDrivePhoto | null>(null);

  // Reset to page 1 whenever filter changes
  useEffect(() => {
    setPage(1);
  }, [category, selectedTag, search, limit, sortBy]);

  // Server data fetching
  const { data: serverGallery } = useQuery({
    queryKey: ["public-gallery", { category, tag: selectedTag, search, page, limit, sortBy }],
    queryFn: () => getPublicGalleryPhotos({ category, tag: selectedTag, search, page, limit, sortBy }),
    staleTime: 60_000,
  });

  // Compute pagination (uses server data when available, otherwise local paginator)
  const paginated = useMemo(() => {
    if (serverGallery && typeof serverGallery.total === "number") {
      return serverGallery;
    }
    return getPaginatedGoogleDrivePhotos({
      category,
      tag: selectedTag,
      search,
      page,
      limit,
      sortBy,
    });
  }, [serverGallery, category, selectedTag, search, page, limit, sortBy]);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (!lightboxPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxPhoto(null);
      } else if (e.key === "ArrowRight") {
        const list = paginated.items;
        const idx = list.findIndex((p: any) => p.id === lightboxPhoto.id || p._id === (lightboxPhoto as any)._id);
        if (idx !== -1 && idx < list.length - 1) {
          setLightboxPhoto(list[idx + 1] as any);
        }
      } else if (e.key === "ArrowLeft") {
        const list = paginated.items;
        const idx = list.findIndex((p: any) => p.id === lightboxPhoto.id || p._id === (lightboxPhoto as any)._id);
        if (idx > 0) {
          setLightboxPhoto(list[idx - 1] as any);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxPhoto, paginated.items]);

  // Generate pagination range
  const paginationRange = useMemo(() => {
    const totalPages = paginated.totalPages;
    const current = paginated.page;
    const delta = 2;
    const range: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  }, [paginated.totalPages, paginated.page]);

  return (
    <PublicShell>
      {/* Editorial Hero Section */}
      <div className="border-b border-border bg-card/20 pt-28 pb-10 sm:pt-36 sm:pb-14">
        <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-medium text-accent">
                <Sparkles className="size-3.5" />
                <span>Curated Architectural Visual Archive (50 Works)</span>
              </div>
              <h1 className="mt-3 font-display text-3xl sm:text-5xl lg:text-6xl font-light text-foreground tracking-tight leading-[1.15]">
                Architectural Photo Gallery & Vault.
              </h1>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-light">
                High-resolution documentation of bespoke residential and commercial commissions.
                Filter room by room, inspect materials, and view full-scale architectural photographs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 rounded bg-foreground px-5 py-2.5 text-xs uppercase tracking-widest text-background font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <span>Projects Portfolio</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Gallery Workspace */}
      <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16 py-8">
        {/* Category Tab Strip */}
        <div className="no-scrollbar overflow-x-auto border-b border-border pb-4 -mx-5 px-5 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-max">
            {PHOTO_CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "rounded border px-4 py-2 text-xs transition-all cursor-pointer",
                    active
                      ? "border-accent bg-accent/15 text-foreground font-semibold shadow-xs"
                      : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-border/80",
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar: Search, Layout Switcher, Sort & Per-Page Controls */}
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border pb-6">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by room, travertine, oak, project, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs bg-card/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Tag Filter, Sort, Layout & Items Per Page */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Tag Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground hidden sm:inline">Tag:</span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="rounded border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
              >
                {paginated.allTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
              >
                <option value="default">Curated Flow</option>
                <option value="newest">Newest First</option>
                <option value="title">Space / Room Name</option>
                <option value="project">Project Name</option>
              </select>
            </div>

            {/* Items Per Page */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground hidden sm:inline">Per page:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="rounded border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
              >
                <option value={12}>12 photos</option>
                <option value={24}>24 photos</option>
                <option value={36}>36 photos</option>
                <option value={48}>48 photos</option>
              </select>
            </div>

            {/* Layout Switcher */}
            <div className="hidden sm:flex items-center rounded border border-border bg-card p-0.5">
              <button
                onClick={() => setLayout("masonry")}
                title="Masonry Layout"
                className={cn(
                  "p-1.5 rounded transition-colors",
                  layout === "masonry" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Columns className="size-3.5" />
              </button>
              <button
                onClick={() => setLayout("grid")}
                title="Grid Layout"
                className={cn(
                  "p-1.5 rounded transition-colors",
                  layout === "grid" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Grid3X3 className="size-3.5" />
              </button>
              <button
                onClick={() => setLayout("cinematic")}
                title="Cinematic Wide View"
                className={cn(
                  "p-1.5 rounded transition-colors",
                  layout === "cinematic" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Counter summary bar */}
        <div className="py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-b border-border/50">
          <div className="flex items-center gap-2">
            <span>
              Showing{" "}
              <strong className="text-foreground">
                {paginated.total > 0 ? (paginated.page - 1) * paginated.limit + 1 : 0} –{" "}
                {Math.min(paginated.page * paginated.limit, paginated.total)}
              </strong>{" "}
              of <strong className="text-foreground">{paginated.total}</strong> matching photos
            </span>
            <span>({paginated.totalDriveAssets} Total Compositions)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px]">
              Page {paginated.page} of {paginated.totalPages}
            </span>
          </div>
        </div>

        {/* PHOTO GALLERY CONTENT */}
        {paginated.items.length > 0 ? (
          <div className="mt-8">
            {/* Masonry / Grid Modes */}
            {layout === "masonry" && (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {paginated.items.map((photo) => (
                  <PhotoCardItem
                    key={photo.id}
                    photo={photo}
                    onOpenLightbox={() => setLightboxPhoto(photo)}
                  />
                ))}
              </div>
            )}

            {layout === "grid" && (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {paginated.items.map((photo) => (
                  <PhotoCardItem
                    key={photo.id}
                    photo={photo}
                    aspectRatio="aspect-[4/3]"
                    onOpenLightbox={() => setLightboxPhoto(photo)}
                  />
                ))}
              </div>
            )}

            {layout === "cinematic" && (
              <div className="grid gap-8 md:grid-cols-2">
                {paginated.items.map((photo) => (
                  <PhotoCardItem
                    key={photo.id}
                    photo={photo}
                    aspectRatio="aspect-[16/10]"
                    isCinematic
                    onOpenLightbox={() => setLightboxPhoto(photo)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-12 rounded border border-dashed border-border py-20 text-center bg-card/30">
            <p className="font-display text-xl text-foreground font-light">No photographs matched your criteria.</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Try adjusting your search query, selecting a different category, or resetting all filters.
            </p>
            <button
              onClick={() => {
                setCategory("All");
                setSelectedTag("All");
                setSearch("");
              }}
              className="mt-6 rounded border border-foreground/30 px-5 py-2 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {paginated.totalPages > 1 && (
          <div className="mt-14 border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* Previous button */}
            <Button
              variant="outline"
              size="sm"
              disabled={!paginated.hasPrevPage}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 200, behavior: "smooth" });
              }}
              className="w-full sm:w-auto text-xs gap-1.5"
            >
              <ChevronLeft className="size-4" /> Previous Page
            </Button>

            {/* Numeric Page Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {paginationRange.map((p, i) => {
                if (p === "...") {
                  return (
                    <span key={`ellipsis-${i}`} className="px-2 text-xs text-muted-foreground">
                      …
                    </span>
                  );
                }
                const pageNum = Number(p);
                const isCurrent = pageNum === paginated.page;
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => {
                      setPage(pageNum);
                      window.scrollTo({ top: 200, behavior: "smooth" });
                    }}
                    className={cn(
                      "h-8 min-w-8 rounded border px-2.5 text-xs font-mono transition-colors",
                      isCurrent
                        ? "border-accent bg-accent text-accent-foreground font-bold shadow-xs"
                        : "border-border bg-card text-foreground hover:border-accent/60",
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <Button
              variant="outline"
              size="sm"
              disabled={!paginated.hasNextPage}
              onClick={() => {
                setPage((p) => Math.min(paginated.totalPages, p + 1));
                window.scrollTo({ top: 200, behavior: "smooth" });
              }}
              className="w-full sm:w-auto text-xs gap-1.5"
            >
              Next Page <ChevronRight className="size-4" />
            </Button>
          </div>
        )}

        {/* Consultation Callout Footer */}
        <div className="mt-20 rounded border border-border bg-card/40 p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <Badge variant="outline" className="text-[10px] text-accent border-accent/40 mb-2">
              Atelier Commissions
            </Badge>
            <h3 className="font-display text-2xl sm:text-3xl text-foreground font-light">
              Commission bespoke architecture for your residence.
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl">
              From stone dry-laying to handcrafted fumed oak millwork, we manage complete turnkey
              interiors across Mumbai, Ahmedabad, Surat, and beyond.
            </p>
          </div>
          <Link
            to="/contact"
            hash="consultation"
            className="inline-flex items-center gap-2 rounded bg-foreground px-7 py-3.5 text-xs uppercase tracking-widest text-background font-medium hover:bg-accent hover:text-accent-foreground transition-colors shrink-0"
          >
            Book a Consultation <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* FULL-SCREEN HIGH-RES LIGHTBOX MODAL */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-6 backdrop-blur-xl animate-in fade-in"
          onClick={() => setLightboxPhoto(null)}
        >
          {/* Close & Nav buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxPhoto(null);
            }}
            className="absolute top-4 right-4 z-20 rounded-full bg-black/70 p-2.5 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="size-5" />
          </button>

          {/* Container */}
          <div
            className="relative max-w-6xl w-full max-h-[92vh] rounded-lg border border-white/15 bg-card overflow-hidden shadow-2xl flex flex-col lg:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left/Main: High-Res Image Display */}
            <div className="relative flex-1 bg-black/95 flex items-center justify-center p-4 min-h-[350px] lg:min-h-[580px]">
              <DriveImage
                src={lightboxPhoto.url}
                driveId={lightboxPhoto.id}
                fallbackUrls={[lightboxPhoto.thumbnailUrl, lightboxPhoto.driveViewUrl]}
                alt={lightboxPhoto.title}
                className="max-h-[80vh] max-w-full object-contain rounded-md shadow-2xl"
                wrapperClassName="flex items-center justify-center w-full h-full"
              />

              {/* Prev / Next on Image */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const idx = GOOGLE_DRIVE_PHOTOS.findIndex((p) => p.id === lightboxPhoto.id);
                  if (idx > 0) setLightboxPhoto(GOOGLE_DRIVE_PHOTOS[idx - 1]!);
                }}
                disabled={GOOGLE_DRIVE_PHOTOS.findIndex((p) => p.id === lightboxPhoto.id) === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white hover:bg-black disabled:opacity-30 transition-opacity"
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const idx = GOOGLE_DRIVE_PHOTOS.findIndex((p) => p.id === lightboxPhoto.id);
                  if (idx !== -1 && idx < GOOGLE_DRIVE_PHOTOS.length - 1) {
                    setLightboxPhoto(GOOGLE_DRIVE_PHOTOS[idx + 1]!);
                  }
                }}
                disabled={
                  GOOGLE_DRIVE_PHOTOS.findIndex((p) => p.id === lightboxPhoto.id) ===
                  GOOGLE_DRIVE_PHOTOS.length - 1
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white hover:bg-black disabled:opacity-30 transition-opacity"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            {/* Right: Rich Architectural Details */}
            <div className="w-full lg:w-96 p-6 flex flex-col justify-between space-y-5 bg-card border-t lg:border-t-0 lg:border-l border-border overflow-y-auto max-h-[40vh] lg:max-h-[88vh]">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] text-accent border-accent/40">
                    {lightboxPhoto.category}
                  </Badge>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    Photo {lightboxPhoto.index} / {GOOGLE_DRIVE_PHOTOS.length}
                  </span>
                </div>

                <h2 className="mt-3 font-display text-xl sm:text-2xl font-normal text-foreground leading-snug">
                  {lightboxPhoto.title}
                </h2>

                <p className="text-xs text-accent font-medium mt-1">
                  {lightboxPhoto.projectTitle} · {lightboxPhoto.location}
                </p>

                <div className="mt-4 border-t border-border/70 pt-4 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lightboxPhoto.caption}
                  </p>

                  <div className="space-y-2 pt-2 text-[11px] text-muted-foreground font-mono">
                    <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                      <span>Space Typology:</span>
                      <span className="text-foreground">{lightboxPhoto.category}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                      <span>Project Code:</span>
                      <span className="text-foreground">{lightboxPhoto.projectCode}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                      <span>Studio Practice:</span>
                      <span className="text-foreground">Right Angle Design Studio</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-3">
                    {lightboxPhoto.tags
                      .filter((t) => !t.toLowerCase().includes("drive"))
                      .map((t) => (
                        <span
                          key={t}
                          className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Studio Commission & Case Study */}
              <div className="space-y-2 border-t border-border pt-4">
                <Link
                  to="/contact"
                  hash="consultation"
                  className="w-full inline-flex items-center justify-center gap-2 rounded bg-foreground px-4 py-2.5 text-xs text-background uppercase tracking-widest font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Sparkles className="size-3.5" />
                  <span>Enquire for Your Space</span>
                </Link>

                <Link
                  to="/portfolio"
                  className="w-full inline-flex items-center justify-center gap-2 rounded border border-border bg-card px-4 py-2.5 text-xs text-foreground hover:border-accent hover:text-accent transition-colors"
                >
                  <span>Explore Atelier Portfolio</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </PublicShell>
  );
}

function PhotoCardItem({
  photo,
  aspectRatio,
  isCinematic = false,
  onOpenLightbox,
}: {
  photo: GoogleDrivePhoto;
  aspectRatio?: string;
  isCinematic?: boolean;
  onOpenLightbox: () => void;
}) {
  return (
    <div className="group relative rounded border border-border/80 bg-card overflow-hidden transition-all duration-300 hover:border-accent/80 hover:shadow-xl break-inside-avoid mb-6">
      {/* Image Preview with Dynamic Box Sizing */}
      <div
        onClick={onOpenLightbox}
        className={cn(
          "relative overflow-hidden cursor-pointer",
          aspectRatio ? aspectRatio : "w-full",
        )}
      >
        <DriveImage
          src={photo.url || photo.thumbnailUrl}
          driveId={photo.id}
          fallbackUrls={[photo.thumbnailUrl, photo.driveViewUrl]}
          alt={photo.title}
          autoAspect={!aspectRatio}
          className={cn(
            "w-full transition-transform duration-700 ease-out group-hover:scale-105",
            aspectRatio ? "size-full object-cover" : "h-auto w-full object-cover block",
          )}
          wrapperClassName="w-full"
        />
        {/* Subtle dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="rounded bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] text-white font-medium">
            {photo.category}
          </span>
          <span className="rounded bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono text-white/80">
            #{photo.index}
          </span>
        </div>

        {/* Center Hover Action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="rounded bg-black/75 backdrop-blur-md px-3.5 py-1.5 text-xs text-white flex items-center gap-1.5 border border-white/20 shadow-lg">
            <Eye className="size-3.5 text-accent" /> Inspect Photo
          </span>
        </div>

        {/* Bottom Details on Image */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="font-display text-sm font-medium leading-snug line-clamp-1">{photo.title}</p>
          <p className="text-[11px] text-white/75 mt-0.5">
            {photo.projectTitle} · {photo.location}
          </p>
        </div>
      </div>

      {/* Card Details Footer */}
      <div className="p-3.5 space-y-2.5 text-xs bg-card">
        <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
          {photo.caption}
        </p>

        <div className="flex flex-wrap gap-1 pt-1">
          {photo.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action cue */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
          <button
            onClick={onOpenLightbox}
            className="text-accent hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>Inspect Spatial View</span>
          </button>
          <span className="font-mono text-[10px] text-muted-foreground uppercase">
            {photo.projectCode}
          </span>
        </div>
      </div>
    </div>
  );
}

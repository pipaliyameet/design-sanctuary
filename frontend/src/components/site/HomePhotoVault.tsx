import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  ArrowRight,
  Maximize2,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import {
  GOOGLE_DRIVE_PHOTOS,
  PHOTO_CATEGORIES,
  PUBLIC_DRIVE_FOLDER_URL,
  deduplicatePhotos,
  type GoogleDrivePhoto,
} from "@/lib/google-drive-photos";
import { publicService } from "@/services/public.service";
import { DriveImage } from "./DriveImage";
import { PhotoLightboxModal } from "./PhotoLightboxModal";
import { cn } from "@/lib/utils";

export function HomePhotoVault() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<GoogleDrivePhoto | null>(null);
  const pageSize = 8;

  const { data: homepageMedia } = useQuery({
    queryKey: ["homepage-media"],
    queryFn: async () => {
      try {
        const res: any = await publicService.getHomepageMedia();
        const payload = res?.data || res;
        if (Array.isArray(payload) && payload.length > 0) {
          const distinctPayload = deduplicatePhotos(payload);
          return distinctPayload.map((p: any, idx: number) => ({
            id: p.id || p._id || `drive_${p.driveFileId || idx}`,
            index: p.homepageOrder ?? idx + 1,
            fileName: p.fileName || `Photo #${idx + 1}`,
            title: p.title || p.caption || "Architectural Work",
            caption: p.caption || p.title || "",
            category: p.category || "Living & Salon",
            projectId: p.projectId || "altamount-penthouse",
            projectTitle: p.projectTitle || p.project_title || "The Altamount Penthouse",
            projectCode: "RA-ARC",
            location: p.location || "Mumbai",
            url: p.url || (p.driveFileId ? `https://lh3.googleusercontent.com/d/${p.driveFileId}` : ""),
            thumbnailUrl: p.thumbnailUrl || p.thumbnail_url || p.url,
            driveViewUrl: p.driveFileId ? `https://drive.google.com/file/d/${p.driveFileId}/view` : PUBLIC_DRIVE_FOLDER_URL,
            tags: p.tags || ["Google Drive Vault"],
          }));
        }
      } catch (err) {
        // Graceful fallback
      }
      return GOOGLE_DRIVE_PHOTOS;
    },
    staleTime: 5_000,
  });

  const allPhotos = useMemo(() => {
    if (homepageMedia && Array.isArray(homepageMedia) && homepageMedia.length > 0) {
      return deduplicatePhotos(homepageMedia);
    }
    return GOOGLE_DRIVE_PHOTOS;
  }, [homepageMedia]);

  // Filter photos by category
  const filteredPhotos = useMemo(() => {
    if (!selectedCategory || selectedCategory === "All") {
      return allPhotos;
    }
    return allPhotos.filter((p) => p.category === selectedCategory);
  }, [allPhotos, selectedCategory]);

  const totalPages = Math.ceil(filteredPhotos.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);

  const paginatedPhotos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPhotos.slice(start, start + pageSize);
  }, [filteredPhotos, currentPage, pageSize]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <section className="border-t border-border bg-card/30 py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* Header Strip */}
        <div className="flex flex-wrap items-end justify-between gap-6 pb-8 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-accent animate-pulse" />
              <p className="eyebrow">ARCHITECTURAL PHOTO VAULT</p>
            </div>
            <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground">
              Explore Architectural Works & Spatial Details
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-light max-w-xl">
              Click on any photograph to open the high-resolution lightbox viewer and inspect project
              specifications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded bg-foreground px-5 py-2.5 text-xs uppercase tracking-widest text-background font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <span>Explore All {allPhotos.length} Works</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="no-scrollbar overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-2 min-w-max pb-2">
              {PHOTO_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={cn(
                      "rounded border px-3.5 py-1.5 text-xs transition-all cursor-pointer",
                      active
                        ? "border-accent bg-accent/20 text-foreground font-semibold shadow-xs"
                        : "border-border bg-background/60 text-muted-foreground hover:text-foreground hover:border-border/90",
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
            <span>Showing {paginatedPhotos.length} of {filteredPhotos.length} photos</span>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {paginatedPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActiveLightboxPhoto(photo)}
              className="group relative rounded border border-border/80 bg-card overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-xl cursor-pointer"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <DriveImage
                  src={photo.url}
                  driveId={photo.id}
                  fallbackUrls={[photo.thumbnailUrl, photo.driveViewUrl]}
                  alt={photo.title}
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  wrapperClassName="size-full"
                />

                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="rounded bg-black/70 backdrop-blur-md px-2 py-0.5 text-[9px] text-white font-medium">
                    {photo.category}
                  </span>
                  <span className="rounded bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-mono text-white/80">
                    #{photo.index}
                  </span>
                </div>

                {/* Hover Click Zoom Cue */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1.5 rounded-full bg-black/80 backdrop-blur-md px-3 py-1.5 text-xs text-white shadow-lg">
                    <Maximize2 className="size-3.5 text-accent" />
                    <span>Open Photo</span>
                  </div>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3.5 space-y-1 bg-card">
                <h3 className="line-clamp-1 text-xs font-medium text-foreground group-hover:text-accent transition-colors">
                  {photo.title}
                </h3>
                <p className="line-clamp-1 text-[11px] text-muted-foreground">
                  {photo.projectTitle} · {photo.location}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <div className="text-xs text-muted-foreground">
              Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
                <span>Prev</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cn(
                    "size-8 rounded border text-xs font-medium transition-colors cursor-pointer",
                    currentPage === p
                      ? "border-accent bg-accent text-accent-foreground font-bold"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-1 rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      <PhotoLightboxModal
        photo={activeLightboxPhoto}
        photosList={filteredPhotos}
        isOpen={!!activeLightboxPhoto}
        onClose={() => setActiveLightboxPhoto(null)}
        onSelectPhoto={(photo) => setActiveLightboxPhoto(photo)}
      />
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Upload,
  Globe,
  Star,
  Check,
  Search,
  Filter,
  Eye,
  X,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Download,
} from "lucide-react";
import { getStudioMediaAssets, updateMediaPublishStatus } from "@/lib/studio-admin.functions";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
  shortDate,
} from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { type StudioMediaAsset } from "@/lib/studio-mock-data";
import { DriveImage } from "@/components/site/DriveImage";

export const Route = createFileRoute("/_authenticated/studio/media/")({
  component: MediaLibraryPage,
  head: () => ({
    meta: [
      { title: "Media Library & Visual Assets — Atelier Vermilion Studio" },
      {
        name: "description",
        content:
          "High-resolution architectural photography, 3D renders, before/after sliders, and website portfolio publishing.",
      },
    ],
  }),
});

const CATEGORIES = [
  { key: "all", label: "All Media" },
  { key: "3d_renders", label: "3D Renders" },
  { key: "final_photos", label: "Final Photography" },
  { key: "site_photos", label: "Site Photos" },
  { key: "before_after", label: "Before / After" },
  { key: "floor_plans", label: "Floor Plans" },
] as const;

function MediaLibraryPage() {
  const queryClient = useQueryClient();
  const fetchMedia = useServerFn(getStudioMediaAssets);
  const patchMedia = useServerFn(updateMediaPublishStatus);

  const {
    data: media,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["studio", "media"],
    queryFn: () => fetchMedia(),
  });

  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [selectedAsset, setSelectedAsset] = useState<StudioMediaAsset | null>(null);

  // Reset page on search or category filter change
  useEffect(() => {
    setPage(1);
  }, [category, search, limit]);

  const statusMutation = useMutation({
    mutationFn: (input: {
      id: string;
      visibility?: StudioMediaAsset["visibility"];
      is_featured?: boolean;
      is_cover?: boolean;
    }) => patchMedia({ data: input }),
    onSuccess: () => {
      toast.success("Media visibility updated.");
      queryClient.invalidateQueries({ queryKey: ["studio"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  const filteredMedia = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (media ?? []).filter((m) => {
      if (category !== "all" && m.category !== category) return false;
      if (!q) return true;
      return [m.title, m.project_title, m.room_name, ...(m.tags || [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [media, category, search]);

  const total = filteredMedia.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const validPage = Math.min(Math.max(1, page), totalPages);
  const paginatedMedia = useMemo(() => {
    const start = (validPage - 1) * limit;
    return filteredMedia.slice(start, start + limit);
  }, [filteredMedia, validPage, limit]);

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          eyebrow="Studio Asset Management"
          title={`Media Library & Vault (${filteredMedia.length})`}
        />
      </div>

      {/* Filter and Category Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`rounded border px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                  category === cat.key
                    ? "border-accent bg-accent/15 text-foreground font-medium"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by tag, room, project..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground h-8"
            >
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
              <option value={48}>48 / page</option>
            </select>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            Showing {total > 0 ? (validPage - 1) * limit + 1 : 0} –{" "}
            {Math.min(validPage * limit, total)} of {total} photos
          </span>
          <span className="font-mono text-[11px]">
            Page {validPage} of {totalPages}
          </span>
        </div>
      </div>

      {isLoading && <LoadingBlock label="Indexing media files & renders…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}


      {/* MASONRY / EDITORIAL MEDIA GRID */}
      {media && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedMedia.map((asset) => (
              <div
                key={asset.id}
                className="group relative rounded border border-border bg-card overflow-hidden flex flex-col transition-all hover:border-accent/60 shadow-xs"
              >
                {/* Image Preview Container */}
                <div
                  className="relative aspect-[4/3] overflow-hidden bg-muted cursor-pointer"
                  onClick={() => setSelectedAsset(asset)}
                >
                  <DriveImage
                    src={asset.url}
                    fallbackUrls={[asset.thumbnail_url]}
                    alt={asset.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    wrapperClassName="size-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none" />

                  {/* Badges on preview */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium">
                      {asset.category.replace(/_/g, " ")}
                    </span>
                    {asset.visibility === "website" && (
                      <span className="bg-accent/90 text-accent-foreground px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center gap-0.5">
                        <Globe className="h-2.5 w-2.5" /> Web
                      </span>
                    )}
                  </div>

                  {/* Quick inspect button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="rounded bg-black/60 backdrop-blur px-3 py-1 text-xs text-white flex items-center gap-1.5 border border-white/20">
                      <Eye className="h-3.5 w-3.5" /> Inspect Lightbox
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                    <p className="font-display font-medium text-xs leading-snug line-clamp-1">
                      {asset.title}
                    </p>
                    <p className="text-[10px] text-white/70">{asset.project_title}</p>
                  </div>
                </div>

                {/* Asset Details & Controls */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5 text-xs">
                  <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                    {asset.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0, 3).map((t: string) => (
                      <span
                        key={t}
                        className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Quick Toggle Website Publishing */}
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Public Website
                    </span>
                    <Button
                      size="sm"
                      variant={asset.visibility === "website" ? "default" : "outline"}
                      className="h-6 px-2 text-[10px]"
                      onClick={() =>
                        statusMutation.mutate({
                          id: asset.id,
                          visibility: asset.visibility === "website" ? "private" : "website",
                        })
                      }
                    >
                      {asset.visibility === "website" ? "Published" : "Publish"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={validPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-xs"
              >
                Previous
              </Button>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={`p-${pNum}`}
                    onClick={() => setPage(pNum)}
                    className={`h-7 w-7 rounded border text-xs font-mono transition-colors ${
                      pNum === validPage
                        ? "border-accent bg-accent text-accent-foreground font-bold"
                        : "border-border bg-card text-foreground hover:border-accent"
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={validPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="text-xs"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}


      {/* HIGH-RES LIGHTBOX MODAL */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl w-full rounded border border-white/20 bg-card overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedAsset(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="bg-black flex items-center justify-center p-4 min-h-[300px]">
                <DriveImage
                  src={selectedAsset.url}
                  fallbackUrls={[selectedAsset.thumbnail_url]}
                  alt={selectedAsset.title}
                  className="max-h-[70vh] w-full object-contain rounded"
                  wrapperClassName="w-full flex items-center justify-center"
                />
              </div>

              <div className="p-6 flex flex-col justify-between space-y-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {selectedAsset.category.replace(/_/g, " ")}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {selectedAsset.visibility}
                    </Badge>
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-normal text-foreground leading-tight">
                    {selectedAsset.title}
                  </h3>
                  <p className="text-sm text-accent mt-0.5">{selectedAsset.project_title}</p>

                  <div className="mt-4 space-y-2 border-t border-border pt-3">
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedAsset.description}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedAsset.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span>Uploaded by {selectedAsset.uploaded_by}</span>
                    <span>{shortDate(selectedAsset.upload_date)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={selectedAsset.visibility === "website" ? "default" : "outline"}
                      className="text-xs flex-1"
                      onClick={() => {
                        statusMutation.mutate({
                          id: selectedAsset.id,
                          visibility:
                            selectedAsset.visibility === "website" ? "private" : "website",
                        });
                        setSelectedAsset({
                          ...selectedAsset,
                          visibility:
                            selectedAsset.visibility === "website" ? "private" : "website",
                        });
                      }}
                    >
                      <Globe className="h-3.5 w-3.5 mr-1.5" />
                      {selectedAsset.visibility === "website"
                        ? "Live on Website"
                        : "Publish to Website"}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => toast.success("Asset set as primary project cover image.")}
                    >
                      Set Project Cover
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

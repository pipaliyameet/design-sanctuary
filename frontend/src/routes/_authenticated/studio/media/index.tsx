import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Trash2,
  Plus,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Link as LinkIcon,
  UploadCloud,
  Smartphone,
  HardDrive,
  FileImage,
} from "lucide-react";
import {
  getStudioMediaAssets,
  createStudioMedia,
  deleteStudioMediaAsset,
  updateStudioMedia,
} from "@/lib/studio-admin.functions";
import { mediaService } from "@/services/media.service";
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
import { DriveImage } from "@/components/site/DriveImage";
import { PHOTO_CATEGORIES, PUBLIC_DRIVE_FOLDER_URL } from "@/lib/google-drive-photos";

export const Route = createFileRoute("/_authenticated/studio/media/")({
  component: MediaLibraryPage,
  head: () => ({
    meta: [
      { title: "Owner Media & Drive Management — Right Angle Design Studio" },
      {
        name: "description",
        content:
          "Manage architectural photography, Google Drive sync, and instant customer website publishing.",
      },
    ],
  }),
});

const CATEGORIES = [
  { key: "all", label: "All Works" },
  { key: "Living & Salon", label: "Living & Salon" },
  { key: "Master Bedroom & Suites", label: "Master Bedroom" },
  { key: "Dining & Show Kitchen", label: "Dining & Kitchen" },
  { key: "Foyer & Architectural Joinery", label: "Foyer & Joinery" },
  { key: "Courtyard & Terraces", label: "Courtyard & Terraces" },
  { key: "Bath & Spa Sanctuary", label: "Bath & Spa" },
  { key: "Bespoke Materials & Lighting", label: "Materials & Lighting" },
  { key: "3d_renders", label: "3D Renders" },
  { key: "final_photos", label: "Final Photography" },
] as const;

const POPULAR_PROJECTS = [
  { id: "altamount-penthouse", title: "The Altamount Penthouse (Mumbai)" },
  { id: "alibaug-coastal-villa", title: "Alibaug Coastal Villa (Alibaug)" },
  { id: "malabar-hill-residence", title: "Malabar Hill Residence (Mumbai)" },
  { id: "kothari-pavilions", title: "Kothari Pavilions (Lonavala)" },
  { id: "oberoi-penthouse", title: "The Oberoi Sea-Facing Duplex (Worli)" },
  { id: "studio-archive", title: "Studio Archive & Material Lab" },
];

export function MediaLibraryPage() {
  const queryClient = useQueryClient();

  const {
    data: media,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["studio", "media"],
    queryFn: () => getStudioMediaAssets(),
  });

  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  // Modals state
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<any | null>(null);

  // Upload Mode & Device File State
  const [uploadMode, setUploadMode] = useState<"device" | "drive">("device");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Photo Form State
  const [driveInput, setDriveInput] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoCategory, setPhotoCategory] = useState<string>("Living & Salon");
  const [photoProject, setPhotoProject] = useState<string>(POPULAR_PROJECTS[0]?.id || "altamount-penthouse");
  const [customProjectTitle, setCustomProjectTitle] = useState("");
  const [photoTags, setPhotoTags] = useState("Travertine, Minimalist, Handcrafted");
  const [publishToWebsite, setPublishToWebsite] = useState(true);
  const [featureOnHomepage, setFeatureOnHomepage] = useState(false);

  // Reset page on search or category filter change
  useEffect(() => {
    setPage(1);
  }, [category, search, limit]);

  const resetForm = () => {
    setSelectedFile(null);
    if (filePreview && filePreview.startsWith("blob:")) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview(null);
    setDriveInput("");
    setPhotoTitle("");
    setPhotoCaption("");
    setCustomProjectTitle("");
    setIsDragging(false);
  };

  const handleFileChange = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WEBP, HEIC, etc.).");
      return;
    }
    if (filePreview && filePreview.startsWith("blob:")) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));

    // Auto-derive clean title if currently empty
    if (!photoTitle.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setPhotoTitle(cleanName);
    }
  };

  // Derived Google Drive Preview File ID from link or input
  const extractedDriveFileId = useMemo(() => {
    if (!driveInput) return "";
    const str = driveInput.trim();
    const match =
      str.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
      str.match(/id=([a-zA-Z0-9_-]+)/) ||
      str.match(/folders\/([a-zA-Z0-9_-]+)/) ||
      str.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
    if (!str.startsWith("http") && str.length > 10) return str;
    return "";
  }, [driveInput]);

  const previewThumbnailUrl = useMemo(() => {
    if (extractedDriveFileId) {
      return `https://drive.google.com/thumbnail?id=${extractedDriveFileId}&sz=w800`;
    }
    if (driveInput.startsWith("http")) {
      return driveInput;
    }
    return "";
  }, [extractedDriveFileId, driveInput]);

  // Mutation to Upload Device Photo to Google Drive
  const uploadDevicePhotoMutation = useMutation({
    mutationFn: async (payload: { file: File; metadata: any }) => {
      return mediaService.upload(payload.file, payload.metadata);
    },
    onSuccess: () => {
      toast.success("Photo uploaded to Google Drive & synchronized with customer website!");
      setIsAddModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["studio", "media"] });
      queryClient.invalidateQueries({ queryKey: ["public-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["home-content"] });
      queryClient.invalidateQueries({ queryKey: ["public"] });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to upload photo to Google Drive.");
    },
  });

  // Mutation to Add Photo via Google Drive link
  const addPhotoMutation = useMutation({
    mutationFn: async (payload: any) => {
      return createStudioMedia({ data: payload });
    },
    onSuccess: () => {
      toast.success("Photo registered successfully! Synchronized to customer website.");
      setIsAddModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["studio", "media"] });
      queryClient.invalidateQueries({ queryKey: ["public-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["home-content"] });
      queryClient.invalidateQueries({ queryKey: ["public"] });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to add photo. Please verify the Drive link.");
    },
  });

  // Mutation to Delete Photo
  const deletePhotoMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteStudioMediaAsset({ data: { id } });
    },
    onSuccess: () => {
      toast.success("Photo deleted from library and customer website.");
      setAssetToDelete(null);
      if (selectedAsset) setSelectedAsset(null);
      queryClient.invalidateQueries({ queryKey: ["studio", "media"] });
      queryClient.invalidateQueries({ queryKey: ["public-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["home-content"] });
      queryClient.invalidateQueries({ queryKey: ["public"] });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete photo.");
    },
  });

  // Mutation to Update Visibility
  const statusMutation = useMutation({
    mutationFn: (input: {
      id: string;
      visibility?: string;
      isFeatured?: boolean;
      isCover?: boolean;
    }) => updateStudioMedia({ data: input }),
    onSuccess: () => {
      toast.success("Media visibility updated.");
      queryClient.invalidateQueries({ queryKey: ["studio", "media"] });
      queryClient.invalidateQueries({ queryKey: ["public-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["home-content"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedProjObj = POPULAR_PROJECTS.find((p) => p.id === photoProject);
    const projTitle = customProjectTitle.trim() || selectedProjObj?.title.split(" (")[0] || "The Altamount Penthouse";

    if (uploadMode === "device") {
      if (!selectedFile) {
        toast.error("Please choose or drop an image file from your device or gallery.");
        return;
      }
      uploadDevicePhotoMutation.mutate({
        file: selectedFile,
        metadata: {
          title: photoTitle.trim() || selectedFile.name,
          caption: photoCaption.trim() || photoTitle.trim() || selectedFile.name,
          alt: photoCaption.trim() || photoTitle.trim() || selectedFile.name,
          category: photoCategory,
          projectId: photoProject,
          projectTitle: projTitle,
          tags: photoTags.split(",").map((t) => t.trim()).filter(Boolean),
          visibility: publishToWebsite ? "website" : "internal",
          isFeatured: featureOnHomepage,
        },
      });
    } else {
      if (!driveInput.trim()) {
        toast.error("Please enter a Google Drive link, File ID, or Image URL.");
        return;
      }
      addPhotoMutation.mutate({
        driveLink: driveInput.trim(),
        driveFileId: extractedDriveFileId,
        url: driveInput.startsWith("http") && !extractedDriveFileId ? driveInput : undefined,
        title: photoTitle.trim() || "Bespoke Architectural Work",
        caption: photoCaption.trim() || photoTitle.trim() || "Architectural Photograph",
        alt: photoCaption.trim() || photoTitle.trim(),
        category: photoCategory,
        projectId: photoProject,
        projectTitle: projTitle,
        tags: photoTags.split(",").map((t) => t.trim()).filter(Boolean),
        visibility: publishToWebsite ? "website" : "internal",
        isFeatured: featureOnHomepage,
      });
    }
  };

  const filteredMedia = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (media ?? []).filter((m: any) => {
      if (category !== "all" && m.category !== category) return false;
      if (!q) return true;
      return [m.title, m.project_title, m.caption, m.description, ...(m.tags || [])]
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
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              OWNER COMMAND CENTER • LIVE DRIVE SYNC
            </span>
          </div>
          <PageTitle
            eyebrow="Architectural Visual Assets"
            title={`Owner Photo Vault & Media (${filteredMedia.length})`}
          />
          <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
            Add, categorize, and delete photographs directly via Google Drive. Any change here
            immediately synchronizes with the customer-facing Photo Gallery and Homepage.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5 shadow-sm font-medium text-xs h-9 px-4 cursor-pointer"
          >
            <Upload className="size-4" />
            <span>Upload Photo to Drive</span>
          </Button>

          <Link
            to="/gallery"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded border border-border bg-card px-3.5 py-2 text-xs text-foreground font-medium hover:border-accent hover:text-accent transition-colors"
          >
            <Globe className="size-3.5" />
            <span>View Customer Gallery</span>
            <ExternalLink className="size-3 opacity-60" />
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 text-xs gap-1.5"
            title="Refresh vault data"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filter and Category Bar */}
      <div className="my-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Categories Pill Scroller */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`rounded border px-3 py-1 text-xs transition-colors cursor-pointer ${
                  category === cat.key
                    ? "border-accent bg-accent/20 text-foreground font-semibold"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search & Limit */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search photo, project, tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-card"
              />
            </div>

            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground h-8 cursor-pointer"
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

      {isLoading && <LoadingBlock label="Connecting to Google Drive vault & database…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {/* MASONRY / EDITORIAL MEDIA GRID */}
      {media && (
        <>
          {paginatedMedia.length === 0 ? (
            <div className="rounded border border-dashed border-border p-12 text-center my-8">
              <ImageIcon className="mx-auto size-10 text-muted-foreground/50 mb-3" />
              <h3 className="font-display text-lg text-foreground">No photographs found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                No photos match the selected category or search filter. Add a new photograph from
                Google Drive or clear your search.
              </p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 bg-accent text-accent-foreground text-xs"
              >
                <Plus className="size-3.5 mr-1" /> Add Photo Now
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedMedia.map((asset: any) => (
                <div
                  key={asset.id || asset._id}
                  className="group relative rounded border border-border bg-card overflow-hidden flex flex-col transition-all hover:border-accent/60 shadow-xs hover:shadow-md"
                >
                  {/* Image Preview Container */}
                  <div
                    className="relative aspect-[4/3] overflow-hidden bg-muted cursor-pointer"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <DriveImage
                      src={asset.url}
                      fallbackUrls={[asset.thumbnail_url, asset.thumbnailUrl]}
                      alt={asset.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      wrapperClassName="size-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none" />

                    {/* Badges on preview */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium">
                        {asset.category.replace(/_/g, " ")}
                      </span>

                      <div className="flex items-center gap-1">
                        {asset.visibility === "website" ? (
                          <span className="bg-emerald-600/90 text-white px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center gap-0.5 backdrop-blur-sm">
                            <Globe className="h-2.5 w-2.5" /> Live
                          </span>
                        ) : (
                          <span className="bg-zinc-700/90 text-white px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center gap-0.5 backdrop-blur-sm">
                            Private
                          </span>
                        )}
                        {asset.isFeatured && (
                          <span className="bg-amber-500/90 text-black px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5 fill-current" /> Home
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hover action overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="rounded bg-black/70 backdrop-blur px-2.5 py-1 text-xs text-white flex items-center gap-1 border border-white/20">
                        <Eye className="h-3.5 w-3.5" /> Inspect
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <p className="font-display font-medium text-xs leading-snug line-clamp-1">
                        {asset.title}
                      </p>
                      <p className="text-[10px] text-white/70">{asset.project_title}</p>
                    </div>
                  </div>

                  {/* Asset Details & Owner Controls */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5 text-xs">
                    <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                      {asset.description || asset.caption || "No description provided."}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {(asset.tags || []).slice(0, 3).map((t: string) => (
                        <span
                          key={t}
                          className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Action Bar: Toggle Publish & Delete */}
                    <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant={asset.visibility === "website" ? "default" : "outline"}
                        className="h-7 px-2 text-[10px] flex-1 cursor-pointer"
                        onClick={() =>
                          statusMutation.mutate({
                            id: asset.id || asset._id,
                            visibility: asset.visibility === "website" ? "private" : "website",
                          })
                        }
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        {asset.visibility === "website" ? "Live on Web" : "Publish to Web"}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAssetToDelete(asset)}
                        className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        title="Delete photo from drive library and customer website"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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
                    className={`h-7 w-7 rounded border text-xs font-mono transition-colors cursor-pointer ${
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

      {/* ========================================================================= */}
      {/* 1. ADD / UPLOAD PHOTO TO GOOGLE DRIVE MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-2xl w-full rounded-lg border border-border bg-card shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                  <UploadCloud className="size-4" />
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg text-foreground">
                    Add & Upload Photo to Google Drive
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Store high-res photographs in Drive & instantly publish to website
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(false);
                }}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Source Mode Tab Bar */}
            <div className="flex border-b border-border bg-muted/20 px-4 pt-2">
              <button
                type="button"
                onClick={() => setUploadMode("device")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                  uploadMode === "device"
                    ? "border-accent text-accent font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Smartphone className="size-3.5" />
                <span>Upload from Device / Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadMode("drive")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                  uploadMode === "drive"
                    ? "border-accent text-accent font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <LinkIcon className="size-3.5" />
                <span>Import from Google Drive Link</span>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* TAB 1: DEVICE / GALLERY UPLOAD */}
              {uploadMode === "device" && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                  />

                  {!selectedFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files?.[0]) {
                          handleFileChange(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`rounded-lg border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-accent bg-accent/10 scale-[0.99]"
                          : "border-border/80 bg-muted/20 hover:border-accent/60 hover:bg-muted/40"
                      }`}
                    >
                      <div className="size-12 rounded-full bg-accent/15 text-accent mx-auto flex items-center justify-center mb-3">
                        <UploadCloud className="size-6" />
                      </div>
                      <p className="font-medium text-xs text-foreground">
                        Drag and drop photograph here, or <span className="text-accent underline">browse device</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Select from your computer, phone gallery, or camera (JPG, PNG, WEBP, HEIC up to 100MB)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3 text-xs gap-1.5 pointer-events-none"
                      >
                        <Smartphone className="size-3.5" />
                        <span>Choose Photo from Device</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {filePreview && (
                          <div className="relative size-16 rounded overflow-hidden bg-black/40 shrink-0 border border-border">
                            <img
                              src={filePreview}
                              alt="Selected upload"
                              className="size-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-xs text-foreground truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {(selectedFile.size / 1024).toFixed(1)} KB • Ready to store in Drive
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-medium mt-1">
                            <CheckCircle2 className="size-3" /> Selected from device gallery
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-7 px-2.5 text-[11px]"
                        >
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            if (filePreview) URL.revokeObjectURL(filePreview);
                            setFilePreview(null);
                          }}
                          className="h-7 px-2 text-destructive hover:bg-destructive/10"
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: GOOGLE DRIVE LINK IMPORT */}
              {uploadMode === "drive" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center justify-between">
                      <span>Google Drive Link or File ID *</span>
                      <button
                        type="button"
                        onClick={() => {
                          setDriveInput("https://drive.google.com/file/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE/view");
                          setPhotoTitle("Altamount Penthouse — Marble Salon");
                          setPhotoCaption("Vein-cut travertine fireplace with low-slung linen sofa.");
                        }}
                        className="text-[11px] text-accent hover:underline cursor-pointer"
                      >
                        Paste Sample Link
                      </button>
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="e.g. https://drive.google.com/file/d/1RVz5DwORdVYsquHkOm97r8i1RvJGhi-Y/view"
                        value={driveInput}
                        onChange={(e) => setDriveInput(e.target.value)}
                        className="pl-9 text-xs bg-background"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Accepts share links (<code>https://drive.google.com/file/d/...</code>) or raw File IDs.
                    </p>
                  </div>

                  {/* Live Preview Box */}
                  {previewThumbnailUrl && (
                    <div className="rounded border border-border bg-muted/40 p-3 flex items-center gap-4">
                      <div className="relative size-16 rounded overflow-hidden bg-black/40 shrink-0 border border-border">
                        <DriveImage
                          src={previewThumbnailUrl}
                          alt="Drive preview"
                          className="size-full object-cover"
                          wrapperClassName="size-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-emerald-500 text-[11px] font-medium">
                          <CheckCircle2 className="size-3.5 shrink-0" />
                          <span>Drive asset detected & ready</span>
                        </div>
                        {extractedDriveFileId && (
                          <p className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">
                            File ID: {extractedDriveFileId}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Title & Category */}
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Photo Title / Space *</label>
                  <Input
                    placeholder="e.g. Master Suite & Acoustic Headboard"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    className="text-xs bg-background"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Category *</label>
                  <select
                    value={photoCategory}
                    onChange={(e) => setPhotoCategory(e.target.value)}
                    className="w-full rounded border border-border bg-background px-3 py-2 text-xs text-foreground cursor-pointer"
                  >
                    {PHOTO_CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Assigned Project</label>
                <select
                  value={photoProject}
                  onChange={(e) => setPhotoProject(e.target.value)}
                  className="w-full rounded border border-border bg-background px-3 py-2 text-xs text-foreground cursor-pointer"
                >
                  {POPULAR_PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                  <option value="custom">Other / Custom Project...</option>
                </select>
                {photoProject === "custom" && (
                  <Input
                    placeholder="Type custom project name..."
                    value={customProjectTitle}
                    onChange={(e) => setCustomProjectTitle(e.target.value)}
                    className="mt-2 text-xs bg-background"
                  />
                )}
              </div>

              {/* Caption / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Architectural Description / Caption
                </label>
                <Input
                  placeholder="e.g. Curved acoustic micro-cement niche with 2700K ambient illumination."
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="text-xs bg-background"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Tags (comma separated)
                </label>
                <Input
                  placeholder="Travertine, Smoked Oak, Minimalist, Master Bedroom"
                  value={photoTags}
                  onChange={(e) => setPhotoTags(e.target.value)}
                  className="text-xs bg-background"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-border space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishToWebsite}
                    onChange={(e) => setPublishToWebsite(e.target.checked)}
                    className="rounded border-border accent-accent size-4"
                  />
                  <div>
                    <span className="font-medium text-foreground">
                      Make Live on Customer Website
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Instantly appears in <code>/gallery</code> and public portfolio
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featureOnHomepage}
                    onChange={(e) => setFeatureOnHomepage(e.target.checked)}
                    className="rounded border-border accent-accent size-4"
                  />
                  <div>
                    <span className="font-medium text-foreground">
                      Feature on Homepage Photo Vault
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Pins this photo to the homepage featured strip
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsAddModalOpen(false);
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploadDevicePhotoMutation.isPending || addPhotoMutation.isPending}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs px-5 cursor-pointer gap-1.5"
                >
                  {uploadDevicePhotoMutation.isPending ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Uploading to Google Drive…</span>
                    </>
                  ) : addPhotoMutation.isPending ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Registering & Syncing…</span>
                    </>
                  ) : uploadMode === "device" ? (
                    <>
                      <UploadCloud className="size-3.5" />
                      <span>Upload to Drive & Publish</span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" />
                      <span>Add to Library & Publish</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-md w-full rounded border border-destructive/40 bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-base text-foreground">
                  Delete Photograph from Vault?
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to permanently delete this photo? It will immediately be
                  removed from the owner library and the public customer gallery.
                </p>
              </div>
            </div>

            {/* Photo preview thumbnail */}
            <div className="rounded border border-border bg-muted/40 p-2.5 flex items-center gap-3">
              <div className="size-14 rounded overflow-hidden bg-black shrink-0">
                <DriveImage
                  src={assetToDelete.url}
                  fallbackUrls={[assetToDelete.thumbnail_url, assetToDelete.thumbnailUrl]}
                  alt={assetToDelete.title}
                  className="size-full object-cover"
                  wrapperClassName="size-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{assetToDelete.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{assetToDelete.project_title}</p>
                <Badge variant="outline" className="text-[9px] mt-1">
                  {assetToDelete.category}
                </Badge>
              </div>
            </div>

            {/* Delete Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAssetToDelete(null)}
                disabled={deletePhotoMutation.isPending}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deletePhotoMutation.mutate(assetToDelete.id || assetToDelete._id)}
                disabled={deletePhotoMutation.isPending}
                className="text-xs gap-1.5 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>{deletePhotoMutation.isPending ? "Deleting…" : "Yes, Delete Photo"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HIGH-RES LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl w-full rounded border border-white/20 bg-card overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedAsset(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="bg-black flex items-center justify-center p-4 min-h-[300px]">
                <DriveImage
                  src={selectedAsset.url}
                  fallbackUrls={[selectedAsset.thumbnail_url, selectedAsset.thumbnailUrl]}
                  alt={selectedAsset.title}
                  className="max-h-[70vh] w-full object-contain rounded"
                  wrapperClassName="w-full flex items-center justify-center"
                />
              </div>

              <div className="p-6 flex flex-col justify-between space-y-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {selectedAsset.category?.replace(/_/g, " ")}
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
                      {selectedAsset.description || selectedAsset.caption || "No description."}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(selectedAsset.tags || []).map((tag: string) => (
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
                    <span>Uploaded by {selectedAsset.uploaded_by || "Owner"}</span>
                    <span>{shortDate(selectedAsset.upload_date || selectedAsset.createdAt)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={selectedAsset.visibility === "website" ? "default" : "outline"}
                      className="text-xs flex-1 cursor-pointer"
                      onClick={() => {
                        const newVis =
                          selectedAsset.visibility === "website" ? "private" : "website";
                        statusMutation.mutate({
                          id: selectedAsset.id || selectedAsset._id,
                          visibility: newVis,
                        });
                        setSelectedAsset({
                          ...selectedAsset,
                          visibility: newVis,
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
                      variant="destructive"
                      className="text-xs gap-1 cursor-pointer"
                      onClick={() => {
                        setAssetToDelete(selectedAsset);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
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

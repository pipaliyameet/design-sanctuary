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
  ArrowUpDown,
  MoveUp,
  MoveDown,
} from "lucide-react";
import {
  getStudioMediaAssets,
  createStudioMedia,
  deleteStudioMediaAsset,
  updateStudioMedia,
  uploadStudioMedia,
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
  { key: "all", label: "All Vault Photos (Google Drive)" },
  { key: "homepage", label: "⭐ Customer Screen (Live)" },
  { key: "Living & Salon", label: "Living & Salon" },
  { key: "Master Bedroom & Suites", label: "Master Bedroom" },
  { key: "Dining & Show Kitchen", label: "Dining & Kitchen" },
  { key: "Foyer & Architectural Joinery", label: "Foyer & Joinery" },
  { key: "Courtyard & Terraces", label: "Courtyard & Terraces" },
  { key: "Bath & Spa Sanctuary", label: "Bath & Spa" },
  { key: "Bespoke Materials & Lighting", label: "Materials & Lighting" },
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

  // Upload Mode & Multiple Device Files State
  const [uploadMode, setUploadMode] = useState<"device" | "drive">("device");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
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
  const [featureOnHomepage, setFeatureOnHomepage] = useState(true);
  const [homepageOrderInput, setHomepageOrderInput] = useState(1);

  // Reset page on search or category filter change
  useEffect(() => {
    setPage(1);
  }, [category, search, limit]);

  const resetForm = () => {
    setSelectedFiles([]);
    filePreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });
    setFilePreviews([]);
    setDriveInput("");
    setPhotoTitle("");
    setPhotoCaption("");
    setCustomProjectTitle("");
    setHomepageOrderInput(1);
    setIsDragging(false);
  };

  const handleFilesChange = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const filesArray = Array.from(filesList).filter((f) =>
      f.type.startsWith("image/") || f.type.startsWith("video/")
    );

    if (filesArray.length === 0) {
      toast.error("Please select valid image or video files (JPG, PNG, WEBP, MP4, etc.).");
      return;
    }

    // Clean up previous previews
    filePreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    setSelectedFiles(filesArray);
    const newPreviews = filesArray.map((f) => URL.createObjectURL(f));
    setFilePreviews(newPreviews);

    if (filesArray.length === 1 && !photoTitle.trim()) {
      const cleanName = filesArray[0].name
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

  // Mutation to Upload Device Photos to Google Drive
  const uploadDevicePhotosMutation = useMutation({
    mutationFn: async (payload: { files: File[]; metadata: any }) => {
      return uploadStudioMedia({
        data: {
          files: payload.files,
          ...payload.metadata,
        },
      });
    },
    onSuccess: () => {
      toast.success("Photos successfully stored in Google Drive vault & synced with website!");
      setIsAddModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["studio", "media"] });
      queryClient.invalidateQueries({ queryKey: ["public-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["home-content"] });
      queryClient.invalidateQueries({ queryKey: ["public"] });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to upload photos to Google Drive.");
    },
  });

  // Mutation to Add Photo via Google Drive link
  const addPhotoMutation = useMutation({
    mutationFn: async (payload: any) => {
      return createStudioMedia({ data: payload });
    },
    onSuccess: () => {
      toast.success("Photo registered successfully in vault & synced to website!");
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

  // Mutation to Delete Photo permanently
  const deletePhotoMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteStudioMediaAsset({ data: { id } });
    },
    onSuccess: () => {
      toast.success("Photo permanently removed from Google Drive and website.");
      setAssetToDelete(null);
      if (selectedAsset) setSelectedAsset(null);
      queryClient.invalidateQueries({ queryKey: ["studio", "media"] });
      queryClient.invalidateQueries({ queryKey: ["public-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["home-content"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-media"] });
      queryClient.invalidateQueries({ queryKey: ["public"] });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete photo.");
    },
  });

  // Mutation to Toggle Homepage Visibility
  const toggleHomepageMutation = useMutation({
    mutationFn: (input: { id: string; isHomepageVisible: boolean }) =>
      updateStudioMedia({
        data: {
          id: input.id,
          isHomepageVisible: input.isHomepageVisible,
        },
      }),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.isHomepageVisible
          ? "✓ Added to Homepage Presentation"
          : "○ Hidden from Homepage (Drive file preserved)"
      );
      queryClient.invalidateQueries({ queryKey: ["studio", "media"] });
      queryClient.invalidateQueries({ queryKey: ["home-content"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-media"] });
      queryClient.invalidateQueries({ queryKey: ["public-gallery"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  // Mutation to Update Order
  const updateOrderMutation = useMutation({
    mutationFn: (input: { id: string; homepageOrder: number }) =>
      updateStudioMedia({
        data: {
          id: input.id,
          homepageOrder: input.homepageOrder,
        },
      }),
    onSuccess: () => {
      toast.success("Homepage order saved.");
      queryClient.invalidateQueries({ queryKey: ["studio", "media"] });
      queryClient.invalidateQueries({ queryKey: ["home-content"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-media"] });
      queryClient.invalidateQueries({ queryKey: ["public-gallery"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Order update failed"),
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedProjObj = POPULAR_PROJECTS.find((p) => p.id === photoProject);
    const projTitle =
      customProjectTitle.trim() || selectedProjObj?.title.split(" (")[0] || "The Altamount Penthouse";

    if (uploadMode === "device") {
      if (selectedFiles.length === 0) {
        toast.error("Please choose or drop image files from your device.");
        return;
      }
      uploadDevicePhotosMutation.mutate({
        files: selectedFiles,
        metadata: {
          title: photoTitle.trim() || selectedFiles[0]?.name || "Architectural Work",
          caption: photoCaption.trim() || photoTitle.trim() || "Architectural View",
          alt: photoCaption.trim() || photoTitle.trim(),
          category: photoCategory,
          projectId: photoProject,
          projectTitle: projTitle,
          tags: photoTags.split(",").map((t) => t.trim()).filter(Boolean),
          visibility: publishToWebsite ? "website" : "internal",
          isHomepageVisible: featureOnHomepage,
          homepageOrder: homepageOrderInput,
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
        isHomepageVisible: featureOnHomepage,
        homepageOrder: homepageOrderInput,
      });
    }
  };

  const filteredMedia = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (media ?? []).filter((m: any) => {
      if (category === "homepage") {
        if (!m.isHomepageVisible) return false;
      } else if (category !== "all" && m.category !== category) {
        return false;
      }
      if (!q) return true;
      return [m.title, m.project_title, m.caption, m.description, ...(m.tags || [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [media, category, search]);

  const homepageCount = useMemo(() => {
    return (media ?? []).filter((m: any) => m.isHomepageVisible).length;
  }, [media]);

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
              OWNER COMMAND CENTER • GOOGLE DRIVE PERMANENT VAULT
            </span>
          </div>
          <PageTitle
            eyebrow="Architectural Visual Assets"
            title={`Owner Photo Vault & Media (${filteredMedia.length})`}
          />
          <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
            Upload and control photographs directly in Google Drive. Choose which photos appear on
            the public homepage without deleting original assets.
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
            <span>Upload Photos to Drive</span>
          </Button>

          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded border border-border bg-card px-3.5 py-2 text-xs text-foreground font-medium hover:border-accent hover:text-accent transition-colors"
          >
            <Globe className="size-3.5" />
            <span>View Public Homepage</span>
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

      {/* Target Drive Folder Banner */}
      <div className="mt-4 rounded border border-accent/30 bg-accent/5 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <FolderOpen className="size-4 text-accent shrink-0" />
          <div>
            <span className="font-medium text-foreground">Target Google Drive Storage Vault:</span>{" "}
            <span className="font-mono text-[11px] text-muted-foreground">
              Folder ID: 1ix9RDbXHK0JVqsxPyfxYL8M1bCdHdBze
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent font-semibold">
            {homepageCount} Live on Homepage
          </span>
          <a
            href="https://drive.google.com/drive/folders/1ix9RDbXHK0JVqsxPyfxYL8M1bCdHdBze"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-accent hover:underline flex items-center gap-1"
          >
            Open in Google Drive <ExternalLink className="size-3" />
          </a>
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
                {cat.key === "homepage" && (
                  <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.2 text-[9px] text-accent-foreground font-bold">
                    {homepageCount}
                  </span>
                )}
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
            <div className="rounded border border-dashed border-border p-12 text-center my-8 bg-card/40">
              <ImageIcon className="mx-auto size-10 text-muted-foreground/50 mb-3" />
              <h3 className="font-display text-lg text-foreground">No photographs found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                {category === "homepage"
                  ? "You have not selected any photos for the homepage yet. Switch to 'All Works' to choose photos for your homepage."
                  : "No photos match the selected category or search filter. Upload a new photo to Google Drive."}
              </p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 bg-accent text-accent-foreground text-xs"
              >
                <Plus className="size-3.5 mr-1" /> Add Photos to Vault
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedMedia.map((asset: any) => {
                const isHomepage = asset.isHomepageVisible;
                return (
                  <div
                    key={asset.id || asset._id}
                    className={`group relative rounded border bg-card overflow-hidden flex flex-col transition-all shadow-xs hover:shadow-md ${
                      isHomepage ? "border-accent/80 ring-1 ring-accent/30" : "border-border hover:border-border/80"
                    }`}
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

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
                        <span className="bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium">
                          {asset.category?.replace(/_/g, " ")}
                        </span>

                        <div className="flex items-center gap-1">
                          {isHomepage ? (
                            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shadow-xs font-mono">
                              <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                              <span>CUSTOMER SCREEN #{asset.homepageOrder ?? 1}</span>
                            </span>
                          ) : (
                            <span className="bg-black/70 text-zinc-300 px-1.5 py-0.5 rounded text-[9px] font-mono">
                              Drive Vault Only
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="rounded bg-black/75 backdrop-blur px-2.5 py-1 text-xs text-white flex items-center gap-1 border border-white/20">
                          <Eye className="h-3.5 w-3.5" /> Inspect Photo
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
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3 text-xs bg-card">
                      <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                        {asset.description || asset.caption || "Architectural photograph in Google Drive vault."}
                      </p>

                      {/* Customer Screen Position / Order Control */}
                      {isHomepage && (
                        <div className="rounded bg-accent/15 border border-accent/40 px-2.5 py-1.5 flex items-center justify-between text-[11px]">
                          <span className="text-foreground font-semibold flex items-center gap-1">
                            <ArrowUpDown className="size-3 text-accent" /> Customer Order:
                          </span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              max="999"
                              defaultValue={asset.homepageOrder ?? 1}
                              onBlur={(e) => {
                                const val = Number(e.target.value);
                                if (val > 0 && val !== asset.homepageOrder) {
                                  updateOrderMutation.mutate({
                                    id: asset.id || asset._id,
                                    homepageOrder: val,
                                  });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const val = Number((e.target as HTMLInputElement).value);
                                  if (val > 0) {
                                    updateOrderMutation.mutate({
                                      id: asset.id || asset._id,
                                      homepageOrder: val,
                                    });
                                  }
                                }
                              }}
                              className="w-12 rounded border border-border bg-background px-1.5 py-0.5 text-center text-xs font-mono font-bold text-foreground focus:border-accent"
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Bar: Toggle Customer Screen Visibility & Delete */}
                      <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant={isHomepage ? "default" : "outline"}
                          className={`h-8 px-2.5 text-xs flex-1 cursor-pointer font-medium transition-all ${
                            isHomepage
                              ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs"
                              : "border-border text-foreground hover:border-accent hover:bg-accent/10"
                          }`}
                          onClick={() =>
                            toggleHomepageMutation.mutate({
                              id: asset.id || asset._id,
                              isHomepageVisible: !isHomepage,
                            })
                          }
                          disabled={toggleHomepageMutation.isPending}
                        >
                          {isHomepage ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1 text-accent-foreground" />
                              <span>✓ On Customer Screen</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5 mr-1 text-accent" />
                              <span>+ Set for Customer Screen</span>
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAssetToDelete(asset)}
                          className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                          title="Delete photo permanently from Google Drive & database"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
      {/* 1. ADD / UPLOAD PHOTOS TO GOOGLE DRIVE MODAL */}
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
                    Upload Photos to Google Drive Vault
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Direct permanent cloud storage in folder <code>1ix9RDbXHK0JVqsxPyfxYL8M1bCdHdBze</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(false);
                }}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleAddSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Upload Mode Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-md bg-muted/60 border border-border">
                <button
                  type="button"
                  onClick={() => setUploadMode("device")}
                  className={`flex items-center justify-center gap-2 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                    uploadMode === "device"
                      ? "bg-card text-foreground shadow-xs font-semibold border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Smartphone className="size-3.5" />
                  <span>Upload Files from Device</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("drive")}
                  className={`flex items-center justify-center gap-2 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                    uploadMode === "drive"
                      ? "bg-card text-foreground shadow-xs font-semibold border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <HardDrive className="size-3.5" />
                  <span>Link Google Drive File ID</span>
                </button>
              </div>

              {/* Mode A: Device Multi-file Dropzone */}
              {uploadMode === "device" && (
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFilesChange(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/60 bg-muted/20"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => handleFilesChange(e.target.files)}
                      className="hidden"
                    />

                    <div className="flex flex-col items-center gap-2">
                      <div className="size-12 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                        <UploadCloud className="size-6" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          Click to select photos/videos or drag & drop here
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Select one or multiple high-res photographs (JPG, PNG, WEBP, MP4)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Previews Strip */}
                  {selectedFiles.length > 0 && (
                    <div className="rounded border border-border bg-muted/40 p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium text-foreground">
                        <span>Selected Files ({selectedFiles.length})</span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB total
                        </span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto pt-1">
                        {filePreviews.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded overflow-hidden border border-border bg-black"
                          >
                            <img src={url} alt="preview" className="size-full object-cover" />
                            <span className="absolute bottom-0.5 right-0.5 rounded bg-black/80 px-1 text-[8px] text-white font-mono">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mode B: Google Drive Link Input */}
              {uploadMode === "drive" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center justify-between">
                      <span>Google Drive Share URL or File ID *</span>
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="e.g. https://drive.google.com/file/d/1ix9RDbXHK0JVqsxPyfxYL8M1bCdHdBze/view"
                        value={driveInput}
                        onChange={(e) => setDriveInput(e.target.value)}
                        className="pl-9 text-xs bg-background"
                      />
                    </div>
                  </div>

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
                          <span>Google Drive asset verified</span>
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
                  <label className="text-xs font-medium text-foreground">Photo Title / Space Name</label>
                  <Input
                    placeholder="e.g. Master Suite & Acoustic Wall"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    className="text-xs bg-background"
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
                  placeholder="e.g. Honed silver travertine hearth with bespoke smoked oak wall paneling."
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

              {/* Homepage Visibility Toggles */}
              <div className="pt-2 border-t border-border space-y-3 bg-muted/20 p-3 rounded">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featureOnHomepage}
                    onChange={(e) => setFeatureOnHomepage(e.target.checked)}
                    className="rounded border-border accent-accent size-4"
                  />
                  <div>
                    <span className="font-medium text-foreground flex items-center gap-1.5 text-xs">
                      <Star className="size-3.5 text-accent fill-accent" />
                      Show on Public Homepage
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Presents this photo directly in the customer homepage portfolio & gallery
                    </p>
                  </div>
                </label>

                {featureOnHomepage && (
                  <div className="flex items-center gap-3 pt-1">
                    <label className="text-xs text-muted-foreground font-medium">
                      Homepage Display Order:
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={homepageOrderInput}
                      onChange={(e) => setHomepageOrderInput(Number(e.target.value))}
                      className="w-20 text-xs bg-background h-7"
                    />
                  </div>
                )}
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
                  disabled={uploadDevicePhotosMutation.isPending || addPhotoMutation.isPending}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs px-5 cursor-pointer gap-1.5 font-medium"
                >
                  {uploadDevicePhotosMutation.isPending ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Uploading to Google Drive…</span>
                    </>
                  ) : addPhotoMutation.isPending ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Saving to Vault…</span>
                    </>
                  ) : uploadMode === "device" ? (
                    <>
                      <UploadCloud className="size-3.5" />
                      <span>Upload to Drive ({selectedFiles.length || 1} Photo)</span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" />
                      <span>Add to Vault & Publish</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SAFETY CONFIRMATION DELETE MODAL */}
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
                  Delete Photograph Permanently?
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This will permanently delete the file from your Google Drive folder and remove the
                  photo from your website.
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
                {assetToDelete.isHomepageVisible && (
                  <Badge variant="outline" className="text-[9px] mt-1 border-accent/50 text-accent">
                    Live on Homepage
                  </Badge>
                )}
              </div>
            </div>

            {/* Delete Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAssetToDelete(null)}
                disabled={deletePhotoMutation.isPending}
                className="text-xs cursor-pointer"
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
                <span>{deletePhotoMutation.isPending ? "Deleting from Drive…" : "Delete"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HIGH-RES LIGHTBOX / INSPECTOR MODAL */}
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
                    {selectedAsset.isHomepageVisible ? (
                      <Badge className="text-[10px] bg-accent text-accent-foreground">
                        ★ Showing on Homepage
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        Hidden from Homepage
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-normal text-foreground leading-tight">
                    {selectedAsset.title}
                  </h3>
                  <p className="text-sm text-accent mt-0.5">{selectedAsset.project_title}</p>

                  <div className="mt-4 space-y-2 border-t border-border pt-3">
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedAsset.description || selectedAsset.caption || "No description provided."}
                    </p>
                    {selectedAsset.driveFileId && (
                      <p className="font-mono text-[10px] text-muted-foreground">
                        Google Drive File ID: {selectedAsset.driveFileId}
                      </p>
                    )}
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
                      variant={selectedAsset.isHomepageVisible ? "default" : "outline"}
                      className={`text-xs flex-1 cursor-pointer ${
                        selectedAsset.isHomepageVisible
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : ""
                      }`}
                      onClick={() => {
                        const newVis = !selectedAsset.isHomepageVisible;
                        toggleHomepageMutation.mutate({
                          id: selectedAsset.id || selectedAsset._id,
                          isHomepageVisible: newVis,
                        });
                        setSelectedAsset({
                          ...selectedAsset,
                          isHomepageVisible: newVis,
                        });
                      }}
                    >
                      <Star className="h-3.5 w-3.5 mr-1.5" />
                      {selectedAsset.isHomepageVisible
                        ? "✓ On Homepage (Click to Hide)"
                        : "+ Show on Homepage"}
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

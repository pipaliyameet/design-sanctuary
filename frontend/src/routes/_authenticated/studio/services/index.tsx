import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  Plus,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Layers,
  CheckCircle2,
  Image as ImageIcon,
  ArrowUpRight,
  LayoutGrid,
  List as ListIcon,
  X,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import {
  listStudioServices,
  createStudioService,
  updateStudioService,
  deleteStudioService,
} from "@/lib/studio-admin.functions";
import type { CmsServiceItem } from "@/services/cms.service";
import { DriveImage } from "@/components/site/DriveImage";
import { MediaPickerModal } from "@/components/studio/MediaPickerModal";
import {
  AppShell,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageTitle,
} from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/studio/services/")({
  component: ServicesControlPage,
  head: () => ({
    meta: [
      { title: "Services & Studio Disciplines Control — Right Angle Design Studio" },
      {
        name: "description",
        content:
          "Manage architectural disciplines, editorial descriptions, Google Drive showcase photography, and live customer publishing.",
      },
    ],
  }),
});

export function ServicesControlPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["studio", "services"],
    queryFn: () => listStudioServices(),
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "draft">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [editingService, setEditingService] = useState<CmsServiceItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<CmsServiceItem | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"create" | "edit" | null>(null);

  // Form State for Create / Edit
  const [formNumber, setFormNumber] = useState("01");
  const [formTitle, setFormTitle] = useState("");
  const [formShortDesc, setFormShortDesc] = useState("");
  const [formFullDesc, setFormFullDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formDriveFileId, setFormDriveFileId] = useState("");
  const [formLink, setFormLink] = useState("/services");
  const [formSortOrder, setFormSortOrder] = useState(1);
  const [formPublished, setFormPublished] = useState(true);
  const [deliverablesInput, setDeliverablesInput] = useState("");
  const [deliverablesList, setDeliverablesList] = useState<string[]>([]);

  // Mutation: Create Service
  const createMutation = useMutation({
    mutationFn: (payload: Partial<CmsServiceItem>) =>
      createStudioService({ data: payload }),
    onSuccess: () => {
      toast.success("Service discipline created and synced with live site.");
      setIsCreateModalOpen(false);
      resetForm();
      invalidateAllServiceQueries();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create service.");
    },
  });

  // Mutation: Update Service
  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; updates: Partial<CmsServiceItem> }) =>
      updateStudioService({ data: payload }),
    onSuccess: () => {
      toast.success("Service updated and synced with customer website.");
      setEditingService(null);
      resetForm();
      invalidateAllServiceQueries();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update service.");
    },
  });

  // Mutation: Delete Service
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStudioService({ data: { id } }),
    onSuccess: () => {
      toast.success("Service discipline removed permanently.");
      setServiceToDelete(null);
      invalidateAllServiceQueries();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete service.");
    },
  });

  function invalidateAllServiceQueries() {
    queryClient.invalidateQueries({ queryKey: ["studio", "services"] });
    queryClient.invalidateQueries({ queryKey: ["cms", "services"] });
    queryClient.invalidateQueries({ queryKey: ["public-services"] });
    queryClient.invalidateQueries({ queryKey: ["home-content"] });
    queryClient.invalidateQueries({ queryKey: ["public"] });
    refetch();
  }

  const resetForm = () => {
    setFormNumber(String((data?.length ?? 0) + 1).padStart(2, "0"));
    setFormTitle("");
    setFormShortDesc("");
    setFormFullDesc("");
    setFormImage("");
    setFormDriveFileId("");
    setFormLink("/services");
    setFormSortOrder((data?.length ?? 0) + 1);
    setFormPublished(true);
    setDeliverablesInput("");
    setDeliverablesList([]);
    setPickerTarget(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (service: CmsServiceItem) => {
    setEditingService(service);
    setFormNumber(service.number || "01");
    setFormTitle(service.title || "");
    setFormShortDesc(service.shortDesc || "");
    setFormFullDesc(service.fullDesc || "");
    setFormImage(service.image || "");
    setFormDriveFileId(service.driveFileId || "");
    setFormLink(service.link || `/services#${service.title.toLowerCase().replace(/\s+/g, "-")}`);
    setFormSortOrder(service.sortOrder ?? 1);
    setFormPublished(service.published !== false);
    setDeliverablesList(service.deliverables || []);
    setDeliverablesInput("");
  };

  const handleAddDeliverable = () => {
    if (!deliverablesInput.trim()) return;
    const clean = deliverablesInput.trim();
    if (!deliverablesList.includes(clean)) {
      setDeliverablesList([...deliverablesList, clean]);
    }
    setDeliverablesInput("");
  };

  const handleRemoveDeliverable = (item: string) => {
    setDeliverablesList(deliverablesList.filter((d) => d !== item));
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Please enter a service title.");
      return;
    }

    const payload: Partial<CmsServiceItem> = {
      number: formNumber.trim(),
      title: formTitle.trim(),
      shortDesc: formShortDesc.trim(),
      fullDesc: formFullDesc.trim(),
      image: formImage.trim(),
      driveFileId: formDriveFileId.trim() || null,
      deliverables: deliverablesList,
      link: formLink.trim() || "/services",
      sortOrder: Number(formSortOrder) || 1,
      published: formPublished,
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, updates: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleTogglePublish = (service: CmsServiceItem) => {
    const nextState = !service.published;
    updateMutation.mutate({
      id: service.id,
      updates: { published: nextState },
    });
  };

  // Filtered Services List
  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((s) => {
      if (statusFilter === "live" && !s.published) return false;
      if (statusFilter === "draft" && s.published) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.number.toLowerCase().includes(q) ||
        s.shortDesc?.toLowerCase().includes(q) ||
        s.fullDesc?.toLowerCase().includes(q) ||
        s.deliverables?.some((d) => d.toLowerCase().includes(q))
      );
    });
  }, [data, search, statusFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    const list = data ?? [];
    const published = list.filter((s) => s.published).length;
    const totalDeliverables = list.reduce(
      (acc, s) => acc + (s.deliverables?.length || 0),
      0
    );
    const withDriveImage = list.filter((s) => s.image || s.driveFileId).length;
    return {
      total: list.length,
      published,
      totalDeliverables,
      withDriveImage,
    };
  }, [data]);

  return (
    <AppShell>
      {/* Top Page Header */}
      <PageTitle
        eyebrow="Studio Offerings & Disciplines"
        title={`Services Control & Architecture Manager (${filteredServices.length})`}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/services"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>View Customer Page</span>
            </Link>

            <Button
              onClick={openCreateModal}
              size="sm"
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Discipline</span>
            </Button>

            {/* View Switchers */}
            <div className="flex items-center rounded border border-border bg-card p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded p-1.5 transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded p-1.5 transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="List View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        }
      />

      {/* Stats Overview Banner */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
            Active Disciplines
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {stats.published}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Live on Site</span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
            Total Services
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {stats.total}
            </span>
            <span className="text-xs text-muted-foreground">Configured</span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
            Deliverables Tracked
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {stats.totalDeliverables}
            </span>
            <span className="text-xs text-muted-foreground">Specifications</span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
            Drive Imagery
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-accent sm:text-3xl">
              {stats.withDriveImage}
            </span>
            <span className="text-xs text-muted-foreground">Drive Photos</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search disciplines by title, number, deliverables, description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(val: any) => setStatusFilter(val)}
        >
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Disciplines ({data?.length ?? 0})</SelectItem>
            <SelectItem value="live">Live Only ({stats.published})</SelectItem>
            <SelectItem value="draft">Drafts Only ({stats.total - stats.published})</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-9 gap-1.5 text-xs cursor-pointer"
        >
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          <span>Refresh</span>
        </Button>
      </div>

      {isLoading && <LoadingBlock label="Loading studio disciplines & services…" />}
      {error && <ErrorBlock error={error} onRetry={() => refetch()} />}

      {data && filteredServices.length === 0 && (
        <EmptyState message="No studio services match your selected search or filter criteria." />
      )}

      {/* ========================================================================= */}
      {/* 1. GRID VIEW                                                              */}
      {/* ========================================================================= */}
      {viewMode === "grid" && filteredServices.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          {filteredServices.map((service, idx) => (
            <div
              key={service.id || idx}
              className={cn(
                "group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-xs hover:border-accent/60 transition-all duration-300",
                !service.published && "opacity-75 bg-muted/20"
              )}
            >
              {/* Photo Banner with Aspect Ratio */}
              <div className="relative aspect-[16/9] w-full bg-black/40 overflow-hidden border-b border-border">
                {service.image ? (
                  <DriveImage
                    src={service.image}
                    driveId={service.driveFileId || undefined}
                    alt={service.title}
                    className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    wrapperClassName="size-full"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-muted/40 text-muted-foreground text-xs">
                    <ImageIcon className="size-6 mb-1 opacity-50" />
                    <span>No image assigned</span>
                  </div>
                )}

                {/* Top Overlay Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="rounded bg-black/85 backdrop-blur-md px-2.5 py-1 text-xs font-mono font-bold text-white tracking-widest uppercase">
                    SERVICE {service.number}
                  </span>
                  <span className="rounded bg-accent/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono font-semibold text-accent-foreground tracking-wider uppercase">
                    ORDER #{service.sortOrder}
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {service.published ? (
                    <Badge className="bg-emerald-500 text-white font-medium text-[11px] gap-1 px-2.5 py-0.5 shadow-sm">
                      <span className="size-1.5 rounded-full bg-white animate-pulse" />
                      Live on Site
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-black/70 text-amber-300 border-amber-400/40 text-[11px] gap-1 px-2.5 py-0.5">
                      Draft / Hidden
                    </Badge>
                  )}
                </div>

                {/* Quick Photo Swap Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    openEditModal(service);
                    setPickerTarget("edit");
                    setIsMediaPickerOpen(true);
                  }}
                  className="absolute bottom-3 right-3 rounded-md bg-black/80 backdrop-blur-md px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="size-3.5 text-accent" />
                  <span>Change Drive Photo</span>
                </button>
              </div>

              {/* Service Details Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-display text-xl font-medium text-foreground tracking-tight leading-snug">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {service.shortDesc || service.fullDesc || "No description provided."}
                  </p>

                  {/* Deliverables Pills */}
                  {Array.isArray(service.deliverables) && service.deliverables.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/60">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                        Deliverables & Scope ({service.deliverables.length}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {service.deliverables.slice(0, 4).map((del, dIdx) => (
                          <span
                            key={dIdx}
                            className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[11px] text-foreground font-normal"
                          >
                            <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                            <span className="truncate max-w-[220px]">{del}</span>
                          </span>
                        ))}
                        {service.deliverables.length > 4 && (
                          <span className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground font-mono">
                            +{service.deliverables.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(service)}
                      className="h-8 text-xs gap-1.5 cursor-pointer"
                    >
                      {service.published ? (
                        <>
                          <EyeOff className="size-3.5 text-amber-500" />
                          <span>Unpublish</span>
                        </>
                      ) : (
                        <>
                          <Eye className="size-3.5 text-emerald-500" />
                          <span>Publish</span>
                        </>
                      )}
                    </Button>

                    <Link
                      to={service.link || "/services"}
                      target="_blank"
                      className="inline-flex items-center gap-1 h-8 rounded border border-border px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Preview section on public website"
                    >
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(service)}
                      className="h-8 text-xs gap-1.5 cursor-pointer hover:border-accent"
                    >
                      <Edit3 className="size-3.5 text-accent" />
                      <span>Edit Service</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setServiceToDelete(service)}
                      className="h-8 size-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      title="Delete Service"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LIST VIEW                                                              */}
      {/* ========================================================================= */}
      {viewMode === "list" && filteredServices.length > 0 && (
        <div className="space-y-3">
          {filteredServices.map((service, idx) => (
            <div
              key={service.id || idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card hover:border-accent/60 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="size-16 sm:size-20 rounded-md overflow-hidden bg-black shrink-0 border border-border relative">
                  <DriveImage
                    src={service.image}
                    driveId={service.driveFileId || undefined}
                    alt={service.title}
                    className="size-full object-cover"
                    wrapperClassName="size-full"
                  />
                  <span className="absolute top-1 left-1 rounded bg-black/85 px-1 py-0.5 text-[10px] font-mono font-bold text-white">
                    {service.number}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-base font-semibold text-foreground truncate">
                      {service.title}
                    </h4>
                    {service.published ? (
                      <span className="rounded-full bg-emerald-500/15 text-emerald-600 px-2 py-0.5 text-[10px] font-semibold">
                        Live
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-semibold">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1 max-w-xl">
                    {service.shortDesc || service.fullDesc}
                  </p>
                  <p className="mt-1 text-[11px] font-mono text-muted-foreground">
                    Order: {service.sortOrder} · Deliverables: {service.deliverables?.length || 0} items
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePublish(service)}
                  className="h-8 text-xs cursor-pointer"
                >
                  {service.published ? "Unpublish" : "Publish"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(service)}
                  className="h-8 text-xs gap-1.5 cursor-pointer"
                >
                  <Edit3 className="size-3.5 text-accent" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setServiceToDelete(service)}
                  className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CREATE / EDIT SERVICE MODAL                                            */}
      {/* ========================================================================= */}
      {(isCreateModalOpen || editingService) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-accent font-medium">
                  {editingService ? "Update Discipline" : "New Studio Offering"}
                </p>
                <h3 className="text-xl font-display font-medium text-foreground">
                  {editingService ? `Edit Service: ${editingService.title}` : "Add Architectural Service"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingService(null);
                }}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium block mb-1">
                    Number
                  </label>
                  <Input
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    placeholder="01"
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium block mb-1">
                    Service Title
                  </label>
                  <Input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Project Consultancy"
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Photo Selector with Live Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
                    Google Drive Showcase Photography
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPickerTarget(editingService ? "edit" : "create");
                      setIsMediaPickerOpen(true);
                    }}
                    className="h-7 text-[11px] gap-1 text-accent border-accent/40 hover:bg-accent/10 cursor-pointer"
                  >
                    <FolderOpen className="size-3" />
                    <span>Browse Google Drive Vault</span>
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-20 rounded-md overflow-hidden bg-black shrink-0 border border-border">
                    {formImage ? (
                      <DriveImage
                        src={formImage}
                        driveId={formDriveFileId || undefined}
                        alt="Preview"
                        className="size-full object-cover"
                        wrapperClassName="size-full"
                      />
                    ) : (
                      <div className="size-full flex flex-col items-center justify-center text-[10px] text-muted-foreground text-center p-1 bg-muted/30">
                        <ImageIcon className="size-4 mb-1" />
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <Input
                      value={formImage}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormImage(val);
                        const match = val.match(/(?:d\/|id=)([a-zA-Z0-9_-]{20,})/);
                        if (match?.[1]) setFormDriveFileId(match[1]);
                      }}
                      placeholder="Google Drive Image URL (https://lh3.googleusercontent.com/d/...)"
                      className="h-9 text-xs font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Use direct Google Edge URL or pick from the Drive Media Vault.
                    </p>
                  </div>
                </div>
              </div>

              {/* Short & Full Description */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium block mb-1">
                  Short Summary (Cards & Previews)
                </label>
                <Input
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="One sentence executive summary of the service discipline…"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium block mb-1">
                  Full Architectural Description
                </label>
                <textarea
                  value={formFullDesc}
                  onChange={(e) => setFormFullDesc(e.target.value)}
                  rows={3}
                  placeholder="Comprehensive description of process, methodology, and client advocacy…"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs text-foreground shadow-2xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* Deliverables Scope Editor */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium block mb-1">
                  Deliverables & Scope ({deliverablesList.length})
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={deliverablesInput}
                    onChange={(e) => setDeliverablesInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDeliverable();
                      }
                    }}
                    placeholder="Type deliverable and press Enter (e.g. Good For Construction (GFC) drawings)…"
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddDeliverable}
                    className="h-8 text-xs shrink-0 cursor-pointer"
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-muted/20 border border-border/50 rounded-md">
                  {deliverablesList.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground italic">
                      No deliverables added yet. Add key specifications above.
                    </span>
                  ) : (
                    deliverablesList.map((del, dIdx) => (
                      <span
                        key={dIdx}
                        className="inline-flex items-center gap-1 rounded bg-secondary px-2.5 py-1 text-xs text-foreground font-medium"
                      >
                        <span>{del}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDeliverable(del)}
                          className="hover:text-destructive cursor-pointer ml-1"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Settings: Link, Sort Order, Published Status */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium block mb-1">
                    Website Link Anchor
                  </label>
                  <Input
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="/services#discipline"
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium block mb-1">
                    Display Sort Order
                  </label>
                  <Input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value) || 1)}
                    className="h-9 text-xs"
                    min={1}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="publishedCheck"
                  checked={formPublished}
                  onChange={(e) => setFormPublished(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent cursor-pointer size-4"
                />
                <label
                  htmlFor="publishedCheck"
                  className="text-xs font-medium text-foreground cursor-pointer"
                >
                  Publish live to customer website (/services and homepage)
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingService(null);
                  }}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <Sparkles className="size-3.5" />
                  <span>
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving…"
                      : editingService
                      ? "Save Changes"
                      : "Create Discipline"}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MEDIA PICKER MODAL INTEGRATION                                         */}
      {/* ========================================================================= */}
      <MediaPickerModal
        open={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        title="Select Google Drive Photograph for Service Discipline"
        description="Choose a high-resolution architectural interior photo from the studio Google Drive archive."
        currentUrl={formImage}
        onSelectMedia={(photoUrl: string) => {
          setFormImage(photoUrl);
          const match = photoUrl.match(/(?:d\/|id=)([a-zA-Z0-9_-]{20,})/);
          if (match?.[1]) setFormDriveFileId(match[1]);
          setIsMediaPickerOpen(false);
        }}
      />

      {/* ========================================================================= */}
      {/* 5. DELETE CONFIRMATION MODAL                                              */}
      {/* ========================================================================= */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <Trash2 className="size-6" />
              <h3 className="font-display text-lg font-medium text-foreground">
                Delete Service Discipline?
              </h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                "{serviceToDelete.title}" (SERVICE {serviceToDelete.number})
              </strong>
              ? This discipline will be immediately removed from the customer website.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setServiceToDelete(null)}
                disabled={deleteMutation.isPending}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(serviceToDelete.id)}
                disabled={deleteMutation.isPending}
                className="text-xs cursor-pointer"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete Permanently"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

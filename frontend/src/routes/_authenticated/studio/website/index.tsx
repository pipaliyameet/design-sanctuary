import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  Edit3,
  Eye,
  Check,
  Save,
  Send,
  ExternalLink,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Layers,
  CheckCircle2,
  Undo,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Settings,
} from "lucide-react";
import {
  cmsService,
  type HomepageConfigData,
  type CmsCaseStudyItem,
  type CmsServiceItem,
  type CmsProcessItem,
  type CmsTestimonialItem,
} from "@/services/cms.service";
import { publicService } from "@/services/public.service";
import { GOOGLE_DRIVE_PHOTOS } from "@/lib/google-drive-photos";
import { AppShell, PageTitle } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DriveImage } from "@/components/site/DriveImage";
import { MediaPickerModal } from "@/components/studio/MediaPickerModal";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/studio/website/")({
  component: LiveVisualWebsiteEditor,
  head: () => ({
    meta: [
      { title: "Visual Website Control Center & Live Editor — Right Angle Design Studio" },
      {
        name: "description",
        content:
          "Visual control center to preview the real public website, click photos to replace them from Google Drive, edit text, and publish live.",
      },
    ],
  }),
});

type ViewportMode = "desktop" | "tablet" | "mobile";
type ActivePage = "home" | "portfolio" | "gallery" | "services" | "process" | "about" | "contact";

const DEFAULT_HERO_IMAGE =
  GOOGLE_DRIVE_PHOTOS[0]?.url ||
  "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE";

function LiveVisualWebsiteEditor() {
  const queryClient = useQueryClient();

  // Editor View State
  const [activePage, setActivePage] = useState<ActivePage>("home");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [editMode, setEditMode] = useState<boolean>(true);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState<boolean>(false);

  // Media Picker Dialog State
  const [mediaPickerOpen, setMediaPickerOpen] = useState<boolean>(false);
  const [activeSlotTarget, setActiveSlotTarget] = useState<{
    slotType: "hero" | "project_cover" | "project_hero" | "service" | "atmosphere";
    targetId?: string;
    title?: string;
  } | null>(null);

  // Text Edit Dialog State
  const [textEditorOpen, setTextEditorOpen] = useState<boolean>(false);
  const [activeTextSlot, setActiveTextSlot] = useState<{
    field: "heroTitle" | "heroSubtitle" | "ctaText";
    label: string;
    value: string;
  } | null>(null);

  // Queries
  const { data: homeData } = useQuery({
    queryKey: ["cms", "homepage"],
    queryFn: () => cmsService.getHomepage(),
  });

  const { data: projectsData } = useQuery({
    queryKey: ["cms", "projects"],
    queryFn: () => cmsService.listProjects(),
  });

  const { data: servicesData } = useQuery({
    queryKey: ["cms", "services"],
    queryFn: () => cmsService.listServices(),
  });

  const { data: processData } = useQuery({
    queryKey: ["cms", "process"],
    queryFn: () => cmsService.listProcess(),
  });

  const { data: testimonialsData } = useQuery({
    queryKey: ["cms", "testimonials"],
    queryFn: () => cmsService.listTestimonials(),
  });

  const { data: galleryMedia } = useQuery({
    queryKey: ["media", "public-gallery"],
    queryFn: () => publicService.getGallery({ limit: 8 }),
  });

  // Working Draft State for Real-Time Visual Feedback
  const [draftHome, setDraftHome] = useState<HomepageConfigData>({
    heroTitle: "Architecture & Interior Sanctuary",
    heroSubtitle:
      "Spaces shaped by light, material and everyday life. Bespoke residential, commercial and turnkey interiors across India.",
    heroImage: DEFAULT_HERO_IMAGE,
    ctaText: "Initiate a Commission",
    ctaLink: "/contact",
    featuredProjectSlugs: [],
    showServices: true,
    showProcess: true,
    showTestimonials: true,
    showJournal: true,
  });

  // Sync initial query into draft
  useEffect(() => {
    if (homeData) {
      setDraftHome({
        ...homeData,
        heroImage:
          homeData.heroImage && !homeData.heroImage.includes("1yKk6NqN3z5h4hL")
            ? homeData.heroImage
            : DEFAULT_HERO_IMAGE,
      });
    }
  }, [homeData]);

  // Mutations
  const publishMutation = useMutation({
    mutationFn: async () => {
      await cmsService.updateHomepage(draftHome);
    },
    onSuccess: () => {
      toast.success("All website changes published to live site successfully!");
      setHasUnpublishedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["cms"] });
      queryClient.invalidateQueries({ queryKey: ["public"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Publishing failed.");
    },
  });

  const updateCaseStudyCoverMutation = useMutation({
    mutationFn: async ({ id, photoUrl }: { id: string; photoUrl: string }) => {
      await cmsService.updateCaseStudy(id, { heroImage: photoUrl });
    },
    onSuccess: () => {
      toast.success("Project cover updated!");
      queryClient.invalidateQueries({ queryKey: ["cms", "projects"] });
      queryClient.invalidateQueries({ queryKey: ["public"] });
    },
  });

  // Handle Photo Picker Selection
  const handleSelectMedia = (photoUrl: string) => {
    if (!activeSlotTarget) return;

    if (activeSlotTarget.slotType === "hero") {
      setDraftHome((prev) => ({ ...prev, heroImage: photoUrl }));
      setHasUnpublishedChanges(true);
      toast.success("Homepage hero photo updated in draft! Click Publish Live when ready.");
    } else if (activeSlotTarget.slotType === "project_cover" && activeSlotTarget.targetId) {
      updateCaseStudyCoverMutation.mutate({
        id: activeSlotTarget.targetId,
        photoUrl,
      });
    }
  };

  // Handle Text Save
  const handleSaveText = () => {
    if (!activeTextSlot) return;
    setDraftHome((prev) => ({
      ...prev,
      [activeTextSlot.field]: activeTextSlot.value,
    }));
    setHasUnpublishedChanges(true);
    setTextEditorOpen(false);
    toast.success(`${activeTextSlot.label} updated in draft!`);
  };

  const caseStudies = projectsData?.caseStudies || [];
  const services = servicesData || [];
  const processSteps = processData || [];
  const testimonials = testimonialsData || [];

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Title & Live Action Header */}
        <PageTitle
          eyebrow="Right Angle Design Studio"
          title="Live Customer View Website Control Center"
          actions={
            <div className="flex items-center gap-2.5">
              {hasUnpublishedChanges ? (
                <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/40 animate-pulse bg-amber-500/10">
                  Unpublished Changes
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/40 bg-emerald-500/10">
                  Live & Synced
                </Badge>
              )}

              <Button
                size="sm"
                disabled={publishMutation.isPending || !hasUnpublishedChanges}
                onClick={() => publishMutation.mutate()}
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs tracking-wider uppercase font-semibold h-8"
              >
                <Send className="size-3 mr-1.5" />
                {publishMutation.isPending ? "Publishing…" : "Publish Live to Website"}
              </Button>

              <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                <a href="/" target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3.5 mr-1.5" /> Customer Site
                </a>
              </Button>
            </div>
          }
        />

        {/* Toolbar: Page Switcher, Device Viewport & Edit Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card shadow-xs">
          {/* Page Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {(
              [
                { id: "home", label: "Homepage" },
                { id: "portfolio", label: "Portfolio" },
                { id: "gallery", label: "Gallery" },
                { id: "services", label: "Services" },
                { id: "process", label: "Process" },
                { id: "about", label: "About" },
                { id: "contact", label: "Contact" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePage(p.id)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium rounded transition-colors ${
                  activePage === p.id
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Right Controls: Viewport & Edit Switch */}
          <div className="flex items-center gap-3">
            {/* Viewport Switcher */}
            <div className="flex items-center gap-1 bg-muted/40 border border-border/80 rounded p-0.5">
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
                  viewport === "desktop" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Monitor className="size-3.5" /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewport("tablet")}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
                  viewport === "tablet" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Tablet className="size-3.5" /> Tablet
              </button>
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
                  viewport === "mobile" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Smartphone className="size-3.5" /> Mobile
              </button>
            </div>

            {/* Edit Mode Toggle */}
            <button
              type="button"
              onClick={() => setEditMode(!editMode)}
              className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider font-medium flex items-center gap-1.5 border transition-all ${
                editMode
                  ? "bg-accent/15 border-accent text-accent font-semibold"
                  : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Edit3 className="size-3.5" />
              <span>{editMode ? "Edit Mode: Active" : "View Only"}</span>
            </button>
          </div>
        </div>

        {/* =====================================================================
            LIVE CUSTOMER VIEW CANVAS
            ===================================================================== */}
        <div className="border border-border/80 bg-stone-900/30 rounded-xl p-3 sm:p-6 flex justify-center min-h-[750px] overflow-hidden">
          <div
            className={`transition-all duration-300 bg-background text-foreground shadow-2xl border border-border/70 overflow-hidden relative ${
              viewport === "desktop"
                ? "w-full max-w-[1720px] rounded"
                : viewport === "tablet"
                  ? "w-[768px] rounded-lg my-2 border-2 border-border"
                  : "w-[390px] rounded-2xl my-2 border-4 border-foreground/20"
            }`}
          >
            {/* Simulated Public Header */}
            <header className="border-b border-border/60 bg-background px-6 py-4 flex items-center justify-between sticky top-0 z-30">
              <BrandLogo variant="horizontal" size="sm" />
              <nav className="hidden sm:flex items-center gap-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <span>Work</span>
                <span>Gallery</span>
                <span>Services</span>
                <span>Process</span>
                <span>About</span>
                <span>Contact</span>
              </nav>
              <Button size="sm" variant="outline" className="text-[11px] uppercase tracking-wider h-7 pointer-events-none">
                Book a Consultation
              </Button>
            </header>

            {/* ===================================================================
                PAGE: HOMEPAGE (/)
                =================================================================== */}
            {activePage === "home" && (
              <div className="space-y-16 sm:space-y-24 pb-20">
                {/* 1. HERO SECTION WITH CLICK-TO-EDIT PHOTO & TEXT */}
                <section className="relative min-h-[65vh] sm:min-h-[78vh] overflow-hidden flex flex-col justify-end p-6 sm:p-12 lg:p-16 border-b border-border bg-[#0f0e0d]">
                  {/* Hero Background Image */}
                  <DriveImage
                    src={draftHome.heroImage}
                    alt="Homepage Hero"
                    className="absolute inset-0 size-full object-cover brightness-[0.78]"
                    wrapperClassName="absolute inset-0 size-full"
                  />

                  {/* Dark subtle gradient for supreme text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                  {/* Edit Overlay for Hero Photo */}
                  {editMode && (
                    <div className="absolute top-6 right-6 z-20">
                      <Button
                        size="sm"
                        onClick={() => {
                          setActiveSlotTarget({
                            slotType: "hero",
                            title: "Homepage Hero Background Photo",
                          });
                          setMediaPickerOpen(true);
                        }}
                        className="bg-black/85 hover:bg-black text-white text-xs border border-white/25 shadow-xl backdrop-blur-md"
                      >
                        <ImageIcon className="size-3.5 mr-1.5 text-accent" /> Change Hero Photo
                      </Button>
                    </div>
                  )}

                  {/* Hero Content */}
                  <div className="relative z-10 max-w-4xl space-y-4 text-white">
                    <p className="eyebrow text-white/85">Right Angle Design Studio</p>

                    {/* Headline Title */}
                    <div
                      onClick={() => {
                        if (editMode) {
                          setActiveTextSlot({
                            field: "heroTitle",
                            label: "Hero Headline Title",
                            value: draftHome.heroTitle,
                          });
                          setTextEditorOpen(true);
                        }
                      }}
                      className={`font-display text-3xl sm:text-5xl lg:text-6xl font-light text-white leading-tight ${
                        editMode ? "cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-accent p-1.5 rounded transition-all" : ""
                      }`}
                    >
                      {draftHome.heroTitle}
                    </div>

                    {/* Subtitle */}
                    <div
                      onClick={() => {
                        if (editMode) {
                          setActiveTextSlot({
                            field: "heroSubtitle",
                            label: "Hero Subtitle Thesis",
                            value: draftHome.heroSubtitle,
                          });
                          setTextEditorOpen(true);
                        }
                      }}
                      className={`text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed font-light ${
                        editMode ? "cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-accent p-1.5 rounded transition-all" : ""
                      }`}
                    >
                      {draftHome.heroSubtitle}
                    </div>

                    <div className="pt-2">
                      <Button className="bg-foreground text-background font-medium text-xs tracking-widest uppercase pointer-events-none">
                        {draftHome.ctaText} <ArrowRight className="size-3.5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </section>

                {/* 2. SELECTED PROJECTS SECTION WITH CLICK-TO-CHANGE COVERS */}
                <section className="px-6 sm:px-12 max-w-[1720px] mx-auto">
                  <div className="flex items-end justify-between border-b border-border pb-4 mb-8">
                    <div>
                      <p className="eyebrow">Portfolio Index</p>
                      <h2 className="font-display text-2xl sm:text-4xl text-foreground font-light mt-1">
                        Selected Architecture & Interiors
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {caseStudies.slice(0, 4).map((study) => (
                      <div key={study.id} className="group space-y-4">
                        {/* Project Cover Container */}
                        <div className="relative aspect-[16/10] overflow-hidden border border-border bg-muted rounded">
                          <DriveImage
                            src={study.heroImage}
                            alt={study.title}
                            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                            wrapperClassName="size-full"
                          />

                          {/* Edit Overlay for Project Cover */}
                          {editMode && (
                            <div className="absolute top-3 right-3 z-20">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setActiveSlotTarget({
                                    slotType: "project_cover",
                                    targetId: study.id,
                                    title: `${study.title} — Cover Photo`,
                                  });
                                  setMediaPickerOpen(true);
                                }}
                                className="bg-black/85 hover:bg-black text-white text-[11px] border border-white/20 shadow-md backdrop-blur-sm h-7"
                              >
                                <ImageIcon className="size-3 mr-1 text-accent" /> Replace Cover Photo
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Project Info */}
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-display text-xl text-foreground font-light">{study.title}</h3>
                            <span className="text-xs text-muted-foreground">{study.year}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{study.location} · {study.spaceType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3. DISCIPLINE SERVICES PREVIEW */}
                {draftHome.showServices && (
                  <section className="px-6 sm:px-12 max-w-[1720px] mx-auto border-t border-border pt-12">
                    <p className="eyebrow">Studio Disciplines</p>
                    <h2 className="font-display text-2xl sm:text-3xl text-foreground font-light mt-1 mb-8">
                      Comprehensive Architectural Execution
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {services.slice(0, 3).map((service) => (
                        <div key={service.id} className="border border-border p-6 bg-card/40 space-y-3">
                          <Badge variant="outline" className="text-[10px] font-mono">{service.number}</Badge>
                          <h4 className="font-display text-lg font-medium text-foreground">{service.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{service.shortDesc}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. DESIGN METHODOLOGY PREVIEW */}
                {draftHome.showProcess && (
                  <section className="px-6 sm:px-12 max-w-[1720px] mx-auto border-t border-border pt-12">
                    <p className="eyebrow">Our Methodology</p>
                    <h2 className="font-display text-2xl sm:text-3xl text-foreground font-light mt-1 mb-8">
                      7-Stage Predictable Design & Build Process
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {processSteps.slice(0, 4).map((step) => (
                        <div key={step.id} className="border border-border p-5 bg-card/30 space-y-2">
                          <span className="text-xs text-accent font-mono">{step.number}</span>
                          <h4 className="font-display text-base text-foreground">{step.title}</h4>
                          <p className="text-[11px] text-muted-foreground">{step.timeline}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* ===================================================================
                PAGE: PORTFOLIO (/portfolio)
                =================================================================== */}
            {activePage === "portfolio" && (
              <div className="p-6 sm:p-12 space-y-12">
                <div className="border-b border-border pb-6">
                  <p className="eyebrow">Portfolio Index</p>
                  <h1 className="font-display text-3xl sm:text-5xl font-light text-foreground mt-2">
                    Completed Works & Architectural Case Studies
                  </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {caseStudies.map((study) => (
                    <div key={study.id} className="border border-border bg-card/40 overflow-hidden group">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <DriveImage
                          src={study.heroImage}
                          alt={study.title}
                          className="size-full object-cover"
                        />
                        {editMode && (
                          <div className="absolute top-3 right-3 z-20">
                            <Button
                              size="sm"
                              onClick={() => {
                                setActiveSlotTarget({
                                  slotType: "project_cover",
                                  targetId: study.id,
                                  title: `${study.title} — Portfolio Cover Photo`,
                                });
                                setMediaPickerOpen(true);
                              }}
                              className="bg-black/85 hover:bg-black text-white text-[11px] border border-white/20 h-7"
                            >
                              <ImageIcon className="size-3 mr-1 text-accent" /> Change Photo
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-xl text-foreground">{study.title}</h3>
                          <Badge variant="outline" className="text-[10px]">{study.year}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{study.location} · {study.spaceType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================================================================
                PAGE: GALLERY (/gallery)
                =================================================================== */}
            {activePage === "gallery" && (
              <div className="p-6 sm:p-12 space-y-8">
                <div className="border-b border-border pb-6">
                  <p className="eyebrow">Media Vault</p>
                  <h1 className="font-display text-3xl sm:text-5xl font-light text-foreground mt-2">
                    Architectural Photography Archive
                  </h1>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(galleryMedia?.photos || []).map((photo: any, i: number) => (
                    <div key={i} className="aspect-[4/3] relative overflow-hidden border border-border bg-muted">
                      <DriveImage src={photo.url} alt={photo.title || "Gallery photo"} className="size-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================================================================
                PAGE: SERVICES (/services)
                =================================================================== */}
            {activePage === "services" && (
              <div className="p-6 sm:p-12 space-y-12">
                <div className="border-b border-border pb-6">
                  <p className="eyebrow">Disciplines</p>
                  <h1 className="font-display text-3xl sm:text-5xl font-light text-foreground mt-2">
                    Interior Architecture & Turnkey Execution
                  </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="border border-border p-8 bg-card/40 space-y-4">
                      <Badge variant="outline" className="text-xs font-mono">{service.number}</Badge>
                      <h3 className="font-display text-2xl font-light text-foreground">{service.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{service.shortDesc}</p>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed font-light">{service.fullDesc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================================================================
                PAGE: PROCESS (/process)
                =================================================================== */}
            {activePage === "process" && (
              <div className="p-6 sm:p-12 space-y-12">
                <div className="border-b border-border pb-6">
                  <p className="eyebrow">Methodology</p>
                  <h1 className="font-display text-3xl sm:text-5xl font-light text-foreground mt-2">
                    7-Stage Architectural Design Process
                  </h1>
                </div>

                <div className="space-y-6">
                  {processSteps.map((step) => (
                    <div key={step.id} className="border border-border p-6 bg-card/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-accent font-semibold">{step.number}</span>
                          <h3 className="font-display text-xl text-foreground font-light">{step.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 max-w-2xl">{step.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">{step.timeline}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================================================================
                PAGE: ABOUT (/about)
                =================================================================== */}
            {activePage === "about" && (
              <div className="p-6 sm:p-12 space-y-12">
                <div className="border-b border-border pb-6">
                  <p className="eyebrow">Studio Profile</p>
                  <h1 className="font-display text-3xl sm:text-5xl font-light text-foreground mt-2">
                    About Right Angle Design Studio
                  </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <div className="space-y-4 text-xs text-muted-foreground leading-relaxed font-light">
                    <p>
                      Founded on a rigorous architectural ethos, Right Angle Design Studio shapes bespoke residential, commercial, and turnkey environments around daylight, materiality, and everyday rhythm.
                    </p>
                    <p>
                      Every commission begins with comprehensive spatial planning, 3D laser-measured site surveys, and disciplined procurement.
                    </p>
                  </div>
                  <div className="aspect-[4/3] border border-border bg-muted overflow-hidden rounded">
                    <DriveImage src={GOOGLE_DRIVE_PHOTOS[4]?.url || DEFAULT_HERO_IMAGE} alt="Studio Atmosphere" className="size-full object-cover" />
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================
                PAGE: CONTACT (/contact)
                =================================================================== */}
            {activePage === "contact" && (
              <div className="p-6 sm:p-12 space-y-8">
                <div className="border-b border-border pb-6">
                  <p className="eyebrow">Inquire</p>
                  <h1 className="font-display text-3xl sm:text-5xl font-light text-foreground mt-2">
                    Initiate an Architectural Commission
                  </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                  <div className="border border-border p-6 bg-card/40 space-y-3">
                    <p className="font-semibold text-foreground text-sm">Mumbai Practice</p>
                    <p className="text-muted-foreground">14 Sun Mill Compound, Tulsi Pipe Road, Lower Parel, Mumbai 400013</p>
                    <p className="text-accent">+91 98200 41100 · contact@rightangle.design</p>
                  </div>
                  <div className="border border-border p-6 bg-card/40 space-y-3">
                    <p className="font-semibold text-foreground text-sm">Bengaluru Practice</p>
                    <p className="text-muted-foreground">84 Lavelle Road, Shanthala Nagar, Ashok Nagar, Bengaluru 560001</p>
                    <p className="text-accent">+91 80 4120 7800 · contact@rightangle.design</p>
                  </div>
                </div>
              </div>
            )}

            {/* Simulated Public Footer */}
            <footer className="border-t border-border bg-card/60 p-8 sm:p-12 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
              <BrandLogo variant="horizontal" size="sm" />
              <p>© {new Date().getFullYear()} Right Angle Design Studio. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VISUAL GOOGLE DRIVE MEDIA PICKER MODAL
          ========================================================================= */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelectMedia={handleSelectMedia}
        title={activeSlotTarget?.title || "Choose Google Drive Photograph"}
      />

      {/* =========================================================================
          INLINE TEXT EDITOR MODAL
          ========================================================================= */}
      <Dialog open={textEditorOpen} onOpenChange={setTextEditorOpen}>
        <DialogContent className="max-w-lg p-6 bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-medium">
              Edit {activeTextSlot?.label}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {activeTextSlot?.field === "heroSubtitle" ? (
              <Textarea
                value={activeTextSlot?.value || ""}
                onChange={(e) =>
                  setActiveTextSlot((prev) => (prev ? { ...prev, value: e.target.value } : null))
                }
                className="text-xs h-32 leading-relaxed"
              />
            ) : (
              <Input
                value={activeTextSlot?.value || ""}
                onChange={(e) =>
                  setActiveTextSlot((prev) => (prev ? { ...prev, value: e.target.value } : null))
                }
                className="text-sm font-medium"
              />
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setTextEditorOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveText}
                className="bg-foreground text-background hover:bg-accent hover:text-accent-foreground text-xs"
              >
                Save Draft
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

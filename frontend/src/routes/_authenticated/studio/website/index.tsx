import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Globe,
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
  Grid,
  Sliders,
  Images,
  Compass,
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
import {
  GOOGLE_DRIVE_PHOTOS,
  type GoogleDrivePhoto,
} from "@/lib/google-drive-photos";
import {
  CURATED_STUDIO_PROJECTS,
  CURATED_STUDIO_MATERIALS,
  CURATED_STUDIO_SERVICES,
  CURATED_STUDIO_TESTIMONIALS,
  type CaseCard,
  type MaterialItem,
} from "@/lib/public.functions";
import { broadcastCmsUpdate, useCmsLiveSync } from "@/lib/cms-live-sync";
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
import { EditorialProjectGrid } from "@/components/site/CaseCardGrid";
import { EditorialServicesSection } from "@/components/site/EditorialServices";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { cn } from "@/lib/utils";

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

const DEFAULT_HERO_IMAGE =
  GOOGLE_DRIVE_PHOTOS[0]?.url ||
  "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE";

export function LiveVisualWebsiteEditor() {
  const queryClient = useQueryClient();
  useCmsLiveSync();

  // Editor View State
  const editMode = true;
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState<boolean>(false);

  // Dynamic Custom Photos Overrides in Draft
  const [customAtmospherePhoto, setCustomAtmospherePhoto] = useState<string>(
    "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg"
  );
  const [customBeforePhoto, setCustomBeforePhoto] = useState<string>(
    "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r"
  );
  const [customAfterPhoto, setCustomAfterPhoto] = useState<string>(
    "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE"
  );
  const [customMaterials, setCustomMaterials] = useState<MaterialItem[]>(CURATED_STUDIO_MATERIALS);

  // Media Picker Dialog State
  const [mediaPickerOpen, setMediaPickerOpen] = useState<boolean>(false);
  const [activeSlotTarget, setActiveSlotTarget] = useState<{
    slotType:
      | "hero"
      | "atmosphere"
      | "project_cover"
      | "spotlight"
      | "service"
      | "material"
      | "before_image"
      | "after_image"
      | "vault_strip";
    targetId?: string;
    index?: number;
    title?: string;
    currentUrl?: string;
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
    queryFn: () => publicService.getGallery({ limit: 12 }),
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
        heroImage: homeData.heroImage || DEFAULT_HERO_IMAGE,
        atmospherePhoto: homeData.atmospherePhoto || customAtmospherePhoto,
        beforePhoto: homeData.beforePhoto || customBeforePhoto,
        afterPhoto: homeData.afterPhoto || customAfterPhoto,
      });
      if (homeData.atmospherePhoto) setCustomAtmospherePhoto(homeData.atmospherePhoto);
      if (homeData.beforePhoto) setCustomBeforePhoto(homeData.beforePhoto);
      if (homeData.afterPhoto) setCustomAfterPhoto(homeData.afterPhoto);
    }
  }, [homeData]);

  // Mutations
  const publishMutation = useMutation({
    mutationFn: async () => {
      await cmsService.updateHomepage({
        ...draftHome,
        atmospherePhoto: customAtmospherePhoto,
        beforePhoto: customBeforePhoto,
        afterPhoto: customAfterPhoto,
      });
    },
    onSuccess: () => {
      toast.success("All website changes published to live site successfully!");
      setHasUnpublishedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["cms"] });
      queryClient.invalidateQueries({ queryKey: ["public"] });
      queryClient.invalidateQueries({ queryKey: ["home-content"] });
      broadcastCmsUpdate({ type: "publish_all" });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Publishing failed.");
    },
  });

  const updateCaseStudyCoverMutation = useMutation({
    mutationFn: async ({ id, photoUrl }: { id: string; photoUrl: string }) => {
      await cmsService.updateCaseStudy(id, { heroImage: photoUrl });
    },
    onMutate: async ({ id, photoUrl }) => {
      await queryClient.cancelQueries({ queryKey: ["cms", "projects"] });
      const previousProjects = queryClient.getQueryData(["cms", "projects"]);
      queryClient.setQueryData(["cms", "projects"], (old: any) => {
        if (!old || !old.caseStudies) return old;
        return {
          ...old,
          caseStudies: old.caseStudies.map((cs: any) =>
            cs.id === id || cs._id === id || cs.slug === id ? { ...cs, heroImage: photoUrl } : cs
          ),
        };
      });
      return { previousProjects };
    },
    onSuccess: () => {
      toast.success("Project cover photograph updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["cms", "projects"] });
      queryClient.invalidateQueries({ queryKey: ["public"] });
      queryClient.invalidateQueries({ queryKey: ["home-content"] });
      broadcastCmsUpdate({ type: "case_study_cover" });
    },
    onError: (err, _variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["cms", "projects"], context.previousProjects);
      }
      toast.error(err instanceof Error ? err.message : "Failed to change cover photo.");
    },
  });

  // Handle Photo Picker Selection for any slot on the entire homepage
  const handleSelectMedia = (photoUrl: string) => {
    if (!activeSlotTarget) return;

    const { slotType, targetId, index } = activeSlotTarget;

    if (slotType === "hero") {
      const updated = { ...draftHome, heroImage: photoUrl };
      setDraftHome(updated);
      cmsService.updateHomepage({
        ...updated,
        atmospherePhoto: customAtmospherePhoto,
        beforePhoto: customBeforePhoto,
        afterPhoto: customAfterPhoto,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["cms"] });
        queryClient.invalidateQueries({ queryKey: ["public"] });
        queryClient.invalidateQueries({ queryKey: ["home-content"] });
        broadcastCmsUpdate({ type: "hero_photo", url: photoUrl });
        toast.success("Hero photo updated & live on public website!");
      }).catch(() => {
        setHasUnpublishedChanges(true);
      });
    } else if (slotType === "atmosphere") {
      setCustomAtmospherePhoto(photoUrl);
      cmsService.updateHomepage({
        ...draftHome,
        atmospherePhoto: photoUrl,
        beforePhoto: customBeforePhoto,
        afterPhoto: customAfterPhoto,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["cms"] });
        queryClient.invalidateQueries({ queryKey: ["public"] });
        queryClient.invalidateQueries({ queryKey: ["home-content"] });
        broadcastCmsUpdate({ type: "atmosphere_photo", url: photoUrl });
        toast.success("Studio atmosphere photo updated & live!");
      }).catch(() => {
        setHasUnpublishedChanges(true);
      });
    } else if (slotType === "project_cover" && targetId) {
      updateCaseStudyCoverMutation.mutate({
        id: targetId,
        photoUrl,
      });
    } else if (slotType === "spotlight" && targetId) {
      updateCaseStudyCoverMutation.mutate({
        id: targetId,
        photoUrl,
      });
    } else if (slotType === "material" && typeof index === "number") {
      setCustomMaterials((prev) => {
        const copy = [...prev];
        if (copy[index]) {
          copy[index] = { ...copy[index]!, image: photoUrl };
        }
        return copy;
      });
      cmsService.updateHomepage({
        ...draftHome,
        atmospherePhoto: customAtmospherePhoto,
        beforePhoto: customBeforePhoto,
        afterPhoto: customAfterPhoto,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["cms"] });
        queryClient.invalidateQueries({ queryKey: ["public"] });
        queryClient.invalidateQueries({ queryKey: ["home-content"] });
        broadcastCmsUpdate({ type: "material_photo", url: photoUrl });
        toast.success("Material texture updated & live!");
      }).catch(() => {
        setHasUnpublishedChanges(true);
      });
    } else if (slotType === "before_image") {
      setCustomBeforePhoto(photoUrl);
      cmsService.updateHomepage({
        ...draftHome,
        atmospherePhoto: customAtmospherePhoto,
        beforePhoto: photoUrl,
        afterPhoto: customAfterPhoto,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["cms"] });
        queryClient.invalidateQueries({ queryKey: ["public"] });
        queryClient.invalidateQueries({ queryKey: ["home-content"] });
        broadcastCmsUpdate({ type: "before_photo", url: photoUrl });
        toast.success("Transformation 'Before' photo updated & live!");
      }).catch(() => {
        setHasUnpublishedChanges(true);
      });
    } else if (slotType === "after_image") {
      setCustomAfterPhoto(photoUrl);
      cmsService.updateHomepage({
        ...draftHome,
        atmospherePhoto: customAtmospherePhoto,
        beforePhoto: customBeforePhoto,
        afterPhoto: photoUrl,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["cms"] });
        queryClient.invalidateQueries({ queryKey: ["public"] });
        queryClient.invalidateQueries({ queryKey: ["home-content"] });
        broadcastCmsUpdate({ type: "after_photo", url: photoUrl });
        toast.success("Transformation 'After' photo updated & live!");
      }).catch(() => {
        setHasUnpublishedChanges(true);
      });
    }
  };

  // Handle Text Save
  const handleSaveText = () => {
    if (!activeTextSlot) return;
    const updated = {
      ...draftHome,
      [activeTextSlot.field]: activeTextSlot.value,
    };
    setDraftHome(updated);
    setTextEditorOpen(false);

    cmsService.updateHomepage({
      ...updated,
      atmospherePhoto: customAtmospherePhoto,
      beforePhoto: customBeforePhoto,
      afterPhoto: customAfterPhoto,
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["cms"] });
      queryClient.invalidateQueries({ queryKey: ["public"] });
      queryClient.invalidateQueries({ queryKey: ["home-content"] });
      broadcastCmsUpdate({ type: "text_saved", field: activeTextSlot.field });
      toast.success(`${activeTextSlot.label} updated & live on public website!`);
    }).catch(() => {
      setHasUnpublishedChanges(true);
      toast.success(`${activeTextSlot.label} updated in draft!`);
    });
  };

  const rawCaseStudies: CmsCaseStudyItem[] = projectsData?.caseStudies || [];
  const caseStudies: CaseCard[] =
    rawCaseStudies.length > 0
      ? rawCaseStudies.map((cs) => ({
          _id: cs.id,
          slug: cs.slug,
          title: cs.title,
          subtitle: cs.subtitle,
          location: cs.location,
          year: cs.year,
          hero_image: cs.heroImage,
          summary: cs.summary,
          space_type: cs.spaceType,
          style: cs.style,
          area_sqft: cs.areaSqft,
          featured: cs.featured,
          published_at: cs.publishedAt,
        }))
      : CURATED_STUDIO_PROJECTS;

  const services = servicesData && servicesData.length > 0 ? servicesData : CURATED_STUDIO_SERVICES;
  const processSteps = processData && processData.length > 0 ? processData : [];
  const testimonials = testimonialsData && testimonialsData.length > 0 ? testimonialsData : CURATED_STUDIO_TESTIMONIALS;
  const flagshipProject = caseStudies[0] || CURATED_STUDIO_PROJECTS[0];

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Title & Live Action Header */}
        <PageTitle
          eyebrow="Right Angle Design Studio"
          title="Visual Website Control Center & Live Editor"
          actions={
            <div className="flex items-center gap-2.5">
              {hasUnpublishedChanges ? (
                <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/40 animate-pulse bg-amber-500/10 font-mono">
                  ● Unpublished Changes
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/40 bg-emerald-500/10 font-mono">
                  ● Live & Synced
                </Badge>
              )}

              <Button
                size="sm"
                disabled={publishMutation.isPending || !hasUnpublishedChanges}
                onClick={() => publishMutation.mutate()}
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs tracking-wider uppercase font-semibold h-8 cursor-pointer"
              >
                <Send className="size-3 mr-1.5" />
                {publishMutation.isPending ? "Publishing…" : "Publish Live to Website"}
              </Button>

              <Button asChild size="sm" variant="outline" className="h-8 text-xs cursor-pointer">
                <a href="/" target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3.5 mr-1.5" /> Customer Site
                </a>
              </Button>
            </div>
          }
        />

        {/* =====================================================================
            LIVE CUSTOMER VIEW CANVAS
            ===================================================================== */}
        <div className="border border-border/80 bg-stone-900/30 rounded-xl p-3 sm:p-6 flex justify-center min-h-[750px] overflow-hidden">
          <div className="w-full max-w-[1720px] rounded transition-all duration-300 bg-background text-foreground shadow-2xl border border-border/70 overflow-hidden relative">
            {/* Simulated Public Header */}
            <header className="border-b border-border/60 bg-background/95 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
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
                PAGE: HOMEPAGE (/) - FULL CUSTOMER VIEW CANVAS
                =================================================================== */}
            <div className="space-y-16 sm:space-y-24 pb-20">
                  {/* 1. HERO SECTION WITH CLICK-TO-EDIT PHOTO & TEXT */}
                  <section className="relative min-h-[65vh] sm:min-h-[82vh] overflow-hidden flex flex-col justify-end p-6 sm:p-12 lg:p-16 border-b border-border bg-[#0f0e0d]">
                    <DriveImage
                      src={draftHome.heroImage}
                      alt="Homepage Hero"
                      className="absolute inset-0 size-full object-cover brightness-[0.8]"
                      wrapperClassName="absolute inset-0 size-full"
                    />

                    {/* Dark subtle gradient for supreme text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none" />

                    {/* Edit Overlay for Hero Photo */}
                    {editMode && (
                      <div className="absolute top-6 right-6 z-20">
                        <Button
                          size="sm"
                          onClick={() => {
                            setActiveSlotTarget({
                              slotType: "hero",
                              title: "Homepage Hero Background Photo",
                              currentUrl: draftHome.heroImage,
                            });
                            setMediaPickerOpen(true);
                          }}
                          className="bg-black/85 hover:bg-black text-white text-xs border border-white/25 shadow-xl backdrop-blur-md cursor-pointer"
                        >
                          <ImageIcon className="size-3.5 mr-1.5 text-accent" /> Change Hero Photo
                        </Button>
                      </div>
                    )}

                    {/* Hero Content */}
                    <div className="relative z-10 max-w-4xl space-y-4 text-white">
                      <p className="eyebrow text-white/85 flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-accent inline-block" />
                        Right Angle Design Studio
                      </p>

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
                        className={cn(
                          "font-display text-3xl sm:text-5xl lg:text-6xl font-light text-white leading-tight",
                          editMode && "cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-accent p-1.5 rounded transition-all",
                        )}
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
                        className={cn(
                          "text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed font-light",
                          editMode && "cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-accent p-1.5 rounded transition-all",
                        )}
                      >
                        {draftHome.heroSubtitle}
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <Button className="bg-accent text-accent-foreground font-semibold text-xs tracking-widest uppercase pointer-events-none">
                          {draftHome.ctaText} <ArrowRight className="size-3.5 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </section>

                  {/* 2. STUDIO STATEMENT & ATMOSPHERE PHOTO */}
                  <section className="px-6 sm:px-12 max-w-[1720px] mx-auto">
                    <div className="grid gap-10 lg:grid-cols-12 items-center">
                      <div className="lg:col-span-7 space-y-5">
                        <p className="eyebrow">THE STUDIO</p>
                        <h2 className="font-display text-2xl sm:text-4xl font-light text-foreground leading-[1.15] tracking-tight">
                          We create considered residential and commercial interiors where{" "}
                          <span className="italic text-accent font-normal">
                            material, proportion and light work together.
                          </span>
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground font-light max-w-2xl">
                          Every project we undertake starts by stripping away the non-essential. We avoid
                          ephemeral trends and disposable finishes in pursuit of spaces that breathe.
                        </p>
                      </div>

                      {/* Atmosphere Photo Container with Replace Button */}
                      <div className="group relative lg:col-span-5 overflow-hidden bg-stone aspect-[4/5] border border-border rounded">
                        <DriveImage
                          src={customAtmospherePhoto}
                          alt="Studio Atmosphere"
                          className="size-full object-cover"
                          wrapperClassName="size-full"
                        />
                        {editMode && (
                          <div className="absolute top-3 right-3 z-20">
                            <Button
                              size="sm"
                              onClick={() => {
                                setActiveSlotTarget({
                                  slotType: "atmosphere",
                                  title: "Studio Atmosphere Photograph",
                                  currentUrl: customAtmospherePhoto,
                                });
                                setMediaPickerOpen(true);
                              }}
                              className="bg-black/85 hover:bg-black text-white text-[11px] border border-white/20 shadow-md backdrop-blur-sm h-7 cursor-pointer"
                            >
                              <ImageIcon className="size-3 mr-1 text-accent" /> Replace Photo
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* 3. SELECTED ARCHITECTURAL COMMISSIONS (Full Editorial Grid) */}
                  <section className="px-6 sm:px-12 max-w-[1720px] mx-auto border-t border-border pt-12">
                    <div className="flex items-end justify-between border-b border-border pb-4 mb-8">
                      <div>
                        <p className="eyebrow">Selected Work</p>
                        <h2 className="font-display text-2xl sm:text-4xl text-foreground font-light mt-1">
                          Featured Architectural Commissions
                        </h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {caseStudies.slice(0, 6).map((study) => (
                        <div key={study._id || study.slug} className="group space-y-3">
                          {/* Project Cover Container */}
                          <div className="relative aspect-[16/10] overflow-hidden border border-border bg-stone rounded">
                            <DriveImage
                              src={study.hero_image}
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
                                      targetId: study._id || study.slug,
                                      title: `${study.title} — Cover Photo`,
                                      currentUrl: study.hero_image,
                                    });
                                    setMediaPickerOpen(true);
                                  }}
                                  className="bg-black/85 hover:bg-black text-white text-[11px] border border-white/20 shadow-md backdrop-blur-sm h-7 cursor-pointer"
                                >
                                  <ImageIcon className="size-3 mr-1 text-accent" /> Replace Photo
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
                            <p className="text-xs text-muted-foreground">{study.location} · {study.space_type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 4. MAGAZINE SPREAD SPOTLIGHT FEATURE */}
                  {flagshipProject && (
                    <section className="px-6 sm:px-12 max-w-[1720px] mx-auto border-t border-border pt-12">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card/40 border border-border p-6 rounded-lg">
                        <div className="relative lg:col-span-7 aspect-[16/10] overflow-hidden rounded bg-stone border border-border">
                          <DriveImage
                            src={flagshipProject.hero_image}
                            alt={flagshipProject.title}
                            className="size-full object-cover"
                            wrapperClassName="size-full"
                          />
                          {editMode && (
                            <div className="absolute top-3 right-3 z-20">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setActiveSlotTarget({
                                    slotType: "spotlight",
                                    targetId: flagshipProject._id || flagshipProject.slug,
                                    title: `Spotlight: ${flagshipProject.title}`,
                                    currentUrl: flagshipProject.hero_image,
                                  });
                                  setMediaPickerOpen(true);
                                }}
                                className="bg-black/85 hover:bg-black text-white text-[11px] border border-white/20 shadow-md backdrop-blur-sm h-7 cursor-pointer"
                              >
                                <ImageIcon className="size-3 mr-1 text-accent" /> Replace Spotlight Photo
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="lg:col-span-5 space-y-4">
                          <p className="eyebrow">EDITORIAL SPOTLIGHT</p>
                          <h3 className="font-display text-2xl sm:text-3xl text-foreground font-light">
                            {flagshipProject.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                            {flagshipProject.summary}
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* 5. PRACTICE DISCIPLINES (Interactive Live Frame) */}
                  {draftHome.showServices && (
                    <section className="px-6 sm:px-12 max-w-[1720px] mx-auto border-t border-border pt-12">
                      <div className="flex items-end justify-between border-b border-border pb-4 mb-8">
                        <div>
                          <p className="eyebrow">PRACTICE DISCIPLINES</p>
                          <h2 className="font-display text-2xl sm:text-4xl text-foreground font-light mt-1">
                            Disciplines & Scope of Practice
                          </h2>
                        </div>
                      </div>

                      <EditorialServicesSection services={services} />
                    </section>
                  )}

                  {/* 6. MATERIALITY & TACTILE CRAFT */}
                  <section className="px-6 sm:px-12 max-w-[1720px] mx-auto border-t border-border pt-12">
                    <div className="flex items-end justify-between border-b border-border pb-4 mb-8">
                      <div>
                        <p className="eyebrow">MATERIALITY & CRAFT</p>
                        <h2 className="font-display text-2xl sm:text-4xl text-foreground font-light mt-1">
                          Tactile Material Provenance
                        </h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {customMaterials.map((mat, idx) => (
                        <div key={mat._id || idx} className="border border-border/80 bg-card/60 rounded overflow-hidden group">
                          <div className="relative aspect-[4/3] overflow-hidden bg-stone">
                            <DriveImage src={mat.image} alt={mat.name} className="size-full object-cover" />
                            {editMode && (
                              <div className="absolute top-3 right-3 z-20">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setActiveSlotTarget({
                                      slotType: "material",
                                      index: idx,
                                      title: `Material: ${mat.name}`,
                                      currentUrl: mat.image,
                                    });
                                    setMediaPickerOpen(true);
                                  }}
                                  className="bg-black/85 hover:bg-black text-white text-[10px] border border-white/20 h-6 px-2 cursor-pointer"
                                >
                                  <ImageIcon className="size-3 mr-1 text-accent" /> Change Texture
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="p-4 space-y-1.5">
                            <span className="text-[10px] font-mono text-accent uppercase">{mat.category} · {mat.provenance}</span>
                            <h4 className="font-display text-base text-foreground font-light">{mat.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 font-light">{mat.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 7. BEFORE / AFTER TRANSFORMATION */}
                  <section className="px-6 sm:px-12 max-w-[1720px] mx-auto border-t border-border pt-12">
                    <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
                      <div>
                        <p className="eyebrow">TRANSFORMATION</p>
                        <h2 className="font-display text-2xl sm:text-4xl text-foreground font-light mt-1">
                          From Bare Shell to Architectural Sanctuary
                        </h2>
                      </div>
                      {editMode && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveSlotTarget({
                                slotType: "before_image",
                                title: "Transformation 'Before' Photo",
                                currentUrl: customBeforePhoto,
                              });
                              setMediaPickerOpen(true);
                            }}
                            className="text-xs h-7 cursor-pointer"
                          >
                            <ImageIcon className="size-3 mr-1 text-accent" /> Change 'Before'
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveSlotTarget({
                                slotType: "after_image",
                                title: "Transformation 'After' Photo",
                                currentUrl: customAfterPhoto,
                              });
                              setMediaPickerOpen(true);
                            }}
                            className="text-xs h-7 cursor-pointer"
                          >
                            <ImageIcon className="size-3 mr-1 text-accent" /> Change 'After'
                          </Button>
                        </div>
                      )}
                    </div>

                    <BeforeAfterSlider
                      beforeUrl={customBeforePhoto}
                      afterUrl={customAfterPhoto}
                      beforeLabel="BEFORE EXECUTION"
                      afterLabel="COMPLETED SANCTUARY"
                      caption="The Shah Residence · 6,400 sq ft transformation"
                      aspectRatio="aspect-[16/9] sm:aspect-[21/10]"
                    />
                  </section>
                </div>
              </div>
            </div>
          </div>

      {/* Media Picker Modal for Google Drive Photos Selection */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        title={activeSlotTarget?.title || "Choose Google Drive Photograph"}
        currentUrl={activeSlotTarget?.currentUrl}
        onSelectMedia={(photoUrl) => {
          handleSelectMedia(photoUrl);
          setMediaPickerOpen(false);
        }}
      />

      {/* Text Editor Dialog */}
      <Dialog open={textEditorOpen} onOpenChange={setTextEditorOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{activeTextSlot?.label || "Edit Content"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {activeTextSlot?.field === "heroTitle" ? (
              <Input
                value={activeTextSlot?.value || ""}
                onChange={(e) =>
                  setActiveTextSlot((prev) => (prev ? { ...prev, value: e.target.value } : null))
                }
                className="font-display text-lg"
              />
            ) : (
              <Textarea
                rows={4}
                value={activeTextSlot?.value || ""}
                onChange={(e) =>
                  setActiveTextSlot((prev) => (prev ? { ...prev, value: e.target.value } : null))
                }
                className="text-sm leading-relaxed"
              />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setTextEditorOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSaveText} className="bg-accent text-accent-foreground font-medium cursor-pointer">
              Save to Draft
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

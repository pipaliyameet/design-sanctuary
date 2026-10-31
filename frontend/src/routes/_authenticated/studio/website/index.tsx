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
  Film,
  Instagram,
  Quote,
  Pencil,
  Video,
  Star,
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
  ARCHITECTURAL_FILMS,
  GOOGLE_DRIVE_VIDEOS_FOLDER_URL,
  type DriveVideo,
} from "@/lib/google-drive-videos";
import {
  CURATED_STUDIO_PROJECTS,
  CURATED_STUDIO_MATERIALS,
  CURATED_STUDIO_SERVICES,
  CURATED_STUDIO_PROCESS,
  CURATED_STUDIO_TESTIMONIALS,
  STUDIO_DETAILS,
  type CaseCard,
  type ServiceItem,
  type ProcessStepItem,
  type TestimonialItem,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { EditorialServicesSection } from "@/components/site/EditorialServices";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { ArchitecturalFilmsSection } from "@/components/site/ArchitecturalFilmsSection";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/studio/website/")({
  component: LiveVisualWebsiteEditor,
  head: () => ({
    meta: [
      { title: "Customer Homepage Control Center & Live Visual Editor — Right Angle Design Studio" },
      {
        name: "description",
        content:
          "Full control center to modify all customer homepage sections: films, projects, spotlight, hero, statement, stats, services, process, materials, before/after, philosophy, testimonials, and contact.",
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

  // Mode Toggle: Visual Edit Controls vs Pure Customer Site Preview
  const [editMode, setEditMode] = useState<boolean>(true);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  // Dynamic Custom Photos & Collections in Draft
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
  const [customProcessSteps, setCustomProcessSteps] = useState<ProcessStepItem[]>(CURATED_STUDIO_PROCESS);
  const [customTestimonials, setCustomTestimonials] = useState<TestimonialItem[]>(CURATED_STUDIO_TESTIMONIALS);
  const [customFilms, setCustomFilms] = useState<DriveVideo[]>(ARCHITECTURAL_FILMS);
  const [spotlightSlug, setSpotlightSlug] = useState<string>("mehta-executive-suite");

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
    field: string;
    label: string;
    value: string;
    multiline?: boolean;
  } | null>(null);

  // Project Edit Dialog State
  const [projectEditorOpen, setProjectEditorOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<{
    id: string;
    title: string;
    subtitle: string;
    spaceType: string;
    location: string;
    areaSqft: number;
    year: number;
    summary: string;
    heroImage: string;
  } | null>(null);

  // Architectural Film Edit Dialog State
  const [filmEditorOpen, setFilmEditorOpen] = useState<boolean>(false);
  const [editingFilmIndex, setEditingFilmIndex] = useState<number | null>(null);
  const [filmForm, setFilmForm] = useState<{
    title: string;
    category: string;
    location: string;
    description: string;
    streamUrl: string;
  }>({
    title: "",
    category: "",
    location: "",
    description: "",
    streamUrl: "",
  });

  // Spotlight Story Edit Dialog State
  const [spotlightEditorOpen, setSpotlightEditorOpen] = useState<boolean>(false);
  const [spotlightForm, setSpotlightForm] = useState<{
    title: string;
    subtitle: string;
    summary: string;
    spaceType: string;
    location: string;
    heroImage: string;
  }>({
    title: "",
    subtitle: "",
    summary: "",
    spaceType: "",
    location: "",
    heroImage: "",
  });

  // Specialized Edit Dialogs
  const [processDialogOpen, setProcessDialogOpen] = useState<boolean>(false);
  const [editingProcessIndex, setEditingProcessIndex] = useState<number | null>(null);
  const [processForm, setProcessForm] = useState<{ number: string; title: string; timeline: string; description: string }>({
    number: "01",
    title: "",
    timeline: "",
    description: "",
  });

  const [testimonialDialogOpen, setTestimonialDialogOpen] = useState<boolean>(false);
  const [editingTestimonialIndex, setEditingTestimonialIndex] = useState<number | null>(null);
  const [testimonialForm, setTestimonialForm] = useState<{ quote: string; author: string; project: string; location: string }>({
    quote: "",
    author: "",
    project: "",
    location: "",
  });

  const [materialDialogOpen, setMaterialDialogOpen] = useState<boolean>(false);
  const [editingMaterialIndex, setEditingMaterialIndex] = useState<number | null>(null);
  const [materialForm, setMaterialForm] = useState<{ name: string; category: string; provenance: string; description: string }>({
    name: "",
    category: "",
    provenance: "",
    description: "",
  });

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

  // Draft State mirroring Homepage
  const [draftHome, setDraftHome] = useState<HomepageConfigData>({
    heroTitle: "Architecture & Interior Sanctuary",
    heroSubtitle:
      "Spaces shaped by light, material and everyday life. Bespoke residential, commercial and turnkey interiors across India.",
    heroImage: DEFAULT_HERO_IMAGE,
    ctaText: "Explore Portfolio",
    ctaLink: "/#portfolio-archive",
    ribbonText1: "Mumbai · Bengaluru · Pan India · 12+ Years Practice",
    ribbonText2: "28+ Architectural Commissions · Single-Source Turnkey Accountability",
    statementTitle: "We create considered residential and commercial interiors where material, proportion and light work together.",
    statementText1:
      "Every project we undertake starts by stripping away the non-essential. We avoid ephemeral trends and disposable finishes in pursuit of spaces that breathe: natural vein-cut stone with tactile depth, hand-troweled lime plaster that catches the changing sun, and bespoke millwork resolved with millimeter precision.",
    statementText2:
      "Operating across Mumbai and Bengaluru, our practice provides single-source turnkey accountability from measured drawing sets through to final white-glove styling.",
    stat1Value: "28+",
    stat1Label: "Commissions",
    stat2Value: "12+",
    stat2Label: "Years Active",
    stat3Value: "06",
    stat3Label: "Disciplines",
    stat4Value: "11",
    stat4Label: "Cities",
    beforeAfterCaption: "The Shah Residence, Ahmedabad · 6,400 sq ft transformation",
    beforeLabel: "BEFORE EXECUTION",
    afterLabel: "COMPLETED SANCTUARY",
    philosophy1Title: "01 / HONEST MATERIALS",
    philosophy1Heading: "Stone, Timber & Lime",
    philosophy1Text:
      "We select genuine materials that age with grace. Vein-cut Roman travertine, fumed European oak, and patinated architectural bronze.",
    philosophy2Title: "02 / LIGHT & VOLUME",
    philosophy2Heading: "Daylight as Structure",
    philosophy2Text:
      "Every space is shaped around natural illumination vectors and low-glare 2400K–2700K ambient luminaire layers for evening calm.",
    philosophy3Title: "03 / TURNKEY RIGOR",
    philosophy3Heading: "End-to-End Custody",
    philosophy3Text:
      "From structural drawings to bespoke furniture fabrication and white-glove styling, our single-source governance guarantees zero friction.",
    consultationHeading: "Ready to begin your architectural sanctuary?",
    consultationPhone: "+91 95375 86804",
    consultationEmail: "contact@rightangle.design",
    spotlightProjectSlug: "mehta-executive-suite",
    featuredProjectSlugs: [],
    showServices: true,
    showProcess: true,
    showTestimonials: true,
    showJournal: true,
  });

  // Sync initial query into draft
  useEffect(() => {
    if (homeData) {
      setDraftHome((prev) => ({
        ...prev,
        ...homeData,
        heroImage: homeData.heroImage || prev.heroImage,
        atmospherePhoto: homeData.atmospherePhoto || customAtmospherePhoto,
        beforePhoto: homeData.beforePhoto || customBeforePhoto,
        afterPhoto: homeData.afterPhoto || customAfterPhoto,
      }));
      if (homeData.atmospherePhoto) setCustomAtmospherePhoto(homeData.atmospherePhoto);
      if (homeData.beforePhoto) setCustomBeforePhoto(homeData.beforePhoto);
      if (homeData.afterPhoto) setCustomAfterPhoto(homeData.afterPhoto);
      if (homeData.architecturalFilms && Array.isArray(homeData.architecturalFilms)) {
        setCustomFilms(homeData.architecturalFilms);
      }
      if (homeData.spotlightProjectSlug) {
        setSpotlightSlug(homeData.spotlightProjectSlug);
      }
    }
  }, [homeData]);

  // Sync database process steps and testimonials when available
  useEffect(() => {
    if (processData && processData.length > 0) {
      setCustomProcessSteps(
        processData.map((p, idx) => ({
          _id: p.id,
          number: p.number || String(idx + 1).padStart(2, "0"),
          title: p.title,
          timeline: p.timeline || `Phase ${idx + 1}`,
          description: p.description,
          sortOrder: p.sortOrder ?? idx + 1,
        }))
      );
    }
  }, [processData]);

  useEffect(() => {
    if (testimonialsData && testimonialsData.length > 0) {
      setCustomTestimonials(
        testimonialsData.map((t) => ({
          _id: t.id,
          clientName: t.clientName,
          author: t.clientName,
          project: t.project,
          projectTitle: t.project,
          location: t.location,
          quote: t.quote || t.text,
          text: t.quote || t.text,
          role: t.role || "Homeowner",
          approved: t.approved,
          rating: 5,
        }))
      );
    }
  }, [testimonialsData]);

  // Projects list
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
          tags: [cs.spaceType || "Residential"],
        }))
      : CURATED_STUDIO_PROJECTS;

  const services = servicesData && servicesData.length > 0 ? servicesData : CURATED_STUDIO_SERVICES;
  
  // Spotlight project: selected by admin or first matching project
  const spotlightProject =
    caseStudies.find((s) => s.slug === spotlightSlug || s._id === spotlightSlug) ||
    caseStudies[3] || // default Mehta Executive Suite
    caseStudies[0] ||
    CURATED_STUDIO_PROJECTS[0];

  // Derive available categories for filter preview
  const availableCategories = useMemo(() => {
    const set = new Set<string>(["ALL"]);
    for (const s of caseStudies) {
      if (s.space_type) set.add(s.space_type.toUpperCase());
    }
    return Array.from(set).slice(0, 6);
  }, [caseStudies]);

  const filteredProjects = useMemo(() => {
    if (selectedFilter === "ALL") return caseStudies;
    const term = selectedFilter.toLowerCase();
    return caseStudies.filter((s) => {
      const type = (s.space_type || "").toLowerCase();
      const style = (s.style || "").toLowerCase();
      return type.includes(term) || style.includes(term);
    });
  }, [caseStudies, selectedFilter]);

  // Mutations
  const publishMutation = useMutation({
    mutationFn: async () => {
      await cmsService.updateHomepage({
        ...draftHome,
        atmospherePhoto: customAtmospherePhoto,
        beforePhoto: customBeforePhoto,
        afterPhoto: customAfterPhoto,
        architecturalFilms: customFilms,
        spotlightProjectSlug: spotlightSlug,
        processSteps: customProcessSteps,
        materials: customMaterials,
        testimonials: customTestimonials,
      });
    },
    onSuccess: () => {
      toast.success("All homepage changes published to live customer site!");
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

  const updateCaseStudyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CmsCaseStudyItem> }) => {
      return cmsService.updateCaseStudy(id, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["cms", "projects"] });
      const previousProjects = queryClient.getQueryData(["cms", "projects"]);
      queryClient.setQueryData(["cms", "projects"], (old: any) => {
        if (!old || !old.caseStudies) return old;
        return {
          ...old,
          caseStudies: old.caseStudies.map((cs: any) =>
            cs.id === id || cs._id === id || cs.slug === id ? { ...cs, ...data } : cs
          ),
        };
      });
      return { previousProjects };
    },
    onSuccess: (_result, variables) => {
      toast.success(`Project "${variables.data.title || 'details'}" updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ["cms", "projects"] });
      queryClient.invalidateQueries({ queryKey: ["public"] });
      queryClient.invalidateQueries({ queryKey: ["home-content"] });
      broadcastCmsUpdate({ type: "case_study" });
    },
    onError: (err, _variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["cms", "projects"], context.previousProjects);
      }
      toast.error(err instanceof Error ? err.message : "Failed to update project.");
    },
  });

  // Handle Photo Picker Selection
  const handleSelectMedia = (photoUrl: string) => {
    if (!activeSlotTarget) return;
    const { slotType, targetId, index } = activeSlotTarget;

    if (slotType === "hero") {
      const updated = { ...draftHome, heroImage: photoUrl };
      setDraftHome(updated);
      cmsService
        .updateHomepage({
          ...updated,
          atmospherePhoto: customAtmospherePhoto,
          beforePhoto: customBeforePhoto,
          afterPhoto: customAfterPhoto,
          architecturalFilms: customFilms,
          spotlightProjectSlug: spotlightSlug,
        })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["cms"] });
          queryClient.invalidateQueries({ queryKey: ["public"] });
          queryClient.invalidateQueries({ queryKey: ["home-content"] });
          broadcastCmsUpdate({ type: "hero_photo", url: photoUrl });
          toast.success("Hero photograph updated and live on customer site!");
        })
        .catch(() => setHasUnpublishedChanges(true));
    } else if (slotType === "atmosphere") {
      setCustomAtmospherePhoto(photoUrl);
      cmsService
        .updateHomepage({
          ...draftHome,
          atmospherePhoto: photoUrl,
          beforePhoto: customBeforePhoto,
          afterPhoto: customAfterPhoto,
          architecturalFilms: customFilms,
          spotlightProjectSlug: spotlightSlug,
        })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["cms"] });
          queryClient.invalidateQueries({ queryKey: ["public"] });
          queryClient.invalidateQueries({ queryKey: ["home-content"] });
          broadcastCmsUpdate({ type: "atmosphere_photo", url: photoUrl });
          toast.success("Studio atmosphere photo updated and live!");
        })
        .catch(() => setHasUnpublishedChanges(true));
    } else if (slotType === "project_cover" && targetId) {
      updateCaseStudyMutation.mutate({
        id: targetId,
        data: { heroImage: photoUrl },
      });
    } else if (slotType === "spotlight" && targetId) {
      updateCaseStudyMutation.mutate({
        id: targetId,
        data: { heroImage: photoUrl },
      });
    } else if (slotType === "material" && typeof index === "number") {
      setCustomMaterials((prev) => {
        const copy = [...prev];
        if (copy[index]) {
          copy[index] = { ...copy[index]!, image: photoUrl };
        }
        return copy;
      });
      setHasUnpublishedChanges(true);
      toast.success("Material texture updated in draft!");
    } else if (slotType === "before_image") {
      setCustomBeforePhoto(photoUrl);
      cmsService
        .updateHomepage({
          ...draftHome,
          atmospherePhoto: customAtmospherePhoto,
          beforePhoto: photoUrl,
          afterPhoto: customAfterPhoto,
          architecturalFilms: customFilms,
          spotlightProjectSlug: spotlightSlug,
        })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["cms"] });
          queryClient.invalidateQueries({ queryKey: ["public"] });
          queryClient.invalidateQueries({ queryKey: ["home-content"] });
          broadcastCmsUpdate({ type: "before_photo", url: photoUrl });
          toast.success("Transformation 'Before' photo updated and live!");
        })
        .catch(() => setHasUnpublishedChanges(true));
    } else if (slotType === "after_image") {
      setCustomAfterPhoto(photoUrl);
      cmsService
        .updateHomepage({
          ...draftHome,
          atmospherePhoto: customAtmospherePhoto,
          beforePhoto: customBeforePhoto,
          afterPhoto: photoUrl,
          architecturalFilms: customFilms,
          spotlightProjectSlug: spotlightSlug,
        })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["cms"] });
          queryClient.invalidateQueries({ queryKey: ["public"] });
          queryClient.invalidateQueries({ queryKey: ["home-content"] });
          broadcastCmsUpdate({ type: "after_photo", url: photoUrl });
          toast.success("Transformation 'After' photo updated and live!");
        })
        .catch(() => setHasUnpublishedChanges(true));
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

    cmsService
      .updateHomepage({
        ...updated,
        atmospherePhoto: customAtmospherePhoto,
        beforePhoto: customBeforePhoto,
        afterPhoto: customAfterPhoto,
        architecturalFilms: customFilms,
        spotlightProjectSlug: spotlightSlug,
      })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["cms"] });
        queryClient.invalidateQueries({ queryKey: ["public"] });
        queryClient.invalidateQueries({ queryKey: ["home-content"] });
        broadcastCmsUpdate({ type: "text_saved", field: activeTextSlot.field });
        toast.success(`${activeTextSlot.label} updated and live on customer homepage!`);
      })
      .catch(() => {
        setHasUnpublishedChanges(true);
        toast.success(`${activeTextSlot.label} updated in draft!`);
      });
  };

  // Handle Project Save
  const handleSaveProject = () => {
    if (!editingProject) return;
    updateCaseStudyMutation.mutate({
      id: editingProject.id,
      data: {
        title: editingProject.title,
        subtitle: editingProject.subtitle,
        spaceType: editingProject.spaceType,
        location: editingProject.location,
        areaSqft: Number(editingProject.areaSqft) || 0,
        year: Number(editingProject.year) || 2026,
        summary: editingProject.summary,
        heroImage: editingProject.heroImage,
      },
    });
    setProjectEditorOpen(false);
  };

  // Handle Film Edit Click & Save
  const handleOpenFilmEditor = (film: DriveVideo, index: number) => {
    setEditingFilmIndex(index);
    setFilmForm({
      title: film.title,
      category: film.category,
      location: film.location,
      description: film.description,
      streamUrl: film.streamUrl,
    });
    setFilmEditorOpen(true);
  };

  const handleSaveFilm = () => {
    if (editingFilmIndex === null) return;
    const copy = [...customFilms];
    const target = copy[editingFilmIndex];
    if (target) {
      copy[editingFilmIndex] = {
        ...target,
        title: filmForm.title,
        category: filmForm.category,
        location: filmForm.location,
        description: filmForm.description,
        streamUrl: filmForm.streamUrl || target.streamUrl,
      };
      setCustomFilms(copy);
      setFilmEditorOpen(false);
      setHasUnpublishedChanges(true);

      cmsService
        .updateHomepage({
          ...draftHome,
          atmospherePhoto: customAtmospherePhoto,
          beforePhoto: customBeforePhoto,
          afterPhoto: customAfterPhoto,
          architecturalFilms: copy,
          spotlightProjectSlug: spotlightSlug,
        })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["cms"] });
          queryClient.invalidateQueries({ queryKey: ["public"] });
          queryClient.invalidateQueries({ queryKey: ["home-content"] });
          toast.success("Architectural film updated and live!");
        })
        .catch(() => {
          toast.success("Film updated in draft!");
        });
    }
  };

  // Handle Process Step Save
  const handleSaveProcessStep = () => {
    if (editingProcessIndex === null) return;
    const copy = [...customProcessSteps];
    const target = copy[editingProcessIndex];
    if (target) {
      copy[editingProcessIndex] = {
        ...target,
        number: processForm.number,
        title: processForm.title,
        timeline: processForm.timeline,
        description: processForm.description,
      };
      setCustomProcessSteps(copy);
      setProcessDialogOpen(false);
      setHasUnpublishedChanges(true);
      toast.success("Process step updated in draft!");
    }
  };

  // Handle Testimonial Save
  const handleSaveTestimonial = () => {
    if (editingTestimonialIndex === null) return;
    const copy = [...customTestimonials];
    const target = copy[editingTestimonialIndex];
    if (target) {
      copy[editingTestimonialIndex] = {
        ...target,
        quote: testimonialForm.quote,
        text: testimonialForm.quote,
        clientName: testimonialForm.author,
        author: testimonialForm.author,
        project: testimonialForm.project,
        projectTitle: testimonialForm.project,
        location: testimonialForm.location,
      };
      setCustomTestimonials(copy);
      setTestimonialDialogOpen(false);
      setHasUnpublishedChanges(true);
      toast.success("Client perspective testimonial updated in draft!");
    }
  };

  // Handle Material Save
  const handleSaveMaterial = () => {
    if (editingMaterialIndex === null) return;
    const copy = [...customMaterials];
    const target = copy[editingMaterialIndex];
    if (target) {
      copy[editingMaterialIndex] = {
        ...target,
        name: materialForm.name,
        category: materialForm.category,
        provenance: materialForm.provenance,
        description: materialForm.description,
      };
      setCustomMaterials(copy);
      setMaterialDialogOpen(false);
      setHasUnpublishedChanges(true);
      toast.success("Material details updated in draft!");
    }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Top Control Bar */}
        <PageTitle
          eyebrow="Right Angle Design Studio — Admin CMS"
          title="Customer Homepage Control Center & Live Editor"
          actions={
            <div className="flex flex-wrap items-center gap-3">
              {/* Toggle Edit Controls vs Preview Mode */}
              <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-900 border border-border px-3 py-1.5 rounded-md">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  {editMode ? <Sliders className="size-3 text-accent" /> : <Eye className="size-3 text-accent" />}
                  {editMode ? "Visual Edit Mode" : "Customer Preview"}
                </span>
                <Switch
                  checked={editMode}
                  onCheckedChange={setEditMode}
                  aria-label="Toggle Visual Edit Mode"
                  className="data-[state=checked]:bg-accent"
                />
              </div>

              {hasUnpublishedChanges ? (
                <Badge
                  variant="outline"
                  className="text-xs text-amber-500 border-amber-500/40 animate-pulse bg-amber-500/10 font-mono"
                >
                  ● Unpublished Changes
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs text-emerald-600 border-emerald-500/40 bg-emerald-500/10 font-mono"
                >
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
            1-TO-1 CUSTOMER HOMEPAGE CANVAS
            ===================================================================== */}
        <div className="border border-border/80 bg-stone-900/30 rounded-xl p-2 sm:p-5 flex justify-center min-h-[750px] overflow-hidden">
          <div className="w-full max-w-[1720px] rounded transition-all duration-300 bg-background text-foreground shadow-2xl border border-border/70 overflow-hidden relative">
            
            {/* Simulated Public Header */}
            <header className="border-b border-border/60 bg-background/95 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
              <BrandLogo variant="horizontal" size="sm" />
              <nav className="hidden sm:flex items-center gap-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <span className="text-foreground font-medium border-b-2 border-accent pb-1">Portfolio</span>
                <span>Gallery</span>
                <span>Services</span>
                <span>Process</span>
                <span>Studio</span>
                <span>Contact</span>
              </nav>
              <Button size="sm" variant="outline" className="text-[11px] uppercase tracking-wider h-7 pointer-events-none">
                Book a Consultation
              </Button>
            </header>

            {/* ===================================================================
                SECTION 01 — FULL-SCREEN / CINEMATIC HERO
                =================================================================== */}
            <section className="relative isolate min-h-[70vh] sm:min-h-[85vh] lg:min-h-[90vh] overflow-hidden flex flex-col justify-end pt-20 border-b border-border bg-[#0f0e0d]">
              <DriveImage
                src={draftHome.heroImage}
                alt="Right Angle Design Studio Hero Space"
                className="absolute inset-0 size-full object-cover brightness-[0.85]"
                wrapperClassName="absolute inset-0 size-full"
              />

              {/* Ambient Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none" />

              {/* Edit Hero Photo Button */}
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

              {/* Hero Content Box */}
              <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-10 sm:px-8 sm:pb-16">
                <div className="max-w-3xl space-y-4">
                  {/* Eyebrow */}
                  <p className="eyebrow text-white/80 flex items-center gap-2">
                    <span className="inline-block size-1.5 rounded-full bg-accent" />
                    Architecture & Interior Design
                  </p>

                  {/* Main Headline */}
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
                      "font-display text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight font-light leading-[1.08]",
                      editMode &&
                        "cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-accent p-1.5 -ml-1.5 rounded transition-all group"
                    )}
                  >
                    <span>{draftHome.heroTitle}</span>
                    {editMode && (
                      <Pencil className="inline size-3.5 ml-2 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  {/* Positioning Subtitle */}
                  <div
                    onClick={() => {
                      if (editMode) {
                        setActiveTextSlot({
                          field: "heroSubtitle",
                          label: "Hero Positioning Subtitle",
                          value: draftHome.heroSubtitle,
                          multiline: true,
                        });
                        setTextEditorOpen(true);
                      }
                    }}
                    className={cn(
                      "mt-4 max-w-xl text-sm sm:text-base lg:text-lg leading-relaxed text-white/85 font-light",
                      editMode &&
                        "cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-accent p-1.5 -ml-1.5 rounded transition-all group"
                    )}
                  >
                    <span>{draftHome.heroSubtitle}</span>
                    {editMode && (
                      <Pencil className="inline size-3.5 ml-2 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  {/* CTAs */}
                  <div className="mt-8 flex flex-wrap items-center gap-4 pt-2">
                    <Button className="bg-accent px-7 py-3.5 text-xs font-semibold tracking-[0.2em] text-accent-foreground uppercase pointer-events-none">
                      <span>Explore Portfolio</span>
                      <ArrowRight className="size-3.5 ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      className="border border-white/40 bg-black/20 backdrop-blur-md px-6 py-3.5 text-xs font-medium tracking-[0.18em] text-white uppercase pointer-events-none"
                    >
                      Book a Consultation
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Metadata Ribbon (Editable) */}
              <div className="relative border-t border-white/15 bg-black/65 backdrop-blur-md py-3 text-white/75 text-[11px] sm:text-xs">
                <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 sm:px-8">
                  <div
                    onClick={() => {
                      if (editMode) {
                        setActiveTextSlot({
                          field: "ribbonText1",
                          label: "Ribbon Info (Left)",
                          value: draftHome.ribbonText1 || "Mumbai · Bengaluru · Pan India · 12+ Years Practice",
                        });
                        setTextEditorOpen(true);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-4 sm:gap-6 font-light",
                      editMode && "cursor-pointer hover:text-accent hover:underline transition-colors"
                    )}
                  >
                    <span>{draftHome.ribbonText1 || "Mumbai · Bengaluru · Pan India · 12+ Years Practice"}</span>
                    {editMode && <Pencil className="size-2.5 text-accent" />}
                  </div>

                  <div
                    onClick={() => {
                      if (editMode) {
                        setActiveTextSlot({
                          field: "ribbonText2",
                          label: "Ribbon Info (Right)",
                          value:
                            draftHome.ribbonText2 ||
                            "28+ Architectural Commissions · Single-Source Turnkey Accountability",
                        });
                        setTextEditorOpen(true);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-4 sm:gap-6 font-light",
                      editMode && "cursor-pointer hover:text-accent hover:underline transition-colors"
                    )}
                  >
                    <span>
                      {draftHome.ribbonText2 ||
                        "28+ Architectural Commissions · Single-Source Turnkey Accountability"}
                    </span>
                    {editMode && <Pencil className="size-2.5 text-accent" />}
                  </div>
                </div>
              </div>
            </section>

            {/* ===================================================================
                SECTION 02 — STUDIO STATEMENT & HIGHLIGHT STATS
                =================================================================== */}
            <section className="py-16 sm:py-24 bg-card/30 border-b border-border">
              <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
                <div className="grid gap-12 lg:grid-cols-12 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <p className="eyebrow">THE STUDIO</p>

                    {/* Headline Statement */}
                    <div
                      onClick={() => {
                        if (editMode) {
                          setActiveTextSlot({
                            field: "statementTitle",
                            label: "Studio Statement Headline",
                            value:
                              draftHome.statementTitle ||
                              "We create considered residential and commercial interiors where material, proportion and light work together.",
                            multiline: true,
                          });
                          setTextEditorOpen(true);
                        }
                      }}
                      className={cn(
                        "font-display text-2xl sm:text-4xl lg:text-5xl font-light text-foreground leading-[1.15] tracking-tight",
                        editMode && "cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-accent p-1.5 -ml-1.5 rounded transition-all group"
                      )}
                    >
                      <span>{draftHome.statementTitle}</span>
                      {editMode && <Pencil className="inline size-3.5 ml-2 text-accent opacity-0 group-hover:opacity-100" />}
                    </div>

                    {/* Paragraph 1 */}
                    <div
                      onClick={() => {
                        if (editMode) {
                          setActiveTextSlot({
                            field: "statementText1",
                            label: "Studio Statement Body (Paragraph 1)",
                            value: draftHome.statementText1 || "",
                            multiline: true,
                          });
                          setTextEditorOpen(true);
                        }
                      }}
                      className={cn(
                        "text-sm sm:text-base leading-relaxed text-muted-foreground font-light max-w-2xl",
                        editMode && "cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-accent p-1.5 -ml-1.5 rounded transition-all group"
                      )}
                    >
                      <span>{draftHome.statementText1}</span>
                      {editMode && <Pencil className="inline size-3 ml-2 text-accent opacity-0 group-hover:opacity-100" />}
                    </div>

                    {/* Paragraph 2 */}
                    <div
                      onClick={() => {
                        if (editMode) {
                          setActiveTextSlot({
                            field: "statementText2",
                            label: "Studio Statement Body (Paragraph 2)",
                            value: draftHome.statementText2 || "",
                            multiline: true,
                          });
                          setTextEditorOpen(true);
                        }
                      }}
                      className={cn(
                        "text-sm sm:text-base leading-relaxed text-muted-foreground font-light max-w-2xl",
                        editMode && "cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-accent p-1.5 -ml-1.5 rounded transition-all group"
                      )}
                    >
                      <span>{draftHome.statementText2}</span>
                      {editMode && <Pencil className="inline size-3 ml-2 text-accent opacity-0 group-hover:opacity-100" />}
                    </div>

                    <div>
                      <span className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground font-semibold border-b border-foreground/30 pb-1 pointer-events-none">
                        <span>Discover the Studio</span>
                        <ArrowRight className="size-3" />
                      </span>
                    </div>

                    {/* 4 Architectural Statistics Cards */}
                    <div className="pt-8 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-6">
                      {[
                        { valKey: "stat1Value", lblKey: "stat1Label", defVal: "28+", defLbl: "Commissions" },
                        { valKey: "stat2Value", lblKey: "stat2Label", defVal: "12+", defLbl: "Years Active" },
                        { valKey: "stat3Value", lblKey: "stat3Label", defVal: "06", defLbl: "Disciplines" },
                        { valKey: "stat4Value", lblKey: "stat4Label", defVal: "11", defLbl: "Cities" },
                      ].map((st, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            if (editMode) {
                              setActiveTextSlot({
                                field: st.valKey,
                                label: `Stat #${i + 1} Value (e.g. ${st.defVal})`,
                                value: (draftHome as any)[st.valKey] || st.defVal,
                              });
                              setTextEditorOpen(true);
                            }
                          }}
                          className={cn(
                            "group p-2 rounded transition-all",
                            editMode && "cursor-pointer hover:bg-accent/10 border border-transparent hover:border-accent/40"
                          )}
                        >
                          <span className="font-display text-2xl sm:text-3xl font-light text-foreground group-hover:text-accent">
                            {(draftHome as any)[st.valKey] || st.defVal}
                          </span>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                            {(draftHome as any)[st.lblKey] || st.defLbl}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Studio Atmosphere Photography with Replace Button */}
                  <div className="group relative lg:col-span-5 overflow-hidden bg-stone aspect-[4/5] border border-border">
                    <DriveImage
                      src={customAtmospherePhoto}
                      alt="Studio Atmosphere"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
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
              </div>
            </section>

            {/* ===================================================================
                SECTION 02.5 — ARCHITECTURAL CINEMA & VIDEO REELS DISPATCH (EDITABLE)
                =================================================================== */}
            <div className="relative">
              <ArchitecturalFilmsSection
                films={customFilms}
                isEditable={editMode}
                onEditFilm={handleOpenFilmEditor}
              />
            </div>

            {/* ===================================================================
                SECTION 03 & 04 — SELECTED PORTFOLIO PROJECTS (EXACT EDITORIAL LAYOUT)
                =================================================================== */}
            <section id="portfolio-archive" className="py-16 sm:py-24 bg-background scroll-mt-20 border-t border-border">
              <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-border">
                  <div>
                    <p className="eyebrow">SELECTED WORK</p>
                    <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground tracking-tight">
                      Featured Architectural Commissions
                    </h2>
                  </div>

                  {/* Dynamic Category Filter */}
                  {availableCategories.length > 1 && (
                    <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-1">
                      {availableCategories.map((cat) => {
                        const isActive = selectedFilter === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedFilter(cat)}
                            className={cn(
                              "relative py-1 text-xs uppercase tracking-[0.2em] transition-colors cursor-pointer whitespace-nowrap",
                              isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <span>{cat}</span>
                            {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* EXACT EDITORIAL ALTERNATING LAYOUT AS SHOWN IN SCREENSHOTS 2 & 3 */}
                <div className="pt-12 space-y-16 sm:space-y-24">
                  {filteredProjects.slice(0, 5).map((project, idx) => {
                    const formattedIndex = String(idx + 1).padStart(2, "0");
                    const isLeftImage = idx % 2 === 0;

                    return (
                      <div
                        key={project._id || project.slug || idx}
                        className={cn(
                          "grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-center relative group p-3 rounded-lg border border-transparent transition-all",
                          editMode && "hover:border-accent/40 hover:bg-card/20"
                        )}
                      >
                        {/* Dominant Image Block */}
                        <div
                          className={cn(
                            "relative overflow-hidden bg-stone border border-border md:col-span-7 lg:col-span-8 aspect-[4/3] sm:aspect-[16/10]",
                            !isLeftImage && "md:order-2"
                          )}
                        >
                          <DriveImage
                            src={project.hero_image}
                            alt={project.title}
                            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                            wrapperClassName="size-full"
                          />
                          {editMode && (
                            <div className="absolute top-3 right-3 z-20 flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setActiveSlotTarget({
                                    slotType: "project_cover",
                                    targetId: project._id || project.slug,
                                    title: `${project.title} — Cover Photo`,
                                    currentUrl: project.hero_image,
                                  });
                                  setMediaPickerOpen(true);
                                }}
                                className="bg-black/85 hover:bg-black text-white text-[11px] border border-white/20 shadow-md backdrop-blur-sm h-7 cursor-pointer"
                              >
                                <ImageIcon className="size-3 mr-1 text-accent" /> Replace Cover
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Supporting Editorial Story */}
                        <div
                          className={cn(
                            "md:col-span-5 lg:col-span-4 flex flex-col justify-center space-y-3.5 lg:space-y-4",
                            !isLeftImage && "md:order-1"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              <span className="font-mono text-accent font-semibold">{formattedIndex}</span>
                              <span>·</span>
                              <span>{project.space_type || "Residential"}</span>
                              <span>·</span>
                              <span>{project.year || "2026"}</span>
                            </div>

                            {editMode && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingProject({
                                    id: project._id || project.slug,
                                    title: project.title,
                                    subtitle: project.subtitle || "",
                                    spaceType: project.space_type || "",
                                    location: project.location || "",
                                    areaSqft: project.area_sqft || 0,
                                    year: project.year || 2026,
                                    summary: project.summary || "",
                                    heroImage: project.hero_image,
                                  });
                                  setProjectEditorOpen(true);
                                }}
                                className="h-6 px-2 text-[10px] uppercase font-mono tracking-wider border-accent/40 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground cursor-pointer"
                              >
                                <Pencil className="size-2.5 mr-1" /> Edit Details
                              </Button>
                            )}
                          </div>

                          <h3
                            onClick={() => {
                              if (editMode) {
                                setEditingProject({
                                  id: project._id || project.slug,
                                  title: project.title,
                                  subtitle: project.subtitle || "",
                                  spaceType: project.space_type || "",
                                  location: project.location || "",
                                  areaSqft: project.area_sqft || 0,
                                  year: project.year || 2026,
                                  summary: project.summary || "",
                                  heroImage: project.hero_image,
                                });
                                setProjectEditorOpen(true);
                              }
                            }}
                            className={cn(
                              "font-display text-2xl sm:text-3xl lg:text-4xl font-light text-foreground tracking-tight leading-[1.15]",
                              editMode && "cursor-pointer hover:text-accent transition-colors"
                            )}
                          >
                            {project.title}
                          </h3>

                          <p className="text-xs uppercase tracking-wider text-muted-foreground/90 font-medium">
                            {project.location}
                            {project.area_sqft ? ` · ${project.area_sqft.toLocaleString()} Sq Ft` : ""}
                          </p>

                          {project.summary && (
                            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground font-light pt-1 line-clamp-3">
                              {project.summary}
                            </p>
                          )}

                          <div className="pt-2">
                            <span className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground font-medium border-b border-foreground/30 pb-1 pointer-events-none">
                              <span>View Project</span>
                              <ArrowRight className="size-3.5 text-accent" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ===================================================================
                SECTION 05 — EDITORIAL SPOTLIGHT (EXACT MATCH FOR SCREENSHOT 4)
                =================================================================== */}
            {spotlightProject && (
              <section className="border-t border-border bg-card/20 py-16 sm:py-24">
                <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
                  {/* Spotlight Project Selector in Edit Mode */}
                  {editMode && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-lg border border-accent/40 bg-accent/5">
                      <div className="flex items-center gap-2 text-xs font-mono text-foreground">
                        <Star className="size-3.5 text-accent" />
                        <span className="font-semibold uppercase tracking-wider">Spotlight Project Feature:</span>
                        <select
                          value={spotlightSlug}
                          onChange={(e) => {
                            const newSlug = e.target.value;
                            setSpotlightSlug(newSlug);
                            setHasUnpublishedChanges(true);
                            cmsService
                              .updateHomepage({
                                ...draftHome,
                                spotlightProjectSlug: newSlug,
                              })
                              .then(() => {
                                queryClient.invalidateQueries({ queryKey: ["cms"] });
                                queryClient.invalidateQueries({ queryKey: ["public"] });
                                queryClient.invalidateQueries({ queryKey: ["home-content"] });
                                toast.success("Spotlight project changed!");
                              });
                          }}
                          className="bg-background border border-border px-2.5 py-1 text-xs rounded font-sans cursor-pointer ml-1"
                        >
                          {caseStudies.map((cs) => (
                            <option key={cs._id || cs.slug} value={cs.slug || cs._id}>
                              {cs.title} ({cs.location})
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingProject({
                            id: spotlightProject._id || spotlightProject.slug,
                            title: spotlightProject.title,
                            subtitle: spotlightProject.subtitle || "",
                            spaceType: spotlightProject.space_type || "",
                            location: spotlightProject.location || "",
                            areaSqft: spotlightProject.area_sqft || 0,
                            year: spotlightProject.year || 2026,
                            summary: spotlightProject.summary || "",
                            heroImage: spotlightProject.hero_image,
                          });
                          setProjectEditorOpen(true);
                        }}
                        className="text-xs h-7 border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      >
                        <Pencil className="size-3 mr-1" /> Edit Spotlight Project
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    {/* Left: 16/10 Photo */}
                    <div className="relative lg:col-span-7 aspect-[16/10] overflow-hidden bg-stone border border-border">
                      <DriveImage
                        src={spotlightProject.hero_image}
                        alt={spotlightProject.title}
                        className="size-full object-cover transition-transform duration-700 hover:scale-105"
                        wrapperClassName="size-full"
                      />
                      {editMode && (
                        <div className="absolute top-3 right-3 z-20">
                          <Button
                            size="sm"
                            onClick={() => {
                              setActiveSlotTarget({
                                slotType: "spotlight",
                                targetId: spotlightProject._id || spotlightProject.slug,
                                title: `Spotlight: ${spotlightProject.title}`,
                                currentUrl: spotlightProject.hero_image,
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

                    {/* Right: Narrative */}
                    <div className="lg:col-span-5 space-y-5">
                      <p className="eyebrow">EDITORIAL SPOTLIGHT</p>
                      
                      <h3
                        onClick={() => {
                          if (editMode) {
                            setEditingProject({
                              id: spotlightProject._id || spotlightProject.slug,
                              title: spotlightProject.title,
                              subtitle: spotlightProject.subtitle || "",
                              spaceType: spotlightProject.space_type || "",
                              location: spotlightProject.location || "",
                              areaSqft: spotlightProject.area_sqft || 0,
                              year: spotlightProject.year || 2026,
                              summary: spotlightProject.summary || "",
                              heroImage: spotlightProject.hero_image,
                            });
                            setProjectEditorOpen(true);
                          }
                        }}
                        className={cn(
                          "font-display text-2xl sm:text-4xl font-light text-foreground tracking-tight leading-[1.15]",
                          editMode && "cursor-pointer hover:text-accent transition-colors"
                        )}
                      >
                        {spotlightProject.title}
                      </h3>

                      {spotlightProject.subtitle && (
                        <p className="font-editorial text-base sm:text-lg italic text-foreground/85 font-light">
                          {spotlightProject.subtitle}
                        </p>
                      )}

                      <p className="text-sm leading-relaxed text-muted-foreground font-light">
                        {spotlightProject.summary ||
                          "A sequence of flowing spatial chambers defined by vein-matched Roman travertine portals and custom cast brass pull handles."}
                      </p>

                      <div className="pt-2 flex flex-wrap gap-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                        <span>TYPOLOGY: {spotlightProject.space_type || "COMMERCIAL OFFICE"}</span>
                        <span>·</span>
                        <span>LOCATION: {spotlightProject.location || "YAGNIK ROAD, RAJKOT"}</span>
                      </div>

                      <div className="pt-4">
                        <Button className="inline-flex items-center gap-2.5 bg-foreground px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-background pointer-events-none font-medium">
                          <span>View Case Study</span>
                          <ArrowRight className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ===================================================================
                SECTION 06 — PRACTICE DISCIPLINES (Services)
                =================================================================== */}
            <section className="py-10 sm:py-14 bg-background border-t border-border">
              <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
                <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-border">
                  <div>
                    <p className="eyebrow">PRACTICE DISCIPLINES</p>
                    <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground tracking-tight">
                      Disciplines & Scope of Practice
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground font-semibold pointer-events-none">
                    Full Service Overview <ArrowRight className="size-3.5" />
                  </span>
                </div>

                <div className="pt-6">
                  <EditorialServicesSection services={services} />
                </div>
              </div>
            </section>

            {/* ===================================================================
                SECTION 07 — PROCESS / METHODOLOGY (5-Stage Architectural Process)
                =================================================================== */}
            <section className="border-t border-border bg-card/30 py-16 sm:py-24">
              <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-10 border-b border-border">
                  <div className="max-w-2xl">
                    <p className="eyebrow">METHODOLOGY</p>
                    <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground tracking-tight">
                      Our 5-Stage Architectural Process
                    </h2>
                    <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                      From initial laser site survey through to final white-glove handover, our structured
                      methodology eliminates ambiguity.
                    </p>
                  </div>
                </div>

                {/* Timeline display */}
                <div className="pt-8">
                  <ProcessTimeline steps={customProcessSteps} />
                </div>

                {/* Edit Controls for Process Steps */}
                {editMode && (
                  <div className="mt-8 pt-6 border-t border-border/60">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-3">
                      Manage Process Steps (Click to Edit):
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {customProcessSteps.map((step, idx) => (
                        <Button
                          key={step._id || idx}
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingProcessIndex(idx);
                            setProcessForm({
                              number: step.number || String(idx + 1).padStart(2, "0"),
                              title: step.title,
                              timeline: step.timeline || "",
                              description: step.description,
                            });
                            setProcessDialogOpen(true);
                          }}
                          className="text-xs h-8 bg-card border-border/80 text-foreground hover:border-accent hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer font-medium"
                        >
                          <Pencil className="size-3 mr-1.5 text-accent" />
                          Step {step.number}: {step.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ===================================================================
                SECTION 08 — MATERIALITY & CRAFT (Tactile Material Provenance)
                =================================================================== */}
            <section className="border-t border-border bg-background py-16 sm:py-24">
              <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-border">
                  <div>
                    <p className="eyebrow">MATERIALITY & CRAFT</p>
                    <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground tracking-tight">
                      Tactile Material Provenance
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md font-light">
                    Every stone slab, timber flitch, and patinated metal profile is selected directly from quarries and mills.
                  </p>
                </div>

                <div className="pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {customMaterials.map((m, idx) => (
                    <div
                      key={m._id || idx}
                      className="group border border-border/80 bg-card/60 rounded-sm overflow-hidden hover:border-accent/60 transition-all duration-500"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-stone relative">
                        <DriveImage
                          src={m.image}
                          alt={m.name}
                          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                          wrapperClassName="size-full"
                        />
                        {editMode && (
                          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => {
                                setActiveSlotTarget({
                                  slotType: "material",
                                  index: idx,
                                  title: `Material: ${m.name}`,
                                  currentUrl: m.image,
                                });
                                setMediaPickerOpen(true);
                              }}
                              className="bg-black/85 hover:bg-black text-white text-[10px] border border-white/20 h-6 px-2 cursor-pointer shadow-md"
                            >
                              <ImageIcon className="size-3 mr-1 text-accent" /> Change Texture
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingMaterialIndex(idx);
                                setMaterialForm({
                                  name: m.name,
                                  category: m.category,
                                  provenance: m.provenance,
                                  description: m.description,
                                });
                                setMaterialDialogOpen(true);
                              }}
                              className="bg-black/85 hover:bg-black text-white text-[10px] border border-white/20 h-6 px-2 cursor-pointer shadow-md"
                            >
                              <Pencil className="size-3 text-accent" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="p-6 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-accent font-mono font-medium">
                          <span>{m.category}</span>
                          <span className="text-muted-foreground/80 font-normal">{m.provenance}</span>
                        </div>
                        <h4 className="font-display text-xl text-foreground font-light">{m.name}</h4>
                        <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed font-light line-clamp-3">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ===================================================================
                SECTION 09 — BEFORE / AFTER TRANSFORMATION
                =================================================================== */}
            <section className="border-t border-border bg-card/20 py-16 sm:py-24">
              <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-10 border-b border-border">
                  <div className="max-w-2xl">
                    <p className="eyebrow">TRANSFORMATION</p>
                    <h2 className="mt-2 text-2xl sm:text-4xl font-display font-light text-foreground tracking-tight">
                      From Bare Shell to Architectural Sanctuary
                    </h2>
                    <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                      Slide the divider below to inspect the transformation.
                    </p>
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
                        className="text-xs h-8 bg-card text-foreground border-border hover:border-accent hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="size-3.5 mr-1.5 text-accent" /> Change 'Before'
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
                        className="text-xs h-8 bg-card text-foreground border-border hover:border-accent hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="size-3.5 mr-1.5 text-accent" /> Change 'After'
                      </Button>
                    </div>
                  )}
                </div>

                <div className="pt-8">
                  <BeforeAfterSlider
                    beforeUrl={customBeforePhoto}
                    afterUrl={customAfterPhoto}
                    beforeLabel={draftHome.beforeLabel || "BEFORE EXECUTION"}
                    afterLabel={draftHome.afterLabel || "COMPLETED SANCTUARY"}
                    caption={draftHome.beforeAfterCaption || "The Shah Residence, Ahmedabad · 6,400 sq ft transformation"}
                    aspectRatio="aspect-[16/9] sm:aspect-[21/10]"
                  />
                </div>

                {editMode && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setActiveTextSlot({
                          field: "beforeAfterCaption",
                          label: "Transformation Caption",
                          value:
                            draftHome.beforeAfterCaption ||
                            "The Shah Residence, Ahmedabad · 6,400 sq ft transformation",
                        });
                        setTextEditorOpen(true);
                      }}
                      className="text-xs text-muted-foreground hover:text-accent cursor-pointer"
                    >
                      <Pencil className="size-3 mr-1.5 text-accent" /> Edit Slider Caption
                    </Button>
                  </div>
                )}
              </div>
            </section>

            {/* ===================================================================
                SECTION 10 — ABOUT THE STUDIO / PHILOSOPHY
                =================================================================== */}
            <section className="border-t border-border bg-background py-16 sm:py-24">
              <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {/* Card 1 */}
                  <div
                    onClick={() => {
                      if (editMode) {
                        setActiveTextSlot({
                          field: "philosophy1Heading",
                          label: "Philosophy #1 Heading",
                          value: draftHome.philosophy1Heading || "Stone, Timber & Lime",
                        });
                        setTextEditorOpen(true);
                      }
                    }}
                    className={cn(
                      "border-t border-accent/60 pt-6 space-y-3 p-2 rounded transition-all",
                      editMode && "cursor-pointer hover:bg-card/40 border border-transparent hover:border-accent/30"
                    )}
                  >
                    <span className="font-mono text-xs text-accent font-semibold">
                      {draftHome.philosophy1Title || "01 / HONEST MATERIALS"}
                    </span>
                    <h4 className="font-display text-xl text-foreground font-light">
                      {draftHome.philosophy1Heading || "Stone, Timber & Lime"}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                      {draftHome.philosophy1Text ||
                        "We select genuine materials that age with grace. Vein-cut Roman travertine, fumed European oak, and patinated architectural bronze."}
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div
                    onClick={() => {
                      if (editMode) {
                        setActiveTextSlot({
                          field: "philosophy2Heading",
                          label: "Philosophy #2 Heading",
                          value: draftHome.philosophy2Heading || "Daylight as Structure",
                        });
                        setTextEditorOpen(true);
                      }
                    }}
                    className={cn(
                      "border-t border-accent/60 pt-6 space-y-3 p-2 rounded transition-all",
                      editMode && "cursor-pointer hover:bg-card/40 border border-transparent hover:border-accent/30"
                    )}
                  >
                    <span className="font-mono text-xs text-accent font-semibold">
                      {draftHome.philosophy2Title || "02 / LIGHT & VOLUME"}
                    </span>
                    <h4 className="font-display text-xl text-foreground font-light">
                      {draftHome.philosophy2Heading || "Daylight as Structure"}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                      {draftHome.philosophy2Text ||
                        "Every space is shaped around natural illumination vectors and low-glare 2400K–2700K ambient luminaire layers for evening calm."}
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div
                    onClick={() => {
                      if (editMode) {
                        setActiveTextSlot({
                          field: "philosophy3Heading",
                          label: "Philosophy #3 Heading",
                          value: draftHome.philosophy3Heading || "End-to-End Custody",
                        });
                        setTextEditorOpen(true);
                      }
                    }}
                    className={cn(
                      "border-t border-accent/60 pt-6 space-y-3 p-2 rounded transition-all",
                      editMode && "cursor-pointer hover:bg-card/40 border border-transparent hover:border-accent/30"
                    )}
                  >
                    <span className="font-mono text-xs text-accent font-semibold">
                      {draftHome.philosophy3Title || "03 / TURNKEY RIGOR"}
                    </span>
                    <h4 className="font-display text-xl text-foreground font-light">
                      {draftHome.philosophy3Heading || "End-to-End Custody"}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                      {draftHome.philosophy3Text ||
                        "From structural drawings to bespoke furniture fabrication and white-glove styling, our single-source governance guarantees zero friction."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ===================================================================
                SECTION 11 — CLIENT PERSPECTIVES (Testimonials)
                =================================================================== */}
            <section className="border-t border-border bg-card/30 py-16 sm:py-20">
              <div className="mx-auto max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
                <div className="flex items-center justify-between pb-8">
                  <p className="eyebrow">CLIENT PERSPECTIVES</p>
                  {editMode && (
                    <Badge variant="outline" className="text-[11px] font-mono text-muted-foreground">
                      Click any testimonial to edit quote & client name
                    </Badge>
                  )}
                </div>

                <div className="grid gap-10 md:grid-cols-3 max-w-6xl mx-auto">
                  {customTestimonials.slice(0, 3).map((t, idx) => (
                    <div
                      key={t._id || idx}
                      onClick={() => {
                        if (editMode) {
                          setEditingTestimonialIndex(idx);
                          setTestimonialForm({
                            quote: t.quote || t.text || "",
                            author: t.author || t.clientName || "",
                            project: t.project || t.projectTitle || "",
                            location: t.location || "",
                          });
                          setTestimonialDialogOpen(true);
                        }
                      }}
                      className={cn(
                        "flex flex-col justify-between border-l-2 border-accent/80 bg-card/40 p-6 rounded-r-md transition-all duration-300",
                        editMode && "cursor-pointer hover:bg-card/80 hover:shadow-lg border hover:border-accent/40"
                      )}
                    >
                      <p className="font-editorial text-base sm:text-lg font-light italic text-foreground leading-relaxed">
                        “{t.quote || t.text}”
                      </p>
                      <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                        <div>
                          <p className="font-display text-sm text-foreground font-medium">{t.author || t.clientName}</p>
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5 font-light">
                            {t.project || t.projectTitle} · {t.location}
                          </p>
                        </div>
                        {editMode && <Pencil className="size-3 text-accent" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ===================================================================
                SECTION 13 — PHOTO VAULT & ARCHITECTURAL DISPATCH
                =================================================================== */}
            <section className="border-t border-border bg-background py-16 sm:py-24">
              <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4 pb-10 border-b border-border">
                  <div>
                    <p className="eyebrow flex items-center gap-2">
                      <Instagram className="size-3 text-accent" /> STUDIO DISPATCH
                    </p>
                    <h2 className="mt-2 text-2xl sm:text-4xl font-display font-normal text-foreground">
                      Material Studies & Site Dispatch
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.08em] text-accent font-semibold pointer-events-none">
                    Follow Right Angle Design Studio on Instagram <ArrowUpRight className="size-3.5" />
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                  {GOOGLE_DRIVE_PHOTOS.slice(0, 6).map((item, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "group relative aspect-square overflow-hidden bg-secondary/30 border border-border/60",
                        idx >= 4 && "hidden lg:block"
                      )}
                    >
                      <DriveImage
                        src={item.url}
                        alt={item.caption || item.title || "Studio Dispatch"}
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        wrapperClassName="size-full"
                      />
                      <div className="absolute inset-0 bg-black/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-3">
                        <p className="text-xs text-white line-clamp-2 leading-snug font-medium">
                          {item.caption || item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ===================================================================
                SECTION 14 — CONSULTATION & STUDIO CONTACT
                =================================================================== */}
            <section className="border-t border-border bg-card/40 py-16 sm:py-24">
              <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
                <div className="grid gap-12 lg:grid-cols-12 items-center">
                  <div className="lg:col-span-8 space-y-4">
                    <p className="eyebrow">INITIATE AN ARCHITECTURAL COMMISSION</p>
                    <div
                      onClick={() => {
                        if (editMode) {
                          setActiveTextSlot({
                            field: "consultationHeading",
                            label: "Consultation Callout Heading",
                            value:
                              draftHome.consultationHeading ||
                              "Ready to begin your architectural sanctuary?",
                          });
                          setTextEditorOpen(true);
                        }
                      }}
                      className={cn(
                        "font-display text-2xl sm:text-4xl text-foreground font-light leading-tight",
                        editMode && "cursor-pointer hover:text-accent transition-colors"
                      )}
                    >
                      <span>{draftHome.consultationHeading || "Ready to begin your architectural sanctuary?"}</span>
                      {editMode && <Pencil className="inline size-3.5 ml-2 text-accent" />}
                    </div>

                    <p className="text-sm text-muted-foreground font-light max-w-xl">
                      Founded and directed by Principal Architect <strong className="text-foreground font-medium">Ravi Pipaliya</strong>, Right Angle Design Studio provides single-source turnkey accountability across India.
                    </p>

                    <div className="pt-4 flex flex-wrap gap-6 text-xs uppercase tracking-wider text-foreground font-medium">
                      <div
                        onClick={() => {
                          if (editMode) {
                            setActiveTextSlot({
                              field: "consultationPhone",
                              label: "Studio Phone / WhatsApp",
                              value: draftHome.consultationPhone || "+91 95375 86804",
                            });
                            setTextEditorOpen(true);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2",
                          editMode && "cursor-pointer hover:text-accent transition-colors"
                        )}
                      >
                        <Phone className="size-3.5 text-accent" />
                        <span>{draftHome.consultationPhone || "+91 95375 86804"}</span>
                      </div>

                      <div
                        onClick={() => {
                          if (editMode) {
                            setActiveTextSlot({
                              field: "consultationEmail",
                              label: "Studio Email",
                              value: draftHome.consultationEmail || "contact@rightangle.design",
                            });
                            setTextEditorOpen(true);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2",
                          editMode && "cursor-pointer hover:text-accent transition-colors"
                        )}
                      >
                        <Mail className="size-3.5 text-accent" />
                        <span>{draftHome.consultationEmail || "contact@rightangle.design"}</span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="size-3.5 text-accent" />
                        <span>Mumbai · Ahmedabad · Bengaluru</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 flex flex-col gap-3">
                    <Button className="bg-accent text-accent-foreground uppercase tracking-widest text-xs font-semibold py-4 pointer-events-none">
                      Schedule Private Consultation
                    </Button>
                    <p className="text-[11px] text-muted-foreground text-center font-mono">
                      Direct Principal Custody · Turnkey Delivery
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Simulated Public Footer */}
            <footer className="border-t border-border bg-background py-8 px-6 text-center text-xs text-muted-foreground font-light">
              <div className="flex flex-col sm:flex-row items-center justify-between max-w-[1400px] mx-auto gap-4">
                <BrandLogo variant="horizontal" size="sm" />
                <p>© 2026 RIGHT ANGLE DESIGN STUDIO. All architectural commissions reserved.</p>
                <div className="flex gap-4 uppercase tracking-wider text-[10px]">
                  <span>Terms</span>
                  <span>·</span>
                  <span>Privacy</span>
                  <span>·</span>
                  <span>Sitemap</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* =======================================================================
          MODALS & DIALOGS
          ======================================================================= */}

      {/* Google Drive Media Picker Modal */}
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

      {/* Project Editor Dialog (Screenshots 2 & 3) */}
      <Dialog open={projectEditorOpen} onOpenChange={setProjectEditorOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display font-light text-xl">
              Edit Project: {editingProject?.title || "Architectural Project"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Modify project title, typology, location, area, summary, and cover photograph.
            </DialogDescription>
          </DialogHeader>

          {editingProject && (
            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-mono uppercase text-muted-foreground">Project Title</label>
                  <Input
                    value={editingProject.title}
                    onChange={(e) => setEditingProject((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                    className="mt-1 font-display text-base"
                    placeholder="e.g. Mehta Executive Suite"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-mono uppercase text-muted-foreground">Subtitle / Architectural Concept</label>
                  <Input
                    value={editingProject.subtitle}
                    onChange={(e) => setEditingProject((prev) => (prev ? { ...prev, subtitle: e.target.value } : null))}
                    className="mt-1"
                    placeholder="e.g. Boutique Financial Headquarters & Private Salon"
                  />
                </div>

                <div>
                  <label className="font-mono uppercase text-muted-foreground">Typology / Space Type</label>
                  <Input
                    value={editingProject.spaceType}
                    onChange={(e) => setEditingProject((prev) => (prev ? { ...prev, spaceType: e.target.value } : null))}
                    className="mt-1"
                    placeholder="e.g. Commercial Office or Residential Villa"
                  />
                </div>

                <div>
                  <label className="font-mono uppercase text-muted-foreground">Location</label>
                  <Input
                    value={editingProject.location}
                    onChange={(e) => setEditingProject((prev) => (prev ? { ...prev, location: e.target.value } : null))}
                    className="mt-1"
                    placeholder="e.g. Yagnik Road, Rajkot"
                  />
                </div>

                <div>
                  <label className="font-mono uppercase text-muted-foreground">Area (Sq Ft)</label>
                  <Input
                    type="number"
                    value={editingProject.areaSqft || ""}
                    onChange={(e) => setEditingProject((prev) => (prev ? { ...prev, areaSqft: Number(e.target.value) } : null))}
                    className="mt-1"
                    placeholder="e.g. 1950"
                  />
                </div>

                <div>
                  <label className="font-mono uppercase text-muted-foreground">Year</label>
                  <Input
                    type="number"
                    value={editingProject.year || 2026}
                    onChange={(e) => setEditingProject((prev) => (prev ? { ...prev, year: Number(e.target.value) } : null))}
                    className="mt-1"
                    placeholder="2026"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono uppercase text-muted-foreground">Summary / Narrative</label>
                <Textarea
                  rows={3}
                  value={editingProject.summary}
                  onChange={(e) => setEditingProject((prev) => (prev ? { ...prev, summary: e.target.value } : null))}
                  className="mt-1 text-sm leading-relaxed"
                  placeholder="A refined workspace with acoustic slat panelling, Italian marble reception desk, and private boardroom."
                />
              </div>

              <div>
                <label className="font-mono uppercase text-muted-foreground">Cover Photograph (Google Drive)</label>
                <div className="mt-1 flex items-center gap-3">
                  <Input
                    value={editingProject.heroImage}
                    onChange={(e) => setEditingProject((prev) => (prev ? { ...prev, heroImage: e.target.value } : null))}
                    className="text-xs font-mono"
                    placeholder="https://lh3.googleusercontent.com/d/..."
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveSlotTarget({
                        slotType: "project_cover",
                        targetId: editingProject.id,
                        title: `Cover Photo: ${editingProject.title}`,
                        currentUrl: editingProject.heroImage,
                      });
                      setMediaPickerOpen(true);
                    }}
                    className="shrink-0 h-9 text-xs cursor-pointer"
                  >
                    <ImageIcon className="size-3.5 mr-1 text-accent" /> Pick Drive Photo
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectEditorOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSaveProject} className="bg-accent text-accent-foreground font-medium cursor-pointer">
              Save Project Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Architectural Film Editor Dialog */}
      <Dialog open={filmEditorOpen} onOpenChange={setFilmEditorOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display font-light text-xl">
              Edit Architectural Walkthrough Reel
            </DialogTitle>
            <DialogDescription className="text-xs">
              Modify the video reel title, architectural discipline scope, location context, narrative, and video stream file.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3.5 text-xs">
            <div>
              <label className="font-mono uppercase text-muted-foreground">Reel Title</label>
              <Input
                value={filmForm.title}
                onChange={(e) => setFilmForm((prev) => ({ ...prev, title: e.target.value }))}
                className="mt-1 font-display text-base"
                placeholder="e.g. The Shah Courtyard Residence — Cinematic Walkthrough"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono uppercase text-muted-foreground">Discipline Scope</label>
                <Input
                  value={filmForm.category}
                  onChange={(e) => setFilmForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="mt-1"
                  placeholder="e.g. Residential Architecture"
                />
              </div>

              <div>
                <label className="font-mono uppercase text-muted-foreground">Location & Context</label>
                <Input
                  value={filmForm.location}
                  onChange={(e) => setFilmForm((prev) => ({ ...prev, location: e.target.value }))}
                  className="mt-1"
                  placeholder="e.g. Ahmedabad, Gujarat"
                />
              </div>
            </div>

            <div>
              <label className="font-mono uppercase text-muted-foreground">Narrative Description</label>
              <Textarea
                rows={3}
                value={filmForm.description}
                onChange={(e) => setFilmForm((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1 text-sm leading-relaxed"
                placeholder="Experience the spatial journey through the double-height central atrium..."
              />
            </div>

            <div>
              <label className="font-mono uppercase text-muted-foreground">Video Stream URL / File</label>
              <Input
                value={filmForm.streamUrl}
                onChange={(e) => setFilmForm((prev) => ({ ...prev, streamUrl: e.target.value }))}
                className="mt-1 font-mono text-xs"
                placeholder="/videos/architectural-film-01.mp4 or Drive stream URL"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFilmEditorOpen(false)}
              className="bg-card text-foreground border-border hover:border-accent hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveFilm}
              className="bg-accent text-accent-foreground font-medium hover:bg-accent/90 cursor-pointer"
            >
              Save Reel Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* General Text Editor Dialog */}
      <Dialog open={textEditorOpen} onOpenChange={setTextEditorOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display font-light text-xl">
              {activeTextSlot?.label || "Edit Content"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {activeTextSlot?.multiline ? (
              <Textarea
                rows={5}
                value={activeTextSlot?.value || ""}
                onChange={(e) =>
                  setActiveTextSlot((prev) => (prev ? { ...prev, value: e.target.value } : null))
                }
                className="text-sm leading-relaxed"
                placeholder="Enter text..."
              />
            ) : (
              <Input
                value={activeTextSlot?.value || ""}
                onChange={(e) =>
                  setActiveTextSlot((prev) => (prev ? { ...prev, value: e.target.value } : null))
                }
                className="font-display text-base"
                placeholder="Enter text..."
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTextEditorOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSaveText} className="bg-accent text-accent-foreground font-medium cursor-pointer">
              Save to Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Step Dialog */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-light text-xl">
              Edit Process Stage {processForm.number}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-muted-foreground">Stage Title</label>
              <Input
                value={processForm.title}
                onChange={(e) => setProcessForm((prev) => ({ ...prev, title: e.target.value }))}
                className="mt-1 font-display"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-muted-foreground">Timeline / Phase</label>
              <Input
                value={processForm.timeline}
                onChange={(e) => setProcessForm((prev) => ({ ...prev, timeline: e.target.value }))}
                className="mt-1"
                placeholder="e.g. Weeks 1–2"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-muted-foreground">Stage Description</label>
              <Textarea
                rows={4}
                value={processForm.description}
                onChange={(e) => setProcessForm((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1 text-sm leading-relaxed"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSaveProcessStep} className="bg-accent text-accent-foreground font-medium cursor-pointer">
              Update Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Testimonial Dialog */}
      <Dialog open={testimonialDialogOpen} onOpenChange={setTestimonialDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-light text-xl">
              Edit Client Perspective
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-muted-foreground">Quote Text</label>
              <Textarea
                rows={4}
                value={testimonialForm.quote}
                onChange={(e) => setTestimonialForm((prev) => ({ ...prev, quote: e.target.value }))}
                className="mt-1 text-sm leading-relaxed"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-muted-foreground">Client Name</label>
              <Input
                value={testimonialForm.author}
                onChange={(e) => setTestimonialForm((prev) => ({ ...prev, author: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono uppercase text-muted-foreground">Project</label>
                <Input
                  value={testimonialForm.project}
                  onChange={(e) => setTestimonialForm((prev) => ({ ...prev, project: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-muted-foreground">Location</label>
                <Input
                  value={testimonialForm.location}
                  onChange={(e) => setTestimonialForm((prev) => ({ ...prev, location: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestimonialDialogOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSaveTestimonial} className="bg-accent text-accent-foreground font-medium cursor-pointer">
              Update Perspective
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Material Dialog */}
      <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-light text-xl">
              Edit Tactile Material
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-muted-foreground">Material Name</label>
              <Input
                value={materialForm.name}
                onChange={(e) => setMaterialForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 font-display"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono uppercase text-muted-foreground">Category</label>
                <Input
                  value={materialForm.category}
                  onChange={(e) => setMaterialForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-muted-foreground">Provenance / Origin</label>
                <Input
                  value={materialForm.provenance}
                  onChange={(e) => setMaterialForm((prev) => ({ ...prev, provenance: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-muted-foreground">Description</label>
              <Textarea
                rows={3}
                value={materialForm.description}
                onChange={(e) => setMaterialForm((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1 text-sm leading-relaxed"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaterialDialogOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSaveMaterial} className="bg-accent text-accent-foreground font-medium cursor-pointer">
              Update Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

import {
  publicService,
  type ServiceItem,
  type ProcessStepItem,
  type TestimonialItem,
  type MaterialItem,
} from "../services/public.service";
import {
  GOOGLE_DRIVE_PHOTOS,
  getPaginatedGoogleDrivePhotos,
  type GoogleDrivePhoto,
  type PaginatedPhotosResult,
  type PhotoFilterParams,
} from "./google-drive-photos";

export type {
  GoogleDrivePhoto,
  PaginatedPhotosResult,
  PhotoFilterParams,
  ServiceItem,
  ProcessStepItem,
  TestimonialItem,
  MaterialItem,
};

export interface CaseCard {
  _id?: string;
  slug: string;
  title: string;
  subtitle?: string;
  location: string;
  year?: number;
  hero_image: string;
  summary: string;
  space_type: string;
  style?: string;
  area_sqft?: number;
  featured?: boolean;
  published_at?: string;
  tags?: string[];
  sortOrder?: number;
}

export interface FullCaseStudy extends CaseCard {
  client_brief?: string;
  brief?: string;
  concept?: string;
  solution?: string;
  timeline?: string;
  execution?: string;
  credits?: Record<string, string>;
  before_after?: {
    beforeUrl: string;
    afterUrl: string;
    beforeLabel?: string;
    afterLabel?: string;
    caption?: string;
  };
  palette?: Array<{ name: string; hex: string; role: string }>;
  specifications?: Array<{ label: string; value: string }>;
  gallery?: Array<{ url: string; caption: string; space: string }>;
  materials?: Array<{ name: string; type: string; provenance: string } | any>;
  scope?: string[];
  rooms?: Array<{
    title?: string;
    name?: string;
    description?: string;
    images?: Array<{ url: string; alt?: string; caption?: string } | any>;
  }>;
  testimonial?: { quote: string; author: string; role: string };
  seo_title?: string;
  seo_description?: string;
}

export interface JournalPost {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  body?: string;
  author?: string;
  cover_image: string;
  coverImage?: string;
  readingTimeMinutes?: number;
  read_minutes?: number;
  published_at?: string;
  publishedAt?: string;
  category: string;
  tags?: string[];
}

export const STUDIO_DETAILS = {
  name: "Right Angle Design Studio",
  tagline: "Interior Architecture & Design Studio",
  phone: "+91 95375 86804",
  email: "contact@rightangledesign.com",
  emailAddress: "contact@rightangledesign.com",
  address: "Studio 4B, The Mill District, Lower Parel, Mumbai 400013",
  officeAddress: "Studio 4B, The Mill District, Lower Parel, Mumbai 400013",
  instagram: "https://www.instagram.com/right_angle_interior_design/",
  instagramHandle: "@right_angle_interior_design",
  instagramUrl: "https://www.instagram.com/right_angle_interior_design/",
  whatsappNumber: "919537586804",
  whatsappFormatted: "+91 95375 86804",
  consultationBookingUrl: "/contact",
};

export async function getPublicGalleryPhotos(params?: PhotoFilterParams): Promise<PaginatedPhotosResult> {
  try {
    const res = await publicService.getGallery(params);
    const data = res?.data || res;
    if (data && (data.items || data.data)) {
      const payload = data.items ? data : data.data;
      return {
        items: payload.items || [],
        total: payload.total || payload.totalCount || 0,
        page: payload.page || payload.currentPage || 1,
        limit: payload.limit || payload.pageSize || 12,
        totalPages: payload.totalPages || Math.ceil((payload.total || 0) / 12) || 1,
        hasNextPage: payload.hasNextPage ?? false,
        hasPrevPage: payload.hasPrevPage ?? false,
        allCategories: payload.allCategories || [],
        allTags: payload.allTags || [],
        totalDriveAssets: payload.totalDriveAssets || payload.total || 0,
      };
    }
  } catch (err) {
    console.error("[API Error] Failed to fetch public gallery:", err);
  }
  return {
    items: [],
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
    allCategories: [],
    allTags: [],
    totalDriveAssets: 0,
  };
}

export const CURATED_STUDIO_MATERIALS: MaterialItem[] = [
  {
    _id: "mat-1",
    name: "Silver Vein-Cut Navona Travertine",
    category: "Natural Stone",
    provenance: "Tivoli, Italy",
    image: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
    description: "Linear vein-cut Italian travertine with subtle slate-grey and cream striations, honed to a silky tactile finish.",
    projectTitle: "The Altamount Penthouse",
  },
  {
    _id: "mat-2",
    name: "Smoked Slavonian Oak Flitch",
    category: "Timber & Veneer",
    provenance: "Slavonia, Croatia",
    image: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
    description: "Quarter-sawn fumed European oak treated with natural botanical oils to deepen the grain and tactile warm shadow.",
    projectTitle: "Alibaug Coastal Villa",
  },
  {
    _id: "mat-3",
    name: "Hand-Patinated Architectural Bronze",
    category: "Metalwork & Accents",
    provenance: "Moradabad, India",
    image: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
    description: "Custom-formulated chemical patina on solid brass extrusions, creating velvety deep-amber reflections.",
    projectTitle: "Shah Courtyard Residence",
  },
  {
    _id: "mat-4",
    name: "Venetian Marmorino & Raw Lime Plaster",
    category: "Surface Finishes",
    provenance: "Treviso, Italy",
    image: "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
    description: "Multi-layered breathable slaked lime plaster infused with crushed Carrara marble for soft acoustic absorption.",
    projectTitle: "Mehta Executive Suite",
  },
  {
    _id: "mat-5",
    name: "Grigio Carnico Fluted Quartzite",
    category: "Monolithic Stone",
    provenance: "Carnic Alps, Italy",
    image: "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
    description: "Charcoal quartzite with dramatic white calcite veins, diamond-fluted for dimensional wall claddings.",
    projectTitle: "Oberoi Sea-Facing Duplex",
  },
  {
    _id: "mat-6",
    name: "Hand-Woven Belgian Organic Linen",
    category: "Soft Textures & Draping",
    provenance: "Flanders, Belgium",
    image: "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
    description: "High-density raw linen drapes filtering natural afternoon sunlight into ambient golden diffuse illumination.",
    projectTitle: "Kothari Pavilions",
  },
];

export const CURATED_STUDIO_PROJECTS: CaseCard[] = [
  {
    _id: "cs-1",
    slug: "altamount-penthouse",
    title: "The Altamount Penthouse",
    subtitle: "Honed silver travertine, smoked oak & panoramic coastal views",
    location: "Mumbai, Maharashtra",
    year: 2026,
    hero_image: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
    summary: "A 5,800 sq ft duplex penthouse framed with honed silver travertine, smoked European oak, and bespoke bronze detailing overlooking the Arabian Sea.",
    space_type: "Penthouse & High-End Residential",
    style: "Quiet Luxury Minimalist",
    area_sqft: 5800,
    featured: true,
    published_at: "2026-01-15",
    tags: ["Penthouse", "Residential", "Mumbai", "Travertine", "Smoked Oak"],
    sortOrder: 1,
  },
  {
    _id: "cs-2",
    slug: "alibaug-coastal-villa",
    title: "Alibaug Coastal Villa",
    subtitle: "Courtyard living, rammed earth textures & bespoke teak millwork",
    location: "Alibaug, Maharashtra",
    year: 2026,
    hero_image: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
    summary: "A tranquil private sanctuary structured around courtyards, rammed earth textures, custom teak millwork, and seamless indoor-outdoor living.",
    space_type: "Coastal Villa & Private Retreat",
    style: "Organic Modernist",
    area_sqft: 7200,
    featured: true,
    published_at: "2026-02-10",
    tags: ["Villa", "Coastal", "Alibaug", "Teak", "Courtyard"],
    sortOrder: 2,
  },
  {
    _id: "cs-3",
    slug: "shah-courtyard-residence",
    title: "The Shah Courtyard Residence",
    subtitle: "Ancestral warmth reimagined with double-height volume & quartzite portals",
    location: "Ahmedabad, Gujarat",
    year: 2026,
    hero_image: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
    summary: "A 6,400 sq ft ancestral estate reinvented with double-height central atrium, monolithic quartzite portals, and fluted teak joinery.",
    space_type: "Residential Architecture",
    style: "Warm Contemporary",
    area_sqft: 6400,
    featured: true,
    published_at: "2026-03-01",
    tags: ["Courtyard", "Heritage Modern", "Ahmedabad", "Quartzite"],
    sortOrder: 3,
  },
  {
    _id: "cs-4",
    slug: "mehta-executive-suite",
    title: "Mehta Executive Suite",
    subtitle: "Private family office suite with acoustic micro-cement & custom bronze",
    location: "Bandra Kurla Complex, Mumbai",
    year: 2026,
    hero_image: "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
    summary: "Private family office suite balancing acoustic micro-cement, velvet leather paneling, and discreet architectural ambient lighting.",
    space_type: "Commercial & Executive Office",
    style: "Executive Elegance",
    area_sqft: 3400,
    featured: true,
    published_at: "2026-03-15",
    tags: ["Commercial", "Executive", "BKC", "Office"],
    sortOrder: 4,
  },
  {
    _id: "cs-5",
    slug: "oberoi-sea-facing-duplex",
    title: "Oberoi Sea-Facing Duplex",
    subtitle: "Monolithic charcoal quartzite & brushed brass accents",
    location: "Worli, Mumbai",
    year: 2026,
    hero_image: "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
    summary: "Monolithic charcoal quartzite and brushed brass accents framing panoramic sea views with bespoke furniture curation.",
    space_type: "Luxury Duplex",
    style: "Sculptural Contemporary",
    area_sqft: 4600,
    featured: true,
    published_at: "2026-04-01",
    tags: ["Duplex", "Worli", "Sea-Facing", "Luxury"],
    sortOrder: 5,
  },
  {
    _id: "cs-6",
    slug: "kothari-pavilions",
    title: "Kothari Pavilions",
    subtitle: "Integrated landscape living, organic linen & water features",
    location: "Koregaon Park, Pune",
    year: 2026,
    hero_image: "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
    summary: "Low-slung pavilion living integrated into lush landscaping, featuring Belgian linen, fluted stone walls, and tranquil water features.",
    space_type: "Pavilion & Landscape Residence",
    style: "Biophilic Modernism",
    area_sqft: 8500,
    featured: true,
    published_at: "2026-04-20",
    tags: ["Pavilion", "Pune", "Biophilic", "Landscape"],
    sortOrder: 6,
  },
];

export const CURATED_STUDIO_SERVICES: ServiceItem[] = [
  {
    _id: "srv-1",
    number: "01",
    title: "Architectural Interior Design",
    slug: "architectural-interior-design",
    shortDesc: "Complete architectural space planning, circulation mapping, and bespoke structural craftsmanship.",
    short_description: "Complete architectural space planning, interior detailing, and bespoke craftsmanship.",
    fullDesc: "Full-service interior architecture including structural space realignment, bespoke portal joinery, daylight orientation, and tailored luxury residential aesthetics.",
    description: "Full-service interior architecture including MEP, structural space realignment, and tailored luxury aesthetics.",
    image: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
    images: [
      "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
      "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
      "https://lh3.googleusercontent.com/d/1lR9CjqpuCkuV2ietp3LOplngUozxQl_R",
      "https://lh3.googleusercontent.com/d/1YhMC1rcK8CG5IIoGohUveL6D4UZzh17f",
    ],
    deliverables: [
      "Comprehensive spatial layouts & daylight mapping",
      "Bespoke joinery, door, and window shop drawings",
      "Architectural lighting design & lux level planning",
      "Full sanitaryware, tile, and stone schedules",
    ],
    link: "/services#residential",
    icon: "Home",
    active: true,
    sortOrder: 1,
    order: 1,
  },
  {
    _id: "srv-2",
    number: "02",
    title: "Bespoke Furniture & Millwork",
    slug: "bespoke-furniture",
    shortDesc: "Custom handcrafted furniture, wardrobe pavilions, and monolithic joinery crafted exclusively for each space.",
    short_description: "Custom handcrafted furniture, artisanal joinery, and curated material curation.",
    fullDesc: "From 1-of-1 dining tables to precision-fluted teak paneling and integrated glass wardrobe pavilions with diffused LED lighting.",
    description: "From custom dining tables to integrated cabinetry, precision-crafted exclusively for each project.",
    image: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
    images: [
      "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
      "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
      "https://lh3.googleusercontent.com/d/1VXY00jcsOzQyxcdQq9g0Uubc7DwmmaPN",
      "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
    ],
    deliverables: [
      "1-of-1 custom dining and cocktail table designs",
      "Integrated sensor LED warm lighting wardrobe suites",
      "Bespoke architectural hardware & patinated brass fittings",
      "Veneer grain matching & hand-rubbed botanical oil finishes",
    ],
    link: "/services#furniture",
    icon: "Layers",
    active: true,
    sortOrder: 2,
    order: 2,
  },
  {
    _id: "srv-3",
    number: "03",
    title: "Turnkey Project Execution",
    slug: "turnkey-execution",
    shortDesc: "Single-source site custody, weekly milestone transparency, and white-glove handover across India.",
    short_description: "End-to-end execution, site supervision, vendor management, and handover.",
    fullDesc: "Comprehensive site governance with vetted master carpenters, masonry teams, and MEP engineers under continuous senior supervision with frozen milestone budgets.",
    description: "Comprehensive site management with rigorous quality control, weekly milestones, and client transparency.",
    image: "https://lh3.googleusercontent.com/d/1UNtmTkQxW0vxEKvv7_POkseU7576wxPR",
    images: [
      "https://lh3.googleusercontent.com/d/1UNtmTkQxW0vxEKvv7_POkseU7576wxPR",
      "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
      "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
      "https://lh3.googleusercontent.com/d/1YhMC1rcK8CG5IIoGohUveL6D4UZzh17f",
    ],
    deliverables: [
      "Frozen bill of quantities (BOQ) with fixed pricing",
      "Weekly on-site quality assurance audits",
      "Direct supervision of electrical, plumbing & HVAC",
      "White-glove handover with photographic progress portal",
    ],
    link: "/services#turnkey",
    icon: "Briefcase",
    active: true,
    sortOrder: 3,
    order: 3,
  },
];

export const CURATED_STUDIO_PROCESS: ProcessStepItem[] = [
  { _id: "step-1", stepNumber: 1, title: "Discovery & Briefing", description: "In-depth consultation to map spatial needs, aesthetic aspirations, and lifestyle requirements.", order: 1 },
  { _id: "step-2", stepNumber: 2, title: "Concept & Spatial Planning", description: "3D architectural visualizations, mood boards, and functional layout schemes.", order: 2 },
  { _id: "step-3", stepNumber: 3, title: "Material & Detail Specifications", description: "Finishes curation, custom joinery drawings, lighting plans, and detailed BOQs.", order: 3 },
  { _id: "step-4", stepNumber: 4, title: "Site Execution & Handover", description: "On-site supervision, craftsmanship QA, finishing touches, and milestone handover.", order: 4 },
];

export const CURATED_STUDIO_TESTIMONIALS: TestimonialItem[] = [
  {
    _id: "test-1",
    clientName: "Rajesh & Sunita Mehta",
    author: "Rajesh & Sunita Mehta",
    project: "The Altamount Penthouse",
    projectTitle: "The Altamount Penthouse",
    location: "Mumbai",
    text: "Right-Angle-Design-Studio transformed our Altamount Penthouse with flawless attention to light, joinery, and craftsmanship. The living spaces feel tranquil and timeless.",
    quote: "Right-Angle-Design-Studio transformed our Altamount Penthouse with flawless attention to light, joinery, and craftsmanship. The living spaces feel tranquil and timeless.",
    role: "Homeowners",
    rating: 5,
    approved: true,
  },
  {
    _id: "test-2",
    clientName: "Vikram Singhania",
    author: "Vikram Singhania",
    project: "Alibaug Coastal Villa",
    projectTitle: "Alibaug Coastal Villa",
    location: "Alibaug",
    text: "Their turnkey execution and honesty in material selection made our Alibaug villa an effortless retreat. Every room frames daylight with exceptional poise.",
    quote: "Their turnkey execution and honesty in material selection made our Alibaug villa an effortless retreat. Every room frames daylight with exceptional poise.",
    role: "Estate Owner",
    rating: 5,
    approved: true,
  },
  {
    _id: "test-3",
    clientName: "Anand Shah",
    author: "Anand Shah",
    project: "Shah Courtyard Residence",
    projectTitle: "Shah Courtyard Residence",
    location: "Ahmedabad",
    text: "The level of detailing in the Shah Courtyard Residence is truly world-class. The double-height atrium and fluted teak millwork are architectural masterworks.",
    quote: "The level of detailing in the Shah Courtyard Residence is truly world-class. The double-height atrium and fluted teak millwork are architectural masterworks.",
    role: "Client",
    rating: 5,
    approved: true,
  },
];

export async function getHomeContent() {
  try {
    const res: any = await publicService.getHomeContent();
    const rawData = res?.data || res || {};
    const rawProjects = rawData.featuredProjects || rawData.studies || [];
    let studies: CaseCard[] = Array.isArray(rawProjects) && rawProjects.length > 0
      ? rawProjects.map((d: any) => ({
          _id: d._id ? String(d._id) : undefined,
          slug: d.slug,
          title: d.title,
          subtitle: d.subtitle || "",
          location: d.location || "Mumbai",
          year: d.year || 2026,
          hero_image: d.heroImage || d.hero_image || "",
          summary: d.summary || "",
          space_type: d.spaceType || d.space_type || "Residential",
          style: d.style || "Warm Contemporary",
          area_sqft: d.areaSqft || d.area_sqft,
          featured: d.featured ?? true,
          published_at: d.publishedAt || d.published_at || "2026-01-01",
          tags: d.tags || [d.spaceType || "Residential"],
          sortOrder: d.sortOrder,
        }))
      : CURATED_STUDIO_PROJECTS;

    const unwrapStr = (val: any, fallback: string): string => {
      if (!val) return fallback;
      if (typeof val === "string") return val;
      if (typeof val === "object" && val.text) return String(val.text);
      if (typeof val === "object" && val.value) return String(val.value);
      return fallback;
    };

    const heroTitle = unwrapStr(rawData.heroTitle, "Architecture & Interior Sanctuary");
    const heroSubtitle = unwrapStr(
      rawData.heroSubtitle,
      "Spaces shaped by light, material and everyday life. Bespoke residential, commercial and turnkey interiors across India."
    );
    const heroImage = unwrapStr(rawData.heroImage, "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE");
    const atmospherePhoto = unwrapStr(rawData.atmospherePhoto, "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg");
    const beforePhoto = unwrapStr(rawData.beforePhoto, "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r");
    const afterPhoto = unwrapStr(rawData.afterPhoto, "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE");
    const ctaText = unwrapStr(rawData.ctaText, "View Projects");
    const ctaLink = unwrapStr(rawData.ctaLink, "/portfolio");

    const materialsData =
      Array.isArray(rawData.materials) && rawData.materials.length >= 3
        ? (rawData.materials as MaterialItem[])
        : CURATED_STUDIO_MATERIALS;

    const servicesData =
      Array.isArray(rawData.services) && rawData.services.length > 0
        ? (rawData.services as ServiceItem[])
        : CURATED_STUDIO_SERVICES;

    const processData =
      Array.isArray(rawData.processSteps) && rawData.processSteps.length > 0
        ? (rawData.processSteps as ProcessStepItem[])
        : CURATED_STUDIO_PROCESS;

    const rawTestimonials = rawData.testimonials;
    const testimonialsData: TestimonialItem[] =
      Array.isArray(rawTestimonials) && rawTestimonials.length > 0
        ? rawTestimonials.map((t: any) => ({
            _id: t._id ? String(t._id) : undefined,
            clientName: t.clientName || t.author || "Private Client",
            author: t.author || t.clientName || "Private Client",
            project: t.project || t.projectTitle || "Residential Sanctuary",
            projectTitle: t.projectTitle || t.project || "Residential Sanctuary",
            location: t.location || "Mumbai",
            text: t.text || t.quote || "",
            quote: t.quote || t.text || "",
            role: t.role || "Homeowner",
            rating: t.rating || 5,
            approved: t.approved ?? true,
            sortOrder: t.sortOrder,
          }))
        : CURATED_STUDIO_TESTIMONIALS;

    const homepageMedia = Array.isArray(rawData.homepageMedia) ? rawData.homepageMedia : [];

    return {
      heroTitle,
      heroSubtitle,
      heroImage,
      atmospherePhoto,
      beforePhoto,
      afterPhoto,
      ctaText,
      ctaLink,
      studies,
      featuredProjects: studies,
      services: servicesData,
      processSteps: processData,
      testimonials: testimonialsData,
      materials: materialsData,
      recentJournal: [],
      heroMedia: rawData.heroMedia || [],
      homepageMedia,
      settings: rawData.settings || {},
    };
  } catch (err) {
    console.error("[API Error] Failed to fetch home content from backend:", err);
    return {
      heroTitle: "Architecture & Interior Sanctuary",
      heroSubtitle:
        "Spaces shaped by light, material and everyday life. Bespoke residential, commercial and turnkey interiors across India.",
      heroImage: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
      atmospherePhoto: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
      beforePhoto: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
      afterPhoto: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
      ctaText: "View Projects",
      ctaLink: "/portfolio",
      studies: CURATED_STUDIO_PROJECTS,
      featuredProjects: CURATED_STUDIO_PROJECTS,
      services: CURATED_STUDIO_SERVICES,
      processSteps: CURATED_STUDIO_PROCESS,
      testimonials: CURATED_STUDIO_TESTIMONIALS,
      materials: CURATED_STUDIO_MATERIALS,
      recentJournal: [],
      heroMedia: [],
      homepageMedia: [],
      settings: {},
    };
  }
}

export async function getHomepageMedia() {
  try {
    const res: any = await publicService.getHomepageMedia();
    const data = res?.data || res || [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("[API Error] Failed to fetch homepage media:", err);
    return [];
  }
}

export async function getSiteSettings() {
  try {
    const res: any = await publicService.getSiteSettings();
    return res?.data || res || STUDIO_DETAILS;
  } catch (err) {
    return STUDIO_DETAILS;
  }
}

export async function listCaseStudies(params?: { category?: string }): Promise<CaseCard[]> {
  try {
    const res: any = await publicService.listCaseStudies(params);
    const data = res?.data || res;
    if (Array.isArray(data) && data.length > 0) {
      return data.map((d: any) => ({
        _id: d._id ? String(d._id) : undefined,
        slug: d.slug,
        title: d.title,
        subtitle: d.subtitle || "",
        location: d.location || "Mumbai",
        year: d.year || 2026,
        hero_image: d.heroImage || d.hero_image || "",
        summary: d.summary || "",
        space_type: d.spaceType || d.space_type || "Residential",
        style: d.style || "Warm Contemporary",
        area_sqft: d.areaSqft || d.area_sqft,
        featured: d.featured ?? false,
        published_at: d.publishedAt || d.published_at || "2026-01-01",
        tags: d.tags || [d.spaceType || "Residential"],
        sortOrder: d.sortOrder,
      }));
    }
    return CURATED_STUDIO_PROJECTS;
  } catch (err) {
    console.error("[API Error] Failed to list case studies:", err);
    return CURATED_STUDIO_PROJECTS;
  }
}

export async function getCaseStudy({ data }: { data: { slug: string } }): Promise<{
  study: FullCaseStudy | null;
  prev?: CaseCard | null;
  next?: CaseCard | null;
  related?: CaseCard[];
}> {
  try {
    const res: any = await publicService.getCaseStudy(data.slug);
    const payload = res?.data || res;
    if (payload && payload.study) {
      const d = payload.study;
      const normalizedStudy: FullCaseStudy = {
        _id: d._id ? String(d._id) : undefined,
        slug: d.slug,
        title: d.title,
        subtitle: d.subtitle,
        location: d.location,
        year: d.year,
        hero_image: d.heroImage || d.hero_image,
        summary: d.summary,
        space_type: d.spaceType || d.space_type || "Residential",
        style: d.style,
        area_sqft: d.areaSqft || d.area_sqft,
        featured: d.featured,
        published_at: d.publishedAt || d.published_at,
        tags: d.tags,
        client_brief: d.clientBrief || d.client_brief,
        concept: d.concept,
        execution: d.execution,
        gallery: d.gallery || [],
        materials: d.materials || [],
        specifications: d.specifications || [],
        testimonial: d.testimonial,
        before_after: d.before_after || d.beforeAfter,
      };

      const normalizeItem = (item?: any): CaseCard | null => {
        if (!item) return null;
        return {
          _id: item._id ? String(item._id) : undefined,
          slug: item.slug,
          title: item.title,
          subtitle: item.subtitle,
          location: item.location,
          year: item.year,
          hero_image: item.heroImage || item.hero_image,
          summary: item.summary,
          space_type: item.spaceType || item.space_type || "Residential",
          style: item.style,
          area_sqft: item.areaSqft || item.area_sqft,
        };
      };

      return {
        study: normalizedStudy,
        prev: normalizeItem(payload.prev),
        next: normalizeItem(payload.next),
        related: Array.isArray(payload.related)
          ? payload.related.map((r: any) => normalizeItem(r)).filter(Boolean) as CaseCard[]
          : [],
      };
    }
  } catch (err) {
    console.error("[API Error] Failed to get case study from API:", err);
  }

  // Fallback to matching curated project
  const match = CURATED_STUDIO_PROJECTS.find((p) => p.slug === data.slug) || CURATED_STUDIO_PROJECTS[0];
  if (match) {
    const fullStudy: FullCaseStudy = {
      ...match,
      client_brief: "Create a timeless, contemplative residential sanctuary that balances grandeur with intimate warmth.",
      concept: "Interiors structured around daylight orientation, continuous stone portals, and monolithic joinery.",
      execution: "Completed with white-glove site management, bespoke joinery fabrication, and precision lighting integration.",
      gallery: [
        { url: match.hero_image, caption: `${match.title} Master Perspective`, space: "Main Sanctuary" },
        { url: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg", caption: "Bedroom Suite & Joinery", space: "Master Suite" },
        { url: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r", caption: "Dining & Natural Stone Detailing", space: "Dining Area" },
      ],
      materials: CURATED_STUDIO_MATERIALS.slice(0, 4),
    };
    const idx = CURATED_STUDIO_PROJECTS.findIndex((p) => p.slug === match.slug);
    const prev = idx > 0 ? CURATED_STUDIO_PROJECTS[idx - 1] : null;
    const next = idx < CURATED_STUDIO_PROJECTS.length - 1 ? CURATED_STUDIO_PROJECTS[idx + 1] : null;
    const related = CURATED_STUDIO_PROJECTS.filter((p) => p.slug !== match.slug).slice(0, 3);
    return { study: fullStudy, prev, next, related };
  }

  return { study: null, related: [] };
}

export async function listServices(): Promise<ServiceItem[]> {
  try {
    const res: any = await publicService.listServices();
    return res?.data || res || [];
  } catch (err) {
    console.error("[API Error] Failed to fetch services:", err);
    return [];
  }
}

export async function listProcessSteps(): Promise<ProcessStepItem[]> {
  try {
    const res: any = await publicService.listProcessSteps();
    return res?.data || res || [];
  } catch (err) {
    console.error("[API Error] Failed to fetch process steps:", err);
    return [];
  }
}

export async function listTestimonials(): Promise<TestimonialItem[]> {
  try {
    const res: any = await publicService.listTestimonials();
    return res?.data || res || [];
  } catch (err) {
    console.error("[API Error] Failed to fetch testimonials:", err);
    return [];
  }
}

export async function listMaterials(): Promise<MaterialItem[]> {
  try {
    const res: any = await publicService.listMaterials();
    return res?.data || res || [];
  } catch (err) {
    console.error("[API Error] Failed to fetch materials:", err);
    return [];
  }
}

export async function listJournalPosts(): Promise<JournalPost[]> {
  try {
    const res: any = await publicService.listJournal();
    const data = res?.data || res;
    if (Array.isArray(data)) {
      return data.map((d: any) => ({
        _id: d._id ? String(d._id) : undefined,
        slug: d.slug,
        title: d.title,
        excerpt: d.excerpt,
        content: d.content || d.body,
        cover_image: d.coverImage || d.cover_image,
        readingTimeMinutes: d.readingTimeMinutes || d.read_minutes || 4,
        read_minutes: d.readingTimeMinutes || d.read_minutes || 4,
        published_at: d.publishedAt || d.published_at || "2026-01-01",
        category: d.category || "Material Craft",
        tags: d.tags || [],
      }));
    }
    return [];
  } catch (err) {
    console.error("[API Error] Failed to list journal posts:", err);
    return [];
  }
}

export const listJournal = listJournalPosts;

export async function getJournalPost({ data }: { data: { slug: string } }): Promise<{
  post: JournalPost | null;
  recent: JournalPost[];
}> {
  try {
    const res: any = await publicService.getJournalPost(data.slug);
    const payload = res?.data || res;
    if (payload && payload.post) {
      const p = payload.post;
      return {
        post: {
          _id: p._id ? String(p._id) : undefined,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content || p.body,
          cover_image: p.coverImage || p.cover_image,
          readingTimeMinutes: p.readingTimeMinutes || p.read_minutes || 4,
          published_at: p.publishedAt || p.published_at,
          category: p.category || "Material Craft",
          tags: p.tags || [],
        },
        recent: Array.isArray(payload.recent)
          ? payload.recent.map((r: any) => ({
              _id: r._id ? String(r._id) : undefined,
              slug: r.slug,
              title: r.title,
              excerpt: r.excerpt,
              cover_image: r.coverImage || r.cover_image,
              readingTimeMinutes: r.readingTimeMinutes || r.read_minutes || 4,
              published_at: r.publishedAt || r.published_at,
              category: r.category,
            }))
          : [],
      };
    }
    return { post: null, recent: [] };
  } catch (err) {
    console.error("[API Error] Failed to get journal post:", err);
    return { post: null, recent: [] };
  }
}

export async function submitEnquiry(payload: any) {
  return publicService.submitEnquiry(payload);
}



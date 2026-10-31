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
  owner: "Ravi Pipaliya",
  founder: "Ravi Pipaliya",
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
    title: "Architecture & Interior Design",
    slug: "architecture-interior-design",
    shortDesc: "Architectural planning, interior design, space planning, and functional, aesthetically pleasing spaces tailored to each client's requirements.",
    short_description: "Architectural planning, interior design, space planning, and functional, aesthetically pleasing spaces tailored to each client's requirements.",
    fullDesc: "Comprehensive architectural planning, interior design, space planning, and functional, aesthetically pleasing spaces tailored to each client's requirements. We integrate daylight vectors, proportional flow, and material purity from measured site surveys through to comprehensive construction drawings.",
    description: "Architectural planning, interior design, space planning, and functional, aesthetically pleasing spaces tailored to each client's requirements.",
    image: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
    images: [
      "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
      "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
      "https://lh3.googleusercontent.com/d/1lR9CjqpuCkuV2ietp3LOplngUozxQl_R",
      "https://lh3.googleusercontent.com/d/1YhMC1rcK8CG5IIoGohUveL6D4UZzh17f",
    ],
    deliverables: [
      "Architectural planning & space optimization",
      "Tailored residential & commercial interior design",
      "Comprehensive Good For Construction (GFC) drawings",
      "Circulation mapping & architectural lighting design",
    ],
    link: "/services#architecture-interior-design",
    icon: "Home",
    active: true,
    sortOrder: 1,
    order: 1,
  },
  {
    _id: "srv-2",
    number: "02",
    title: "Landscape Design",
    slug: "landscape-design",
    shortDesc: "Thoughtfully designed outdoor spaces, gardens, and landscapes that complement the architecture and surrounding environment.",
    short_description: "Thoughtfully designed outdoor spaces, gardens, and landscapes that complement the architecture and surrounding environment.",
    fullDesc: "Thoughtfully designed outdoor spaces, gardens, and landscapes that complement the architecture and surrounding environment. We harmonize organic greenery, stone hardscaping, ambient exterior illumination, and serene water features with the built structure.",
    description: "Thoughtfully designed outdoor spaces, gardens, and landscapes that complement the architecture and surrounding environment.",
    image: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
    images: [
      "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
      "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
      "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
      "https://lh3.googleusercontent.com/d/12uXjDNKMiHQbafv1nNlieoXbkuH4uUtG",
    ],
    deliverables: [
      "Custom landscape master planning & outdoor zoning",
      "Courtyard gardens & verandah integration",
      "Natural stone pathways, planters & hardscaping",
      "Exterior atmospheric illumination & irrigation planning",
    ],
    link: "/services#landscape-design",
    icon: "Layers",
    active: true,
    sortOrder: 2,
    order: 2,
  },
  {
    _id: "srv-3",
    number: "03",
    title: "Project Consultancy",
    slug: "project-consultancy",
    shortDesc: "Professional guidance, planning, design coordination, material selection, and project management support throughout the project lifecycle.",
    short_description: "Professional guidance, planning, design coordination, material selection, and project management support throughout the project lifecycle.",
    fullDesc: "Professional guidance, planning, design coordination, material selection, and project management support throughout the project lifecycle. We act as your expert client advocate—reviewing technical specifications, verifying quality tolerances, and maintaining budget and timeline integrity.",
    description: "Professional guidance, planning, design coordination, material selection, and project management support throughout the project lifecycle.",
    image: "https://lh3.googleusercontent.com/d/1gk9lNAKNKFDVkDqmVP--Ax4-C3q7aQwu",
    images: [
      "https://lh3.googleusercontent.com/d/1gk9lNAKNKFDVkDqmVP--Ax4-C3q7aQwu",
      "https://lh3.googleusercontent.com/d/1VXY00jcsOzQyxcdQq9g0Uubc7DwmmaPN",
      "https://lh3.googleusercontent.com/d/1EMJLrcUNSG1DG65uQMG-jS77UcfIpV23",
      "https://lh3.googleusercontent.com/d/10nP_gXYEBs66BpfredfrBQdldkynOdJ9",
    ],
    deliverables: [
      "Independent design coordination & technical review",
      "Quarry & mill material selection and verification",
      "MEP, structural & contractor alignment audits",
      "Budget optimization & lifecycle schedule governance",
    ],
    link: "/services#project-consultancy",
    icon: "Compass",
    active: true,
    sortOrder: 3,
    order: 3,
  },
  {
    _id: "srv-4",
    number: "04",
    title: "Turnkey Projects",
    slug: "turnkey-projects",
    shortDesc: "End-to-end project execution, from initial planning and design to material selection, construction, finishing, and final handover.",
    short_description: "End-to-end project execution, from initial planning and design to material selection, construction, finishing, and final handover.",
    fullDesc: "End-to-end project execution, from initial planning and design to material selection, construction, finishing, and final handover. Single-source studio accountability with frozen milestone budgets, vetted master craftsmen, rigorous daily site supervision, and white-glove delivery.",
    description: "End-to-end project execution, from initial planning and design to material selection, construction, finishing, and final handover.",
    image: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
    images: [
      "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
      "https://lh3.googleusercontent.com/d/1UNtmTkQxW0vxEKvv7_POkseU7576wxPR",
      "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
      "https://lh3.googleusercontent.com/d/1YhMC1rcK8CG5IIoGohUveL6D4UZzh17f",
    ],
    deliverables: [
      "End-to-end single-source execution & site custody",
      "Frozen Bill of Quantities (BOQ) with milestone guarantees",
      "Master carpentry, masonry, finishes & MEP execution",
      "White-glove styling, quality QA, and defect-free handover",
    ],
    link: "/services#turnkey-projects",
    icon: "Briefcase",
    active: true,
    sortOrder: 4,
    order: 4,
  },
];

export const CURATED_STUDIO_PROCESS: ProcessStepItem[] = [
  { _id: "step-1", number: "01", title: "Laser Survey & Architectural Audit", timeline: "Weeks 1–2", description: "Millimeter 3D laser scan of the site shell, structural load assessment, and in-depth lifestyle brief mapping.", sortOrder: 1 },
  { _id: "step-2", number: "02", title: "Spatial Schematics & Material Board", timeline: "Weeks 3–5", description: "Volumetric diagrams, natural daylight vectors, full physical travertine and timber flitch curation boards.", sortOrder: 2 },
  { _id: "step-3", number: "03", title: "Detailed Working Drawings & GFC Sets", timeline: "Weeks 6–9", description: "Comprehensive Good-For-Construction drawings: MEP, structural joinery, reflected ceiling luminaire layouts.", sortOrder: 3 },
  { _id: "step-4", number: "04", title: "White-Glove Execution & Site Custody", timeline: "Months 3–6", description: "Daily site custody, milestone BOQ governance, artisan carpentry fabrication, and rigorous QA inspections.", sortOrder: 4 },
  { _id: "step-5", number: "05", title: "Commissioning, Styling & Handover", timeline: "Handover", description: "Final architectural luminaire calibration, custom furniture styling, deep clean, and zero-snag sanctuary handover.", sortOrder: 5 },
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
    const heroImage = unwrapStr(rawData.heroImage, "https://lh3.googleusercontent.com/d/13MLCbdqy_mWAY2Rg1EYFWOh9iO38Wvwu");
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
      ribbonText1: unwrapStr(rawData.ribbonText1 || rawData.settings?.ribbonText1, "Mumbai · Bengaluru · Pan India · 12+ Years Practice"),
      ribbonText2: unwrapStr(rawData.ribbonText2 || rawData.settings?.ribbonText2, "28+ Architectural Commissions · Single-Source Turnkey Accountability"),
      statementTitle: unwrapStr(
        rawData.statementTitle || rawData.settings?.statementTitle,
        "We create considered residential and commercial interiors where material, proportion and light work together."
      ),
      statementText1: unwrapStr(
        rawData.statementText1 || rawData.settings?.statementText1,
        "Every project we undertake starts by stripping away the non-essential. We avoid ephemeral trends and disposable finishes in pursuit of spaces that breathe: natural vein-cut stone with tactile depth, hand-troweled lime plaster that catches the changing sun, and bespoke millwork resolved with millimeter precision."
      ),
      statementText2: unwrapStr(
        rawData.statementText2 || rawData.settings?.statementText2,
        "Operating across Mumbai and Bengaluru, our practice provides single-source turnkey accountability from measured drawing sets through to final white-glove styling."
      ),
      stat1Value: unwrapStr(rawData.stat1Value || rawData.settings?.stat1Value, "28+"),
      stat1Label: unwrapStr(rawData.stat1Label || rawData.settings?.stat1Label, "Commissions"),
      stat2Value: unwrapStr(rawData.stat2Value || rawData.settings?.stat2Value, "12+"),
      stat2Label: unwrapStr(rawData.stat2Label || rawData.settings?.stat2Label, "Years Active"),
      stat3Value: unwrapStr(rawData.stat3Value || rawData.settings?.stat3Value, "06"),
      stat3Label: unwrapStr(rawData.stat3Label || rawData.settings?.stat3Label, "Disciplines"),
      stat4Value: unwrapStr(rawData.stat4Value || rawData.settings?.stat4Value, "11"),
      stat4Label: unwrapStr(rawData.stat4Label || rawData.settings?.stat4Label, "Cities"),
      beforeAfterCaption: unwrapStr(
        rawData.beforeAfterCaption || rawData.settings?.beforeAfterCaption,
        "The Shah Residence, Ahmedabad · 6,400 sq ft transformation"
      ),
      beforeLabel: unwrapStr(rawData.beforeLabel || rawData.settings?.beforeLabel, "BEFORE EXECUTION"),
      afterLabel: unwrapStr(rawData.afterLabel || rawData.settings?.afterLabel, "COMPLETED SANCTUARY"),
      philosophy1Title: unwrapStr(rawData.philosophy1Title || rawData.settings?.philosophy1Title, "01 / HONEST MATERIALS"),
      philosophy1Heading: unwrapStr(rawData.philosophy1Heading || rawData.settings?.philosophy1Heading, "Stone, Timber & Lime"),
      philosophy1Text: unwrapStr(
        rawData.philosophy1Text || rawData.settings?.philosophy1Text,
        "We select genuine materials that age with grace. Vein-cut Roman travertine, fumed European oak, and patinated architectural bronze."
      ),
      philosophy2Title: unwrapStr(rawData.philosophy2Title || rawData.settings?.philosophy2Title, "02 / LIGHT & VOLUME"),
      philosophy2Heading: unwrapStr(rawData.philosophy2Heading || rawData.settings?.philosophy2Heading, "Daylight as Structure"),
      philosophy2Text: unwrapStr(
        rawData.philosophy2Text || rawData.settings?.philosophy2Text,
        "Every space is shaped around natural illumination vectors and low-glare 2400K–2700K ambient luminaire layers for evening calm."
      ),
      philosophy3Title: unwrapStr(rawData.philosophy3Title || rawData.settings?.philosophy3Title, "03 / TURNKEY RIGOR"),
      philosophy3Heading: unwrapStr(rawData.philosophy3Heading || rawData.settings?.philosophy3Heading, "End-to-End Custody"),
      philosophy3Text: unwrapStr(
        rawData.philosophy3Text || rawData.settings?.philosophy3Text,
        "From structural drawings to bespoke furniture fabrication and white-glove styling, our single-source governance guarantees zero friction."
      ),
      consultationHeading: unwrapStr(rawData.consultationHeading || rawData.settings?.consultationHeading, "Ready to begin your architectural sanctuary?"),
      consultationPhone: unwrapStr(rawData.consultationPhone || rawData.settings?.consultationPhone, "+91 95375 86804"),
      consultationEmail: unwrapStr(rawData.consultationEmail || rawData.settings?.consultationEmail, "contact@rightangle.design"),
      spotlightProjectSlug: unwrapStr(rawData.spotlightProjectSlug || rawData.settings?.spotlightProjectSlug, "mehta-executive-suite"),
      architecturalFilms: Array.isArray(rawData.architecturalFilms) && rawData.architecturalFilms.length > 0
        ? rawData.architecturalFilms
        : (Array.isArray(rawData.settings?.architecturalFilms) && rawData.settings.architecturalFilms.length > 0 ? rawData.settings.architecturalFilms : undefined),
      showServices: rawData.showServices ?? rawData.settings?.showServices ?? true,
      showProcess: rawData.showProcess ?? rawData.settings?.showProcess ?? true,
      showTestimonials: rawData.showTestimonials ?? rawData.settings?.showTestimonials ?? true,
      showJournal: rawData.showJournal ?? rawData.settings?.showJournal ?? true,
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



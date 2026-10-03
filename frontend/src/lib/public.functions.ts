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
  phone: "+91 98200 41100",
  email: "contact@rightangledesign.com",
  emailAddress: "contact@rightangledesign.com",
  address: "Studio 4B, The Mill District, Lower Parel, Mumbai 400013",
  officeAddress: "Studio 4B, The Mill District, Lower Parel, Mumbai 400013",
  instagram: "https://instagram.com/rightangledesignstudio",
  instagramHandle: "@rightangledesignstudio",
  instagramUrl: "https://instagram.com/rightangledesignstudio",
  whatsappNumber: "+919820041100",
  whatsappFormatted: "+91 98200 41100",
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
    image: "/materials/silver-vein-navona-travertine.jpg",
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

export async function getHomeContent() {
  try {
    const res: any = await publicService.getHomeContent();
    const rawData = res?.data || res || {};
    const rawProjects = rawData.featuredProjects || rawData.studies || [];
    const studies: CaseCard[] = Array.isArray(rawProjects)
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
      : [];

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

    const materialsData =
      Array.isArray(rawData.materials) && rawData.materials.length >= 3
        ? (rawData.materials as MaterialItem[])
        : CURATED_STUDIO_MATERIALS;

    return {
      heroTitle,
      heroSubtitle,
      studies,
      featuredProjects: studies,
      services: (rawData.services || []) as ServiceItem[],
      processSteps: (rawData.processSteps || []) as ProcessStepItem[],
      testimonials: (rawData.testimonials || []) as TestimonialItem[],
      materials: materialsData,
      recentJournal: [],
      heroMedia: rawData.heroMedia || [],
      settings: rawData.settings || {},
    };
  } catch (err) {
    console.error("[API Error] Failed to fetch home content from backend:", err);
    return {
      heroTitle: "Architecture & Interior Sanctuary",
      heroSubtitle:
        "Spaces shaped by light, material and everyday life. Bespoke residential, commercial and turnkey interiors across India.",
      studies: [],
      featuredProjects: [],
      services: [],
      processSteps: [],
      testimonials: [],
      materials: CURATED_STUDIO_MATERIALS,
      recentJournal: [],
      heroMedia: [],
      settings: {},
    };
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
    if (Array.isArray(data)) {
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
    return [];
  } catch (err) {
    console.error("[API Error] Failed to list case studies:", err);
    return [];
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
    return { study: null, related: [] };
  } catch (err) {
    console.error("[API Error] Failed to get case study:", err);
    return { study: null, related: [] };
  }
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

import { publicService } from "../services/public.service";
import {
  GOOGLE_DRIVE_PHOTOS,
  getPaginatedGoogleDrivePhotos,
  type GoogleDrivePhoto,
  type PaginatedPhotosResult,
  type PhotoFilterParams,
} from "./google-drive-photos";

export type { GoogleDrivePhoto, PaginatedPhotosResult, PhotoFilterParams };

export interface CaseCard {
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  year: number;
  hero_image: string;
  summary: string;
  space_type: string;
  style: string;
  area_sqft: number;
  featured: boolean;
  published_at: string;
  tags?: string[];
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
  rooms?: Array<{ title?: string; name?: string; description?: string; images?: Array<{ url: string; alt?: string; caption?: string } | any> }>;
  testimonial?: { quote: string; author: string; role: string };
  seo_title?: string;
  seo_description?: string;
}

export interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  body?: string;
  content?: string;
  author: string;
  cover_image: string;
  read_minutes: number;
  readingTimeMinutes?: number;
  published_at: string;
  category: string;
  tags?: string[];
}

export const STUDIO_DETAILS = {
  name: "Atelier Vermilion",
  tagline: "Architecture & Interior Sanctuary",
  phone: "+91 98200 41100",
  email: "atelier@ateliervermilion.com",
  emailAddress: "atelier@ateliervermilion.com",
  address: "Studio 4B, The Mill District, Lower Parel, Mumbai 400013",
  officeAddress: "Studio 4B, The Mill District, Lower Parel, Mumbai 400013",
  instagram: "https://instagram.com/ateliervermilion",
  instagramHandle: "@ateliervermilion",
  instagramUrl: "https://instagram.com/ateliervermilion",
  whatsappNumber: "+919820041100",
  whatsappFormatted: "+91 98200 41100",
  consultationBookingUrl: "/contact",
};

export const FALLBACK_CASE_STUDIES: FullCaseStudy[] = [
  {
    slug: "altamount-penthouse",
    title: "The Altamount Penthouse",
    subtitle: "A Masterclass in Fluted Travertine & Cast Bronze",
    location: "Altamount Road, Mumbai",
    year: 2026,
    hero_image: GOOGLE_DRIVE_PHOTOS[0]?.url || "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
    summary: "Curated dual-level residence balancing monumental architectural volumes with quiet tactile warmth.",
    space_type: "Duplex Penthouse",
    style: "Warm Contemporary Minimalist",
    area_sqft: 6800,
    featured: true,
    published_at: "2026-01-15",
    tags: ["Penthouse", "Residential", "Luxury", "Travertine"],
    client_brief: "Create a serene sanctuary elevated above the city skyline with organic stones and seamless millwork.",
    concept: "A sequence of flowing spatial chambers defined by fluted travertine monolithic portals.",
    gallery: GOOGLE_DRIVE_PHOTOS.slice(0, 8).map((p) => ({
      url: p.url,
      caption: p.caption,
      space: p.category,
    })),
  },
  {
    slug: "alibaug-coastal-villa",
    title: "Alibaug Coastal Villa",
    subtitle: "Monolithic Laterite & Reclaimed Teak Waterfront Retreat",
    location: "Awas Beach, Alibaug",
    year: 2025,
    hero_image: GOOGLE_DRIVE_PHOTOS[1]?.url || "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
    summary: "Exposed laterite stone estate immersed within coastal coconut groves and salt air.",
    space_type: "Coastal Estate",
    style: "Tropical Brutalism",
    area_sqft: 9200,
    featured: true,
    published_at: "2025-08-20",
    tags: ["Villa", "Coastal", "Holiday Home", "Teak"],
    gallery: GOOGLE_DRIVE_PHOTOS.slice(8, 16).map((p) => ({
      url: p.url,
      caption: p.caption,
      space: p.category,
    })),
  },
  {
    slug: "shah-villa",
    title: "Shah Courtyard Residence",
    subtitle: "Monolithic Brick & Roman Travertine Courtyard Sanctuary",
    location: "Sindhu Bhavan Road, Ahmedabad",
    year: 2026,
    hero_image: GOOGLE_DRIVE_PHOTOS[2]?.url || "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
    summary: "Monolithic brick and Roman travertine residence planned around an open water courtyard.",
    space_type: "Residential Villa",
    style: "Courtyard & Warm Plaster",
    area_sqft: 6400,
    featured: true,
    published_at: "2026-03-10",
    tags: ["Courtyard", "Villa", "Stone", "Minimalist"],
    gallery: GOOGLE_DRIVE_PHOTOS.slice(16, 24).map((p) => ({
      url: p.url,
      caption: p.caption,
      space: p.category,
    })),
  },
  {
    slug: "mehta-executive-suite",
    title: "Mehta Executive Suite",
    subtitle: "Boutique Financial Headquarters & Private Salon",
    location: "Yagnik Road, Rajkot",
    year: 2026,
    hero_image: GOOGLE_DRIVE_PHOTOS[3]?.url || "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
    summary: "A refined workspace with acoustic slat panelling, Italian marble reception desk, and private boardroom.",
    space_type: "Commercial Office",
    style: "Modern Classic & Walnut",
    area_sqft: 1950,
    featured: true,
    published_at: "2026-04-12",
    tags: ["Office", "Commercial", "Walnut", "Marble"],
    gallery: GOOGLE_DRIVE_PHOTOS.slice(24, 32).map((p) => ({
      url: p.url,
      caption: p.caption,
      space: p.category,
    })),
  },
];

export const FALLBACK_JOURNAL_POSTS: JournalPost[] = [
  {
    slug: "travertine-quarry-chronicles",
    title: "The Poetry of Travertine: From Tuscan Quarries to Mumbai Penthouses",
    excerpt: "Why vein-cut Roman travertine remains the definitive material of timeless residential architecture.",
    body: "Deep within the historic quarries of Tivoli, mineral-rich subterranean springs have layered calcium carbonate over geological epochs...",
    author: "Ira Kapoor",
    cover_image: GOOGLE_DRIVE_PHOTOS[0]?.url,
    read_minutes: 5,
    published_at: "2026-02-10",
    category: "Material Craft",
    tags: ["Stone", "Provenance", "Architecture"],
  },
  {
    slug: "acoustic-millwork-light",
    title: "Architectural Millwork & Concealed 2700K Luminaires",
    excerpt: "How low-glare warm light reveals the grain of fumed European white oak in contemporary spaces.",
    body: "Architectural lighting must never compete with volume; it should softly unveil texture, grain, and stone depth...",
    author: "Nikhil Menon",
    cover_image: GOOGLE_DRIVE_PHOTOS[4]?.url,
    read_minutes: 4,
    published_at: "2026-03-01",
    category: "Lighting & Craft",
    tags: ["Lighting", "Oak", "Millwork"],
  },
];

export async function getPublicGalleryPhotos(params?: PhotoFilterParams): Promise<PaginatedPhotosResult> {
  try {
    const res = await publicService.getGallery(params);
    if (res && res.data) {
      return res.data;
    }
    if (res && res.items) {
      return res;
    }
  } catch (err) {
    // Fall back to local client-side pagination over full dataset
  }
  return getPaginatedGoogleDrivePhotos(params);
}


export async function getHomeContent() {
  try {
    return await publicService.getHomeContent();
  } catch (err) {
    return {
      heroTitle: "Architecture & Interior Sanctuary",
      heroSubtitle: "Curated residential, hospitality, and bespoke spatial design with an unwavering devotion to material craft.",
      featuredProjects: FALLBACK_CASE_STUDIES,
      recentJournal: FALLBACK_JOURNAL_POSTS,
      heroMedia: [],
    };
  }
}

export async function getSiteSettings() {
  try {
    return await publicService.getSiteSettings();
  } catch (err) {
    return STUDIO_DETAILS;
  }
}

export async function listCaseStudies(params?: { category?: string }): Promise<CaseCard[]> {
  try {
    const data = await publicService.listCaseStudies(params);
    if (Array.isArray(data) && data.length > 0) {
      return data.map((d: any) => ({
        ...d,
        hero_image: d.hero_image || d.heroImage || GOOGLE_DRIVE_PHOTOS[0]?.url,
        space_type: d.space_type || d.spaceType || "Residential",
        published_at: d.published_at || d.publishedAt || "2026-01-01",
        area_sqft: d.area_sqft || d.areaSqft || 2500,
      }));
    }
    return FALLBACK_CASE_STUDIES;
  } catch (err) {
    return FALLBACK_CASE_STUDIES;
  }
}

export async function getCaseStudy({ data }: { data: { slug: string } }): Promise<{
  study: FullCaseStudy;
  prev: CaseCard;
  next: CaseCard;
  related: CaseCard[];
}> {
  try {
    const res: any = await publicService.getCaseStudy(data.slug);
    if (res && res.study) {
      const s = res.study;
      return {
        study: {
          ...s,
          hero_image: s.hero_image || s.heroImage || GOOGLE_DRIVE_PHOTOS[0]?.url,
          space_type: s.space_type || s.spaceType || "Residential",
          published_at: s.published_at || s.publishedAt || "2026-01-01",
          area_sqft: s.area_sqft || s.areaSqft || 2500,
          client_brief: s.client_brief || s.clientBrief,
          materials: s.materials || [],
          gallery: s.gallery || [],
          scope: s.scope ? (Array.isArray(s.scope) ? s.scope : [s.scope]) : ["Turnkey Architecture", "Custom Millwork", "Interior Styling"],
          rooms: s.rooms || [],
        },
        prev: res.prev || FALLBACK_CASE_STUDIES[0],
        next: res.next || FALLBACK_CASE_STUDIES[1] || FALLBACK_CASE_STUDIES[0],
        related: res.related || [],
      };
    }
  } catch (err) {
    // fallback
  }

  const found = FALLBACK_CASE_STUDIES.find((f) => f.slug === data.slug) || FALLBACK_CASE_STUDIES[0]!;
  return {
    study: found,
    prev: FALLBACK_CASE_STUDIES[1] || found,
    next: FALLBACK_CASE_STUDIES[0] || found,
    related: FALLBACK_CASE_STUDIES.filter((f) => f.slug !== found.slug),
  };
}

export async function listJournal(): Promise<JournalPost[]> {
  try {
    const data = await publicService.listJournal();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((p: any) => ({
        ...p,
        cover_image: p.cover_image || p.coverImage || GOOGLE_DRIVE_PHOTOS[1]?.url,
        read_minutes: p.read_minutes || p.readingTimeMinutes || 5,
        published_at: p.published_at || p.publishedAt || "2026-01-01",
        author: p.author || "Ira Kapoor",
      }));
    }
    return FALLBACK_JOURNAL_POSTS;
  } catch (err) {
    return FALLBACK_JOURNAL_POSTS;
  }
}

export async function getJournalPost({ data }: { data: { slug: string } }): Promise<JournalPost> {
  try {
    const res: any = await publicService.getJournalPost(data.slug);
    const p = res?.post || res;
    if (p) {
      return {
        ...p,
        cover_image: p.cover_image || p.coverImage || GOOGLE_DRIVE_PHOTOS[1]?.url,
        read_minutes: p.read_minutes || p.readingTimeMinutes || 5,
        published_at: p.published_at || p.publishedAt || "2026-01-01",
        author: p.author || "Ira Kapoor",
        body: p.body || p.content || p.excerpt || "",
      };
    }
  } catch (err) {
    // fallback
  }

  const found = FALLBACK_JOURNAL_POSTS.find((j) => j.slug === data.slug) || FALLBACK_JOURNAL_POSTS[0]!;
  return found;
}

export async function submitEnquiry({ data }: {
  data: {
    name: string;
    email: string;
    phone: string;
    city?: string;
    spaceType?: string;
    scope?: string;
    budgetBand?: string;
    estimatedTimeline?: string;
    notes?: string;
  };
}) {
  return publicService.submitEnquiry(data);
}

import { api } from "./api";

export interface CmsOverviewData {
  stats: {
    publishedProjects: number;
    featuredProjects: number;
    totalStudioProjects: number;
    publishedMedia: number;
    featuredMedia: number;
    servicesCount: number;
    processStepsCount: number;
    testimonialsCount: number;
    journalArticlesCount: number;
    newEnquiriesCount: number;
  };
  recentActivity: Array<{
    id: string;
    actorLabel: string;
    action: string;
    entity: string;
    entityTitle?: string;
    detail?: string;
    createdAt: string;
  }>;
}

export interface HomepageConfigData {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  atmospherePhoto?: string;
  beforePhoto?: string;
  afterPhoto?: string;
  ctaText: string;
  ctaLink: string;
  featuredProjectSlugs?: string[];
  showServices?: boolean;
  showProcess?: boolean;
  showTestimonials?: boolean;
  showJournal?: boolean;
}

export interface CmsCaseStudyItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  year: number;
  heroImage: string;
  summary: string;
  spaceType: string;
  style: string;
  areaSqft: number;
  featured: boolean;
  publishedAt: string;
  clientBrief?: string;
  concept?: string;
  execution?: string;
  palette?: Array<{ name: string; hex: string; role: string }>;
  specifications?: Array<{ label: string; value: string }>;
  gallery?: Array<{ url: string; caption: string; space: string }>;
  materials?: Array<{ name: string; type: string; provenance: string }>;
  testimonial?: { quote: string; author: string; role: string };
}

export interface CmsServiceItem {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  deliverables: string[];
  image: string;
  driveFileId?: string | null;
  link: string;
  sortOrder: number;
  published: boolean;
}

export interface CmsProcessItem {
  id: string;
  number: string;
  title: string;
  description: string;
  timeline: string;
  sortOrder: number;
  published: boolean;
}

export interface CmsTestimonialItem {
  id: string;
  clientName: string;
  project: string;
  location: string;
  text: string;
  quote?: string;
  role?: string;
  approved: boolean;
  featured: boolean;
  sortOrder: number;
}

export interface CmsEnquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string | null;
  spaceType?: string | null;
  scope?: string | null;
  budgetBand?: string | null;
  estimatedTimeline?: string | null;
  notes?: string | null;
  status: "new" | "contacted" | "qualified" | "converted" | "declined" | "closed";
  source?: string | null;
  createdAt: string;
}

export const cmsService = {
  // Overview
  async getOverview(): Promise<CmsOverviewData> {
    return api.get<CmsOverviewData>("/cms/overview");
  },

  // Homepage
  async getHomepage(): Promise<HomepageConfigData> {
    return api.get<HomepageConfigData>("/cms/homepage");
  },
  async updateHomepage(data: Partial<HomepageConfigData>): Promise<HomepageConfigData> {
    return api.patch<HomepageConfigData>("/cms/homepage", data);
  },

  // Projects / Portfolio
  async listProjects(): Promise<{ caseStudies: CmsCaseStudyItem[]; studioProjects: any[] }> {
    return api.get<{ caseStudies: CmsCaseStudyItem[]; studioProjects: any[] }>("/cms/projects");
  },
  async createCaseStudy(data: Partial<CmsCaseStudyItem>): Promise<CmsCaseStudyItem> {
    return api.post<CmsCaseStudyItem>("/cms/projects", data);
  },
  async updateCaseStudy(id: string, data: Partial<CmsCaseStudyItem>): Promise<CmsCaseStudyItem> {
    return api.patch<CmsCaseStudyItem>(`/cms/projects/${id}`, data);
  },
  async deleteCaseStudy(id: string): Promise<{ deleted: boolean }> {
    return api.delete(`/cms/projects/${id}`);
  },

  // Services
  async listServices(): Promise<CmsServiceItem[]> {
    return api.get<CmsServiceItem[]>("/cms/services");
  },
  async createService(data: Partial<CmsServiceItem>): Promise<CmsServiceItem> {
    return api.post<CmsServiceItem>("/cms/services", data);
  },
  async updateService(id: string, data: Partial<CmsServiceItem>): Promise<CmsServiceItem> {
    return api.patch<CmsServiceItem>(`/cms/services/${id}`, data);
  },
  async deleteService(id: string): Promise<{ deleted: boolean }> {
    return api.delete(`/cms/services/${id}`);
  },

  // Process
  async listProcess(): Promise<CmsProcessItem[]> {
    return api.get<CmsProcessItem[]>("/cms/process");
  },
  async createProcess(data: Partial<CmsProcessItem>): Promise<CmsProcessItem> {
    return api.post<CmsProcessItem>("/cms/process", data);
  },
  async updateProcess(id: string, data: Partial<CmsProcessItem>): Promise<CmsProcessItem> {
    return api.patch<CmsProcessItem>(`/cms/process/${id}`, data);
  },
  async deleteProcess(id: string): Promise<{ deleted: boolean }> {
    return api.delete(`/cms/process/${id}`);
  },

  // Testimonials
  async listTestimonials(): Promise<CmsTestimonialItem[]> {
    return api.get<CmsTestimonialItem[]>("/cms/testimonials");
  },
  async updateTestimonial(id: string, data: Partial<CmsTestimonialItem>): Promise<CmsTestimonialItem> {
    return api.patch<CmsTestimonialItem>(`/cms/testimonials/${id}`, data);
  },

  // Enquiries
  async listEnquiries(): Promise<CmsEnquiryItem[]> {
    return api.get<CmsEnquiryItem[]>("/cms/enquiries");
  },
  async updateEnquiryStatus(id: string, status: string): Promise<CmsEnquiryItem> {
    return api.patch<CmsEnquiryItem>(`/cms/enquiries/${id}/status`, { status });
  },
};

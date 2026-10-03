import { api } from "./api";
import { CaseStudyDetail, CaseCard } from "../types/api";

export interface ServiceItem {
  _id?: string;
  number: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  deliverables: string[];
  image: string;
  driveFileId?: string | null;
  link: string;
  sortOrder?: number;
}

export interface ProcessStepItem {
  _id?: string;
  number: string;
  title: string;
  description: string;
  timeline: string;
  sortOrder?: number;
}

export interface TestimonialItem {
  _id?: string;
  clientName: string;
  project: string;
  location: string;
  text: string;
  quote?: string;
  role?: string;
}

export interface MaterialItem {
  _id?: string;
  name: string;
  category: string;
  image: string;
  description: string;
  provenance: string;
  vendorName?: string | null;
  costRange?: string | null;
  projectSlug?: string | null;
  projectTitle?: string | null;
}

export const publicService = {
  async getHomeContent() {
    return api.get("/public/home");
  },

  async getHomepageMedia() {
    return api.get("/media/homepage");
  },

  async getSiteSettings() {
    return api.get("/public/settings");
  },

  async listCaseStudies(params?: { category?: string }): Promise<CaseCard[]> {
    return api.get<CaseCard[]>("/public/projects", params);
  },

  async getCaseStudy(slug: string): Promise<{
    study: CaseStudyDetail;
    prev: CaseCard;
    next: CaseCard;
    related: CaseCard[];
  }> {
    return api.get(`/public/projects/${slug}`);
  },

  async listServices(): Promise<ServiceItem[]> {
    return api.get<ServiceItem[]>("/public/services");
  },

  async listProcessSteps(): Promise<ProcessStepItem[]> {
    return api.get<ProcessStepItem[]>("/public/process");
  },

  async listTestimonials(): Promise<TestimonialItem[]> {
    return api.get<TestimonialItem[]>("/public/testimonials");
  },

  async listMaterials(): Promise<MaterialItem[]> {
    return api.get<MaterialItem[]>("/public/materials");
  },

  async listJournal(): Promise<any[]> {
    return api.get("/public/journal");
  },

  async getJournalPost(slug: string): Promise<{ post: any; recent: any[] }> {
    return api.get(`/public/journal/${slug}`);
  },

  async getGallery(params?: any) {
    return api.get("/public/gallery", params);
  },

  async submitEnquiry(data: {
    name: string;
    email: string;
    phone: string;
    city?: string;
    spaceType?: string;
    scope?: string;
    budgetBand?: string;
    estimatedTimeline?: string;
    notes?: string;
  }) {
    return api.post("/public/enquiries", data);
  },
};

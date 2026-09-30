import { api } from "./api";
import { CaseStudyDetail, CaseCard } from "../types/api";

export const publicService = {
  async getHomeContent() {
    return api.get("/public/home");
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


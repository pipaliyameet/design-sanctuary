import { api } from "./api";
import { LeadItem, EnquiryItem } from "../types/api";

export const leadsService = {
  async list(params?: { stage?: string; status?: string; search?: string }): Promise<{
    leads: LeadItem[];
    enquiries: EnquiryItem[];
  }> {
    return api.get("/leads", params);
  },

  async getById(id: string): Promise<LeadItem> {
    return api.get<LeadItem>(`/leads/${id}`);
  },

  async create(data: Partial<LeadItem>): Promise<LeadItem> {
    return api.post<LeadItem>("/leads", data);
  },

  async update(id: string, data: Partial<LeadItem>): Promise<LeadItem> {
    return api.patch<LeadItem>(`/leads/${id}`, data);
  },

  async delete(id: string): Promise<{ deleted: boolean }> {
    return api.delete(`/leads/${id}`);
  },

  async convertToProject(id: string): Promise<{
    converted: boolean;
    projectId: string;
    clientId: string;
    project: any;
  }> {
    return api.post(`/leads/${id}/convert`);
  },
};

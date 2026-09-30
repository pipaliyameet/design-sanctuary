import { api } from "./api";
import {
  MaterialItem,
  VendorItem,
  TeamMemberItem,
  NotificationItem,
  ActivityLogItem,
} from "../types/api";

export const studioService = {
  // Dashboard & Metrics
  async getDashboardOverview() {
    return api.get("/dashboard/overview");
  },

  async getWeeklyMetrics() {
    return api.get("/dashboard/weekly");
  },

  // Materials
  async listMaterials(params?: { category?: string }): Promise<MaterialItem[]> {
    return api.get<MaterialItem[]>("/materials", params);
  },
  async createMaterial(data: Partial<MaterialItem>): Promise<MaterialItem> {
    return api.post<MaterialItem>("/materials", data);
  },
  async updateMaterial(id: string, data: Partial<MaterialItem>): Promise<MaterialItem> {
    return api.patch<MaterialItem>(`/materials/${id}`, data);
  },
  async deleteMaterial(id: string): Promise<{ deleted: boolean }> {
    return api.delete(`/materials/${id}`);
  },

  // Vendors
  async listVendors(): Promise<VendorItem[]> {
    return api.get<VendorItem[]>("/vendors");
  },
  async createVendor(data: Partial<VendorItem>): Promise<VendorItem> {
    return api.post<VendorItem>("/vendors", data);
  },
  async updateVendor(id: string, data: Partial<VendorItem>): Promise<VendorItem> {
    return api.patch<VendorItem>(`/vendors/${id}`, data);
  },
  async deleteVendor(id: string): Promise<{ deleted: boolean }> {
    return api.delete(`/vendors/${id}`);
  },

  // Team
  async listTeam(): Promise<TeamMemberItem[]> {
    return api.get<TeamMemberItem[]>("/team");
  },
  async createTeamMember(data: Partial<TeamMemberItem>): Promise<TeamMemberItem> {
    return api.post<TeamMemberItem>("/team", data);
  },
  async updateTeamMember(id: string, data: Partial<TeamMemberItem>): Promise<TeamMemberItem> {
    return api.patch<TeamMemberItem>(`/team/${id}`, data);
  },
  async deleteTeamMember(id: string): Promise<{ deleted: boolean }> {
    return api.delete(`/team/${id}`);
  },

  // Notifications
  async listNotifications(): Promise<NotificationItem[]> {
    return api.get<NotificationItem[]>("/notifications");
  },
  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return api.patch(`/notifications/${id}/read`);
  },
  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return api.patch("/notifications/read-all");
  },

  // Activity Log
  async listActivity(params?: { projectId?: string }): Promise<ActivityLogItem[]> {
    return api.get<ActivityLogItem[]>("/activity", params);
  },

  // Settings
  async getSettings(): Promise<Record<string, any>> {
    return api.get("/settings");
  },
  async updateSettings(key: string, value: any): Promise<{ key: string; value: any }> {
    return api.patch("/settings", { key, value });
  },
};

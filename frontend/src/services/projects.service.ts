import { api } from "./api";
import {
  ProjectItem,
  RoomItem,
  TaskItem,
  DesignFileItem,
  ApprovalItem,
  SiteUpdateItem,
  DocumentItem,
  MediaItem,
} from "../types/api";

export const projectsService = {
  async list(params?: { status?: string; clientId?: string; search?: string }): Promise<ProjectItem[]> {
    return api.get<ProjectItem[]>("/projects", params);
  },

  async getById(id: string): Promise<{
    project: ProjectItem;
    rooms: RoomItem[];
    tasks: TaskItem[];
    designFiles: DesignFileItem[];
    approvals: ApprovalItem[];
    siteUpdates: SiteUpdateItem[];
    documents: DocumentItem[];
    invoices: any[];
    boqItems: any[];
    media: MediaItem[];
  }> {
    return api.get(`/projects/${id}`);
  },

  async create(data: Partial<ProjectItem>): Promise<ProjectItem> {
    return api.post<ProjectItem>("/projects", data);
  },

  async update(id: string, data: Partial<ProjectItem>): Promise<ProjectItem> {
    return api.patch<ProjectItem>(`/projects/${id}`, data);
  },

  async delete(id: string): Promise<{ deleted: boolean }> {
    return api.delete(`/projects/${id}`);
  },

  // Rooms
  async createRoom(projectId: string, data: Partial<RoomItem>): Promise<RoomItem> {
    return api.post<RoomItem>(`/projects/${projectId}/rooms`, data);
  },
  async updateRoom(projectId: string, roomId: string, data: Partial<RoomItem>): Promise<RoomItem> {
    return api.patch<RoomItem>(`/projects/${projectId}/rooms/${roomId}`, data);
  },
  async deleteRoom(projectId: string, roomId: string): Promise<{ deleted: boolean }> {
    return api.delete(`/projects/${projectId}/rooms/${roomId}`);
  },

  // Tasks
  async createTask(projectId: string, data: Partial<TaskItem>): Promise<TaskItem> {
    return api.post<TaskItem>(`/projects/${projectId}/tasks`, data);
  },
  async updateTask(projectId: string, taskId: string, data: Partial<TaskItem>): Promise<TaskItem> {
    return api.patch<TaskItem>(`/projects/${projectId}/tasks/${taskId}`, data);
  },
  async deleteTask(projectId: string, taskId: string): Promise<{ deleted: boolean }> {
    return api.delete(`/projects/${projectId}/tasks/${taskId}`);
  },

  // Design Files
  async createDesignFile(projectId: string, data: Partial<DesignFileItem>): Promise<DesignFileItem> {
    return api.post<DesignFileItem>(`/projects/${projectId}/design-files`, data);
  },
  async updateDesignFile(projectId: string, fileId: string, data: Partial<DesignFileItem>): Promise<DesignFileItem> {
    return api.patch<DesignFileItem>(`/projects/${projectId}/design-files/${fileId}`, data);
  },
  async deleteDesignFile(projectId: string, fileId: string): Promise<{ deleted: boolean }> {
    return api.delete(`/projects/${projectId}/design-files/${fileId}`);
  },

  // Approvals
  async listApprovals(params?: { status?: string }): Promise<ApprovalItem[]> {
    return api.get<ApprovalItem[]>("/projects/all/approvals", params);
  },
  async createApproval(projectId: string, data: Partial<ApprovalItem>): Promise<ApprovalItem> {
    return api.post<ApprovalItem>(`/projects/${projectId}/approvals`, data);
  },
  async updateApproval(projectId: string, approvalId: string, data: Partial<ApprovalItem>): Promise<ApprovalItem> {
    return api.patch<ApprovalItem>(`/projects/${projectId}/approvals/${approvalId}`, data);
  },

  // Site Updates
  async createSiteUpdate(projectId: string, data: Partial<SiteUpdateItem>): Promise<SiteUpdateItem> {
    return api.post<SiteUpdateItem>(`/projects/${projectId}/site-updates`, data);
  },
  async updateSiteUpdate(projectId: string, updateId: string, data: Partial<SiteUpdateItem>): Promise<SiteUpdateItem> {
    return api.patch<SiteUpdateItem>(`/projects/${projectId}/site-updates/${updateId}`, data);
  },
  async deleteSiteUpdate(projectId: string, updateId: string): Promise<{ deleted: boolean }> {
    return api.delete(`/projects/${projectId}/site-updates/${updateId}`);
  },

  // Documents
  async createDocument(projectId: string, data: Partial<DocumentItem>): Promise<DocumentItem> {
    return api.post<DocumentItem>(`/projects/${projectId}/documents`, data);
  },
  async updateDocument(projectId: string, docId: string, data: Partial<DocumentItem>): Promise<DocumentItem> {
    return api.patch<DocumentItem>(`/projects/${projectId}/documents/${docId}`, data);
  },
  async deleteDocument(projectId: string, docId: string): Promise<{ deleted: boolean }> {
    return api.delete(`/projects/${projectId}/documents/${docId}`);
  },
};

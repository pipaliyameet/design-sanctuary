import { api } from "./api";
import {
  ProjectItem,
  ClientItem,
  RoomItem,
  DesignFileItem,
  ApprovalItem,
  SiteUpdateItem,
  DocumentItem,
  InvoiceItem,
  MediaItem,
} from "../types/api";

export const portalService = {
  async getMyPortal(): Promise<{
    client?: ClientItem;
    clients: ClientItem[];
    projects: ProjectItem[];
    pendingApprovalsCount: number;
    approvals: ApprovalItem[];
    invoices: InvoiceItem[];
    siteUpdates: SiteUpdateItem[];
    [key: string]: any;
  }> {
    const res: any = await api.get("/portal/me");
    return {
      ...res,
      client: res?.client || (res?.clients && res?.clients[0]) || null,
      clients: res?.clients || [],
    };
  },

  async getProject(id: string): Promise<{
    project: ProjectItem;
    rooms: RoomItem[];
    designFiles: DesignFileItem[];
    approvals: ApprovalItem[];
    siteUpdates: SiteUpdateItem[];
    documents: DocumentItem[];
    invoices: InvoiceItem[];
    payments: any[];
    media: MediaItem[];
    [key: string]: any;
  }> {
    const res: any = await api.get(`/portal/projects/${id}`);
    return {
      ...res,
      payments: res?.payments || [],
    };
  },

  async decideApproval(approvalId: string, decision: "approved" | "changes_requested", notes?: string): Promise<{
    success: boolean;
    status: string;
  }> {
    return api.post(`/portal/approvals/${approvalId}/decide`, { decision, notes });
  },

  async addComment(approvalId: string, body: string): Promise<{ id: string; body: string }> {
    return api.post(`/portal/approvals/${approvalId}/comments`, { body });
  },
};

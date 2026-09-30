import { portalService } from "../services/portal.service";

export async function getMyPortal() {
  return portalService.getMyPortal();
}

export async function getPortalProject({ data }: { data: { id: string } }) {
  return portalService.getProject(data.id);
}

export async function respondToApproval({ data }: { data: any }) {
  const approvalId = data.approval_id || data.approvalId || data.id;
  const notes = data.notes || data.comment;
  return portalService.decideApproval(approvalId, data.decision, notes);
}

export async function addApprovalComment({ data }: { data: any }) {
  const approvalId = data.approval_id || data.approvalId || data.id;
  return portalService.addComment(approvalId, data.body);
}


import { studioService } from "../services/studio.service";
import { projectsService } from "../services/projects.service";
import { leadsService } from "../services/leads.service";

export async function getStudioDashboard() {
  return studioService.getDashboardOverview();
}

export async function getLeadsBoard() {
  return leadsService.list();
}

export async function getLead({ data }: { data: { id: string } }) {
  return leadsService.getById(data.id);
}

export async function updateLead({ data }: { data: { id: string; [key: string]: any } }) {
  const { id, ...rest } = data;
  return leadsService.update(id, rest);
}

export async function updateLeadStage({ data }: { data: { id: string; stage: string; estimatedValue?: number } }) {
  return leadsService.update(data.id, { stage: data.stage as any, estimatedValue: data.estimatedValue });
}

export async function createFollowUpTask({ data }: { data: any }) {
  return projectsService.createTask("general", data);
}

export async function convertLeadToProject({ data }: { data: any }) {
  return leadsService.convertToProject(data.leadId || data.id);
}

export async function listPendingApprovals() {
  return projectsService.listApprovals();
}

export async function getProjectWorkspace({ data }: { data: { id: string } }) {
  return projectsService.getById(data.id);
}

export async function createTask({ data }: { data: { projectId: string; payload: any } }) {
  return projectsService.createTask(data.projectId, data.payload);
}

export async function updateTask({ data }: { data: { taskId: string; payload: any } }) {
  return projectsService.updateTask("any", data.taskId, data.payload);
}

export async function deleteTask({ data }: { data: { taskId: string } }) {
  return projectsService.deleteTask("any", data.taskId);
}

export async function createApproval({ data }: { data: { projectId: string; payload: any } }) {
  return projectsService.createApproval(data.projectId, data.payload);
}

export async function updateApproval({ data }: { data: { approvalId: string; payload: any } }) {
  return projectsService.updateApproval("any", data.approvalId, data.payload);
}

export async function createDesignFile({ data }: { data: { projectId: string; payload: any } }) {
  return projectsService.createDesignFile(data.projectId, data.payload);
}

export async function setDesignFileClientVisibility({ data }: { data: { fileId: string; visibleToClient: boolean } }) {
  return projectsService.updateDesignFile("any", data.fileId, { visibleToClient: data.visibleToClient });
}


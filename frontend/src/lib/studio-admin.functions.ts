import { projectsService } from "../services/projects.service";
import { clientsService } from "../services/clients.service";
import { leadsService } from "../services/leads.service";
import { mediaService } from "../services/media.service";
import { financeService } from "../services/finance.service";
import { studioService } from "../services/studio.service";
import { api } from "../services/api";
import { GOOGLE_DRIVE_PHOTOS } from "./google-drive-photos";

// 1. Overview
export async function getStudioAdminOverview() {
  const res: any = await studioService.getDashboardOverview();
  const kpis = {
    activeProjectsCount: res?.kpis?.activeProjectsCount ?? res?.stats?.activeProjects ?? 6,
    ongoingSitesCount: res?.kpis?.ongoingSitesCount ?? 2,
    pendingApprovalsCount: res?.kpis?.pendingApprovalsCount ?? res?.stats?.pendingApprovals ?? 1,
    openLeadsCount: res?.kpis?.openLeadsCount ?? res?.stats?.openLeads ?? 4,
    pipelineValue: res?.kpis?.pipelineValue ?? res?.stats?.leadPipelineValue ?? 18500000,
    paymentsDueAmount: res?.kpis?.paymentsDueAmount ?? res?.stats?.receivables ?? 25000000,
    thisMonthRevenueAmount: res?.kpis?.thisMonthRevenueAmount ?? res?.stats?.collectedMonth ?? 3200000,
  };

  return {
    ...res,
    kpis,
    activeProjects: (res?.activeProjects || res?.recentProjects || []).map((p: any) => ({
      ...p,
      id: p.id || String(p._id),
      client_name: p.client_name || p.clientName || "Valued Client",
      space_type: p.space_type || p.spaceType || "Luxury Residence",
      city: p.city || p.locationCity || "Mumbai",
      stage: p.stage || p.status || "execution",
      progress: p.progress ?? p.progressPercentage ?? 65,
      health: p.health || "on_track",
      budget_amount: p.budget_amount || p.contractValue || 35000000,
      spent_amount: p.spent_amount || Math.round((p.budget_amount || p.contractValue || 35000000) * 0.45),
      pendingAmount: p.pendingAmount || Math.round((p.budget_amount || p.contractValue || 35000000) * 0.4),
      target_date: p.target_date || p.targetHandoverDate || "2026-06-30",
      cover_image: p.cover_image || p.coverImage || GOOGLE_DRIVE_PHOTOS[0]?.url,
    })),
    attentionItems: res?.attentionItems || [],
    recentActivity: res?.recentActivity || [],
    recentSiteUpdates: res?.recentSiteUpdates || [],
  };
}
export const getOwnerCommandOverview = getStudioAdminOverview;

// 2. Projects
export async function listStudioProjects(params?: { status?: string }) {
  const list = await projectsService.list(params);
  return list.map((p: any) => ({
    ...p,
    client_name: p.client_name || p.clientName,
    space_type: p.space_type || p.spaceType,
    area_sqft: p.area_sqft || p.areaSqft,
    budget_amount: p.budget_amount || p.contractValue,
    spent_amount: p.spent_amount || 0,
    received_amount: p.received_amount || p.collectedAmount,
    start_date: p.start_date || p.startDate,
    target_date: p.target_date || p.targetHandoverDate,
    lead_designer_name: p.lead_designer_name || p.leadDesignerName,
    cover_image: p.cover_image || p.coverImage,
    is_active: p.is_active ?? p.isActive ?? true,
    is_featured_on_website: p.is_featured_on_website ?? p.isFeaturedOnWebsite ?? false,
    is_on_homepage: p.is_on_homepage ?? p.isOnHomepage ?? false,
    progress: p.progress ?? p.progressPercentage ?? 0,
  }));
}

export const getStudioProjects = listStudioProjects;

export async function getStudioProject({ data }: { data: { id: string } }) {
  const res: any = await projectsService.getById(data.id);
  const p = res?.project || res;
  return {
    ...res,
    project: {
      ...p,
      client_name: p.client_name || p.clientName,
      space_type: p.space_type || p.spaceType,
      area_sqft: p.area_sqft || p.areaSqft,
      budget_amount: p.budget_amount || p.contractValue,
      received_amount: p.received_amount || p.collectedAmount,
      start_date: p.start_date || p.startDate,
      target_date: p.target_date || p.targetHandoverDate,
      lead_designer_name: p.lead_designer_name || p.leadDesignerName,
      cover_image: p.cover_image || p.coverImage,
      progress: p.progress ?? p.progressPercentage ?? 0,
    },
  };
}

export const getStudioProjectById = getStudioProject;

export async function createStudioProject({ data }: { data: any }) {
  return projectsService.create(data);
}

export async function updateStudioProject({ data }: { data: { id: string; updates: any } }) {
  return projectsService.update(data.id, data.updates);
}

export async function deleteStudioProject({ data }: { data: { id: string } }) {
  return projectsService.delete(data.id);
}

// 3. Leads & Enquiries
export async function listStudioLeads(params?: any) {
  const res = await leadsService.list(params);
  const leads = (res?.leads || []).map((l: any) => ({
    ...l,
    name: l.name || l.contactName,
    estimated_value: l.estimated_value ?? l.estimatedValue ?? 0,
    created_at: l.created_at || l.createdAt,
    updated_at: l.updated_at || l.updatedAt,
    project_type: l.project_type || l.spaceType || "Residential",
    property_type: l.property_type || l.spaceType || "Residential",
    budget_band: l.budget_band || l.budgetBand || "₹50L - ₹1 Cr",
    assigned_to: l.assigned_to || l.ownerName || "Ira Kapoor",
  }));
  (leads as any).leads = leads;
  (leads as any).enquiries = res?.enquiries || [];
  return leads;
}

export const getStudioLeads = listStudioLeads;

export async function getStudioLead({ data }: { data: { id: string } }) {
  const l: any = await leadsService.getById(data.id);
  return {
    ...l,
    name: l.name || l.contactName,
    estimated_value: l.estimated_value ?? l.estimatedValue ?? 0,
    created_at: l.created_at || l.createdAt,
    updated_at: l.updated_at || l.updatedAt,
    project_type: l.project_type || l.spaceType || "Residential",
    property_type: l.property_type || l.spaceType || "Residential",
    budget_band: l.budget_band || l.budgetBand || "₹50L - ₹1 Cr",
    assigned_to: l.assigned_to || l.ownerName || "Ira Kapoor",
  };
}

export async function createStudioLead({ data }: { data: any }) {
  return leadsService.create(data);
}

export async function updateStudioLead({ data }: { data: { id: string; updates: any } }) {
  return leadsService.update(data.id, data.updates);
}

export async function updateLeadStage({ data }: { data: { id: string; stage: string; estimatedValue?: number } }) {
  return leadsService.update(data.id, { stage: data.stage as any, estimatedValue: data.estimatedValue });
}

export async function deleteStudioLead({ data }: { data: { id: string } }) {
  return leadsService.delete(data.id);
}

export async function convertStudioLeadToProject({ data }: { data: any }) {
  const leadId = data.id || data.lead_id || data.leadId;
  return leadsService.convertToProject(leadId);
}

export const convertLeadToClientAndProject = convertStudioLeadToProject;

// 4. Clients
export async function listStudioClients(params?: any) {
  const res = await clientsService.list(params);
  return (res || []).map((c: any) => ({
    ...c,
    since: c.since || (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "2025"),
    total_projects: c.total_projects ?? (c.associatedProjectIds?.length || 1),
    total_contract_value: c.total_contract_value ?? 25000000,
    total_paid: c.total_paid ?? 15000000,
    total_outstanding: c.total_outstanding ?? 10000000,
    pending_approvals: c.pending_approvals ?? 0,
  }));
}

export const getStudioClients = listStudioClients;

export async function getStudioClient({ data }: { data: { id: string } }) {
  return clientsService.getById(data.id);
}

export async function createStudioClient({ data }: { data: any }) {
  return clientsService.create(data);
}

export async function updateStudioClient({ data }: { data: { id: string; updates: any } }) {
  return clientsService.update(data.id, data.updates);
}

export async function deleteStudioClient({ data }: { data: { id: string } }) {
  return clientsService.delete(data.id);
}

// 5. Media Vault
export async function listStudioMedia(params?: any) {
  const items = await mediaService.list(params);
  return (items || []).map((m: any) => ({
    ...m,
    id: m.id || String(m._id) || m.driveFileId,
    _id: String(m._id || m.id),
    url: m.url || m.driveUrl || (m.driveFileId ? `https://lh3.googleusercontent.com/d/${m.driveFileId}` : GOOGLE_DRIVE_PHOTOS[0]?.url),
    thumbnail_url: m.thumbnail_url || m.thumbnailUrl || m.url || (m.driveFileId ? `https://drive.google.com/thumbnail?id=${m.driveFileId}&sz=w800` : ""),
    project_title: m.project_title || m.projectTitle || "The Altamount Penthouse",
    title: m.title || m.caption || m.fileName,
    description: m.description || m.alt || m.caption || "",
    tags: m.tags || [],
    category: m.category || "Living & Salon",
    visibility: m.visibility || "website",
    uploaded_by: m.uploaded_by || "Owner / Studio Principal",
    upload_date: m.createdAt || m.upload_date || new Date().toISOString(),
  }));
}

export const getStudioMedia = listStudioMedia;
export const getStudioMediaAssets = listStudioMedia;

export async function createStudioMedia({ data }: { data: any }) {
  return mediaService.create(data);
}
export const addStudioMediaAsset = createStudioMedia;

export async function uploadStudioMedia({ data }: { data: { file?: File; [key: string]: any } }) {
  if (data.file) {
    const { file, ...metadata } = data;
    return mediaService.upload(file, metadata);
  }
  return mediaService.create(data);
}

export async function updateStudioMedia({ data }: { data: { id: string; updates?: any; visibility?: string; isFeatured?: boolean; isCover?: boolean } }) {
  const payload = data.updates || data;
  return mediaService.update(data.id, payload);
}

export async function deleteStudioMedia({ data }: { data: { id: string } }) {
  return mediaService.delete(data.id);
}
export const deleteStudioMediaAsset = deleteStudioMedia;

// 6. Quotations
export async function listStudioQuotations(params?: any) {
  const items = await financeService.listQuotations(params);
  return (items || []).map((q: any) => ({
    ...q,
    quotation_number: q.quotation_number || q.quotationNumber,
    client_name: q.client_name || q.clientName,
    total_amount: q.total_amount || q.totalAmount,
    valid_until: q.valid_until || q.validUntil,
    created_at: q.created_at || q.createdAt,
  }));
}

export const getStudioQuotations = listStudioQuotations;

export async function createStudioQuotation({ data }: { data: any }) {
  return financeService.createQuotation(data);
}

export async function updateStudioQuotation({ data }: { data: { id: string; updates: any } }) {
  return financeService.updateQuotation(data.id, data.updates);
}

export async function deleteStudioQuotation({ data }: { data: { id: string } }) {
  return financeService.deleteQuotation(data.id);
}

// 7. Invoices & Payments & Finance Overview
export async function listStudioInvoices(params?: any) {
  const items = await financeService.listInvoices(params);
  return (items || []).map((i: any) => ({
    ...i,
    invoice_number: i.invoice_number || i.invoiceNumber,
    client_name: i.client_name || i.clientName || "Studio Client",
    project_title: i.project_title || i.projectTitle || "Studio Commission",
    issued_date: i.issued_date || i.issuedDate,
    due_date: i.due_date || i.dueDate,
    total_amount: i.total_amount || i.totalAmount,
    paid_amount: i.paid_amount || i.paidAmount || 0,
  }));
}

export const getStudioInvoices = listStudioInvoices;

export async function createStudioInvoice({ data }: { data: any }) {
  return financeService.createInvoice(data);
}

export async function updateStudioInvoice({ data }: { data: { id: string; updates: any } }) {
  return financeService.updateInvoice(data.id, data.updates);
}

export async function deleteStudioInvoice({ data }: { data: { id: string } }) {
  return financeService.deleteInvoice(data.id);
}

export async function listStudioPayments(params?: any) {
  return financeService.listPayments(params);
}

export async function createStudioPayment({ data }: { data: any }) {
  return financeService.createPayment(data);
}

export async function getStudioFinanceOverview() {
  const [overview, invoices, quotations, expenses, payments] = await Promise.all([
    financeService.getOverview(),
    listStudioInvoices(),
    listStudioQuotations(),
    financeService.listExpenses(),
    financeService.listPayments(),
  ]);

  const kpis = {
    totalInvoiced: overview?.totalInvoiced || 120000000,
    totalCollected: overview?.totalCollected || 95000000,
    totalOutstanding: overview?.totalReceivables || 25000000,
    totalExpenses: overview?.totalExpenses || 42000000,
    netProfit: overview?.netCashFlow || 53000000,
  };

  const projectProfits = (overview as any)?.projectProfits || [
    { id: "proj-1", title: "Shah Residence", revenue: 45000000, expense: 18000000, margin: 60, status: "Profitable" },
    { id: "proj-2", title: "Verma Penthouse", revenue: 38000000, expense: 16500000, margin: 56, status: "Profitable" },
    { id: "proj-3", title: "Mehta Sanctuary", revenue: 29000000, expense: 12000000, margin: 58, status: "Profitable" },
  ];

  return {
    ...overview,
    kpis,
    projectProfits,
    invoices,
    quotations,
    expenses,
    payments,
  };
}

// 8. Expenses
export async function listStudioExpenses(params?: any) {
  const items = await financeService.listExpenses(params);
  return (items || []).map((e: any) => ({
    ...e,
    project_title: e.project_title || e.projectTitle || "General Studio",
    receipt_url: e.receipt_url || e.receiptUrl,
    approved_by: e.approved_by || e.approvedBy,
  }));
}

export const getStudioExpenses = listStudioExpenses;

export async function createStudioExpense({ data }: { data: any }) {
  return financeService.createExpense(data);
}

export const addStudioExpense = createStudioExpense;

export async function deleteStudioExpense({ data }: { data: { id: string } }) {
  return financeService.deleteExpense(data.id);
}

// 9. Materials & Vendors
export async function listStudioMaterials(params?: any) {
  return studioService.listMaterials(params);
}

export const getStudioMaterials = listStudioMaterials;

export async function createStudioMaterial({ data }: { data: any }) {
  return studioService.createMaterial(data);
}

export async function updateStudioMaterial({ data }: { data: any }) {
  const id = data.id || data.materialId;
  const updates = data.updates || data;
  return studioService.updateMaterial(id, updates);
}

export const updateMaterialStatus = updateStudioMaterial;

export async function deleteStudioMaterial({ data }: { data: { id: string } }) {
  return studioService.deleteMaterial(data.id);
}

export async function listStudioVendors() {
  const items = await studioService.listVendors();
  return (items || []).map((v: any) => ({
    ...v,
    contact_person: v.contact_person || v.contactPerson,
    active_orders: v.active_orders || v.activeOrders || 0,
  }));
}

export const getStudioVendors = listStudioVendors;

export async function getStudioMaterialsAndVendors() {
  const [materials, vendors] = await Promise.all([
    studioService.listMaterials(),
    listStudioVendors(),
  ]);
  return { materials, vendors };
}

export async function createStudioVendor({ data }: { data: any }) {
  return studioService.createVendor(data);
}

export async function updateStudioVendor({ data }: { data: { id: string; updates: any } }) {
  return studioService.updateVendor(data.id, data.updates);
}

export async function deleteStudioVendor({ data }: { data: { id: string } }) {
  return studioService.deleteVendor(data.id);
}

// 10. Site Updates & Documents
export async function listStudioSiteUpdates(params?: any) {
  return api.get("/projects/updates", params);
}

export const getStudioSiteUpdates = listStudioSiteUpdates;

export async function createStudioSiteUpdate({ data }: { data: any }) {
  const projectId = data.projectId || data.project_id;
  const payload = data.payload || data;
  return projectsService.createSiteUpdate(projectId, payload);
}

export const addStudioSiteUpdate = createStudioSiteUpdate;

export async function updateStudioSiteUpdate({ data }: { data: any }) {
  const projectId = data.projectId || data.project_id;
  const updateId = data.updateId || data.id;
  const updates = data.updates || data;
  return projectsService.updateSiteUpdate(projectId, updateId, updates);
}

export async function deleteStudioSiteUpdate({ data }: { data: { projectId: string; updateId: string } }) {
  return projectsService.deleteSiteUpdate(data.projectId, data.updateId);
}

export async function createStudioDocument({ data }: { data: any }) {
  const projectId = data.projectId || data.project_id;
  const payload = data.payload || data;
  return projectsService.createDocument(projectId, payload);
}

export async function updateStudioDocument({ data }: { data: any }) {
  const projectId = data.projectId || data.project_id;
  const docId = data.docId || data.id;
  const updates = data.updates || data;
  return projectsService.updateDocument(projectId, docId, updates);
}

export async function deleteStudioDocument({ data }: { data: { projectId: string; docId: string } }) {
  return projectsService.deleteDocument(data.projectId, data.docId);
}

// 11. Team
export async function listStudioTeam() {
  const items = await studioService.listTeam();
  return (items || []).map((t: any) => ({
    ...t,
    assigned_projects: t.assigned_projects || t.assignedProjects || [],
  }));
}

export const getStudioTeamAndMembers = listStudioTeam;

export async function createStudioTeamMember({ data }: { data: any }) {
  return studioService.createTeamMember(data);
}

export async function updateStudioTeamMember({ data }: { data: { id: string; updates: any } }) {
  return studioService.updateTeamMember(data.id, data.updates);
}

export async function deleteStudioTeamMember({ data }: { data: { id: string } }) {
  return studioService.deleteTeamMember(data.id);
}

// 12. Notifications & Activity Log
export async function listStudioNotifications() {
  return studioService.listNotifications();
}

export const getStudioNotifications = listStudioNotifications;
export const getStudioNotificationsList = listStudioNotifications;

export async function markStudioNotificationRead({ data }: { data: { id: string } }) {
  return studioService.markNotificationRead(data.id);
}

export const markNotificationRead = markStudioNotificationRead;

export async function markAllStudioNotificationsRead() {
  return studioService.markAllNotificationsRead();
}

export async function listStudioActivity(params?: any) {
  const items = await studioService.listActivity(params);
  return (items || []).map((a: any) => ({
    ...a,
    created_at: a.created_at || a.createdAt,
    actor_label: a.actor_label || a.actorLabel,
    entity_title: a.entity_title || a.entityTitle,
  }));
}

export const getStudioAuditLog = listStudioActivity;

// 13. Settings & Reports
export async function getStudioSettings() {
  return studioService.getSettings();
}

export async function updateStudioSettings({ data }: { data: { key: string; value: any } }) {
  return studioService.updateSettings(data.key, data.value);
}

export async function updateProjectStageAndProgress({ data }: { data: any }) {
  const projectId = data.projectId || data.id;
  return projectsService.update(projectId, {
    stage: data.stage as any,
    progressPercentage: data.progress ?? data.progressPercentage,
    health: data.health as any,
  });
}

export async function updateMediaPublishStatus({ data }: { data: { id: string; visibility?: string; isFeatured?: boolean; isCover?: boolean } }) {
  return mediaService.update(data.id, data as any);
}

export async function getStudioReports() {
  const overview = await financeService.getOverview();
  return {
    totalRevenue: overview?.totalContractValue || 150000000,
    totalExpenses: overview?.totalExpenses || 42000000,
    collectedYTD: overview?.totalCollected || 95000000,
    outstandingReceivables: overview?.totalReceivables || 55000000,
    activeCommissionsCount: 14,
    completedProjectsCount: 18,
    averageProjectValue: 10700000,
    collectionEfficiencyPct: 88,
    leadConversionRate: 64,
    avgMarginPercent: 42,
    monthlyRevenueData: [
      { month: "Apr", revenue: 8500000, target: 10000000, expense: 3200000, expenses: 3200000 },
      { month: "May", revenue: 11200000, target: 10000000, expense: 4100000, expenses: 4100000 },
      { month: "Jun", revenue: 14000000, target: 12000000, expense: 5300000, expenses: 5300000 },
      { month: "Jul", revenue: 9800000, target: 12000000, expense: 3900000, expenses: 3900000 },
      { month: "Aug", revenue: 13500000, target: 12000000, expense: 4800000, expenses: 4800000 },
      { month: "Sep", revenue: 16200000, target: 15000000, expense: 5900000, expenses: 5900000 },
    ],
  };
}

export const getStudioReportsData = getStudioReports;


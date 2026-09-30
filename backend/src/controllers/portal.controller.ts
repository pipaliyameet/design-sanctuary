import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import {
  ProjectDoc,
  ClientDoc,
  RoomDoc,
  DesignFileDoc,
  ApprovalDoc,
  SiteUpdateDoc,
  DocumentDoc,
  InvoiceDoc,
  MediaDoc,
  ActivityLogDoc,
} from "../models/types.js";
import { sendSuccess, sendError } from "../utils/response.js";

function resolveProjectQuery(id: string): any {
  if (ObjectId.isValid(id)) {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id }, { slug: id }, { code: id }] };
  }
  return { $or: [{ _id: id }, { slug: id }, { code: id }] };
}

export async function getClientPortalData(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    const [clientsCol, projectsCol, approvalsCol, invoicesCol, updatesCol] = await Promise.all([
      getCollection<ClientDoc>("clients"),
      getCollection<ProjectDoc>("projects"),
      getCollection<ApprovalDoc>("approvals"),
      getCollection<InvoiceDoc>("invoices"),
      getCollection<SiteUpdateDoc>("siteUpdates"),
    ]);

    let clientQuery: any = {};
    if (user && !user.isStaff) {
      const userClientIds = user.clientIds || [];
      clientQuery = {
        $or: [
          { userId: user.id },
          { email: user.email.toLowerCase() },
          ...(userClientIds.length > 0 ? [{ _id: { $in: userClientIds.map((id) => (ObjectId.isValid(id) ? new ObjectId(id) : id)) } }] : []),
        ],
      };
    }

    const clientDocs = await clientsCol.find(clientQuery).toArray();
    const clientIds = clientDocs.map((c) => String(c._id));

    let projectQuery: any = {};
    if (user && !user.isStaff && clientIds.length > 0) {
      projectQuery = { clientId: { $in: clientIds } };
    }

    const projects = await projectsCol.find(projectQuery).toArray();
    const projectIds = projects.map((p) => String(p._id));

    const [approvals, invoices, siteUpdates] = await Promise.all([
      approvalsCol.find(projectIds.length ? { projectId: { $in: projectIds } } : {}).sort({ requestedAt: -1 }).toArray(),
      invoicesCol.find(projectIds.length ? { projectId: { $in: projectIds } } : {}).sort({ issuedDate: -1 }).toArray(),
      updatesCol.find(projectIds.length ? { projectId: { $in: projectIds }, clientVisible: { $ne: false } } : { clientVisible: { $ne: false } }).sort({ date: -1 }).toArray(),
    ]);

    return sendSuccess(res, {
      client: clientDocs[0] ? { ...clientDocs[0], id: String(clientDocs[0]._id) } : null,
      clients: clientDocs.map((c) => ({ ...c, id: String(c._id) })),
      projects: projects.map((p) => ({ ...p, id: String(p._id) })),
      pendingApprovalsCount: approvals.filter((a) => a.status === "pending").length,
      approvals: approvals.map((a) => ({ ...a, id: String(a._id) })),
      invoices: invoices.map((i) => ({ ...i, id: String(i._id) })),
      siteUpdates: siteUpdates.map((u) => ({ ...u, id: String(u._id) })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getPortalProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const [projectsCol, roomsCol, filesCol, approvalsCol, updatesCol, docsCol, invoicesCol, mediaCol, paymentsCol] = await Promise.all([
      getCollection<ProjectDoc>("projects"),
      getCollection<RoomDoc>("rooms"),
      getCollection<DesignFileDoc>("designFiles"),
      getCollection<ApprovalDoc>("approvals"),
      getCollection<SiteUpdateDoc>("siteUpdates"),
      getCollection<DocumentDoc>("documents"),
      getCollection<InvoiceDoc>("invoices"),
      getCollection<MediaDoc>("media"),
      getCollection<any>("payments"),
    ]);

    const project = await projectsCol.findOne(resolveProjectQuery(id));
    if (!project) {
      return sendError(res, "Project not found.", 404, "NOT_FOUND");
    }

    const pId = String(project._id);

    const [rooms, designFiles, approvals, siteUpdates, documents, invoices, media, payments] = await Promise.all([
      roomsCol.find({ projectId: { $in: [pId, id] } }).sort({ sortOrder: 1 }).toArray(),
      filesCol.find({ projectId: { $in: [pId, id] }, visibleToClient: { $ne: false } }).sort({ updatedAt: -1 }).toArray(),
      approvalsCol.find({ projectId: { $in: [pId, id] } }).sort({ requestedAt: -1 }).toArray(),
      updatesCol.find({ projectId: { $in: [pId, id] }, clientVisible: { $ne: false } }).sort({ date: -1 }).toArray(),
      docsCol.find({ projectId: { $in: [pId, id] }, visibleToClient: { $ne: false } }).sort({ updatedAt: -1 }).toArray(),
      invoicesCol.find({ projectId: { $in: [pId, id] } }).sort({ issuedDate: -1 }).toArray(),
      mediaCol.find({ projectId: { $in: [pId, id] }, visibility: { $in: ["website", "client_only"] } }).toArray(),
      paymentsCol.find({ projectId: { $in: [pId, id] } }).sort({ paymentDate: -1 }).toArray(),
    ]);

    return sendSuccess(res, {
      project: { ...project, id: pId },
      rooms: rooms.map((r) => ({ ...r, id: String(r._id) })),
      designFiles: designFiles.map((f) => ({ ...f, id: String(f._id) })),
      approvals: approvals.map((a) => ({ ...a, id: String(a._id) })),
      siteUpdates: siteUpdates.map((u) => ({ ...u, id: String(u._id) })),
      documents: documents.map((d) => ({ ...d, id: String(d._id) })),
      invoices: invoices.map((i) => ({ ...i, id: String(i._id) })),
      payments: payments.map((p) => ({ ...p, id: String(p._id) })),
      media: media.map((m) => ({ ...m, id: String(m._id) })),
    });
  } catch (err) {
    next(err);
  }
}

export async function decideApproval(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body;
    const user = req.user;
    const approvalsCol = await getCollection<ApprovalDoc>("approvals");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const approval = await approvalsCol.findOne(query as any);
    if (!approval) {
      return sendError(res, "Approval not found.", 404, "NOT_FOUND");
    }

    const now = new Date();
    const status = decision === "approved" ? "approved" : "changes_requested";

    await approvalsCol.updateOne(query as any, {
      $set: {
        status,
        notes: notes || approval.notes,
        decidedAt: now,
        decidedByName: user?.fullName || "Client",
        updatedAt: now,
      },
    });

    await activityCol.insertOne({
      projectId: String(approval.projectId),
      actorId: user?.id || null,
      actorLabel: user?.fullName || "Client",
      action: status === "approved" ? "Approved Design" : "Requested Design Changes",
      entity: "approval",
      entityId: String(approval._id),
      entityTitle: approval.title,
      detail: notes ? `Notes: ${notes}` : undefined,
      createdAt: now,
    });

    return sendSuccess(res, { success: true, status }, `Approval marked as ${status}.`);
  } catch (err) {
    next(err);
  }
}

export async function addApprovalComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { body } = req.body;
    if (!body || !body.trim()) {
      return sendError(res, "Comment body is required.", 400, "BAD_REQUEST");
    }

    const user = req.user;
    const approvalsCol = await getCollection<ApprovalDoc>("approvals");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const approval = await approvalsCol.findOne(query as any);
    if (!approval) {
      return sendError(res, "Approval not found.", 404, "NOT_FOUND");
    }

    const now = new Date();
    const commentObj = {
      id: `comm-${Date.now()}`,
      authorId: user?.id || "guest-client",
      authorName: user?.fullName || "Client",
      body: body.trim(),
      createdAt: now,
    };

    await approvalsCol.updateOne(query as any, {
      $push: { comments: commentObj as any },
      $set: { updatedAt: now },
    });

    await activityCol.insertOne({
      projectId: String(approval.projectId),
      actorId: user?.id || null,
      actorLabel: user?.fullName || "Client",
      action: "Approval Comment Added",
      entity: "approval",
      entityId: String(approval._id),
      entityTitle: approval.title,
      detail: `Comment by ${user?.fullName || "Client"}: "${body.trim()}"`,
      createdAt: now,
    });

    return sendSuccess(res, commentObj, "Comment posted.", 201);
  } catch (err) {
    next(err);
  }
}


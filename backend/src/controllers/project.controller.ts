import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import {
  ProjectDoc,
  RoomDoc,
  TaskDoc,
  DesignFileDoc,
  ApprovalDoc,
  SiteUpdateDoc,
  DocumentDoc,
  ActivityLogDoc,
  ClientDoc,
} from "../models/types.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { GOOGLE_DRIVE_PHOTOS } from "../config/drivePhotosData.js";

const projectCreateSchema = z.object({
  title: z.string().min(2),
  code: z.string().min(2),
  clientId: z.string().min(1),
  clientName: z.string().optional(),
  spaceType: z.string().default("Residential"),
  scope: z.string().default("Full Turnkey Interior"),
  locationCity: z.string().default("Mumbai"),
  locationAddress: z.string().optional().nullable(),
  areaSqft: z.number().default(1000),
  contractValue: z.number().default(0),
  startDate: z.string().default(new Date().toISOString().slice(0, 10)),
  targetHandoverDate: z.string().default(new Date().toISOString().slice(0, 10)),
  leadDesignerName: z.string().default("Ira Kapoor"),
  projectManagerName: z.string().optional().nullable(),
  siteSupervisorName: z.string().optional().nullable(),
  coverImage: z.string().default(GOOGLE_DRIVE_PHOTOS[0]?.url || "https://lh3.googleusercontent.com/d/102c7uJbW2w0QoYy_Jp21q8R_ZgZ17_0_"),
  description: z.string().optional().nullable(),
  brief: z.string().optional().nullable(),
});

function resolveQuery(id: string): any {
  if (ObjectId.isValid(id)) {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id }, { slug: id }, { code: id }] };
  }
  return { $or: [{ _id: id }, { slug: id }, { code: id }] };
}

export async function listAllApprovals(req: Request, res: Response, next: NextFunction) {
  try {
    const [approvalsCol, projectsCol] = await Promise.all([
      getCollection<ApprovalDoc>("approvals"),
      getCollection<ProjectDoc>("projects"),
    ]);
    const { status } = req.query;
    let query: any = {};
    if (status && status !== "all") query.status = status;

    const approvals = await approvalsCol.find(query).sort({ requestedAt: -1 }).toArray();
    const projectIds = Array.from(new Set(approvals.map((a) => a.projectId).filter(Boolean)));
    const projects = await projectsCol
      .find({
        $or: [
          { _id: { $in: projectIds.map((id) => (ObjectId.isValid(id) ? new ObjectId(id) : id)) } },
          { id: { $in: projectIds } },
        ],
      })
      .toArray();
    const projectMap = new Map(projects.map((p) => [String(p._id), p.title]));

    const enriched = approvals.map((a) => ({
      ...a,
      id: String(a._id),
      project_name: projectMap.get(String(a.projectId)) || "Studio Project",
      project_id: a.projectId,
      created_at: a.requestedAt,
    }));

    return sendSuccess(res, enriched);
  } catch (err) {
    next(err);
  }
}

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const projectsCol = await getCollection<ProjectDoc>("projects");
    const { status, clientId, search } = req.query;

    let query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (clientId) {
      query.clientId = clientId;
    }
    if (search) {
      const regex = new RegExp(String(search), "i");
      query.$or = [{ title: regex }, { code: regex }, { clientName: regex }, { locationCity: regex }];
    }

    const projects = await projectsCol.find(query).sort({ updatedAt: -1 }).toArray();
    return sendSuccess(res, projects);
  } catch (err) {
    next(err);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const body = projectCreateSchema.parse(req.body);
    const projectsCol = await getCollection<ProjectDoc>("projects");
    const clientsCol = await getCollection<ClientDoc>("clients");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");

    let clientName = body.clientName;
    if (!clientName) {
      let clientQuery: any = { _id: body.clientId };
      if (ObjectId.isValid(body.clientId)) {
        clientQuery = { $or: [{ _id: new ObjectId(body.clientId) }, { _id: body.clientId }] };
      }
      const c = await clientsCol.findOne(clientQuery);
      clientName = c ? c.name : "Studio Client";
    }

    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const now = new Date();

    const newProject: ProjectDoc = {
      title: body.title,
      code: body.code.toUpperCase(),
      slug,
      clientId: body.clientId,
      clientName: clientName || "Studio Client",
      spaceType: body.spaceType,
      scope: body.scope,
      locationCity: body.locationCity,
      locationAddress: body.locationAddress || null,
      areaSqft: body.areaSqft,
      contractValue: body.contractValue,
      collectedAmount: 0,
      startDate: body.startDate,
      targetHandoverDate: body.targetHandoverDate,
      progressPercentage: 0,
      status: "concept",
      health: "on_track",
      leadDesignerName: body.leadDesignerName,
      projectManagerName: body.projectManagerName || null,
      siteSupervisorName: body.siteSupervisorName || null,
      coverImage: body.coverImage,
      description: body.description || null,
      brief: body.brief || null,
      isActive: true,
      isFeaturedOnWebsite: false,
      isOnHomepage: false,
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await projectsCol.insertOne(newProject as any);
    const newId = String(insertResult.insertedId);

    // Link project in client document
    let clientUpdateQuery: any = { _id: body.clientId };
    if (ObjectId.isValid(body.clientId)) {
      clientUpdateQuery = { $or: [{ _id: new ObjectId(body.clientId) }, { _id: body.clientId }] };
    }
    await clientsCol.updateOne(clientUpdateQuery, {
      $addToSet: { associatedProjectIds: newId } as any,
    });

    await activityCol.insertOne({
      projectId: newId,
      actorId: req.user?.id || null,
      actorLabel: req.user?.fullName || "Studio Admin",
      action: "Created Commission",
      entity: "project",
      entityId: newId,
      entityTitle: newProject.title,
      detail: `New commission registered with code ${newProject.code}`,
      createdAt: now,
    });

    return sendSuccess(res, { ...newProject, _id: insertResult.insertedId, id: newId }, "Project created successfully.", 201);
  } catch (err) {
    next(err);
  }
}

export async function getProjectDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const [projectsCol, roomsCol, tasksCol, filesCol, approvalsCol, siteCol, docsCol, invoicesCol, boqCol, mediaCol] = await Promise.all([
      getCollection<ProjectDoc>("projects"),
      getCollection<RoomDoc>("rooms"),
      getCollection<TaskDoc>("tasks"),
      getCollection<DesignFileDoc>("designFiles"),
      getCollection<ApprovalDoc>("approvals"),
      getCollection<SiteUpdateDoc>("siteUpdates"),
      getCollection<DocumentDoc>("documents"),
      getCollection<any>("invoices"),
      getCollection<any>("boqItems"),
      getCollection<any>("media"),
    ]);

    const project = await projectsCol.findOne(resolveQuery(id));
    if (!project) {
      return sendError(res, "Project not found.", 404, "NOT_FOUND");
    }

    const pId = String(project._id);
    const pIdMatch = { $in: [pId, project.code, project.slug].filter(Boolean) };

    const [rooms, tasks, designFiles, approvals, siteUpdates, documents, invoices, boqItems, media] = await Promise.all([
      roomsCol.find({ projectId: { $in: [pId, id] } }).sort({ sortOrder: 1 }).toArray(),
      tasksCol.find({ projectId: { $in: [pId, id] } }).sort({ dueDate: 1 }).toArray(),
      filesCol.find({ projectId: { $in: [pId, id] } }).sort({ updatedAt: -1 }).toArray(),
      approvalsCol.find({ projectId: { $in: [pId, id] } }).sort({ requestedAt: -1 }).toArray(),
      siteCol.find({ projectId: { $in: [pId, id] } }).sort({ date: -1 }).toArray(),
      docsCol.find({ projectId: { $in: [pId, id] } }).sort({ updatedAt: -1 }).toArray(),
      invoicesCol.find({ projectId: { $in: [pId, id] } }).sort({ issuedDate: -1 }).toArray(),
      boqCol.find({ projectId: { $in: [pId, id] } }).toArray(),
      mediaCol.find({ projectId: { $in: [pId, id] } }).sort({ sortOrder: 1, createdAt: -1 }).toArray(),
    ]);

    return sendSuccess(res, {
      project: {
        ...project,
        id: String(project._id),
      },
      rooms,
      tasks,
      designFiles,
      approvals,
      siteUpdates,
      documents,
      invoices,
      boqItems,
      media,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = req.body;
    const projectsCol = await getCollection<ProjectDoc>("projects");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");

    const updates: Partial<ProjectDoc> = {
      ...data,
      updatedAt: new Date(),
    };
    delete (updates as any)._id;
    delete (updates as any).id;

    const result = await projectsCol.findOneAndUpdate(
      resolveQuery(id),
      { $set: updates as any },
      { returnDocument: "after" },
    );

    if (!result) {
      return sendError(res, "Project not found.", 404, "NOT_FOUND");
    }

    await activityCol.insertOne({
      projectId: String(result._id),
      actorId: req.user?.id || null,
      actorLabel: req.user?.fullName || "Studio Admin",
      action: "Updated Project Info",
      entity: "project",
      entityId: String(result._id),
      entityTitle: result.title,
      detail: `Project attributes modified`,
      createdAt: new Date(),
    });

    return sendSuccess(res, { ...result, id: String(result._id) }, "Project updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const projectsCol = await getCollection<ProjectDoc>("projects");
    const query = resolveQuery(id);

    const project = await projectsCol.findOne(query);
    if (!project) {
      return sendError(res, "Project not found.", 404, "NOT_FOUND");
    }

    const pId = String(project._id);

    // Delete dependent collections in MongoDB
    await Promise.all([
      projectsCol.deleteOne(query),
      (await getCollection("rooms")).deleteMany({ projectId: pId }),
      (await getCollection("tasks")).deleteMany({ projectId: pId }),
      (await getCollection("designFiles")).deleteMany({ projectId: pId }),
      (await getCollection("approvals")).deleteMany({ projectId: pId }),
      (await getCollection("documents")).deleteMany({ projectId: pId }),
      (await getCollection("siteUpdates")).deleteMany({ projectId: pId }),
      (await getCollection("invoices")).deleteMany({ projectId: pId }),
      (await getCollection("boqItems")).deleteMany({ projectId: pId }),
      (await getCollection("activityLogs")).deleteMany({ projectId: pId }),
    ]);

    return sendSuccess(res, { deleted: true, id: pId }, "Project deleted.");
  } catch (err) {
    next(err);
  }
}

// Sub-entity handlers (Rooms, Tasks, DesignFiles, Approvals, SiteUpdates, Documents)
export async function createRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const roomsCol = await getCollection<RoomDoc>("rooms");
    const now = new Date();
    const doc: RoomDoc = {
      projectId: id,
      name: req.body.name || "Living Area",
      roomType: req.body.roomType || req.body.room_type || "Living",
      areaSqft: Number(req.body.areaSqft || req.body.area_sqft) || 250,
      status: req.body.status || "planning",
      itemsCount: Number(req.body.itemsCount || req.body.items_count) || 0,
      budget: Number(req.body.budget) || 0,
      sortOrder: Number(req.body.sortOrder || req.body.sort_order) || 0,
      heroImage: req.body.heroImage || req.body.hero_image || null,
      createdAt: now,
      updatedAt: now,
    };
    const resDoc = await roomsCol.insertOne(doc as any);
    return sendSuccess(res, { ...doc, _id: resDoc.insertedId, id: String(resDoc.insertedId) }, "Room created.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const { roomId } = req.params;
    const roomsCol = await getCollection<RoomDoc>("rooms");
    const query = ObjectId.isValid(roomId) ? { _id: new ObjectId(roomId) } : { _id: roomId };
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;
    const result = await roomsCol.findOneAndUpdate(query as any, { $set: updates }, { returnDocument: "after" });
    return sendSuccess(res, result, "Room updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const { roomId } = req.params;
    const roomsCol = await getCollection<RoomDoc>("rooms");
    const query = ObjectId.isValid(roomId) ? { _id: new ObjectId(roomId) } : { _id: roomId };
    await roomsCol.deleteOne(query as any);
    return sendSuccess(res, { deleted: true }, "Room deleted.");
  } catch (err) {
    next(err);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const tasksCol = await getCollection<TaskDoc>("tasks");
    const now = new Date();
    const doc: TaskDoc = {
      projectId: id,
      roomId: req.body.roomId || req.body.room_id || null,
      title: req.body.title || "New Task",
      description: req.body.description || null,
      assigneeName: req.body.assigneeName || req.body.assignee_name || "Ira Kapoor",
      assigneeId: req.body.assigneeId || req.body.assignee_id || null,
      status: req.body.status || "todo",
      priority: req.body.priority || "medium",
      dueDate: req.body.dueDate || req.body.due_date || null,
      createdAt: now,
      updatedAt: now,
    };
    const resDoc = await tasksCol.insertOne(doc as any);
    return sendSuccess(res, { ...doc, _id: resDoc.insertedId, id: String(resDoc.insertedId) }, "Task created.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = req.params;
    const tasksCol = await getCollection<TaskDoc>("tasks");
    const query = ObjectId.isValid(taskId) ? { _id: new ObjectId(taskId) } : { _id: taskId };
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;
    const result = await tasksCol.findOneAndUpdate(query as any, { $set: updates }, { returnDocument: "after" });
    return sendSuccess(res, result, "Task updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = req.params;
    const tasksCol = await getCollection<TaskDoc>("tasks");
    const query = ObjectId.isValid(taskId) ? { _id: new ObjectId(taskId) } : { _id: taskId };
    await tasksCol.deleteOne(query as any);
    return sendSuccess(res, { deleted: true }, "Task deleted.");
  } catch (err) {
    next(err);
  }
}

export async function createDesignFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const filesCol = await getCollection<DesignFileDoc>("designFiles");
    const now = new Date();
    const doc: DesignFileDoc = {
      projectId: id,
      roomId: req.body.roomId || req.body.room_id || null,
      title: req.body.title || "Design File",
      category: req.body.category || "3d_render",
      fileUrl: req.body.fileUrl || req.body.file_url || GOOGLE_DRIVE_PHOTOS[0]?.url,
      driveFileId: req.body.driveFileId || req.body.drive_file_id || null,
      version: Number(req.body.version) || 1,
      uploadedByName: req.user?.fullName || "Ira Kapoor",
      visibleToClient: req.body.visibleToClient ?? req.body.visible_to_client ?? true,
      createdAt: now,
      updatedAt: now,
    };
    const resDoc = await filesCol.insertOne(doc as any);
    return sendSuccess(res, { ...doc, _id: resDoc.insertedId, id: String(resDoc.insertedId) }, "Design file registered.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateDesignFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { fileId } = req.params;
    const filesCol = await getCollection<DesignFileDoc>("designFiles");
    const query = ObjectId.isValid(fileId) ? { _id: new ObjectId(fileId) } : { _id: fileId };
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;
    const result = await filesCol.findOneAndUpdate(query as any, { $set: updates }, { returnDocument: "after" });
    return sendSuccess(res, result, "Design file updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteDesignFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { fileId } = req.params;
    const filesCol = await getCollection<DesignFileDoc>("designFiles");
    const query = ObjectId.isValid(fileId) ? { _id: new ObjectId(fileId) } : { _id: fileId };
    await filesCol.deleteOne(query as any);
    return sendSuccess(res, { deleted: true }, "Design file removed.");
  } catch (err) {
    next(err);
  }
}

export async function createApproval(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const approvalsCol = await getCollection<ApprovalDoc>("approvals");
    const now = new Date();
    const doc: ApprovalDoc = {
      projectId: id,
      roomId: req.body.roomId || req.body.room_id || null,
      designFileId: req.body.designFileId || req.body.design_file_id || null,
      title: req.body.title || "Approval Request",
      notes: req.body.notes || null,
      status: "pending",
      requestedAt: now,
      comments: [],
      createdAt: now,
      updatedAt: now,
    };
    const resDoc = await approvalsCol.insertOne(doc as any);
    return sendSuccess(res, { ...doc, _id: resDoc.insertedId, id: String(resDoc.insertedId) }, "Approval request submitted.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateApproval(req: Request, res: Response, next: NextFunction) {
  try {
    const { approvalId } = req.params;
    const approvalsCol = await getCollection<ApprovalDoc>("approvals");
    const query = ObjectId.isValid(approvalId) ? { _id: new ObjectId(approvalId) } : { _id: approvalId };
    const updates: any = { ...req.body, updatedAt: new Date() };
    if (updates.status === "approved" || updates.status === "changes_requested") {
      updates.decidedAt = new Date();
      updates.decidedByName = req.user?.fullName || "Studio";
    }
    delete updates._id;
    delete updates.id;
    const result = await approvalsCol.findOneAndUpdate(query as any, { $set: updates }, { returnDocument: "after" });
    return sendSuccess(res, result, "Approval updated.");
  } catch (err) {
    next(err);
  }
}

export async function createSiteUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const siteCol = await getCollection<SiteUpdateDoc>("siteUpdates");
    const now = new Date();
    const doc: SiteUpdateDoc = {
      projectId: id,
      projectTitle: req.body.projectTitle || req.body.project_title || null,
      date: req.body.date || now.toISOString().slice(0, 10),
      weekNumber: Number(req.body.weekNumber || req.body.week_number) || undefined,
      summary: req.body.summary || "Site progress summary",
      workCompleted: Array.isArray(req.body.workCompleted || req.body.work_completed) ? req.body.workCompleted || req.body.work_completed : [],
      blockers: Array.isArray(req.body.blockers) ? req.body.blockers : [],
      nextAction: req.body.nextAction || req.body.next_action || null,
      authorName: req.user?.fullName || "Site Supervisor",
      photos: Array.isArray(req.body.photos) ? req.body.photos : [],
      driveFileIds: Array.isArray(req.body.driveFileIds) ? req.body.driveFileIds : [],
      clientVisible: req.body.clientVisible ?? req.body.client_visible ?? true,
      createdAt: now,
      updatedAt: now,
    };
    const resDoc = await siteCol.insertOne(doc as any);
    return sendSuccess(res, { ...doc, _id: resDoc.insertedId, id: String(resDoc.insertedId) }, "Site update posted.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateSiteUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const { updateId } = req.params;
    const siteCol = await getCollection<SiteUpdateDoc>("siteUpdates");
    const query = ObjectId.isValid(updateId) ? { _id: new ObjectId(updateId) } : { _id: updateId };
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;
    const result = await siteCol.findOneAndUpdate(query as any, { $set: updates }, { returnDocument: "after" });
    return sendSuccess(res, result, "Site update updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteSiteUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const { updateId } = req.params;
    const siteCol = await getCollection<SiteUpdateDoc>("siteUpdates");
    const query = ObjectId.isValid(updateId) ? { _id: new ObjectId(updateId) } : { _id: updateId };
    await siteCol.deleteOne(query as any);
    return sendSuccess(res, { deleted: true }, "Site update deleted.");
  } catch (err) {
    next(err);
  }
}

export async function createDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const docsCol = await getCollection<DocumentDoc>("documents");
    const now = new Date();
    const doc: DocumentDoc = {
      projectId: id,
      projectTitle: req.body.projectTitle || req.body.project_title || null,
      title: req.body.title || "Project Document",
      category: req.body.category || "contract",
      version: req.body.version || "1.0",
      fileUrl: req.body.fileUrl || req.body.file_url || GOOGLE_DRIVE_PHOTOS[0]?.url,
      driveFileId: req.body.driveFileId || req.body.drive_file_id || null,
      fileSize: req.body.fileSize || req.body.file_size || null,
      fileType: req.body.fileType || req.body.file_type || "pdf",
      uploadedBy: req.user?.fullName || "Studio",
      status: req.body.status || "draft",
      isApproved: req.body.isApproved ?? req.body.is_approved ?? false,
      visibleToClient: req.body.visibleToClient ?? req.body.visible_to_client ?? true,
      createdAt: now,
      updatedAt: now,
    };
    const resDoc = await docsCol.insertOne(doc as any);
    return sendSuccess(res, { ...doc, _id: resDoc.insertedId, id: String(resDoc.insertedId) }, "Document created.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { docId } = req.params;
    const docsCol = await getCollection<DocumentDoc>("documents");
    const query = ObjectId.isValid(docId) ? { _id: new ObjectId(docId) } : { _id: docId };
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;
    const result = await docsCol.findOneAndUpdate(query as any, { $set: updates }, { returnDocument: "after" });
    return sendSuccess(res, result, "Document updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { docId } = req.params;
    const docsCol = await getCollection<DocumentDoc>("documents");
    const query = ObjectId.isValid(docId) ? { _id: new ObjectId(docId) } : { _id: docId };
    await docsCol.deleteOne(query as any);
    return sendSuccess(res, { deleted: true }, "Document deleted.");
  } catch (err) {
    next(err);
  }
}

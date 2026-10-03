import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import { LeadDoc, EnquiryDoc, ClientDoc, ProjectDoc, ActivityLogDoc } from "../models/types.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { GOOGLE_DRIVE_PHOTOS } from "../config/drivePhotosData.js";

function resolveQuery(id: string): any {
  if (ObjectId.isValid(id)) {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
  }
  return { _id: id };
}

export async function listLeads(req: Request, res: Response, next: NextFunction) {
  try {
    const [leadsCol, enquiriesCol] = await Promise.all([
      getCollection<LeadDoc>("leads"),
      getCollection<EnquiryDoc>("enquiries"),
    ]);

    const { stage, status, search } = req.query;
    let query: any = {};
    if (stage && stage !== "all") query.stage = stage;
    if (status && status !== "all") query.status = status;
    if (search) {
      const regex = new RegExp(String(search), "i");
      query.$or = [{ title: regex }, { contactName: regex }, { email: regex }, { phone: regex }];
    }

    const [leads, enquiries] = await Promise.all([
      leadsCol.find(query).sort({ updatedAt: -1 }).toArray(),
      enquiriesCol.find({}).sort({ createdAt: -1 }).toArray(),
    ]);

    return sendSuccess(res, {
      leads: leads.map((l) => ({ ...l, id: String(l._id) })),
      enquiries: enquiries.map((e) => ({ ...e, id: String(e._id) })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getLeadById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const [leadsCol, usersCol, tasksCol] = await Promise.all([
      getCollection<LeadDoc>("leads"),
      getCollection<any>("users"),
      getCollection<any>("tasks"),
    ]);
    const lead = await leadsCol.findOne(resolveQuery(id));
    if (!lead) {
      return sendError(res, "Lead not found.", 404, "NOT_FOUND");
    }
    const staff = await usersCol.find({ role: { $ne: "client" } }).project({ passwordHash: 0 }).toArray();
    const tasks = await tasksCol.find({ $or: [{ leadId: String(lead._id) }, { leadId: id }] }).toArray();

    const normalizedLead = {
      ...lead,
      id: String(lead._id),
      name: lead.contactName || lead.title,
      space_type: lead.spaceType,
      budget_band: lead.budgetBand,
      value_estimate: lead.estimatedValue,
      city: lead.locationCity,
      created_at: lead.createdAt,
      owner_id: lead.ownerId,
    };

    const normalizedStaff = staff.map((s) => ({
      id: String(s._id),
      full_name: s.fullName,
      email: s.email,
      role: s.role,
      title: s.title || s.role,
    }));

    const normalizedTasks = tasks.map((t) => ({
      ...t,
      id: String(t._id),
      due_date: t.dueDate,
      assignee_name: t.assigneeName,
    }));

    return sendSuccess(res, {
      ...normalizedLead,
      lead: normalizedLead,
      staff: normalizedStaff,
      tasks: normalizedTasks,
    });
  } catch (err) {
    next(err);
  }
}

export async function createLead(req: Request, res: Response, next: NextFunction) {
  try {
    const leadsCol = await getCollection<LeadDoc>("leads");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");
    const body = req.body;
    const now = new Date();

    const doc: LeadDoc = {
      title: body.title || `${body.contactName || body.contact_name || "Lead"} Commission`,
      contactName: body.contactName || body.contact_name || "Prospective Client",
      email: body.email || "",
      phone: body.phone || "",
      spaceType: body.spaceType || body.space_type || "Residential",
      scope: body.scope || "Full Turnkey Interior",
      budgetBand: body.budgetBand || body.budget_band || "₹50L - ₹1 Cr",
      estimatedValue: Number(body.estimatedValue || body.value_estimate) || 5000000,
      stage: body.stage || "enquiry",
      probabilityPct: Number(body.probabilityPct || body.probability_pct) || 50,
      targetStartDate: body.targetStartDate || body.target_start_date || null,
      locationCity: body.locationCity || body.location_city || "Mumbai",
      ownerId: body.ownerId || body.owner_id || req.user?.id || null,
      ownerName: body.ownerName || body.owner_name || req.user?.fullName || "Ira Kapoor",
      notes: body.notes || null,
      status: body.status || "active",
      createdAt: now,
      updatedAt: now,
    };

    const result = await leadsCol.insertOne(doc as any);
    const newId = String(result.insertedId);

    await activityCol.insertOne({
      actorId: req.user?.id || null,
      actorLabel: req.user?.fullName || "Studio Staff",
      action: "Created Sales Lead",
      entity: "lead",
      entityId: newId,
      entityTitle: doc.title,
      detail: `New lead created for ${doc.contactName} (${doc.spaceType})`,
      createdAt: now,
    });

    return sendSuccess(res, { ...doc, _id: result.insertedId, id: newId }, "Lead created.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateLead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = req.body;
    const leadsCol = await getCollection<LeadDoc>("leads");
    const query = resolveQuery(id);

    const updates = { ...data, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;

    const result = await leadsCol.findOneAndUpdate(query, { $set: updates }, { returnDocument: "after" });
    if (!result) {
      return sendError(res, "Lead not found.", 404, "NOT_FOUND");
    }

    return sendSuccess(res, { ...result, id: String(result._id) }, "Lead updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteLead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const leadsCol = await getCollection<LeadDoc>("leads");
    await leadsCol.deleteOne(resolveQuery(id));
    return sendSuccess(res, { deleted: true, id }, "Lead deleted.");
  } catch (err) {
    next(err);
  }
}

export async function convertLeadToProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const leadsCol = await getCollection<LeadDoc>("leads");
    const clientsCol = await getCollection<ClientDoc>("clients");
    const projectsCol = await getCollection<ProjectDoc>("projects");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");

    const lead = await leadsCol.findOne(resolveQuery(id));
    if (!lead) {
      return sendError(res, "Lead not found.", 404, "NOT_FOUND");
    }

    const now = new Date();

    // 1. Create or link Client
    let client = await clientsCol.findOne({ email: lead.email.toLowerCase() });
    let clientId: string;

    if (!client) {
      const newClientDoc: ClientDoc = {
        name: lead.contactName,
        primaryContactName: lead.contactName,
        email: lead.email.toLowerCase(),
        phone: lead.phone,
        status: "active",
        portalAccessEnabled: true,
        associatedProjectIds: [],
        createdAt: now,
        updatedAt: now,
      };
      const insertClient = await clientsCol.insertOne(newClientDoc as any);
      clientId = String(insertClient.insertedId);
    } else {
      clientId = String(client._id);
    }

    // 2. Create Project
    const count = await projectsCol.countDocuments();
    const code = `AV-${lead.locationCity ? lead.locationCity.slice(0, 3).toUpperCase() : "MUM"}-${String(count + 1).padStart(3, "0")}`;
    const slug = lead.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const newProject: ProjectDoc = {
      title: lead.title,
      code,
      slug,
      clientId,
      clientName: lead.contactName,
      spaceType: lead.spaceType,
      scope: lead.scope,
      locationCity: lead.locationCity || "Mumbai",
      areaSqft: 2000,
      contractValue: lead.estimatedValue || 5000000,
      collectedAmount: 0,
      startDate: now.toISOString().slice(0, 10),
      targetHandoverDate: new Date(Date.now() + 180 * 864e5).toISOString().slice(0, 10),
      progressPercentage: 5,
      status: "concept",
      health: "on_track",
      leadDesignerName: lead.ownerName || "Ira Kapoor",
      coverImage: GOOGLE_DRIVE_PHOTOS[0]?.url || "https://lh3.googleusercontent.com/d/102c7uJbW2w0QoYy_Jp21q8R_ZgZ17_0_",
      isActive: true,
      isFeaturedOnWebsite: false,
      isOnHomepage: false,
      createdAt: now,
      updatedAt: now,
    };

    const insertProject = await projectsCol.insertOne(newProject as any);
    const projectId = String(insertProject.insertedId);

    // Update Client and Lead
    await Promise.all([
      clientsCol.updateOne(resolveQuery(clientId), { $addToSet: { associatedProjectIds: projectId } as any }),
      leadsCol.updateOne(resolveQuery(id), { $set: { stage: "won", status: "won", updatedAt: now } }),
      activityCol.insertOne({
        projectId,
        actorId: req.user?.id || null,
        actorLabel: req.user?.fullName || "Studio Staff",
        action: "Converted Lead to Commission",
        entity: "project",
        entityId: projectId,
        entityTitle: newProject.title,
        detail: `Lead converted to project ${newProject.code}`,
        createdAt: now,
      }),
    ]);

    return sendSuccess(res, {
      converted: true,
      projectId,
      clientId,
      project: { ...newProject, _id: insertProject.insertedId, id: projectId },
    }, "Lead successfully converted to active commission.");
  } catch (err) {
    next(err);
  }
}

import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import { ClientDoc, ProjectDoc, ActivityLogDoc } from "../models/types.js";
import { sendSuccess, sendError } from "../utils/response.js";

function resolveClientQuery(id: string): any {
  if (ObjectId.isValid(id)) {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
  }
  return { _id: id };
}

export async function listClients(req: Request, res: Response, next: NextFunction) {
  try {
    const clientsCol = await getCollection<ClientDoc>("clients");
    const { search, status } = req.query;

    let query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      const regex = new RegExp(String(search), "i");
      query.$or = [{ name: regex }, { email: regex }, { primaryContactName: regex }, { companyName: regex }];
    }

    const clients = await clientsCol.find(query).sort({ updatedAt: -1 }).toArray();
    return sendSuccess(res, clients);
  } catch (err) {
    next(err);
  }
}

export async function getClientById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const [clientsCol, projectsCol] = await Promise.all([
      getCollection<ClientDoc>("clients"),
      getCollection<ProjectDoc>("projects"),
    ]);

    const client = await clientsCol.findOne(resolveClientQuery(id));
    if (!client) {
      return sendError(res, "Client not found.", 404, "NOT_FOUND");
    }

    const cId = String(client._id);
    const projects = await projectsCol.find({ clientId: { $in: [cId, id] } }).toArray();

    return sendSuccess(res, {
      ...client,
      id: cId,
      projects,
    });
  } catch (err) {
    next(err);
  }
}

export async function createClient(req: Request, res: Response, next: NextFunction) {
  try {
    const clientsCol = await getCollection<ClientDoc>("clients");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");
    const body = req.body;
    const now = new Date();

    const newClient: ClientDoc = {
      name: body.name,
      primaryContactName: body.primaryContactName || body.primary_contact_name || body.name,
      email: body.email.toLowerCase(),
      phone: body.phone,
      companyName: body.companyName || body.company_name || null,
      billingAddress: body.billingAddress || body.billing_address || null,
      gstNumber: body.gstNumber || body.gst_number || null,
      notes: body.notes || null,
      status: body.status || "active",
      associatedProjectIds: [],
      portalAccessEnabled: body.portalAccessEnabled ?? body.portal_access_enabled ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await clientsCol.insertOne(newClient as any);
    const newId = String(insertResult.insertedId);

    await activityCol.insertOne({
      actorId: req.user?.id || null,
      actorLabel: req.user?.fullName || "Studio Staff",
      action: "Created Client Record",
      entity: "client",
      entityId: newId,
      entityTitle: newClient.name,
      detail: `Client account created with email ${newClient.email}`,
      createdAt: now,
    });

    return sendSuccess(res, { ...newClient, _id: insertResult.insertedId, id: newId }, "Client created successfully.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateClient(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = req.body;
    const clientsCol = await getCollection<ClientDoc>("clients");
    const query = resolveClientQuery(id);

    const updates = { ...data, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;

    const result = await clientsCol.findOneAndUpdate(query, { $set: updates }, { returnDocument: "after" });
    if (!result) {
      return sendError(res, "Client not found.", 404, "NOT_FOUND");
    }

    return sendSuccess(res, { ...result, id: String(result._id) }, "Client updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteClient(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const clientsCol = await getCollection<ClientDoc>("clients");
    const query = resolveClientQuery(id);

    await clientsCol.deleteOne(query);
    return sendSuccess(res, { deleted: true, id }, "Client deleted.");
  } catch (err) {
    next(err);
  }
}

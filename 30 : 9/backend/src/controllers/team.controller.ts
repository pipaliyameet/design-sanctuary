import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import { TeamMemberDoc } from "../models/types.js";
import { sendSuccess, sendError } from "../utils/response.js";

function resolveQuery(id: string): any {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
}

export async function listTeam(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<TeamMemberDoc>("teamMembers");
    const items = await col.find({}).toArray();
    return sendSuccess(res, items.map((t) => ({ ...t, id: String(t._id) })));
  } catch (err) {
    next(err);
  }
}

export async function createTeamMember(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<TeamMemberDoc>("teamMembers");
    const now = new Date();
    const doc: TeamMemberDoc = {
      name: req.body.name,
      role: req.body.role || "Interior Designer",
      email: req.body.email || "",
      phone: req.body.phone || "",
      status: req.body.status || "active",
      assignedProjects: Array.isArray(req.body.assignedProjects || req.body.assigned_projects)
        ? req.body.assignedProjects || req.body.assigned_projects
        : [],
      avatarUrl: req.body.avatarUrl || null,
      createdAt: now,
      updatedAt: now,
    };
    const resDoc = await col.insertOne(doc as any);
    return sendSuccess(res, { ...doc, _id: resDoc.insertedId, id: String(resDoc.insertedId) }, "Team member added.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateTeamMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<TeamMemberDoc>("teamMembers");
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;
    const resDoc = await col.findOneAndUpdate(resolveQuery(id), { $set: updates }, { returnDocument: "after" });
    return sendSuccess(res, resDoc, "Team member updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteTeamMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<TeamMemberDoc>("teamMembers");
    await col.deleteOne(resolveQuery(id));
    return sendSuccess(res, { deleted: true }, "Team member removed.");
  } catch (err) {
    next(err);
  }
}

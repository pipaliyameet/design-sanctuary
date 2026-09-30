import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { sendError } from "../utils/response.js";
import { AppRole, ProjectDoc, ClientDoc } from "../models/types.js";
import { getCollection } from "../config/database.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return sendError(res, "Authentication required. Please log in to proceed.", 401, "UNAUTHORIZED");
  }
  return next();
}

export function requireStaff(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return sendError(res, "Authentication required.", 401, "UNAUTHORIZED");
  }

  if (!req.user.isStaff) {
    return sendError(res, "Access denied. Studio staff permissions required.", 403, "FORBIDDEN");
  }

  return next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return sendError(res, "Authentication required.", 401, "UNAUTHORIZED");
  }

  if (!req.user.roles.includes("admin")) {
    return sendError(res, "Access denied. Studio Administrator privileges required.", 403, "FORBIDDEN");
  }

  return next();
}

export function requireRole(allowedRoles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Authentication required.", 401, "UNAUTHORIZED");
    }

    const hasRole = req.user.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole && !req.user.roles.includes("admin")) {
      return sendError(res, `Access denied. Requires one of roles: ${allowedRoles.join(", ")}`, 403, "FORBIDDEN");
    }

    return next();
  };
}

export async function requireProjectAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return sendError(res, "Authentication required.", 401, "UNAUTHORIZED");
  }

  if (req.user.isStaff) {
    return next();
  }

  const projectId = req.params.projectId || req.params.id || req.body?.projectId;
  if (!projectId) {
    return sendError(res, "Project ID is required.", 400, "BAD_REQUEST");
  }

  const projectsCol = await getCollection<ProjectDoc>("projects");
  const clientsCol = await getCollection<ClientDoc>("clients");

  let projectQuery: any = { _id: projectId };
  if (ObjectId.isValid(projectId)) {
    projectQuery = { $or: [{ _id: new ObjectId(projectId) }, { _id: projectId }, { slug: projectId }, { code: projectId }] };
  } else {
    projectQuery = { $or: [{ _id: projectId }, { slug: projectId }, { code: projectId }] };
  }

  const project = await projectsCol.findOne(projectQuery);
  if (!project) {
    return sendError(res, "Project not found.", 404, "NOT_FOUND");
  }

  // Find linked client for this user
  const userClientIds = req.user.clientIds || [];
  const clientDocs = await clientsCol.find({
    $or: [
      { userId: req.user.id },
      { email: req.user.email.toLowerCase() },
      ...(userClientIds.length > 0 ? [{ _id: { $in: userClientIds.map((id) => (ObjectId.isValid(id) ? new ObjectId(id) : id)) } }] : []),
    ],
  }).toArray();

  const allowedClientIds = new Set<string>();
  for (const c of clientDocs) {
    allowedClientIds.add(String(c._id));
  }
  for (const id of userClientIds) {
    allowedClientIds.add(String(id));
  }

  if (!allowedClientIds.has(String(project.clientId))) {
    return sendError(res, "Access denied. You do not have permission to view or manage this project.", 403, "FORBIDDEN");
  }

  return next();
}

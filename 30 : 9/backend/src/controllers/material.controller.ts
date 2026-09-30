import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import { MaterialDoc } from "../models/types.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { GOOGLE_DRIVE_PHOTOS } from "../config/drivePhotosData.js";

function resolveQuery(id: string): any {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
}

export async function listMaterials(req: Request, res: Response, next: NextFunction) {
  try {
    const { category } = req.query;
    const col = await getCollection<MaterialDoc>("materials");
    const query = category && category !== "all" ? { category } : {};
    const items = await col.find(query).toArray();
    return sendSuccess(res, items.map((m) => ({ ...m, id: String(m._id) })));
  } catch (err) {
    next(err);
  }
}

export async function createMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<MaterialDoc>("materials");
    const now = new Date();
    const doc: MaterialDoc = {
      name: req.body.name,
      category: req.body.category || "Stone",
      image: req.body.image || GOOGLE_DRIVE_PHOTOS[1]?.url || "https://lh3.googleusercontent.com/d/1Xl45R4J6Rvhq8m7kL_wK3Wb1Z0d17_0_",
      driveFileId: req.body.driveFileId || null,
      description: req.body.description || "",
      provenance: req.body.provenance || "Local",
      vendorName: req.body.vendorName || null,
      sampleLocation: req.body.sampleLocation || null,
      costRange: req.body.costRange || null,
      projectSlug: req.body.projectSlug || null,
      projectTitle: req.body.projectTitle || null,
      createdAt: now,
      updatedAt: now,
    };
    const resDoc = await col.insertOne(doc as any);
    return sendSuccess(res, { ...doc, _id: resDoc.insertedId, id: String(resDoc.insertedId) }, "Material created.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<MaterialDoc>("materials");
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;
    const resDoc = await col.findOneAndUpdate(resolveQuery(id), { $set: updates }, { returnDocument: "after" });
    return sendSuccess(res, resDoc, "Material updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteMaterial(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<MaterialDoc>("materials");
    await col.deleteOne(resolveQuery(id));
    return sendSuccess(res, { deleted: true }, "Material deleted.");
  } catch (err) {
    next(err);
  }
}

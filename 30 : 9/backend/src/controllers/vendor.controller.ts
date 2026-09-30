import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import { VendorDoc } from "../models/types.js";
import { sendSuccess } from "../utils/response.js";

function resolveQuery(id: string): any {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
}

export async function listVendors(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<VendorDoc>("vendors");
    const items = await col.find({}).toArray();
    return sendSuccess(res, items.map((v) => ({ ...v, id: String(v._id) })));
  } catch (err) {
    next(err);
  }
}

export async function createVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<VendorDoc>("vendors");
    const now = new Date();
    const doc: VendorDoc = {
      name: req.body.name,
      category: req.body.category || "General",
      contactPerson: req.body.contactPerson || req.body.contact_person || "",
      phone: req.body.phone || "",
      email: req.body.email || null,
      rating: Number(req.body.rating) || 5,
      activeOrders: Number(req.body.activeOrders || req.body.active_orders) || 0,
      address: req.body.address || null,
      gstNumber: req.body.gstNumber || req.body.gst_number || null,
      createdAt: now,
      updatedAt: now,
    };
    const resDoc = await col.insertOne(doc as any);
    return sendSuccess(res, { ...doc, _id: resDoc.insertedId, id: String(resDoc.insertedId) }, "Vendor added.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<VendorDoc>("vendors");
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;
    const resDoc = await col.findOneAndUpdate(resolveQuery(id), { $set: updates }, { returnDocument: "after" });
    return sendSuccess(res, resDoc, "Vendor updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<VendorDoc>("vendors");
    await col.deleteOne(resolveQuery(id));
    return sendSuccess(res, { deleted: true }, "Vendor removed.");
  } catch (err) {
    next(err);
  }
}

import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import { NotificationDoc } from "../models/types.js";
import { sendSuccess } from "../utils/response.js";

function resolveQuery(id: string): any {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
}

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<NotificationDoc>("notifications");
    const items = await col.find({}).sort({ createdAt: -1 }).limit(50).toArray();
    return sendSuccess(res, items.map((n) => ({ ...n, id: String(n._id) })));
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<NotificationDoc>("notifications");
    await col.updateOne(resolveQuery(id), { $set: { isRead: true } });
    return sendSuccess(res, { success: true });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<NotificationDoc>("notifications");
    await col.updateMany({}, { $set: { isRead: true } });
    return sendSuccess(res, { success: true });
  } catch (err) {
    next(err);
  }
}

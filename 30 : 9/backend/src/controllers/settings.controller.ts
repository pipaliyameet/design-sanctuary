import { Request, Response, NextFunction } from "express";
import { getCollection } from "../config/database.js";
import { ActivityLogDoc, SiteSettingsDoc } from "../models/types.js";
import { sendSuccess } from "../utils/response.js";

export async function listActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.query;
    const col = await getCollection<ActivityLogDoc>("activityLogs");
    const query = projectId ? { projectId } : {};
    const items = await col.find(query).sort({ createdAt: -1 }).limit(100).toArray();
    return sendSuccess(res, items.map((a) => ({ ...a, id: String(a._id) })));
  } catch (err) {
    next(err);
  }
}

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<SiteSettingsDoc>("siteSettings");
    const docs = await col.find({}).toArray();
    const map: Record<string, any> = {};
    for (const d of docs) {
      map[d.key] = d.value;
    }
    return sendSuccess(res, map);
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<SiteSettingsDoc>("siteSettings");
    const { key, value } = req.body;
    if (!key) {
      return sendSuccess(res, { ok: true });
    }

    await col.updateOne(
      { key },
      { $set: { key, value, updatedAt: new Date() } },
      { upsert: true },
    );

    return sendSuccess(res, { key, value }, "Settings updated.");
  } catch (err) {
    next(err);
  }
}

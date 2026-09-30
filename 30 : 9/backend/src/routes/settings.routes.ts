import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { listActivity } from "../controllers/settings.controller.js";
import { requireAuth, requireStaff, requireAdmin } from "../middleware/role.middleware.js";

export const settingsRouter = Router();
settingsRouter.get("/", getSettings);
settingsRouter.patch("/", requireAuth, requireAdmin, updateSettings);

export const activityRouter = Router();
activityRouter.get("/", requireAuth, requireStaff, listActivity);

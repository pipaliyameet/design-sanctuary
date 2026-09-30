import { Router } from "express";
import { getDashboardOverview, getWeeklyMetrics } from "../controllers/dashboard.controller.js";
import { requireAuth, requireStaff } from "../middleware/role.middleware.js";

const router = Router();

router.get("/overview", requireAuth, requireStaff, getDashboardOverview);
router.get("/weekly", requireAuth, requireStaff, getWeeklyMetrics);

export default router;

import { Router } from "express";
import {
  listLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  convertLeadToProject,
} from "../controllers/lead.controller.js";
import { requireAuth, requireStaff } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", requireAuth, requireStaff, listLeads);
router.post("/", requireAuth, requireStaff, createLead);
router.get("/:id", requireAuth, requireStaff, getLeadById);
router.patch("/:id", requireAuth, requireStaff, updateLead);
router.delete("/:id", requireAuth, requireStaff, deleteLead);
router.post("/:id/convert", requireAuth, requireStaff, convertLeadToProject);

export default router;

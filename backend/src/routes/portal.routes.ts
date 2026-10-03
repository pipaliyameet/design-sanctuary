import { Router } from "express";
import {
  getClientPortalData,
  getPortalProject,
  decideApproval,
  addApprovalComment,
} from "../controllers/portal.controller.js";

const router = Router();

router.get("/me", getClientPortalData);
router.get("/projects/:id", getPortalProject);
router.post("/approvals/:id/decide", decideApproval);
router.post("/approvals/:id/comments", addApprovalComment);

export default router;


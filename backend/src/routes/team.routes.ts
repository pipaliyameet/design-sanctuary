import { Router } from "express";
import {
  listTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/team.controller.js";
import { requireAuth, requireStaff } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", listTeam);
router.post("/", requireAuth, requireStaff, createTeamMember);
router.patch("/:id", requireAuth, requireStaff, updateTeamMember);
router.delete("/:id", requireAuth, requireStaff, deleteTeamMember);

export default router;

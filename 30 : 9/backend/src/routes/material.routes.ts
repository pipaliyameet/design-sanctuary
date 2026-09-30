import { Router } from "express";
import {
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../controllers/material.controller.js";
import { requireAuth, requireStaff } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", listMaterials);
router.post("/", requireAuth, requireStaff, createMaterial);
router.patch("/:id", requireAuth, requireStaff, updateMaterial);
router.delete("/:id", requireAuth, requireStaff, deleteMaterial);

export default router;

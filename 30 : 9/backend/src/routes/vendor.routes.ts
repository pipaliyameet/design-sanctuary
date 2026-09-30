import { Router } from "express";
import {
  listVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from "../controllers/vendor.controller.js";
import { requireAuth, requireStaff } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", requireAuth, requireStaff, listVendors);
router.post("/", requireAuth, requireStaff, createVendor);
router.patch("/:id", requireAuth, requireStaff, updateVendor);
router.delete("/:id", requireAuth, requireStaff, deleteVendor);

export default router;

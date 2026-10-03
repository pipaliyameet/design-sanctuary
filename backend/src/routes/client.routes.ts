import { Router } from "express";
import {
  listClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/client.controller.js";
import { requireAuth, requireStaff } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", requireAuth, requireStaff, listClients);
router.post("/", requireAuth, requireStaff, createClient);
router.get("/:id", requireAuth, requireStaff, getClientById);
router.patch("/:id", requireAuth, requireStaff, updateClient);
router.delete("/:id", requireAuth, requireStaff, deleteClient);

export default router;

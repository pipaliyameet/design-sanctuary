import { Router } from "express";
import {
  getHomepageMedia,
  uploadMedia,
  createMedia,
  listMedia,
  getMediaById,
  updateMedia,
  reorderHomepageMedia,
  deleteMedia,
  proxyDriveImage,
  serveLocalFile,
} from "../controllers/media.controller.js";
import { requireAuth, requireStaff } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

// Public media access
router.get("/homepage", getHomepageMedia);
router.get("/local/:filename", serveLocalFile);
router.get("/drive-image/:id", proxyDriveImage);

// Authenticated owner media management
router.post("/upload", requireAuth, requireStaff, upload.any(), uploadMedia);
router.post("/", requireAuth, requireStaff, createMedia);
router.get("/", listMedia);
router.get("/:id", getMediaById);
router.patch("/reorder", requireAuth, requireStaff, reorderHomepageMedia);
router.patch("/:id", requireAuth, requireStaff, updateMedia);
router.delete("/:id", requireAuth, requireStaff, deleteMedia);

export default router;

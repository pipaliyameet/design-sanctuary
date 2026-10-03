import { Router } from "express";
import {
  uploadMedia,
  createMedia,
  listMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  proxyDriveImage,
  serveLocalFile,
} from "../controllers/media.controller.js";
import { requireAuth, requireStaff } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/local/:filename", serveLocalFile);
router.get("/drive-image/:id", proxyDriveImage);
router.post("/upload", requireAuth, requireStaff, upload.single("file"), uploadMedia);
router.post("/", requireAuth, requireStaff, createMedia);
router.get("/", listMedia);
router.get("/:id", getMediaById);
router.patch("/:id", requireAuth, requireStaff, updateMedia);
router.delete("/:id", requireAuth, requireStaff, deleteMedia);

export default router;


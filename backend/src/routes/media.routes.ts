import { Router } from "express";
import {
  uploadMedia,
  listMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  proxyDriveImage,
} from "../controllers/media.controller.js";
import { requireAuth, requireStaff } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/drive-image/:id", proxyDriveImage);
router.post("/upload", requireAuth, requireStaff, upload.single("file"), uploadMedia);
router.get("/", listMedia);
router.get("/:id", getMediaById);
router.patch("/:id", requireAuth, requireStaff, updateMedia);
router.delete("/:id", requireAuth, requireStaff, deleteMedia);

export default router;


import { Router } from "express";
import {
  getHomepageMedia,
  getDriveStatusHandler,
  uploadMedia,
  createMedia,
  listMedia,
  getMediaById,
  updateMedia,
  replaceMediaFile,
  reorderHomepageMedia,
  deleteMedia,
  proxyDriveImage,
  streamVideo,
  getGoogleOAuthUrlHandler,
  googleOAuthCallbackHandler,
  syncGoogleDriveMediaHandler,
} from "../controllers/media.controller.js";
import { requireAuth, requireStaff } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

// Public media access
router.get("/homepage", getHomepageMedia);
router.get("/drive-status", getDriveStatusHandler);
router.get("/drive-image/:id", proxyDriveImage);
router.get("/stream-video/:id", streamVideo);
router.get("/connect-google-drive", getGoogleOAuthUrlHandler);
router.get("/oauth-callback", googleOAuthCallbackHandler);
router.post("/sync-drive", requireAuth, requireStaff, syncGoogleDriveMediaHandler);
router.get("/sync-drive", requireAuth, requireStaff, syncGoogleDriveMediaHandler);

// Authenticated owner media management
router.post("/upload", requireAuth, requireStaff, upload.any(), uploadMedia);
router.post("/", requireAuth, requireStaff, createMedia);
router.get("/", listMedia);
router.get("/:id", getMediaById);
router.put("/:id/replace", requireAuth, requireStaff, upload.single("file"), replaceMediaFile);
router.patch("/reorder", requireAuth, requireStaff, reorderHomepageMedia);
router.patch("/:id", requireAuth, requireStaff, updateMedia);
router.delete("/:id", requireAuth, requireStaff, deleteMedia);

export default router;

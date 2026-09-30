import { Router } from "express";
import {
  listProjects,
  listAllApprovals,
  createProject,
  getProjectDetail,
  updateProject,
  deleteProject,
  createRoom,
  updateRoom,
  deleteRoom,
  createTask,
  updateTask,
  deleteTask,
  createDesignFile,
  updateDesignFile,
  deleteDesignFile,
  createApproval,
  updateApproval,
  createSiteUpdate,
  updateSiteUpdate,
  deleteSiteUpdate,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/project.controller.js";
import { requireAuth, requireStaff, requireProjectAccess } from "../middleware/role.middleware.js";

const router = Router();

// Project level
router.get("/all/approvals", requireAuth, requireStaff, listAllApprovals);
router.get("/", requireAuth, listProjects);
router.post("/", requireAuth, requireStaff, createProject);
router.get("/:id", requireAuth, requireProjectAccess, getProjectDetail);
router.patch("/:id", requireAuth, requireStaff, updateProject);
router.delete("/:id", requireAuth, requireStaff, deleteProject);

// Rooms
router.post("/:id/rooms", requireAuth, requireStaff, createRoom);
router.patch("/:id/rooms/:roomId", requireAuth, requireStaff, updateRoom);
router.delete("/:id/rooms/:roomId", requireAuth, requireStaff, deleteRoom);

// Tasks
router.post("/:id/tasks", requireAuth, requireStaff, createTask);
router.patch("/:id/tasks/:taskId", requireAuth, requireStaff, updateTask);
router.delete("/:id/tasks/:taskId", requireAuth, requireStaff, deleteTask);

// Design Files
router.post("/:id/design-files", requireAuth, requireStaff, createDesignFile);
router.patch("/:id/design-files/:fileId", requireAuth, requireStaff, updateDesignFile);
router.delete("/:id/design-files/:fileId", requireAuth, requireStaff, deleteDesignFile);

// Approvals
router.post("/:id/approvals", requireAuth, requireStaff, createApproval);
router.patch("/:id/approvals/:approvalId", requireAuth, updateApproval);

// Site Updates
router.post("/:id/site-updates", requireAuth, requireStaff, createSiteUpdate);
router.patch("/:id/site-updates/:updateId", requireAuth, requireStaff, updateSiteUpdate);
router.delete("/:id/site-updates/:updateId", requireAuth, requireStaff, deleteSiteUpdate);

// Documents
router.post("/:id/documents", requireAuth, requireStaff, createDocument);
router.patch("/:id/documents/:docId", requireAuth, requireStaff, updateDocument);
router.delete("/:id/documents/:docId", requireAuth, requireStaff, deleteDocument);

export default router;

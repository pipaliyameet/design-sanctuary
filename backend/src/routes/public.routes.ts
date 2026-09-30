import { Router } from "express";
import {
  getHomeData,
  getSiteSettings,
  listCaseStudies,
  getCaseStudy,
  listJournal,
  getJournalPost,
  submitEnquiry,
  getPublicGallery,
} from "../controllers/public.controller.js";

const router = Router();

router.get("/home", getHomeData);
router.get("/settings", getSiteSettings);
router.get("/projects", listCaseStudies);
router.get("/projects/:slug", getCaseStudy);
router.get("/journal", listJournal);
router.get("/journal/:slug", getJournalPost);
router.get("/gallery", getPublicGallery);
router.post("/enquiries", submitEnquiry);

export default router;


import { Router } from "express";
import {
  getHomeData,
  getSiteSettings,
  listCaseStudies,
  getCaseStudy,
  listServices,
  listProcessSteps,
  listTestimonials,
  listMaterials,
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
router.get("/services", listServices);
router.get("/process", listProcessSteps);
router.get("/testimonials", listTestimonials);
router.get("/materials", listMaterials);
router.get("/journal", listJournal);
router.get("/journal/:slug", getJournalPost);
router.get("/gallery", getPublicGallery);
router.post("/enquiries", submitEnquiry);

export default router;

import { Router } from "express";
import {
  getCmsOverview,
  getHomepageConfig,
  updateHomepageConfig,
  listCmsProjects,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  listCmsServices,
  createCmsService,
  updateCmsService,
  deleteCmsService,
  listCmsProcess,
  createCmsProcess,
  updateCmsProcess,
  deleteCmsProcess,
  listCmsTestimonials,
  updateCmsTestimonial,
  listCmsEnquiries,
  updateEnquiryStatus,
} from "../controllers/cms.controller.js";
import { requireAuth, requireStaff, requireAdmin } from "../middleware/role.middleware.js";

const router = Router();

// All CMS routes require authenticated studio staff
router.use(requireAuth, requireStaff);

// Overview
router.get("/overview", getCmsOverview);

// Homepage
router.get("/homepage", getHomepageConfig);
router.patch("/homepage", updateHomepageConfig);

// Projects & Portfolio
router.get("/projects", listCmsProjects);
router.post("/projects", createCaseStudy);
router.patch("/projects/:id", updateCaseStudy);
router.delete("/projects/:id", requireAdmin, deleteCaseStudy);

// Services
router.get("/services", listCmsServices);
router.post("/services", createCmsService);
router.patch("/services/:id", updateCmsService);
router.delete("/services/:id", requireAdmin, deleteCmsService);

// Process
router.get("/process", listCmsProcess);
router.post("/process", createCmsProcess);
router.patch("/process/:id", updateCmsProcess);
router.delete("/process/:id", requireAdmin, deleteCmsProcess);

// Testimonials
router.get("/testimonials", listCmsTestimonials);
router.patch("/testimonials/:id", updateCmsTestimonial);

// Enquiries
router.get("/enquiries", listCmsEnquiries);
router.patch("/enquiries/:id/status", updateEnquiryStatus);

export default router;

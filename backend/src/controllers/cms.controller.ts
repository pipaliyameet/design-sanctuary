import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "../config/database.js";
import {
  CaseStudyDoc,
  ProjectDoc,
  MediaDoc,
  ServiceDoc,
  ProcessStepDoc,
  TestimonialDoc,
  JournalPostDoc,
  SiteSettingsDoc,
  EnquiryDoc,
  ActivityLogDoc,
} from "../models/types.js";
import { sendSuccess, sendError } from "../utils/response.js";

// 1. Overview Statistics
export async function getCmsOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const [
      caseStudiesCol,
      projectsCol,
      mediaCol,
      servicesCol,
      processCol,
      testimonialsCol,
      journalCol,
      enquiriesCol,
      activityCol,
    ] = await Promise.all([
      getCollection<CaseStudyDoc>("caseStudies"),
      getCollection<ProjectDoc>("projects"),
      getCollection<MediaDoc>("media"),
      getCollection<ServiceDoc>("services"),
      getCollection<ProcessStepDoc>("processSteps"),
      getCollection<TestimonialDoc>("testimonials"),
      getCollection<JournalPostDoc>("journalPosts"),
      getCollection<EnquiryDoc>("enquiries"),
      getCollection<ActivityLogDoc>("activityLogs"),
    ]);

    const [
      totalCaseStudies,
      featuredCaseStudies,
      totalProjects,
      publishedMedia,
      featuredMedia,
      totalServices,
      totalProcessSteps,
      totalTestimonials,
      totalJournal,
      newEnquiries,
      recentActivity,
    ] = await Promise.all([
      caseStudiesCol.countDocuments({}),
      caseStudiesCol.countDocuments({ featured: true }),
      projectsCol.countDocuments({}),
      mediaCol.countDocuments({ visibility: "website" }),
      mediaCol.countDocuments({ isFeatured: true }),
      servicesCol.countDocuments({ published: true }),
      processCol.countDocuments({ published: true }),
      testimonialsCol.countDocuments({ approved: true }),
      journalCol.countDocuments({}),
      enquiriesCol.countDocuments({ status: "new" }),
      activityCol.find({}).sort({ createdAt: -1 }).limit(10).toArray(),
    ]);

    return sendSuccess(res, {
      stats: {
        publishedProjects: totalCaseStudies,
        featuredProjects: featuredCaseStudies,
        totalStudioProjects: totalProjects,
        publishedMedia,
        featuredMedia,
        servicesCount: totalServices,
        processStepsCount: totalProcessSteps,
        testimonialsCount: totalTestimonials,
        journalArticlesCount: totalJournal,
        newEnquiriesCount: newEnquiries,
      },
      recentActivity: recentActivity.map((a) => ({ ...a, id: String(a._id) })),
    });
  } catch (err) {
    next(err);
  }
}

// 2. Homepage Configuration
export async function getHomepageConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const settingsCol = await getCollection<SiteSettingsDoc>("siteSettings");
    const docs = await settingsCol.find({}).toArray();
    const map: Record<string, any> = {};
    for (const d of docs) {
      map[d.key] = d.value;
    }

    const unwrap = (val: any, fallback: any) => {
      if (val === undefined || val === null) return fallback;
      if (typeof val === "object" && "text" in val) return val.text;
      if (typeof val === "object" && "value" in val) return val.value;
      return val;
    };

    return sendSuccess(res, {
      heroTitle: unwrap(map.heroTitle, "Architecture & Interior Sanctuary"),
      heroSubtitle: unwrap(
        map.heroSubtitle,
        "Spaces shaped by light, material and everyday life. Bespoke residential, commercial and turnkey interiors across India."
      ),
      heroImage: unwrap(map.heroImage, "https://lh3.googleusercontent.com/d/1yKk6NqN3z5h4hL-yW_7E3iZ9u3R4O_3"),
      ctaText: unwrap(map.ctaText, "Initiate a Commission"),
      ctaLink: unwrap(map.ctaLink, "/contact"),
      featuredProjectSlugs: map.featuredProjectSlugs || [],
      showServices: map.showServices !== false,
      showProcess: map.showProcess !== false,
      showTestimonials: map.showTestimonials !== false,
      showJournal: map.showJournal !== false,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateHomepageConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const settingsCol = await getCollection<SiteSettingsDoc>("siteSettings");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");
    const body = req.body || {};

    const now = new Date();
    const updateKeys = [
      "heroTitle",
      "heroSubtitle",
      "heroImage",
      "ctaText",
      "ctaLink",
      "featuredProjectSlugs",
      "showServices",
      "showProcess",
      "showTestimonials",
      "showJournal",
    ];

    for (const key of updateKeys) {
      if (body[key] !== undefined) {
        await settingsCol.updateOne(
          { key },
          { $set: { key, value: body[key], updatedAt: now } },
          { upsert: true }
        );
      }
    }

    await activityCol.insertOne({
      projectId: null,
      actorId: req.user?.id || null,
      actorLabel: req.user?.fullName || "Studio Admin",
      action: "Updated Homepage Configuration",
      entity: "homepage",
      entityId: "homepage",
      entityTitle: "Homepage CMS",
      detail: `Updated hero settings & homepage section controls`,
      createdAt: now,
    });

    return sendSuccess(res, body, "Homepage configuration updated successfully.");
  } catch (err) {
    next(err);
  }
}

// 3. Projects & Portfolio Management
export async function listCmsProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const caseStudiesCol = await getCollection<CaseStudyDoc>("caseStudies");
    const projectsCol = await getCollection<ProjectDoc>("projects");

    const [caseStudies, studioProjects] = await Promise.all([
      caseStudiesCol.find({}).sort({ publishedAt: -1 }).toArray(),
      projectsCol.find({}).sort({ updatedAt: -1 }).toArray(),
    ]);

    return sendSuccess(res, {
      caseStudies: caseStudies.map((c) => ({ ...c, id: String(c._id) })),
      studioProjects: studioProjects.map((p) => ({ ...p, id: String(p._id) })),
    });
  } catch (err) {
    next(err);
  }
}

function buildEntityQuery(id: string) {
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id }, { slug: id }] };
  }
  return { $or: [{ _id: id }, { slug: id }] };
}

export async function updateCaseStudy(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = req.body;
    const caseStudiesCol = await getCollection<CaseStudyDoc>("caseStudies");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");

    const query = buildEntityQuery(id);

    const updates = {
      ...data,
      updatedAt: new Date(),
    };
    delete (updates as any)._id;
    delete (updates as any).id;

    const result = await caseStudiesCol.findOneAndUpdate(
      query as any,
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result) {
      return sendError(res, "Case study not found.", 404);
    }

    await activityCol.insertOne({
      projectId: null,
      actorId: req.user?.id || null,
      actorLabel: req.user?.fullName || "Studio Admin",
      action: "Updated Case Study",
      entity: "caseStudy",
      entityId: String(result._id),
      entityTitle: result.title,
      detail: `Updated details / media for ${result.title}`,
      createdAt: new Date(),
    });

    return sendSuccess(res, { ...result, id: String(result._id) }, "Case study updated successfully.");
  } catch (err) {
    next(err);
  }
}

export async function createCaseStudy(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body;
    if (!data.title || !data.slug) {
      return sendError(res, "Title and slug are required.", 400);
    }

    const caseStudiesCol = await getCollection<CaseStudyDoc>("caseStudies");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");

    const now = new Date();
    const doc: CaseStudyDoc = {
      slug: data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      title: data.title,
      subtitle: data.subtitle || "Interior Architecture Commission",
      location: data.location || "Mumbai",
      year: data.year || now.getFullYear(),
      heroImage: data.heroImage || "",
      summary: data.summary || "",
      spaceType: data.spaceType || "Residential",
      style: data.style || "Minimal Architecture",
      areaSqft: data.areaSqft || 3500,
      featured: Boolean(data.featured),
      publishedAt: data.publishedAt || now.toISOString().split("T")[0],
      clientBrief: data.clientBrief || "",
      concept: data.concept || "",
      execution: data.execution || "",
      palette: data.palette || [],
      specifications: data.specifications || [],
      gallery: data.gallery || [],
      materials: data.materials || [],
      testimonial: data.testimonial,
      createdAt: now,
      updatedAt: now,
    };

    const insertRes = await caseStudiesCol.insertOne(doc as any);
    const id = String(insertRes.insertedId);

    await activityCol.insertOne({
      projectId: null,
      actorId: req.user?.id || null,
      actorLabel: req.user?.fullName || "Studio Admin",
      action: "Created Case Study",
      entity: "caseStudy",
      entityId: id,
      entityTitle: doc.title,
      detail: `Created new portfolio case study: ${doc.title}`,
      createdAt: now,
    });

    return sendSuccess(res, { ...doc, id, _id: insertRes.insertedId }, "Case study created.", 201);
  } catch (err) {
    next(err);
  }
}

export async function deleteCaseStudy(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const caseStudiesCol = await getCollection<CaseStudyDoc>("caseStudies");
    const query = buildEntityQuery(id);

    const result = await caseStudiesCol.deleteOne(query as any);
    if (result.deletedCount === 0) {
      return sendError(res, "Case study not found.", 404);
    }

    return sendSuccess(res, { deleted: true, id }, "Case study removed.");
  } catch (err) {
    next(err);
  }
}

// 4. Studio Services Management
export async function listCmsServices(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<ServiceDoc>("services");
    const items = await col.find({}).sort({ sortOrder: 1 }).toArray();
    return sendSuccess(res, items.map((i) => ({ ...i, id: String(i._id) })));
  } catch (err) {
    next(err);
  }
}

export async function createCmsService(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<ServiceDoc>("services");
    const data = req.body;
    const now = new Date();

    const doc: ServiceDoc = {
      number: data.number || "01",
      title: data.title || "Interior Architecture",
      shortDesc: data.shortDesc || "",
      fullDesc: data.fullDesc || "",
      deliverables: data.deliverables || [],
      image: data.image || "",
      driveFileId: data.driveFileId || null,
      link: data.link || "/services",
      sortOrder: Number(data.sortOrder) || 0,
      published: data.published !== false,
      createdAt: now,
      updatedAt: now,
    };

    const resInsert = await col.insertOne(doc as any);
    return sendSuccess(res, { ...doc, id: String(resInsert.insertedId) }, "Service created.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCmsService(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<ServiceDoc>("services");
    const query = buildEntityQuery(id);

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;

    const result = await col.findOneAndUpdate(query as any, { $set: updates }, { returnDocument: "after" });
    if (!result) return sendError(res, "Service not found.", 404);

    return sendSuccess(res, { ...result, id: String(result._id) }, "Service updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteCmsService(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<ServiceDoc>("services");
    const query = buildEntityQuery(id);
    await col.deleteOne(query as any);
    return sendSuccess(res, { deleted: true, id });
  } catch (err) {
    next(err);
  }
}

// 5. Design Process Management
export async function listCmsProcess(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<ProcessStepDoc>("processSteps");
    const items = await col.find({}).sort({ sortOrder: 1 }).toArray();
    return sendSuccess(res, items.map((i) => ({ ...i, id: String(i._id) })));
  } catch (err) {
    next(err);
  }
}

export async function createCmsProcess(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<ProcessStepDoc>("processSteps");
    const data = req.body;
    const now = new Date();

    const doc: ProcessStepDoc = {
      number: data.number || "01",
      title: data.title || "Discovery & Site Analysis",
      description: data.description || "",
      timeline: data.timeline || "Weeks 1 – 2",
      sortOrder: Number(data.sortOrder) || 0,
      published: data.published !== false,
      createdAt: now,
      updatedAt: now,
    };

    const resInsert = await col.insertOne(doc as any);
    return sendSuccess(res, { ...doc, id: String(resInsert.insertedId) }, "Process step created.", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCmsProcess(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<ProcessStepDoc>("processSteps");
    const query = buildEntityQuery(id);

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;

    const result = await col.findOneAndUpdate(query as any, { $set: updates }, { returnDocument: "after" });
    if (!result) return sendError(res, "Process step not found.", 404);

    return sendSuccess(res, { ...result, id: String(result._id) }, "Process step updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteCmsProcess(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<ProcessStepDoc>("processSteps");
    const query = buildEntityQuery(id);
    await col.deleteOne(query as any);
    return sendSuccess(res, { deleted: true, id });
  } catch (err) {
    next(err);
  }
}

// 6. Testimonials Management
export async function listCmsTestimonials(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<TestimonialDoc>("testimonials");
    const items = await col.find({}).sort({ sortOrder: 1 }).toArray();
    return sendSuccess(res, items.map((i) => ({ ...i, id: String(i._id) })));
  } catch (err) {
    next(err);
  }
}

export async function updateCmsTestimonial(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const col = await getCollection<TestimonialDoc>("testimonials");
    const query = buildEntityQuery(id);

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;

    const result = await col.findOneAndUpdate(query as any, { $set: updates }, { returnDocument: "after" });
    if (!result) return sendError(res, "Testimonial not found.", 404);

    return sendSuccess(res, { ...result, id: String(result._id) }, "Testimonial updated.");
  } catch (err) {
    next(err);
  }
}

// 7. Enquiries Management
export async function listCmsEnquiries(req: Request, res: Response, next: NextFunction) {
  try {
    const col = await getCollection<EnquiryDoc>("enquiries");
    const items = await col.find({}).sort({ createdAt: -1 }).toArray();
    return sendSuccess(res, items.map((i) => ({ ...i, id: String(i._id) })));
  } catch (err) {
    next(err);
  }
}

export async function updateEnquiryStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const col = await getCollection<EnquiryDoc>("enquiries");
    const query = buildEntityQuery(id);

    const result = await col.findOneAndUpdate(
      query as any,
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) return sendError(res, "Enquiry not found.", 404);
    return sendSuccess(res, { ...result, id: String(result._id) }, "Enquiry status updated.");
  } catch (err) {
    next(err);
  }
}

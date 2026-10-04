import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getCollection } from "../config/database.js";
import {
  CaseStudyDoc,
  JournalPostDoc,
  SiteSettingsDoc,
  EnquiryDoc,
  ServiceDoc,
  ProcessStepDoc,
  TestimonialDoc,
  MaterialDoc,
  MediaDoc,
} from "../models/types.js";
import { sendSuccess, sendError } from "../utils/response.js";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Valid email required"),
  phone: z.string().trim().min(6, "Valid phone number required"),
  city: z.string().optional().nullable(),
  spaceType: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
  budgetBand: z.string().optional().nullable(),
  estimatedTimeline: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function getHomeData(req: Request, res: Response, next: NextFunction) {
  try {
    const [caseStudiesCol, journalCol, mediaCol, servicesCol, processCol, testimonialsCol, materialsCol, settingsCol] =
      await Promise.all([
        getCollection<CaseStudyDoc>("caseStudies"),
        getCollection<JournalPostDoc>("journalPosts"),
        getCollection<MediaDoc>("media"),
        getCollection<ServiceDoc>("services"),
        getCollection<ProcessStepDoc>("processSteps"),
        getCollection<TestimonialDoc>("testimonials"),
        getCollection<MaterialDoc>("materials"),
        getCollection<SiteSettingsDoc>("siteSettings"),
      ]);

    const [
      featuredProjects,
      recentJournal,
      heroMedia,
      homepageMediaDocs,
      services,
      processSteps,
      testimonials,
      materials,
      settingsDocs,
    ] = await Promise.all([
      caseStudiesCol.find({ featured: true }).sort({ publishedAt: -1 }).limit(6).toArray(),
      journalCol.find({}).sort({ publishedAt: -1 }).limit(3).toArray(),
      mediaCol.find({ visibility: "website", isFeatured: true }).sort({ sortOrder: 1 }).limit(16).toArray(),
      mediaCol
        .find({
          $or: [
            { isHomepageVisible: true },
            { isFeatured: true, visibility: "website" },
          ],
        })
        .sort({ homepageOrder: 1, sortOrder: 1, createdAt: -1 })
        .limit(24)
        .toArray(),
      servicesCol.find({ published: true }).sort({ sortOrder: 1 }).toArray(),
      processCol.find({ published: true }).sort({ sortOrder: 1 }).toArray(),
      testimonialsCol.find({ approved: true }).sort({ sortOrder: 1 }).limit(6).toArray(),
      materialsCol.find({}).limit(6).toArray(),
      settingsCol.find({}).toArray(),
    ]);

    const settingsMap: Record<string, any> = {};
    for (const doc of settingsDocs) {
      settingsMap[doc.key] = doc.value;
    }

    const unwrapStr = (val: any, fallback: string): string => {
      if (!val) return fallback;
      if (typeof val === "string") return val;
      if (typeof val === "object" && val.text) return String(val.text);
      if (typeof val === "object" && val.value) return String(val.value);
      return fallback;
    };

    const homepageMedia = homepageMediaDocs.map((m: any, idx: number) => ({
      id: String(m._id),
      _id: String(m._id),
      driveFileId: m.driveFileId,
      fileName: m.fileName,
      title: m.title || m.caption || m.fileName || `Architectural Work #${idx + 1}`,
      caption: m.caption || m.description || m.title || "",
      description: m.description || m.alt || m.caption || "",
      category: m.category || "Living & Salon",
      mediaType: m.mediaType || (m.mimeType?.startsWith("video/") ? "video" : "image"),
      url: m.driveUrl || (m.driveFileId ? `https://lh3.googleusercontent.com/d/${m.driveFileId}` : ""),
      thumbnailUrl:
        m.thumbnailUrl ||
        m.driveUrl ||
        (m.driveFileId ? `https://drive.google.com/thumbnail?id=${m.driveFileId}&sz=w800` : ""),
      thumbnail_url:
        m.thumbnailUrl ||
        m.driveUrl ||
        (m.driveFileId ? `https://drive.google.com/thumbnail?id=${m.driveFileId}&sz=w800` : ""),
      isHomepageVisible: m.isHomepageVisible ?? m.isFeatured ?? true,
      homepageOrder: m.homepageOrder ?? m.sortOrder ?? idx + 1,
      projectId: m.projectId || "altamount-penthouse",
      projectTitle: m.projectTitle || "The Altamount Penthouse",
      tags: m.tags || [],
      size: m.size || 0,
      createdAt: m.createdAt,
    }));

    return sendSuccess(res, {
      heroTitle: unwrapStr(settingsMap.heroTitle, "Architecture & Interior Sanctuary"),
      heroSubtitle: unwrapStr(
        settingsMap.heroSubtitle,
        "Spaces shaped by light, material and everyday life. Bespoke residential, commercial and turnkey interiors across India."
      ),
      featuredProjects,
      recentJournal,
      heroMedia,
      homepageMedia,
      services,
      processSteps,
      testimonials,
      materials,
      settings: settingsMap,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSiteSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settingsCol = await getCollection<SiteSettingsDoc>("siteSettings");
    const settingsDocs = await settingsCol.find({}).toArray();
    const settingsMap: Record<string, any> = {};
    for (const doc of settingsDocs) {
      settingsMap[doc.key] = doc.value;
    }

    return sendSuccess(res, {
      studioName: "Right-Angle-Design-Studio",
      tagline: "Architecture & Interior Sanctuary",
      phone: "+91 98200 41100",
      email: "contact@rightangle.design",
      address: "Studio 4B, The Mill District, Lower Parel, Mumbai 400013",
      instagram: "https://instagram.com/rightangledesignstudio",
      ...settingsMap,
    });
  } catch (err) {
    next(err);
  }
}

export async function listCaseStudies(req: Request, res: Response, next: NextFunction) {
  try {
    const { category } = req.query;
    const caseStudiesCol = await getCollection<CaseStudyDoc>("caseStudies");

    const query: Record<string, any> = {};
    if (category && typeof category === "string" && category.toLowerCase() !== "all") {
      const reg = new RegExp(category, "i");
      query.$or = [{ spaceType: reg }, { style: reg }, { tags: reg }];
    }

    const studies = await caseStudiesCol.find(query).sort({ publishedAt: -1 }).toArray();
    return sendSuccess(res, studies);
  } catch (err) {
    next(err);
  }
}

export async function getCaseStudy(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const caseStudiesCol = await getCollection<CaseStudyDoc>("caseStudies");

    const study = await caseStudiesCol.findOne({ slug });
    if (!study) {
      return sendError(res, "Case study not found.", 404, "NOT_FOUND");
    }

    const allStudies = await caseStudiesCol.find({}).sort({ publishedAt: -1 }).toArray();
    const currentIndex = allStudies.findIndex((s) => s.slug === slug);
    const prev = currentIndex > 0 ? allStudies[currentIndex - 1] : allStudies[allStudies.length - 1];
    const nextStudy = currentIndex < allStudies.length - 1 ? allStudies[currentIndex + 1] : allStudies[0];
    const related = allStudies.filter((s) => s.slug !== slug).slice(0, 3);

    return sendSuccess(res, {
      study,
      prev,
      next: nextStudy,
      related,
    });
  } catch (err) {
    next(err);
  }
}

export async function listServices(req: Request, res: Response, next: NextFunction) {
  try {
    const servicesCol = await getCollection<ServiceDoc>("services");
    const services = await servicesCol.find({ published: true }).sort({ sortOrder: 1 }).toArray();
    return sendSuccess(res, services);
  } catch (err) {
    next(err);
  }
}

export async function listProcessSteps(req: Request, res: Response, next: NextFunction) {
  try {
    const processCol = await getCollection<ProcessStepDoc>("processSteps");
    const steps = await processCol.find({ published: true }).sort({ sortOrder: 1 }).toArray();
    return sendSuccess(res, steps);
  } catch (err) {
    next(err);
  }
}

export async function listTestimonials(req: Request, res: Response, next: NextFunction) {
  try {
    const testimonialsCol = await getCollection<TestimonialDoc>("testimonials");
    const testimonials = await testimonialsCol.find({ approved: true }).sort({ sortOrder: 1 }).toArray();
    return sendSuccess(res, testimonials);
  } catch (err) {
    next(err);
  }
}

export async function listMaterials(req: Request, res: Response, next: NextFunction) {
  try {
    const materialsCol = await getCollection<MaterialDoc>("materials");
    const materials = await materialsCol.find({}).toArray();
    return sendSuccess(res, materials);
  } catch (err) {
    next(err);
  }
}

export async function listJournal(req: Request, res: Response, next: NextFunction) {
  try {
    const journalCol = await getCollection<JournalPostDoc>("journalPosts");
    const posts = await journalCol.find({}).sort({ publishedAt: -1 }).toArray();
    return sendSuccess(res, posts);
  } catch (err) {
    next(err);
  }
}

export async function getJournalPost(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const journalCol = await getCollection<JournalPostDoc>("journalPosts");

    const post = await journalCol.findOne({ slug });
    if (!post) {
      return sendError(res, "Journal article not found.", 404, "NOT_FOUND");
    }

    const recent = await journalCol.find({ slug: { $ne: slug } }).sort({ publishedAt: -1 }).limit(3).toArray();

    return sendSuccess(res, {
      post,
      recent,
    });
  } catch (err) {
    next(err);
  }
}

export async function submitEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const body = enquirySchema.parse(req.body);
    const enquiriesCol = await getCollection<EnquiryDoc>("enquiries");
    const activityCol = await getCollection<any>("activityLogs");

    const now = new Date();
    const doc: EnquiryDoc = {
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone,
      city: body.city || null,
      spaceType: body.spaceType || null,
      scope: body.scope || null,
      budgetBand: body.budgetBand || null,
      estimatedTimeline: body.estimatedTimeline || null,
      notes: body.notes || null,
      status: "new",
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await enquiriesCol.insertOne(doc as any);

    await activityCol.insertOne({
      actorLabel: "Website Visitor",
      action: "New Consultation Enquiry",
      entity: "enquiry",
      entityId: String(insertResult.insertedId),
      entityTitle: `${body.name} (${body.spaceType || "General"})`,
      detail: `New enquiry received from ${body.email} / ${body.phone}`,
      createdAt: now,
    });

    return sendSuccess(
      res,
      {
        id: String(insertResult.insertedId),
        received: true,
      },
      "Thank you. Our studio partner will contact you shortly.",
      201,
    );
  } catch (err) {
    next(err);
  }
}

export async function getPublicGallery(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, tag, search, page = 1, limit = 12, sortBy = "newest" } = req.query;

    const mediaCol = await getCollection<MediaDoc>("media");

    const filter: Record<string, any> = {
      $or: [
        { visibility: "website" },
        { visibility: "public" },
        { isVisible: true },
        { isHomepageVisible: true },
      ],
    };

    if (category && typeof category === "string" && category.toLowerCase() !== "all") {
      filter.category = new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }

    if (tag && typeof tag === "string" && tag.toLowerCase() !== "all") {
      filter.tags = new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    }

    if (search && typeof search === "string" && search.trim().length > 0) {
      const reg = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { fileName: reg },
        { caption: reg },
        { alt: reg },
        { tags: reg },
        { projectTitle: reg },
        { category: reg },
      ];
    }

    let sortObj: Record<string, 1 | -1> = { sortOrder: 1, createdAt: -1 };
    if (sortBy === "oldest") {
      sortObj = { createdAt: 1 };
    } else if (sortBy === "title") {
      sortObj = { caption: 1 };
    } else if (sortBy === "project") {
      sortObj = { projectTitle: 1 };
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [items, totalCount, allDocs] = await Promise.all([
      mediaCol.find(filter).sort(sortObj).skip(skip).limit(limitNum).toArray(),
      mediaCol.countDocuments(filter),
      mediaCol.find({ visibility: "website" }).project({ category: 1, tags: 1 }).toArray(),
    ]);

    const allCategories = ["All", ...Array.from(new Set(allDocs.map((d: any) => d.category).filter(Boolean)))];
    const allTags = ["All", ...Array.from(new Set(allDocs.flatMap((d: any) => d.tags || []).filter((t: string) => t && t !== "Google Drive Vault")))];

    const formattedItems = items.map((m: any, idx: number) => {
      const driveId = m.driveFileId || String(m._id);
      return {
        id: String(m._id),
        _id: String(m._id),
        driveFileId: m.driveFileId,
        url: m.driveUrl || (m.driveFileId ? `https://lh3.googleusercontent.com/d/${m.driveFileId}` : ""),
        thumbnailUrl:
          m.thumbnailUrl ||
          m.driveUrl ||
          (m.driveFileId ? `https://drive.google.com/thumbnail?id=${m.driveFileId}&sz=w800` : ""),
        title: m.caption || m.fileName || `Architectural Work #${idx + 1}`,
        caption: m.alt || m.caption || "",
        category: m.category || "Living & Salon",
        projectId: m.projectId || "altamount-penthouse",
        projectTitle: m.projectTitle || "The Altamount Penthouse",
        tags: m.tags || [],
        width: 1920,
        height: 1080,
      };
    });

    return sendSuccess(res, {
      items: formattedItems,
      total: totalCount,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      pageSize: limitNum,
      hasNextPage: pageNum * limitNum < totalCount,
      hasPrevPage: pageNum > 1,
      allCategories,
      allTags,
      totalDriveAssets: totalCount,
    });
  } catch (err) {
    next(err);
  }
}

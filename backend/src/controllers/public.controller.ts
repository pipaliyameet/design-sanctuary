import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getCollection } from "../config/database.js";
import { CaseStudyDoc, JournalPostDoc, SiteSettingsDoc, EnquiryDoc } from "../models/types.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { getPaginatedDrivePhotos, GOOGLE_DRIVE_PHOTOS, PUBLIC_DRIVE_FOLDER_URL } from "../config/drivePhotosData.js";


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
    const [caseStudiesCol, journalCol, mediaCol] = await Promise.all([
      getCollection<CaseStudyDoc>("caseStudies"),
      getCollection<JournalPostDoc>("journalPosts"),
      getCollection<any>("media"),
    ]);

    const [featuredProjects, recentJournal, heroMedia] = await Promise.all([
      caseStudiesCol.find({ featured: true }).sort({ publishedAt: -1 }).limit(6).toArray(),
      journalCol.find({}).sort({ publishedAt: -1 }).limit(3).toArray(),
      mediaCol.find({ visibility: "website", isFeatured: true }).limit(10).toArray(),
    ]);

    return sendSuccess(res, {
      heroTitle: "Architecture & Interior Sanctuary",
      heroSubtitle: "Curated residential, hospitality, and bespoke spatial design with an unwavering devotion to material craft.",
      featuredProjects,
      recentJournal,
      heroMedia,
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
      studioName: "Atelier Vermilion",
      tagline: "Architecture & Interior Sanctuary",
      phone: "+91 98200 41100",
      email: "atelier@ateliervermilion.com",
      address: "Studio 4B, The Mill District, Lower Parel, Mumbai 400013",
      instagram: "https://instagram.com/ateliervermilion",
      ...settingsMap,
    });
  } catch (err) {
    next(err);
  }
}

export async function listCaseStudies(req: Request, res: Response, next: NextFunction) {
  try {
    const caseStudiesCol = await getCollection<CaseStudyDoc>("caseStudies");
    const studies = await caseStudiesCol.find({}).sort({ publishedAt: -1 }).toArray();
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

    return sendSuccess(res, {
      id: String(insertResult.insertedId),
      received: true,
    }, "Thank you. Our studio partner will contact you shortly.", 201);
  } catch (err) {
    next(err);
  }
}

export async function getPublicGallery(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, tag, search, page, limit, sortBy } = req.query;

    const result = getPaginatedDrivePhotos({
      category: category as string,
      tag: tag as string,
      search: search as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 12,
      sortBy: sortBy as string,
    });

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}


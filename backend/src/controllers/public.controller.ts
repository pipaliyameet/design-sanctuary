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
import { preloadDriveImages } from "../services/imageCache.service.js";

// In-Memory Response Cache for fast 0ms public queries
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const publicResponseCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

export function invalidatePublicCache(keyPrefix?: string) {
  if (!keyPrefix) {
    publicResponseCache.clear();
    return;
  }
  for (const k of Array.from(publicResponseCache.keys())) {
    if (k.startsWith(keyPrefix)) {
      publicResponseCache.delete(k);
    }
  }
}

function getCached<T>(key: string): T | null {
  const entry = publicResponseCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  if (entry) {
    publicResponseCache.delete(key);
  }
  return null;
}

function setCached<T>(key: string, data: T) {
  publicResponseCache.set(key, { data, timestamp: Date.now() });
}

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
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

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

    // Preload top homepage images in background
    const preloadIds = homepageMedia
      .map((m) => m.driveFileId)
      .filter(Boolean) as string[];
    preloadDriveImages(preloadIds);

    const payload = {
      heroTitle: unwrapStr(settingsMap.heroTitle, "Architecture & Interior Sanctuary"),
      heroSubtitle: unwrapStr(
        settingsMap.heroSubtitle,
        "Spaces shaped by light, material and everyday life. Bespoke residential, commercial and turnkey interiors across India."
      ),
      heroImage: unwrapStr(settingsMap.heroImage, "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE"),
      atmospherePhoto: unwrapStr(settingsMap.atmospherePhoto, "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg"),
      beforePhoto: unwrapStr(settingsMap.beforePhoto, "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r"),
      afterPhoto: unwrapStr(settingsMap.afterPhoto, "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE"),
      ctaText: unwrapStr(settingsMap.ctaText, "View Projects"),
      ctaLink: unwrapStr(settingsMap.ctaLink, "/portfolio"),
      featuredProjects,
      recentJournal,
      heroMedia,
      homepageMedia,
      services,
      processSteps,
      testimonials,
      materials,
      settings: settingsMap,
    };

    return sendSuccess(res, payload);
  } catch (err) {
    next(err);
  }
}

export async function getSiteSettings(req: Request, res: Response, next: NextFunction) {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const settingsCol = await getCollection<SiteSettingsDoc>("siteSettings");
    const settingsDocs = await settingsCol.find({}).toArray();
    const settingsMap: Record<string, any> = {};
    for (const doc of settingsDocs) {
      settingsMap[doc.key] = doc.value;
    }

    const payload = {
      studioName: "Right-Angle-Design-Studio",
      tagline: "Architecture & Interior Sanctuary",
      phone: "+91 95375 86804",
      email: "contact@rightangle.design",
      address: "Studio 4B, The Mill District, Lower Parel, Mumbai 400013",
      instagram: "https://www.instagram.com/right_angle_interior_design/",
      ...settingsMap,
    };

    return sendSuccess(res, payload);
  } catch (err) {
    next(err);
  }
}

export async function listCaseStudies(req: Request, res: Response, next: NextFunction) {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const { category } = req.query;
    const cacheKey = `case_studies_${category || "all"}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return sendSuccess(res, cached);
    }

    const caseStudiesCol = await getCollection<CaseStudyDoc>("caseStudies");

    const query: Record<string, any> = {};
    if (category && typeof category === "string" && category.toLowerCase() !== "all") {
      const reg = new RegExp(category, "i");
      query.$or = [{ spaceType: reg }, { style: reg }, { tags: reg }];
    }

    const studies = await caseStudiesCol.find(query).sort({ publishedAt: -1 }).toArray();
    setCached(cacheKey, studies);
    return sendSuccess(res, studies);
  } catch (err) {
    next(err);
  }
}

export async function getCaseStudy(req: Request, res: Response, next: NextFunction) {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const { slug } = req.params;
    const cacheKey = `study_${slug}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return sendSuccess(res, cached);
    }

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

    const payload = {
      study,
      prev,
      next: nextStudy,
      related,
    };

    setCached(cacheKey, payload);
    return sendSuccess(res, payload);
  } catch (err) {
    next(err);
  }
}

export async function listServices(req: Request, res: Response, next: NextFunction) {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const cacheKey = "services_list";
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return sendSuccess(res, cached);
    }

    const servicesCol = await getCollection<ServiceDoc>("services");
    const services = await servicesCol.find({ published: true }).sort({ sortOrder: 1 }).toArray();

    setCached(cacheKey, services);
    return sendSuccess(res, services);
  } catch (err) {
    next(err);
  }
}

export async function listProcessSteps(req: Request, res: Response, next: NextFunction) {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const cacheKey = "process_steps";
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return sendSuccess(res, cached);
    }

    const processCol = await getCollection<ProcessStepDoc>("processSteps");
    const steps = await processCol.find({ published: true }).sort({ sortOrder: 1 }).toArray();

    setCached(cacheKey, steps);
    return sendSuccess(res, steps);
  } catch (err) {
    next(err);
  }
}

export async function listTestimonials(req: Request, res: Response, next: NextFunction) {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const cacheKey = "testimonials_list";
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return sendSuccess(res, cached);
    }

    const testimonialsCol = await getCollection<TestimonialDoc>("testimonials");
    const testimonials = await testimonialsCol.find({ approved: true }).sort({ sortOrder: 1 }).toArray();

    setCached(cacheKey, testimonials);
    return sendSuccess(res, testimonials);
  } catch (err) {
    next(err);
  }
}

export async function listMaterials(req: Request, res: Response, next: NextFunction) {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const cacheKey = "materials_list";
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return sendSuccess(res, cached);
    }

    const materialsCol = await getCollection<MaterialDoc>("materials");
    const materials = await materialsCol.find({}).sort({ category: 1, name: 1 }).toArray();

    setCached(cacheKey, materials);
    return sendSuccess(res, materials);
  } catch (err) {
    next(err);
  }
}

export async function listJournalPosts(req: Request, res: Response, next: NextFunction) {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const { tag } = req.query;
    const cacheKey = `journal_${tag || "all"}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return sendSuccess(res, cached);
    }

    const journalCol = await getCollection<JournalPostDoc>("journalPosts");
    const query: Record<string, any> = {};
    if (tag && typeof tag === "string") {
      query.tags = tag;
    }
    const posts = await journalCol.find(query).sort({ publishedAt: -1 }).toArray();

    setCached(cacheKey, posts);
    return sendSuccess(res, posts);
  } catch (err) {
    next(err);
  }
}

export async function getJournalPost(req: Request, res: Response, next: NextFunction) {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const { slug } = req.params;
    const cacheKey = `journal_post_${slug}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return sendSuccess(res, cached);
    }

    const journalCol = await getCollection<JournalPostDoc>("journalPosts");
    const post = await journalCol.findOne({ slug });
    if (!post) {
      return sendError(res, "Post not found", 404, "NOT_FOUND");
    }

    setCached(cacheKey, post);
    return sendSuccess(res, post);
  } catch (err) {
    next(err);
  }
}

export async function createEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const data = enquirySchema.parse(req.body);
    const enquiryCol = await getCollection<EnquiryDoc>("enquiries");

    const doc: EnquiryDoc = {
      ...data,
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await enquiryCol.insertOne(doc);
    return sendSuccess(res, { id: String(result.insertedId) }, "Enquiry submitted successfully.", 201);
  } catch (err) {
    next(err);
  }
}

export async function listPublicMedia(req: Request, res: Response, next: NextFunction) {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const { category, tag, search, page = "1", limit = "12" } = req.query;
    const cacheKey = `public_media_${category || ""}_${tag || ""}_${search || ""}_${page}_${limit}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return sendSuccess(res, cached);
    }

    const mediaCol = await getCollection<MediaDoc>("media");

    const query: Record<string, any> = {
      visibility: { $in: ["website", "client_only"] },
    };

    if (category && typeof category === "string" && category.toLowerCase() !== "all") {
      query.category = category;
    }

    if (tag && typeof tag === "string" && tag.toLowerCase() !== "all") {
      query.tags = tag;
    }

    if (search && typeof search === "string" && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: "i" } },
        { caption: { $regex: s, $options: "i" } },
        { projectTitle: { $regex: s, $options: "i" } },
        { tags: { $regex: s, $options: "i" } },
        { fileName: { $regex: s, $options: "i" } },
      ];
    }

    const allItems = await mediaCol.find(query).sort({ homepageOrder: 1, sortOrder: 1, createdAt: -1 }).toArray();

    const seenIds = new Set<string>();
    const seenFileNames = new Set<string>();
    const seenUrls = new Set<string>();
    const uniqueItems: any[] = [];

    for (const m of allItems) {
      const driveId = (m.driveFileId || String(m._id) || "").trim();
      const fn = (m.fileName || "").trim().toLowerCase();
      const u = (m.driveUrl || (m as any).url || "").trim();

      if (driveId && seenIds.has(driveId)) continue;
      if (fn && seenFileNames.has(fn)) continue;
      if (u && seenUrls.has(u)) continue;

      if (driveId) seenIds.add(driveId);
      if (fn) seenFileNames.add(fn);
      if (u) seenUrls.add(u);

      uniqueItems.push(m);
    }

    const totalCount = uniqueItems.length;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;
    const paginatedItems = uniqueItems.slice(skip, skip + limitNum);

    const allDocs = await mediaCol.find({ visibility: { $in: ["website", "client_only"] } } as any).project({ category: 1, tags: 1 }).toArray();

    const allCategories = ["All", ...Array.from(new Set(allDocs.map((d: any) => d.category).filter(Boolean)))];
    const allTags = ["All", ...Array.from(new Set(allDocs.flatMap((d: any) => d.tags || []).filter((t: string) => t && t !== "Google Drive Vault")))];

    const formattedItems = paginatedItems.map((m: any, idx: number) => {
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

    const payload = {
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
    };

    setCached(cacheKey, payload);
    return sendSuccess(res, payload);
  } catch (err) {
    next(err);
  }
}

// Aliases for route bindings
export const listJournal = listJournalPosts;
export const submitEnquiry = createEnquiry;
export const getPublicGallery = listPublicMedia;

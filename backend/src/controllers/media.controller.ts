import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import { getCollection } from "../config/database.js";
import { MediaDoc, ActivityLogDoc } from "../models/types.js";
import {
  uploadBufferToGoogleDrive,
  deleteFileFromGoogleDrive,
  getOrCreateDriveFolder,
  buildDriveDirectUrl,
  buildDriveThumbnailUrl,
  getGoogleDriveClient,
} from "../config/googleDrive.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { env } from "../config/env.js";

/**
 * Public Endpoint: Returns ONLY media marked visible on homepage, sorted by homepageOrder
 */
export async function getHomepageMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const mediaCol = await getCollection<MediaDoc>("media");
    const items = await mediaCol
      .find({
        $or: [
          { isHomepageVisible: true },
          { isFeatured: true, visibility: "website" },
        ],
      })
      .sort({ homepageOrder: 1, sortOrder: 1, createdAt: -1 })
      .toArray();

    const formatted = items.map((m: any, idx: number) => ({
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

    return sendSuccess(res, formatted);
  } catch (err) {
    next(err);
  }
}

/**
 * Register media via Google Drive link or file ID
 */
export async function createMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      driveLink,
      driveFileId: rawDriveFileId,
      url: customUrl,
      fileName,
      title,
      caption,
      alt,
      category = "Living & Salon",
      projectId,
      projectTitle,
      tags,
      visibility = "website",
      isFeatured = false,
      isHomepageVisible = true,
      homepageOrder = 1,
      isCover = false,
      sortOrder = 0,
    } = req.body;

    // Helper to extract Google Drive file ID from URLs
    let driveFileId = rawDriveFileId || "";
    if (driveLink && !driveFileId) {
      const match =
        driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
        driveLink.match(/id=([a-zA-Z0-9_-]+)/) ||
        driveLink.match(/folders\/([a-zA-Z0-9_-]+)/) ||
        driveLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        driveFileId = match[1];
      } else if (!driveLink.startsWith("http") && driveLink.trim().length > 10) {
        driveFileId = driveLink.trim();
      }
    }

    let directUrl = customUrl || "";
    let thumbnailUrl = customUrl || "";
    if (driveFileId) {
      directUrl = `https://lh3.googleusercontent.com/d/${driveFileId}`;
      thumbnailUrl = `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w800`;
    } else if (driveLink && driveLink.startsWith("http")) {
      directUrl = driveLink;
      thumbnailUrl = driveLink;
    }

    const now = new Date();
    const mediaCol = await getCollection<MediaDoc>("media");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
        ? tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : ["Google Drive Vault"];

    const mediaDoc: any = {
      projectId: projectId || "altamount-penthouse",
      projectTitle: projectTitle || "The Altamount Penthouse",
      roomId: null,
      fileName: fileName || title || (driveFileId ? `drive-${driveFileId}.jpg` : "photo.jpg"),
      title: title || caption || "Architectural Photograph",
      driveFileId: driveFileId || null,
      driveUrl: directUrl,
      thumbnailUrl: thumbnailUrl,
      mimeType: "image/jpeg",
      mediaType: "image",
      size: 50000,
      category: category || "Living & Salon",
      caption: caption || title || "Architectural Photograph",
      alt: alt || caption || title || "",
      tags: parsedTags.length > 0 ? parsedTags : ["Google Drive Vault"],
      visibility: visibility || "website",
      isFeatured: isFeatured === true || isFeatured === "true",
      isHomepageVisible: isHomepageVisible === true || isHomepageVisible === "true",
      homepageOrder: Number(homepageOrder) || 1,
      isCover: isCover === true || isCover === "true",
      sortOrder: Number(sortOrder) || 0,
      uploadedBy: req.user?.fullName || "Studio Owner",
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const insertRes = await mediaCol.insertOne(mediaDoc);
    const mediaId = String(insertRes.insertedId);

    await activityCol.insertOne({
      projectId: mediaDoc.projectId || null,
      actorId: req.user?.id || null,
      actorLabel: req.user?.fullName || "Owner / Studio Admin",
      action: "Added Media Photo",
      entity: "media",
      entityId: mediaId,
      entityTitle: mediaDoc.caption || mediaDoc.fileName,
      detail: `Added photo from Google Drive (${driveFileId || directUrl}) - category: ${category}`,
      createdAt: now,
    });

    return sendSuccess(
      res,
      {
        ...mediaDoc,
        _id: insertRes.insertedId,
        id: mediaId,
        url: directUrl,
        thumbnail_url: thumbnailUrl,
        title: mediaDoc.caption,
        project_title: mediaDoc.projectTitle,
      },
      "Photo added to Media Library & Gallery successfully.",
      201,
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Upload single or multiple files directly to Google Drive permanent storage
 */
export async function uploadMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const rawFiles: Express.Multer.File[] = [];
    if (req.files && Array.isArray(req.files)) {
      rawFiles.push(...req.files);
    } else if (req.file) {
      rawFiles.push(req.file);
    }

    if (rawFiles.length === 0) {
      return sendError(res, "No files provided for upload.", 400, "MISSING_FILE");
    }

    const {
      projectId,
      projectTitle,
      roomId,
      category = "Living & Salon",
      title,
      caption,
      alt,
      tags,
      visibility = "website",
      isFeatured = "false",
      isHomepageVisible = "true",
      homepageOrder,
      isCover = "false",
      sortOrder = "0",
    } = req.body;

    const targetFolderId = env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    const isPublic = visibility === "website" || visibility === "client_only";
    const mediaCol = await getCollection<MediaDoc>("media");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");
    const now = new Date();

    const createdRecords: any[] = [];

    for (let i = 0; i < rawFiles.length; i++) {
      const file = rawFiles[i];
      const mediaType = file.mimetype.startsWith("video/") ? "video" : "image";
      const cleanFileName = `${Date.now()}-${i}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const driveResult = await uploadBufferToGoogleDrive({
        buffer: file.buffer,
        fileName: cleanFileName,
        mimeType: file.mimetype,
        folderId: targetFolderId,
        isPublic,
      });

      const parsedTags = Array.isArray(tags)
        ? tags
        : typeof tags === "string"
          ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : ["Google Drive Vault", "Studio Photography"];

      const itemTitle =
        rawFiles.length === 1 && title
          ? title
          : file.originalname.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

      const mediaDoc: any = {
        projectId: projectId || "altamount-penthouse",
        projectTitle: projectTitle || "The Altamount Penthouse",
        roomId: roomId || null,
        fileName: file.originalname,
        title: itemTitle,
        driveFileId: driveResult.fileId,
        driveUrl: driveResult.directUrl,
        thumbnailUrl: driveResult.thumbnailUrl,
        mimeType: file.mimetype,
        mediaType,
        size: file.size,
        category: category || "Living & Salon",
        caption: caption || itemTitle,
        alt: alt || itemTitle,
        tags: parsedTags,
        visibility: visibility as any,
        isFeatured: isFeatured === "true" || isFeatured === true,
        isHomepageVisible: isHomepageVisible === "true" || isHomepageVisible === true,
        homepageOrder: homepageOrder ? Number(homepageOrder) + i : i + 1,
        sortOrder: parseInt(sortOrder, 10) || 0,
        uploadedBy: req.user?.fullName || "Studio Owner",
        status: "active",
        createdAt: now,
        updatedAt: now,
      };

      const insertRes = await mediaCol.insertOne(mediaDoc as any);
      const mediaId = String(insertRes.insertedId);

      createdRecords.push({
        ...mediaDoc,
        _id: insertRes.insertedId,
        id: mediaId,
        url: driveResult.directUrl,
        thumbnail_url: driveResult.thumbnailUrl,
        title: mediaDoc.title,
        project_title: mediaDoc.projectTitle,
        tags: mediaDoc.tags,
      });
    }

    await activityCol.insertOne({
      projectId: projectId || null,
      actorId: req.user?.id || null,
      actorLabel: req.user?.fullName || "Studio Owner",
      action: "Uploaded Media to Google Drive",
      entity: "media",
      entityId: createdRecords[0]?.id || "",
      entityTitle: createdRecords.map((r) => r.fileName).join(", "),
      detail: `Uploaded ${createdRecords.length} file(s) to permanent Google Drive vault (${targetFolderId})`,
      createdAt: now,
    });

    const responseData = createdRecords.length === 1 ? createdRecords[0] : createdRecords;
    return sendSuccess(
      res,
      responseData,
      `Successfully uploaded ${createdRecords.length} file(s) to Google Drive and media vault.`,
      201,
    );
  } catch (err) {
    next(err);
  }
}

/**
 * List media records with filtering & search
 */
export async function listMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId, roomId, category, visibility, isFeatured, isCover, isHomepageVisible } = req.query;
    const mediaCol = await getCollection<MediaDoc>("media");

    let query: any = {};
    if (projectId) {
      query.projectId = projectId;
    }
    if (roomId) {
      query.roomId = roomId;
    }
    if (category && category !== "all") {
      query.category = category;
    }
    if (visibility) {
      query.visibility = visibility;
    }
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }
    if (isHomepageVisible !== undefined) {
      query.isHomepageVisible = isHomepageVisible === "true";
    }
    if (isCover !== undefined) {
      query.isCover = isCover === "true";
    }

    const items = await mediaCol.find(query).sort({ homepageOrder: 1, sortOrder: 1, createdAt: -1 }).toArray();
    const formatted = items.map((m: any, idx: number) => ({
      ...m,
      id: String(m._id),
      _id: String(m._id),
      driveFileId: m.driveFileId,
      url: m.driveUrl || (m.driveFileId ? `https://lh3.googleusercontent.com/d/${m.driveFileId}` : ""),
      thumbnail_url:
        m.thumbnailUrl ||
        m.driveUrl ||
        (m.driveFileId ? `https://drive.google.com/thumbnail?id=${m.driveFileId}&sz=w800` : ""),
      thumbnailUrl:
        m.thumbnailUrl ||
        m.driveUrl ||
        (m.driveFileId ? `https://drive.google.com/thumbnail?id=${m.driveFileId}&sz=w800` : ""),
      title: m.title || m.caption || m.fileName || "Architectural Work",
      caption: m.caption || m.title || "",
      description: m.description || m.alt || m.caption || "",
      project_title: m.projectTitle || "The Altamount Penthouse",
      tags: m.tags || [],
      mediaType: m.mediaType || (m.mimeType?.startsWith("video/") ? "video" : "image"),
      isHomepageVisible: m.isHomepageVisible ?? m.isFeatured ?? false,
      homepageOrder: m.homepageOrder ?? m.sortOrder ?? idx + 1,
      uploaded_by: m.uploadedBy || "Owner / Studio Principal",
      upload_date: m.createdAt,
    }));
    return sendSuccess(res, formatted);
  } catch (err) {
    next(err);
  }
}

/**
 * Get media by ID
 */
export async function getMediaById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const mediaCol = await getCollection<MediaDoc>("media");
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

    const item = await mediaCol.findOne(query as any);
    if (!item) {
      return sendError(res, "Media asset not found.", 404, "NOT_FOUND");
    }

    return sendSuccess(res, {
      ...item,
      id: String(item._id),
      url: item.driveUrl,
      thumbnail_url: item.thumbnailUrl || item.driveUrl,
      title: item.title || item.caption || item.fileName,
      project_title: (item as any).projectTitle || "Studio Archive",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update media metadata (homepage visibility, order, title, etc.)
 */
export async function updateMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = req.body;
    const mediaCol = await getCollection<MediaDoc>("media");
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

    const updates: Partial<MediaDoc> = {
      ...data,
      updatedAt: new Date(),
    };
    delete (updates as any)._id;
    delete (updates as any).id;

    if (updates.homepageOrder !== undefined) {
      updates.homepageOrder = Number(updates.homepageOrder);
    }
    if (updates.isHomepageVisible !== undefined) {
      updates.isHomepageVisible = updates.isHomepageVisible === true || (updates.isHomepageVisible as any) === "true";
    }

    const result = await mediaCol.findOneAndUpdate(
      query as any,
      { $set: updates as any },
      { returnDocument: "after" },
    );

    if (!result) {
      return sendError(res, "Media asset not found.", 404, "NOT_FOUND");
    }

    return sendSuccess(res, result, "Media metadata updated successfully.");
  } catch (err) {
    next(err);
  }
}

/**
 * Bulk reorder homepage media
 */
export async function reorderHomepageMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return sendError(res, "Invalid items payload. Array required.", 400);
    }

    const mediaCol = await getCollection<MediaDoc>("media");
    const bulkOps = items.map((item) => {
      const query = ObjectId.isValid(item.id) ? { _id: new ObjectId(item.id) } : { _id: item.id };
      return {
        updateOne: {
          filter: query,
          update: {
            $set: {
              homepageOrder: Number(item.homepageOrder) || 0,
              updatedAt: new Date(),
            },
          },
        },
      };
    });

    if (bulkOps.length > 0) {
      await mediaCol.bulkWrite(bulkOps as any);
    }

    return sendSuccess(res, { reordered: true, count: bulkOps.length }, "Homepage media order updated successfully.");
  } catch (err) {
    next(err);
  }
}

/**
 * Permanent Delete Media: Deletes from Google Drive + deletes from MongoDB
 */
export async function deleteMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const mediaCol = await getCollection<MediaDoc>("media");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

    let item = await mediaCol.findOne(query as any);
    if (!item) {
      item = await mediaCol.findOne({ driveFileId: id } as any);
    }

    if (!item) {
      return sendError(res, "Media asset not found.", 404, "NOT_FOUND");
    }

    // 1. Delete file from Google Drive if driveFileId exists
    if (item.driveFileId) {
      try {
        await deleteFileFromGoogleDrive(item.driveFileId);
      } catch (driveErr) {
        console.warn(`[Google Drive] Error deleting file ${item.driveFileId}:`, driveErr);
      }
    }

    // 2. Delete MongoDB metadata
    await mediaCol.deleteOne({ _id: item._id });

    await activityCol.insertOne({
      projectId: item.projectId || null,
      actorId: req.user?.id || null,
      actorLabel: req.user?.fullName || "Owner / Studio Admin",
      action: "Permanently Deleted Media Asset",
      entity: "media",
      entityId: String(item._id),
      entityTitle: item.fileName,
      detail: `Deleted photo (${item.caption || item.driveFileId}) permanently from Google Drive & database`,
      createdAt: new Date(),
    });

    return sendSuccess(res, { deleted: true, id: String(item._id) }, "Media asset deleted permanently from Drive and library.");
  } catch (err) {
    next(err);
  }
}

/**
 * Proxy Google Drive Images for high resilience
 */
export async function proxyDriveImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return sendError(res, "Invalid file ID", 400);
    }

    const drive = getGoogleDriveClient();
    if (drive) {
      try {
        const driveRes = await drive.files.get(
          { fileId: id, alt: "media", supportsAllDrives: true },
          { responseType: "stream" },
        );
        res.setHeader("Cache-Control", "public, max-age=86400, immutable");
        res.setHeader("Content-Type", (driveRes.headers as any)?.["content-type"] || "image/jpeg");
        return (driveRes.data as any).pipe(res);
      } catch (apiErr: any) {
        // Fallback to fetch upstream URLs
      }
    }

    const sz = req.query.sz || "w1600";
    const candidateUrls = [
      `https://lh3.googleusercontent.com/d/${id}`,
      `https://drive.google.com/thumbnail?id=${id}&sz=${sz}`,
      `https://drive.google.com/uc?export=view&id=${id}`,
      `https://lh3.googleusercontent.com/u/0/d/${id}`,
    ];

    for (const url of candidateUrls) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type") || "image/jpeg";
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          res.setHeader("Content-Type", contentType);
          res.setHeader("Cache-Control", "public, max-age=86400, immutable");
          res.setHeader("Content-Length", buffer.length.toString());
          return res.send(buffer);
        }
      } catch (fetchErr) {
        // Try next candidate
      }
    }

    return sendError(res, "Unable to load image from Google Drive source.", 404);
  } catch (err) {
    next(err);
  }
}

/**
 * Local files fallback
 */
export async function serveLocalFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { filename } = req.params;
    if (!filename) {
      return sendError(res, "Missing filename", 400);
    }
    const safeFilename = path.basename(filename);
    const filePath = path.resolve(process.cwd(), "uploads", safeFilename);
    if (!fs.existsSync(filePath)) {
      return sendError(res, "File not found", 404);
    }
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    return res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
}

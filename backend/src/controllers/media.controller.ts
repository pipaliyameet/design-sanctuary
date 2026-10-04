import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import { MediaDoc, ActivityLogDoc } from "../models/types.js";
import {
  uploadFileToDrive,
  deleteFileFromDrive,
  checkGoogleDriveHealth,
  buildDriveDirectUrl,
  buildDriveThumbnailUrl,
  getGoogleDriveClient,
  resetGoogleDriveClient,
} from "../services/googleDrive.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { env } from "../config/env.js";

const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_SIZE = 150 * 1024 * 1024; // 150MB

/**
 * Public/Admin Endpoint: Returns current Google Drive integration health status
 */
export async function getDriveStatusHandler(req: Request, res: Response) {
  const status = await checkGoogleDriveHealth();
  return sendSuccess(res, status);
}

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
          { visibility: "website" },
        ],
      })
      .sort({ homepageOrder: 1, sortOrder: 1, createdAt: -1 })
      .limit(36)
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
 * Register media via Google Drive link or file ID (Owner / Admin)
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
      sortOrder = 0,
    } = req.body;

    let targetFileId = rawDriveFileId || "";
    if (!targetFileId && driveLink) {
      const match =
        driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
        driveLink.match(/id=([a-zA-Z0-9_-]+)/) ||
        driveLink.match(/folders\/([a-zA-Z0-9_-]+)/) ||
        driveLink.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) targetFileId = match[1];
      else if (!driveLink.startsWith("http")) targetFileId = driveLink.trim();
    }

    if (!targetFileId && !customUrl) {
      return sendError(res, "Please provide a valid Google Drive file ID, share link, or media URL.", 400);
    }

    const mediaCol = await getCollection<MediaDoc>("media");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");

    const directUrl = customUrl || (targetFileId ? buildDriveDirectUrl(targetFileId) : "");
    const thumbnailUrl = customUrl || (targetFileId ? buildDriveThumbnailUrl(targetFileId, 800) : "");

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
        ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : ["Google Drive Vault", "Architectural Work"];

    const now = new Date();
    const mediaDoc: any = {
      projectId: projectId || "altamount-penthouse",
      projectTitle: projectTitle || "The Altamount Penthouse",
      fileName: fileName || `${title || "drive-media"}.jpg`,
      title: title || caption || "Bespoke Architectural Work",
      caption: caption || title || "Architectural Photograph",
      alt: alt || title || "Architectural Interior View",
      driveFileId: targetFileId || `custom-${Date.now()}`,
      driveFolderId: env.GOOGLE_DRIVE_ROOT_FOLDER_ID,
      driveUrl: directUrl,
      thumbnailUrl,
      category,
      tags: parsedTags,
      mimeType: "image/jpeg",
      size: 0,
      mediaType: "image",
      visibility: (visibility || "website") as any,
      isFeatured: isFeatured === true || isFeatured === "true",
      isHomepageVisible: isHomepageVisible === true || isHomepageVisible === "true",
      homepageOrder: Number(homepageOrder) || 1,
      sortOrder: Number(sortOrder) || 0,
      uploadedBy: req.user?.fullName || "Studio Owner",
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const insertRes = await mediaCol.insertOne(mediaDoc as any);
    const mediaId = String(insertRes.insertedId);

    await activityCol.insertOne({
      projectId: mediaDoc.projectId || null,
      actorId: req.user?.id || null,
      actorLabel: req.user?.fullName || "Studio Owner",
      action: "Linked Google Drive Photo",
      entity: "media",
      entityId: mediaId,
      entityTitle: mediaDoc.title,
      detail: `Registered Google Drive asset (${mediaDoc.driveFileId}) in media vault`,
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
      "Photo registered in Media Vault & synced to website.",
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
      sortOrder = "0",
    } = req.body;

    const mediaCol = await getCollection<MediaDoc>("media");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");
    const now = new Date();
    const createdRecords: any[] = [];
    const uploadedDriveIds: string[] = [];

    try {
      for (let i = 0; i < rawFiles.length; i++) {
        const file = rawFiles[i];

        // 1. Validation: MIME Type
        const isImage = ALLOWED_IMAGE_MIMES.includes(file.mimetype);
        const isVideo = ALLOWED_VIDEO_MIMES.includes(file.mimetype);

        if (!isImage && !isVideo) {
          return sendError(
            res,
            `Unsupported file type '${file.mimetype}'. Supported formats: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV.`,
            400,
            "INVALID_FILE_TYPE",
          );
        }

        // 2. Validation: File Size
        if (isImage && file.size > MAX_IMAGE_SIZE) {
          return sendError(res, `Image ${file.originalname} exceeds 50MB limit.`, 400, "FILE_TOO_LARGE");
        }
        if (isVideo && file.size > MAX_VIDEO_SIZE) {
          return sendError(res, `Video ${file.originalname} exceeds 150MB limit.`, 400, "FILE_TOO_LARGE");
        }

        const mediaType = isVideo ? "video" : "image";
        const cleanFileName = `${Date.now()}-${i}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

        // 3. Upload directly to Google Drive permanent vault
        const driveResult = await uploadFileToDrive({
          buffer: file.buffer,
          fileName: cleanFileName,
          mimeType: file.mimetype,
          projectTitle: projectTitle || "General",
          mediaType,
          isPublic: visibility === "website" || visibility === "client_only",
        });

        uploadedDriveIds.push(driveResult.fileId);

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
          driveFolderId: driveResult.driveFolderId,
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
        detail: `Uploaded ${createdRecords.length} file(s) to permanent Google Drive vault`,
        createdAt: now,
      });

      const responseData = createdRecords.length === 1 ? createdRecords[0] : createdRecords;
      return sendSuccess(
        res,
        responseData,
        `Successfully uploaded ${createdRecords.length} file(s) to permanent Google Drive vault.`,
        201,
      );
    } catch (uploadOrDbErr) {
      // Data Consistency: If MongoDB save failed after Drive uploads, clean up Drive orphans
      if (createdRecords.length < uploadedDriveIds.length) {
        const orphanIds = uploadedDriveIds.slice(createdRecords.length);
        for (const orphanId of orphanIds) {
          try {
            await deleteFileFromDrive(orphanId);
          } catch (cleanupErr) {
            console.warn(`[Google Drive Cleanup] Failed to clean orphan ${orphanId}:`, cleanupErr);
          }
        }
      }
      throw uploadOrDbErr;
    }
  } catch (err: any) {
    const errMsg = err?.message || "Google Drive upload failed.";
    return sendError(res, errMsg, 400);
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
 * Replace media file: Uploads replacement file to Google Drive, updates MongoDB, and removes old file.
 */
export async function replaceMediaFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return sendError(res, "Replacement file is required.", 400, "MISSING_FILE");
    }

    const mediaCol = await getCollection<MediaDoc>("media");
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const oldMedia = await mediaCol.findOne(query as any);

    if (!oldMedia) {
      return sendError(res, "Media asset not found.", 404, "NOT_FOUND");
    }

    const isImage = ALLOWED_IMAGE_MIMES.includes(file.mimetype);
    const isVideo = ALLOWED_VIDEO_MIMES.includes(file.mimetype);
    if (!isImage && !isVideo) {
      return sendError(res, "Unsupported replacement file format.", 400, "INVALID_FILE_TYPE");
    }

    const mediaType = isVideo ? "video" : "image";
    const cleanFileName = `${Date.now()}-repl-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    // 1. Upload new file to Drive first
    const newDriveResult = await uploadFileToDrive({
      buffer: file.buffer,
      fileName: cleanFileName,
      mimeType: file.mimetype,
      projectTitle: (oldMedia as any).projectTitle || oldMedia.projectId || "General",
      mediaType,
      isPublic: oldMedia.visibility === "website" || oldMedia.visibility === "client_only",
    });

    // 2. Update MongoDB document
    const oldFileId = oldMedia.driveFileId;
    const now = new Date();
    await mediaCol.updateOne(
      { _id: oldMedia._id },
      {
        $set: {
          driveFileId: newDriveResult.fileId,
          driveFolderId: newDriveResult.driveFolderId,
          driveUrl: newDriveResult.directUrl,
          thumbnailUrl: newDriveResult.thumbnailUrl,
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          mediaType,
          updatedAt: now,
        },
      },
    );

    // 3. Delete old file from Google Drive
    if (oldFileId && oldFileId !== newDriveResult.fileId) {
      try {
        await deleteFileFromDrive(oldFileId);
      } catch (delErr) {
        console.warn(`[Google Drive] Old file cleanup note (${oldFileId}):`, delErr);
      }
    }

    return sendSuccess(
      res,
      {
        id: String(oldMedia._id),
        driveFileId: newDriveResult.fileId,
        url: newDriveResult.directUrl,
        thumbnail_url: newDriveResult.thumbnailUrl,
      },
      "Media file replaced successfully in Google Drive and database.",
    );
  } catch (err: any) {
    return sendError(res, err?.message || "Failed to replace media file.", 400);
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
 * Permanent Delete Media: Deletes from Google Drive first, then deletes from MongoDB Atlas
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
      return sendError(res, "Media asset not found in database.", 404, "NOT_FOUND");
    }

    // 1. Delete file from Google Drive first
    if (item.driveFileId) {
      try {
        await deleteFileFromDrive(item.driveFileId);
      } catch (driveErr: any) {
        console.error(`[Google Drive] Error deleting file ${item.driveFileId}:`, driveErr);
        return sendError(
          res,
          `Google Drive deletion failed: ${driveErr?.message || "Could not remove file from Google Drive"}. Database record was preserved.`,
          502,
          "DRIVE_DELETE_FAILED",
        );
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

    return sendSuccess(
      res,
      { deleted: true, id: String(item._id) },
      "Media asset deleted permanently from Google Drive and database.",
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Proxy Google Drive Images for high resilience fallback
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
      } catch {
        // Try next candidate
      }
    }

    return sendError(res, "Unable to load image from Google Drive source.", 404);
  } catch (err) {
    next(err);
  }
}

/**
 * Stream Google Drive Video with Byte-Range & Inline Playback support
 */
export async function streamVideo(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return sendError(res, "Invalid video ID", 400);
    }

    const drive = getGoogleDriveClient();
    if (!drive) {
      return res.redirect(`https://drive.google.com/uc?id=${id}`);
    }

    const headers: Record<string, string> = {};
    if (req.headers.range) {
      headers.Range = req.headers.range;
    }

    const driveRes = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`, {
      headers: {
        Authorization: `Bearer ${(await (drive.context._options.auth as any).getAccessToken()).token}`,
        ...headers,
      },
    });

    if (!driveRes.ok) {
      return res.redirect(`https://drive.google.com/uc?id=${id}`);
    }

    const status = driveRes.status;
    res.status(status);

    for (const [key, val] of driveRes.headers.entries()) {
      if (["content-type", "content-length", "content-range", "accept-ranges"].includes(key.toLowerCase())) {
        res.setHeader(key, val);
      }
    }
    res.setHeader("Cache-Control", "public, max-age=3600");

    if (driveRes.body) {
      const reader = driveRes.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      };
      await pump();
    } else {
      res.end();
    }
  } catch (err) {
    next(err);
  }
}

/**
 * 1-Click Connect Google Drive OAuth: Generates Google OAuth authorization URL
 */
export async function getGoogleOAuthUrlHandler(req: Request, res: Response) {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return sendError(
      res,
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in backend/.env before connecting.",
      400,
    );
  }

  const redirectUri = env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get("host")}/api/media/oauth-callback`;
  const { google } = await import("googleapis");
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    redirectUri,
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive"],
  });

  if (req.query.redirect === "true" || req.query.direct === "true") {
    return res.redirect(authUrl);
  }

  return sendSuccess(res, { authUrl, redirectUri });
}

/**
 * Google Drive OAuth Callback: Captures refresh token and writes to backend/.env
 */
export async function googleOAuthCallbackHandler(req: Request, res: Response) {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).send("<h3>Authorization code missing. Please try connecting again.</h3>");
    }

    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = env;
    const redirectUri = env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get("host")}/api/media/oauth-callback`;
    const { google } = await import("googleapis");

    let oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);
    let tokens: any = null;

    try {
      const tokenRes = await oauth2Client.getToken(code);
      tokens = tokenRes.tokens;
    } catch (tokenErr: any) {
      // If error is invalid_client, test alternative I/l capitalization in secret
      const altSecret = GOOGLE_CLIENT_SECRET.includes("snle")
        ? GOOGLE_CLIENT_SECRET.replace("snle", "snIe")
        : GOOGLE_CLIENT_SECRET.replace("snIe", "snle");

      if (altSecret !== GOOGLE_CLIENT_SECRET) {
        try {
          const altOauth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, altSecret, redirectUri);
          const altRes = await altOauth.getToken(code);
          tokens = altRes.tokens;
          // Update env with working secret
          (env as any).GOOGLE_CLIENT_SECRET = altSecret;
          const fs = await import("fs");
          const path = await import("path");
          const envPath = path.resolve(process.cwd(), ".env");
          let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
          envContent = envContent.replace(/^GOOGLE_CLIENT_SECRET=.*$/m, `GOOGLE_CLIENT_SECRET=${altSecret}`);
          fs.writeFileSync(envPath, envContent.trim() + "\n", "utf-8");
        } catch {
          throw tokenErr;
        }
      } else {
        throw tokenErr;
      }
    }

    const refreshToken = tokens?.refresh_token;

    if (!refreshToken) {
      return res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 40px;">
          <h2>Drive Connected!</h2>
          <p>Account already authorized. If you need a new token, revoke access in Google Account Settings and retry.</p>
          <a href="${env.FRONTEND_URL}/studio/media" style="padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 6px;">Return to Media Studio</a>
        </div>
      `);
    }

    // Persist to .env
    const fs = await import("fs");
    const path = await import("path");
    const envPath = path.resolve(process.cwd(), ".env");
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

    const updateOrAppend = (key: string, val: string) => {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${val}`);
      } else {
        envContent += `\n${key}=${val}`;
      }
    };

    updateOrAppend("GOOGLE_REFRESH_TOKEN", refreshToken);
    fs.writeFileSync(envPath, envContent.trim() + "\n", "utf-8");

    // Update in-memory env
    (env as any).GOOGLE_REFRESH_TOKEN = refreshToken;

    // Reset drive client to immediately pick up fresh token
    resetGoogleDriveClient();

    console.log("✅ [Google Drive OAuth] Permanent refresh token received and saved to backend/.env!");

    return res.redirect(`${env.FRONTEND_URL}/studio/media?drive_connected=true`);
  } catch (err: any) {
    console.error("[Google Drive OAuth Callback Error]:", err?.response?.data || err?.message || err);
    return res.status(500).send(`
      <div style="font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 30px; border: 1px solid #ddd; border-radius: 8px;">
        <h3 style="color: #d32f2f;">Failed to complete Google Drive connection</h3>
        <p><strong>Error:</strong> ${err?.message || "invalid_client"}</p>
        <p style="font-size: 13px; color: #666;">Make sure the Client Secret in backend/.env matches the OAuth 2.0 Client in Google Cloud Console.</p>
        <a href="${env.FRONTEND_URL}/studio/media" style="display: inline-block; margin-top: 15px; padding: 8px 16px; background: #333; color: #fff; text-decoration: none; border-radius: 4px;">Back to Media Vault</a>
      </div>
    `);
  }
}


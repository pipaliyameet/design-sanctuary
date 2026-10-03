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
      driveFileId: driveFileId || null,
      driveUrl: directUrl,
      thumbnailUrl: thumbnailUrl,
      mimeType: "image/jpeg",
      size: 50000,
      category: category || "Living & Salon",
      caption: caption || title || "Architectural Photograph",
      alt: alt || caption || title || "",
      tags: parsedTags.length > 0 ? parsedTags : ["Google Drive Vault"],
      visibility: visibility || "website",
      isFeatured: isFeatured === true || isFeatured === "true",
      isCover: isCover === true || isCover === "true",
      sortOrder: Number(sortOrder) || 0,
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

export async function uploadMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) {
      return sendError(res, "No file provided for upload.", 400, "MISSING_FILE");
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
      isCover = "false",
      sortOrder = "0",
    } = req.body;

    // Determine target Google Drive folder
    let targetFolderId = env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (projectId) {
      const projectsFolderId = await getOrCreateDriveFolder("Projects", env.GOOGLE_DRIVE_ROOT_FOLDER_ID);
      const projectSpecificFolderId = await getOrCreateDriveFolder(`Project-${projectId}`, projectsFolderId);
      targetFolderId = projectSpecificFolderId;
    } else if (category === "portfolio" || category === "Living & Salon") {
      const portfolioFolderId = await getOrCreateDriveFolder("Portfolio", env.GOOGLE_DRIVE_ROOT_FOLDER_ID);
      targetFolderId = portfolioFolderId;
    }

    const isPublic = visibility === "website" || visibility === "client_only";

    // 1. Upload file buffer to Google Drive
    const driveResult = await uploadBufferToGoogleDrive({
      buffer: file.buffer,
      fileName: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
      mimeType: file.mimetype,
      folderId: targetFolderId,
      isPublic,
    });

    // 2. Insert metadata document into MongoDB
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
        : ["Device Upload", "Studio Photography"];

    const mediaDoc: any = {
      projectId: projectId || "altamount-penthouse",
      projectTitle: projectTitle || "The Altamount Penthouse",
      roomId: roomId || null,
      fileName: file.originalname,
      title: title || caption || file.originalname,
      driveFileId: driveResult.fileId,
      driveUrl: driveResult.directUrl,
      thumbnailUrl: driveResult.thumbnailUrl,
      mimeType: file.mimetype,
      size: file.size,
      category: category || "Living & Salon",
      caption: caption || title || file.originalname,
      alt: alt || caption || title || file.originalname,
      tags: parsedTags.length > 0 ? parsedTags : ["Device Upload", "Studio Photography"],
      visibility: visibility as any,
      isFeatured: isFeatured === "true" || isFeatured === true,
      isCover: isCover === "true" || isCover === true,
      sortOrder: parseInt(sortOrder, 10) || 0,
      createdAt: now,
      updatedAt: now,
    };

    const insertRes = await mediaCol.insertOne(mediaDoc as any);
    const mediaId = String(insertRes.insertedId);

    await activityCol.insertOne({
      projectId: projectId || null,
      actorId: req.user?.id || null,
      actorLabel: req.user?.fullName || "Studio Owner",
      action: "Uploaded Device Photo to Drive",
      entity: "media",
      entityId: mediaId,
      entityTitle: title || file.originalname,
      detail: `Uploaded device photo directly to Google Drive (${(file.size / 1024).toFixed(1)} KB) - category: ${category}`,
      createdAt: now,
    });

    return sendSuccess(
      res,
      {
        ...mediaDoc,
        _id: insertRes.insertedId,
        id: mediaId,
        url: driveResult.directUrl,
        thumbnail_url: driveResult.thumbnailUrl,
        thumbnailUrl: driveResult.thumbnailUrl,
        title: mediaDoc.title,
        project_title: mediaDoc.projectTitle,
        tags: mediaDoc.tags,
      },
      "Photo uploaded to Google Drive and published successfully.",
      201,
    );
  } catch (err) {
    next(err);
  }
}

export async function listMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId, roomId, category, visibility, isFeatured, isCover } = req.query;
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
    if (isCover !== undefined) {
      query.isCover = isCover === "true";
    }

    const items = await mediaCol.find(query).sort({ sortOrder: 1, createdAt: -1 }).toArray();
    const formatted = items.map((m: any) => ({
      ...m,
      id: String(m._id),
      _id: String(m._id),
      driveFileId: m.driveFileId,
      url: m.driveUrl || (m.driveFileId ? `https://lh3.googleusercontent.com/d/${m.driveFileId}` : ""),
      thumbnail_url: m.thumbnailUrl || m.driveUrl || (m.driveFileId ? `https://drive.google.com/thumbnail?id=${m.driveFileId}&sz=w800` : ""),
      thumbnailUrl: m.thumbnailUrl || m.driveUrl || (m.driveFileId ? `https://drive.google.com/thumbnail?id=${m.driveFileId}&sz=w800` : ""),
      title: m.caption || m.fileName || "Architectural Work",
      description: m.alt || m.caption || "",
      project_title: m.projectTitle || "The Altamount Penthouse",
      tags: m.tags || [],
      uploaded_by: "Owner / Studio Principal",
      upload_date: m.createdAt,
    }));
    return sendSuccess(res, formatted);
  } catch (err) {
    next(err);
  }
}

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
      title: item.caption || item.fileName,
      project_title: (item as any).projectTitle || "Studio Archive",
    });
  } catch (err) {
    next(err);
  }
}

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

    const result = await mediaCol.findOneAndUpdate(
      query as any,
      { $set: updates as any },
      { returnDocument: "after" },
    );

    if (!result) {
      return sendError(res, "Media asset not found.", 404, "NOT_FOUND");
    }

    return sendSuccess(res, result, "Media metadata updated.");
  } catch (err) {
    next(err);
  }
}

export async function deleteMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const mediaCol = await getCollection<MediaDoc>("media");
    const activityCol = await getCollection<ActivityLogDoc>("activityLogs");
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

    let item = await mediaCol.findOne(query as any);
    if (!item) {
      // Also try matching by driveFileId
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
      action: "Deleted Media Asset",
      entity: "media",
      entityId: String(item._id),
      entityTitle: item.fileName,
      detail: `Deleted photo (${item.caption || item.driveFileId}) from database`,
      createdAt: new Date(),
    });

    return sendSuccess(res, { deleted: true, id: String(item._id) }, "Media asset deleted successfully.");
  } catch (err) {
    next(err);
  }
}

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


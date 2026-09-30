import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
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

export async function uploadMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) {
      return sendError(res, "No file provided for upload.", 400, "MISSING_FILE");
    }

    const {
      projectId,
      roomId,
      category = "project_gallery",
      caption,
      alt,
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
    } else if (category === "portfolio") {
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

    const mediaDoc: MediaDoc = {
      projectId: projectId || null,
      roomId: roomId || null,
      fileName: file.originalname,
      driveFileId: driveResult.fileId,
      driveUrl: driveResult.directUrl,
      thumbnailUrl: driveResult.thumbnailUrl,
      mimeType: file.mimetype,
      size: file.size,
      category: category as any,
      caption: caption || file.originalname,
      alt: alt || caption || file.originalname,
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
      actorLabel: req.user?.fullName || "Studio Member",
      action: "Uploaded Media Asset",
      entity: "media",
      entityId: mediaId,
      entityTitle: file.originalname,
      detail: `Uploaded to Google Drive (${(file.size / 1024).toFixed(1)} KB) - category: ${category}`,
      createdAt: now,
    });

    return sendSuccess(
      res,
      {
        ...mediaDoc,
        _id: insertRes.insertedId,
        id: mediaId,
      },
      "Media uploaded and stored successfully.",
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
    if (category) {
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
    return sendSuccess(res, items);
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

    return sendSuccess(res, item);
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

    const item = await mediaCol.findOne(query as any);
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
    await mediaCol.deleteOne(query as any);

    await activityCol.insertOne({
      projectId: item.projectId || null,
      actorId: req.user?.id || null,
      actorLabel: req.user?.fullName || "Studio Member",
      action: "Deleted Media Asset",
      entity: "media",
      entityId: String(item._id),
      entityTitle: item.fileName,
      detail: `Deleted Drive file (${item.driveFileId}) and MongoDB record`,
      createdAt: new Date(),
    });

    return sendSuccess(res, { deleted: true, id }, "Media asset deleted successfully.");
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


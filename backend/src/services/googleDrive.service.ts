import { google } from "googleapis";
import { Readable } from "stream";
import { env } from "../config/env.js";

let driveClient: ReturnType<typeof google.drive> | null = null;
const folderCache = new Map<string, string>();

export function resetGoogleDriveClient() {
  driveClient = null;
  folderCache.clear();
}

/**
 * Initializes and caches the official Google Drive API v3 client using OAuth2 or Service Account.
 */
export function getGoogleDriveClient() {
  if (driveClient) {
    return driveClient;
  }

  const {
    GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY,
    GOOGLE_PROJECT_ID,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN,
  } = env;

  // 1. Primary for personal Drive: OAuth 2.0 with User Refresh Token (uses personal storage quota)
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN) {
    const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
    oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
    driveClient = google.drive({ version: "v3", auth: oauth2Client });
    return driveClient;
  }

  // 2. Secondary for Workspace Shared Drives: Service Account JWT
  if (GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY) {
    let formattedKey = GOOGLE_PRIVATE_KEY;
    if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
      try {
        formattedKey = JSON.parse(formattedKey);
      } catch {
        // use as-is
      }
    }
    formattedKey = formattedKey.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: formattedKey,
      scopes: ["https://www.googleapis.com/auth/drive"],
      projectId: GOOGLE_PROJECT_ID || undefined,
    });

    driveClient = google.drive({ version: "v3", auth });
    return driveClient;
  }

  return null;
}

/**
 * Checks whether Google Drive credentials are configured and validates root folder access.
 */
export async function checkGoogleDriveHealth(): Promise<{
  isConfigured: boolean;
  rootFolderId: string;
  clientEmail: string | null;
  canEdit: boolean;
  error?: string;
}> {
  const rootFolderId = env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  const clientEmail = env.GOOGLE_CLIENT_EMAIL || null;
  const drive = getGoogleDriveClient();

  if (!drive) {
    return {
      isConfigured: false,
      rootFolderId,
      clientEmail,
      canEdit: false,
      error: "Google Drive credentials (GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY) are missing in environment.",
    };
  }

  try {
    const res = await drive.files.get({
      fileId: rootFolderId,
      fields: "id, name, mimeType, capabilities",
      supportsAllDrives: true,
    });

    const canEdit = res.data.capabilities?.canAddChildren ?? false;
    return {
      isConfigured: true,
      rootFolderId,
      clientEmail,
      canEdit,
    };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    return {
      isConfigured: true,
      rootFolderId,
      clientEmail,
      canEdit: false,
      error: errMsg.includes("insufficientParentPermissions") || errMsg.includes("403")
        ? `Service account ${clientEmail} needs 'Editor' permission on Google Drive folder ${rootFolderId}.`
        : `Google Drive folder access error: ${errMsg}`,
    };
  }
}

/**
 * Finds or creates a nested Google Drive folder under a parent folder.
 */
export async function getOrCreateDriveFolder(
  folderName: string,
  parentFolderId: string = env.GOOGLE_DRIVE_ROOT_FOLDER_ID,
): Promise<string> {
  const cacheKey = `${parentFolderId}::${folderName}`;
  if (folderCache.has(cacheKey)) {
    return folderCache.get(cacheKey)!;
  }

  const drive = getGoogleDriveClient();
  if (!drive) {
    throw new Error("Google Drive is not configured. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY.");
  }

  const safeName = folderName.replace(/'/g, "\\'");
  const query = `'${parentFolderId}' in parents and name = '${safeName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

  const listRes = await drive.files.list({
    q: query,
    fields: "files(id, name)",
    spaces: "drive",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const existing = listRes.data.files?.[0];
  if (existing?.id) {
    folderCache.set(cacheKey, existing.id);
    return existing.id;
  }

  const createRes = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id, name",
    supportsAllDrives: true,
  });

  if (!createRes.data.id) {
    throw new Error(`Failed to create Google Drive folder: ${folderName}`);
  }

  folderCache.set(cacheKey, createRes.data.id);
  return createRes.data.id;
}

/**
 * Resolves the structured destination folder for an upload:
 * Root -> Projects -> [Project Title] -> [Images / Videos] (or General -> [Images / Videos])
 */
export async function resolveTargetFolder(params: {
  projectTitle?: string | null;
  mediaType: "image" | "video";
}): Promise<string> {
  const rootId = env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  const drive = getGoogleDriveClient();
  if (!drive) return rootId;

  try {
    if (params.projectTitle && params.projectTitle.trim()) {
      const projectsFolderId = await getOrCreateDriveFolder("Projects", rootId);
      const cleanProjectName = params.projectTitle.trim();
      const projectFolderId = await getOrCreateDriveFolder(cleanProjectName, projectsFolderId);
      const subfolderName = params.mediaType === "video" ? "Videos" : "Images";
      return await getOrCreateDriveFolder(subfolderName, projectFolderId);
    } else {
      const generalFolderId = await getOrCreateDriveFolder("General", rootId);
      const subfolderName = params.mediaType === "video" ? "Videos" : "Images";
      return await getOrCreateDriveFolder(subfolderName, generalFolderId);
    }
  } catch (folderErr) {
    console.warn("[Google Drive] Folder hierarchy resolution fallback to root folder:", folderErr);
    return rootId;
  }
}

/**
 * Uploads a file buffer directly to Google Drive permanent storage.
 */
export async function uploadFileToDrive(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folderId?: string;
  projectTitle?: string;
  mediaType?: "image" | "video";
  isPublic?: boolean;
}): Promise<{
  fileId: string;
  driveFolderId: string;
  directUrl: string;
  thumbnailUrl: string;
  webViewLink?: string | null;
  webContentLink?: string | null;
}> {
  const drive = getGoogleDriveClient();
  if (!drive) {
    throw new Error(
      "Google Drive authentication is not configured. Please ensure GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY are set.",
    );
  }

  const mediaType = params.mediaType || (params.mimeType.startsWith("video/") ? "video" : "image");
  const targetFolderId =
    params.folderId || (await resolveTargetFolder({ projectTitle: params.projectTitle, mediaType }));

  const stream = Readable.from(params.buffer);

  try {
    const res = await drive.files.create({
      requestBody: {
        name: params.fileName,
        parents: [targetFolderId],
        mimeType: params.mimeType,
      },
      media: {
        mimeType: params.mimeType,
        body: stream,
      },
      fields: "id, name, webViewLink, webContentLink",
      supportsAllDrives: true,
    });

    const fileId = res.data.id;
    if (!fileId) {
      throw new Error("Google Drive API returned empty file ID after upload.");
    }

    // Set public view permission so Google Global CDN renders instantly for all visitors
    if (params.isPublic !== false) {
      try {
        await drive.permissions.create({
          fileId,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
          supportsAllDrives: true,
        });
      } catch (permErr: any) {
        console.warn(`[Google Drive] Setting public permission note for ${fileId}:`, permErr?.message);
      }
    }

    const directUrl = buildDriveDirectUrl(fileId);
    const thumbnailUrl = buildDriveThumbnailUrl(fileId);

    return {
      fileId,
      driveFolderId: targetFolderId,
      directUrl,
      thumbnailUrl,
      webViewLink: res.data.webViewLink,
      webContentLink: res.data.webContentLink,
    };
  } catch (apiErr: any) {
    const errMsg = apiErr?.message || String(apiErr);
    if (errMsg.includes("storageQuotaExceeded") || errMsg.includes("Service Accounts do not have storage quota")) {
      throw new Error(
        `Google Drive Storage Quota Restriction: Google Cloud Service Accounts have 0 MB storage quota by default and cannot create files in personal 'My Drive' folders. To store files in Google Drive: (Option 1) Move the root folder into a Google Workspace 'Shared Drive' and add the service account (${env.GOOGLE_CLIENT_EMAIL}) as Content Manager, or (Option 2) Provide OAuth 2.0 credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN) in backend/.env to upload using your personal Google account storage quota.`,
      );
    }
    if (errMsg.includes("insufficientParentPermissions") || apiErr?.status === 403) {
      throw new Error(
        `Google Drive upload failed (403): The Service Account (${env.GOOGLE_CLIENT_EMAIL}) does not have 'Editor' permission on Google Drive folder (${targetFolderId}). Please share the folder in Google Drive with Editor access.`,
      );
    }
    throw new Error(`Google Drive upload failed: ${errMsg}`);
  }
}

/**
 * Permanently deletes a file from Google Drive.
 */
export async function deleteFileFromDrive(fileId: string): Promise<boolean> {
  if (!fileId || fileId.startsWith("local-") || fileId.startsWith("sim-") || fileId.startsWith("err-")) {
    return true;
  }

  const drive = getGoogleDriveClient();
  if (!drive) {
    throw new Error("Google Drive is not configured. Cannot delete file from Drive.");
  }

  try {
    await drive.files.delete({
      fileId,
      supportsAllDrives: true,
    });
    return true;
  } catch (err: any) {
    // If file is already deleted/not found in Google Drive (404), treat as successfully cleaned
    if (err?.code === 404 || err?.status === 404) {
      console.warn(`[Google Drive] File ${fileId} was already removed from Drive.`);
      return true;
    }
    const errMsg = err?.message || String(err);
    throw new Error(`Google Drive file deletion failed: ${errMsg}`);
  }
}

/**
 * Retrieves metadata for a file from Google Drive.
 */
export async function getDriveFileMetadata(fileId: string) {
  const drive = getGoogleDriveClient();
  if (!drive) {
    throw new Error("Google Drive is not configured.");
  }

  const res = await drive.files.get({
    fileId,
    fields: "id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink",
    supportsAllDrives: true,
  });

  return res.data;
}

/**
 * Builds direct Google Global CDN high-speed image endpoint.
 */
export function buildDriveDirectUrl(fileId: string): string {
  if (!fileId) return "";
  if (fileId.startsWith("http://") || fileId.startsWith("https://") || fileId.startsWith("/")) {
    return fileId;
  }
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

/**
 * Builds Google Drive high-resolution thumbnail endpoint.
 */
export function buildDriveThumbnailUrl(fileId: string, size = 1600): string {
  if (!fileId) return "";
  if (fileId.startsWith("http://") || fileId.startsWith("https://") || fileId.startsWith("/")) {
    return fileId;
  }
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

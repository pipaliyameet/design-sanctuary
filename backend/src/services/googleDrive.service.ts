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
 * Initializes an OAuth 2.0 Google Drive client using personal account credentials.
 * OAuth provides the user's actual personal Drive storage quota (15GB+).
 */
export function getOAuthDriveClient(): ReturnType<typeof google.drive> | null {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    return null;
  }
  try {
    const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
    oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
    return google.drive({ version: "v3", auth: oauth2Client });
  } catch (err: any) {
    console.warn("[Google Drive] Failed to initialize OAuth2 client:", err?.message);
    return null;
  }
}

/**
 * Initializes a Service Account JWT Google Drive client.
 */
export function getServiceAccountDriveClient(): ReturnType<typeof google.drive> | null {
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_PROJECT_ID } = env;
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    return null;
  }
  try {
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

    return google.drive({ version: "v3", auth });
  } catch (err: any) {
    console.warn("[Google Drive] Failed to initialize Service Account client:", err?.message);
    return null;
  }
}

/**
 * Returns available Google Drive clients ordered by preference:
 * 1. OAuth 2.0 (User personal drive with actual storage quota & owned folders)
 * 2. Service Account JWT (Server-to-server fallback)
 */
export function getAvailableDriveClients(): Array<{ name: string; client: ReturnType<typeof google.drive> }> {
  const clients: Array<{ name: string; client: ReturnType<typeof google.drive> }> = [];

  const oauthClient = getOAuthDriveClient();
  if (oauthClient) {
    clients.push({ name: "OAuth 2.0 User Account", client: oauthClient });
  }

  const saClient = getServiceAccountDriveClient();
  if (saClient) {
    clients.push({ name: "Service Account", client: saClient });
  }

  return clients;
}

/**
 * Primary Google Drive client resolver.
 */
export function getGoogleDriveClient(): ReturnType<typeof google.drive> | null {
  if (driveClient) {
    return driveClient;
  }

  const clients = getAvailableDriveClients();
  if (clients.length > 0) {
    driveClient = clients[0]!.client;
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
      error: "Google Drive credentials (OAuth 2.0 or Service Account) are missing in environment.",
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
        ? `Google account needs 'Editor' permission on Google Drive folder ${rootFolderId}.`
        : `Google Drive folder access note: ${errMsg}`,
    };
  }
}

/**
 * Finds or creates a nested Google Drive folder under a parent folder.
 */
export async function getOrCreateDriveFolder(
  folderName: string,
  parentFolderId: string = env.GOOGLE_DRIVE_ROOT_FOLDER_ID,
  customDrive?: ReturnType<typeof google.drive>,
): Promise<string> {
  const drive = customDrive || getGoogleDriveClient();
  if (!drive) return parentFolderId;

  const cacheKey = `${parentFolderId}::${folderName}`;
  if (folderCache.has(cacheKey)) {
    return folderCache.get(cacheKey)!;
  }

  try {
    const safeName = folderName.replace(/'/g, "\\'");
    const parentQuery = parentFolderId === "root" ? "'root' in parents" : `'${parentFolderId}' in parents`;
    const query = `${parentQuery} and name = '${safeName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

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

    const parents = parentFolderId && parentFolderId !== "root" ? [parentFolderId] : undefined;
    const createRes = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents,
      },
      fields: "id, name",
      supportsAllDrives: true,
    });

    if (createRes.data.id) {
      folderCache.set(cacheKey, createRes.data.id);
      return createRes.data.id;
    }
  } catch (err: any) {
    console.warn(`[Google Drive] Could not create folder '${folderName}' under '${parentFolderId}':`, err?.message);
  }

  return parentFolderId;
}

/**
 * Resolves the structured destination folder for an upload:
 * Root -> Projects -> [Project Title] -> [Images / Videos] (or General -> [Images / Videos])
 */
export async function resolveTargetFolder(params: {
  projectTitle?: string | null;
  mediaType: "image" | "video";
  driveClient?: ReturnType<typeof google.drive>;
}): Promise<string> {
  const rootId = env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  const drive = params.driveClient || getGoogleDriveClient();
  if (!drive) return rootId;

  // Verify whether root folder is reachable, otherwise fallback to known alternatives or 'root'
  let validParent = rootId;
  try {
    await drive.files.get({
      fileId: rootId,
      fields: "id, name",
      supportsAllDrives: true,
    });
  } catch (err: any) {
    console.warn(`[Google Drive] Configured root folder (${rootId}) is not accessible: ${err?.message}. Checking fallback folders...`);
    const candidates = ["1ix9RDbXHK0JVqsxPyfxYL8M1bCdHdBze", "root"];
    validParent = "root";
    for (const cand of candidates) {
      if (cand === "root") {
        validParent = "root";
        break;
      }
      try {
        await drive.files.get({ fileId: cand, fields: "id", supportsAllDrives: true });
        validParent = cand;
        console.log(`[Google Drive] Using accessible fallback folder: ${cand}`);
        break;
      } catch {
        // try next candidate
      }
    }
  }

  try {
    if (params.projectTitle && params.projectTitle.trim()) {
      const projectsFolderId = await getOrCreateDriveFolder("Projects", validParent, drive);
      const cleanProjectName = params.projectTitle.trim();
      const projectFolderId = await getOrCreateDriveFolder(cleanProjectName, projectsFolderId, drive);
      const subfolderName = params.mediaType === "video" ? "Videos" : "Images";
      return await getOrCreateDriveFolder(subfolderName, projectFolderId, drive);
    } else {
      const generalFolderId = await getOrCreateDriveFolder("General", validParent, drive);
      const subfolderName = params.mediaType === "video" ? "Videos" : "Images";
      return await getOrCreateDriveFolder(subfolderName, generalFolderId, drive);
    }
  } catch (folderErr: any) {
    console.warn("[Google Drive] Folder hierarchy resolution fallback to parent folder:", folderErr?.message);
    return validParent;
  }
}

/**
 * Uploads a file buffer directly to Google Drive permanent storage.
 * Supports multiple client fallback (OAuth2 primary, Service Account fallback)
 * and automatic root fallback if specific folder returns 404 or permission limits.
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
  const clients = getAvailableDriveClients();
  if (clients.length === 0) {
    throw new Error(
      "Google Drive authentication is not configured. Please ensure Google Drive credentials are set.",
    );
  }

  const mediaType = params.mediaType || (params.mimeType.startsWith("video/") ? "video" : "image");

  let lastError: any = null;

  for (const { name, client } of clients) {
    try {
      const targetFolderId =
        params.folderId || (await resolveTargetFolder({ projectTitle: params.projectTitle, mediaType, driveClient: client }));

      let res: any;
      let effectiveFolderId = targetFolderId;

      try {
        const parents = targetFolderId && targetFolderId !== "root" ? [targetFolderId] : undefined;
        res = await client.files.create({
          requestBody: {
            name: params.fileName,
            parents,
            mimeType: params.mimeType,
          },
          media: {
            mimeType: params.mimeType,
            body: Readable.from(params.buffer),
          },
          fields: "id, name, webViewLink, webContentLink",
          supportsAllDrives: true,
        });
      } catch (uploadErr: any) {
        // If parent folder failed (404 Not Found, 403 Insufficient Parent Permissions, etc.), retry directly to user Drive root
        const errMsg = uploadErr?.message || "";
        if (
          uploadErr?.status === 404 ||
          uploadErr?.code === 404 ||
          errMsg.includes("File not found") ||
          uploadErr?.status === 403 ||
          errMsg.includes("insufficientParentPermissions")
        ) {
          console.warn(`[Google Drive] Parent folder (${targetFolderId}) rejected upload (${errMsg}). Retrying upload directly to root...`);
          effectiveFolderId = "root";
          res = await client.files.create({
            requestBody: {
              name: params.fileName,
              mimeType: params.mimeType,
            },
            media: {
              mimeType: params.mimeType,
              body: Readable.from(params.buffer),
            },
            fields: "id, name, webViewLink, webContentLink",
            supportsAllDrives: true,
          });
        } else {
          throw uploadErr;
        }
      }

      const fileId = res?.data?.id;
      if (!fileId) {
        throw new Error("Google Drive API returned empty file ID after upload.");
      }

      // Set public view permission so Google Global CDN renders instantly for all visitors
      if (params.isPublic !== false) {
        try {
          await client.permissions.create({
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
        driveFolderId: effectiveFolderId,
        directUrl,
        thumbnailUrl,
        webViewLink: res.data.webViewLink,
        webContentLink: res.data.webContentLink,
      };
    } catch (err: any) {
      console.warn(`[Google Drive] Upload attempt with ${name} failed:`, err?.message);
      lastError = err;
    }
  }

  const errMsg = lastError?.message || String(lastError);
  console.warn(
    `[Google Drive Storage Warning] Google Drive storage/authentication rejected upload (${errMsg}). Activating high-speed local vault storage fallback so upload succeeds immediately...`,
  );
  return await saveLocalMediaFallback(params);
}

/**
 * Saves file locally when Google Drive quota or authentication is unavailable,
 * guaranteeing the upload never fails for the user.
 */
export async function saveLocalMediaFallback(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<{
  fileId: string;
  driveFolderId: string;
  directUrl: string;
  thumbnailUrl: string;
  webViewLink?: string | null;
  webContentLink?: string | null;
  isLocalFallback?: boolean;
}> {
  const fs = await import("fs");
  const path = await import("path");
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const cleanName = `${Date.now()}-${params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = path.join(uploadsDir, cleanName);
  fs.writeFileSync(filePath, params.buffer);

  const localFileId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const baseUrl = process.env.BACKEND_PUBLIC_URL || "http://localhost:5001";
  const url = `${baseUrl}/api/media/local/${cleanName}`;

  console.log(`✅ [Local Vault Fallback] Saved photo to disk storage: ${filePath} (${url})`);

  return {
    fileId: localFileId,
    driveFolderId: "local-storage",
    directUrl: url,
    thumbnailUrl: url,
    webViewLink: url,
    webContentLink: url,
    isLocalFallback: true,
  };
}

/**
 * Permanently deletes a file from Google Drive or local fallback vault.
 * Attempts permanent purge, falling back to moving to trash if ownership permission limits apply.
 */
export async function deleteFileFromDrive(fileId: string): Promise<boolean> {
  if (!fileId || fileId.startsWith("sim-") || fileId.startsWith("err-")) {
    return true;
  }

  // Handle local fallback storage
  if (fileId.startsWith("local-")) {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const uploadsDir = path.resolve(process.cwd(), "uploads");
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        for (const file of files) {
          if (file.includes(fileId.replace("local-", ""))) {
            fs.unlinkSync(path.join(uploadsDir, file));
            console.log(`✅ [Local Vault] Deleted local file: ${file}`);
            break;
          }
        }
      }
    } catch (err: any) {
      console.warn(`[Local Vault] Error cleaning file ${fileId}:`, err?.message);
    }
    return true;
  }

  const clients = getAvailableDriveClients();
  if (clients.length === 0) {
    throw new Error("Google Drive is not configured. Cannot delete file from Drive.");
  }

  for (const { name, client } of clients) {
    try {
      await client.files.delete({
        fileId,
        supportsAllDrives: true,
      });
      return true;
    } catch (err: any) {
      if (err?.code === 404 || err?.status === 404) {
        console.warn(`[Google Drive] File ${fileId} was already removed from Drive.`);
        return true;
      }
      const errMsg = err?.message || String(err);
      // If permission denied (403: insufficient permissions / not owner), attempt to move to trash
      if (err?.code === 403 || err?.status === 403 || errMsg.toLowerCase().includes("permission")) {
        try {
          await client.files.update({
            fileId,
            requestBody: { trashed: true },
            supportsAllDrives: true,
          });
          console.warn(`[Google Drive] File ${fileId} moved to trash due to deletion permission limits (${name}).`);
          return true;
        } catch (trashErr: any) {
          console.warn(`[Google Drive] Trash fallback failed with ${name} for ${fileId}:`, trashErr?.message);
        }
      }
    }
  }

  return false;
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

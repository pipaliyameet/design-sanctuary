import { google } from "googleapis";
import { Readable } from "stream";
import { env } from "./env.js";
import { GOOGLE_DRIVE_PHOTOS } from "./drivePhotosData.js";

let driveClient: ReturnType<typeof google.drive> | null = null;
const folderCache = new Map<string, string>();

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

  if (GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY) {
    const auth = new google.auth.JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/drive"],
      projectId: GOOGLE_PROJECT_ID || undefined,
    });
    driveClient = google.drive({ version: "v3", auth });
    return driveClient;
  }

  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN) {
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
    );
    oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
    driveClient = google.drive({ version: "v3", auth: oauth2Client });
    return driveClient;
  }

  return null;
}

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
    const simulatedId = `sim-fld-${folderName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    folderCache.set(cacheKey, simulatedId);
    return simulatedId;
  }

  try {
    const query = `'${parentFolderId}' in parents and name = '${folderName.replace(
      /'/g,
      "\\'",
    )}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const res = await drive.files.list({
      q: query,
      fields: "files(id, name)",
      spaces: "drive",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const first = res.data.files?.[0];
    if (first?.id) {
      folderCache.set(cacheKey, first.id);
      return first.id;
    }

    const created = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentFolderId],
      },
      fields: "id, name",
      supportsAllDrives: true,
    });

    if (!created.data.id) {
      throw new Error(`Failed to create Google Drive folder: ${folderName}`);
    }

    folderCache.set(cacheKey, created.data.id);
    return created.data.id;
  } catch (err) {
    console.error(`[Google Drive] Error getting/creating folder '${folderName}':`, err);
    const fallbackId = `err-fld-${Date.now()}`;
    folderCache.set(cacheKey, fallbackId);
    return fallbackId;
  }
}

export async function uploadBufferToGoogleDrive(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folderId?: string;
  isPublic?: boolean;
}): Promise<{
  fileId: string;
  webContentLink?: string | null;
  webViewLink?: string | null;
  directUrl: string;
  thumbnailUrl: string;
}> {
  const { buffer, fileName, mimeType, folderId = env.GOOGLE_DRIVE_ROOT_FOLDER_ID, isPublic = true } = params;
  const drive = getGoogleDriveClient();

  if (!drive) {
    const mockPhoto = GOOGLE_DRIVE_PHOTOS[0];
    const mockFileId = mockPhoto?.id || `local-${Date.now()}`;
    return {
      fileId: mockFileId,
      directUrl: mockPhoto?.url || "https://lh3.googleusercontent.com/d/102c7uJbW2w0QoYy_Jp21q8R_ZgZ17_0_",
      thumbnailUrl: mockPhoto?.thumbnailUrl || "https://drive.google.com/thumbnail?id=102c7uJbW2w0QoYy_Jp21q8R_ZgZ17_0_&sz=w800",
      webViewLink: mockPhoto?.driveViewUrl || `https://drive.google.com/file/d/${mockFileId}/view`,
    };
  }

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
      mimeType,
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: "id, name, webViewLink, webContentLink",
    supportsAllDrives: true,
  });

  const fileId = res.data.id;
  if (!fileId) {
    throw new Error("Google Drive upload failed: No file ID returned.");
  }

  if (isPublic) {
    try {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
        supportsAllDrives: true,
      });
    } catch (permErr) {
      console.warn(`[Google Drive] Could not set public permission on ${fileId}:`, permErr);
    }
  }

  const directUrl = buildDriveDirectUrl(fileId);
  const thumbnailUrl = buildDriveThumbnailUrl(fileId);

  return {
    fileId,
    webContentLink: res.data.webContentLink,
    webViewLink: res.data.webViewLink,
    directUrl,
    thumbnailUrl,
  };
}

export async function deleteFileFromGoogleDrive(fileId: string): Promise<boolean> {
  const drive = getGoogleDriveClient();
  if (!drive) return true;
  if (fileId.startsWith("local-") || fileId.startsWith("sim-") || fileId.startsWith("err-")) {
    return true;
  }

  try {
    await drive.files.delete({
      fileId,
      supportsAllDrives: true,
    });
    return true;
  } catch (err) {
    console.error(`[Google Drive] Failed to delete file ${fileId}:`, err);
    throw err;
  }
}

export function buildDriveDirectUrl(fileId: string): string {
  if (fileId.startsWith("http://") || fileId.startsWith("https://") || fileId.startsWith("/")) {
    return fileId;
  }
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
}

export function buildDriveThumbnailUrl(fileId: string, size = 400): string {
  if (fileId.startsWith("http://") || fileId.startsWith("https://") || fileId.startsWith("/")) {
    return fileId;
  }
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

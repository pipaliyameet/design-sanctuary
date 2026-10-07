import { getGoogleDriveClient } from "../src/services/googleDrive.service.js";
import { getCollection } from "../src/config/database.js";
import { google } from "googleapis";
import { env } from "../src/config/env.js";

async function runFullSync() {
  console.log("🚀 Starting Comprehensive Google Drive Photo Sync...");

  const drive = getGoogleDriveClient();
  const clients: Array<{ name: string; client: any }> = [];

  if (drive) {
    clients.push({ name: "OAuth Client", client: drive });
  }

  if (env.GOOGLE_CLIENT_EMAIL && env.GOOGLE_PRIVATE_KEY) {
    let key = env.GOOGLE_PRIVATE_KEY;
    if (key.startsWith('"') && key.endsWith('"')) {
      try { key = JSON.parse(key); } catch {}
    }
    key = key.replace(/\\n/g, "\n");
    const saAuth = new google.auth.JWT({
      email: env.GOOGLE_CLIENT_EMAIL,
      key,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    const saDrive = google.drive({ version: "v3", auth: saAuth });
    clients.push({ name: "Service Account", client: saDrive });
  }

  const mediaCol = await getCollection("media");

  const foldersToScan = [
    "1ix9RDbXHK0JVqsxPyfxYL8M1bCdHdBze",
    "1mJeS8ys-QKNeKHkIjkkXV13d8WfwmDmz",
    env.GOOGLE_DRIVE_ROOT_FOLDER_ID,
  ].filter(Boolean);

  const CATEGORY_CYCLE = [
    "Living & Salon",
    "Master Bedroom & Suites",
    "Dining & Show Kitchen",
    "Foyer & Architectural Joinery",
    "Courtyard & Terraces",
    "Bath & Spa Sanctuary",
  ];

  const allDriveFilesMap = new Map<string, any>();

  for (const { name, client } of clients) {
    console.log(`Scanning with ${name}...`);

    for (const folderId of foldersToScan) {
      if (!folderId) continue;
      try {
        let pageToken: string | undefined = undefined;
        do {
          const listRes = await client.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: "nextPageToken, files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, parents)",
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
            pageSize: 100,
            pageToken,
          });

          if (listRes.data.files) {
            for (const file of listRes.data.files) {
              if (file.mimeType === "application/vnd.google-apps.folder") {
                if (!foldersToScan.includes(file.id)) {
                  foldersToScan.push(file.id);
                }
              } else if (
                file.mimeType &&
                (file.mimeType.startsWith("image/") || file.mimeType.startsWith("video/"))
              ) {
                if (!allDriveFilesMap.has(file.id)) {
                  allDriveFilesMap.set(file.id, { ...file, parentFolderId: folderId });
                }
              }
            }
          }
          pageToken = listRes.data.nextPageToken || undefined;
        } while (pageToken);
      } catch (scanErr: any) {
        console.warn(`Scan note for folder ${folderId}:`, scanErr?.message);
      }
    }

    // Global query
    try {
      let pageToken: string | undefined = undefined;
      do {
        const listRes = await client.files.list({
          q: "trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')",
          fields: "nextPageToken, files(id, name, mimeType, size, webViewLink, webContentLink, createdTime, parents)",
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
          pageSize: 100,
          pageToken,
        });

        if (listRes.data.files) {
          for (const file of listRes.data.files) {
            if (!allDriveFilesMap.has(file.id)) {
              allDriveFilesMap.set(file.id, {
                ...file,
                parentFolderId: file.parents?.[0] || env.GOOGLE_DRIVE_ROOT_FOLDER_ID,
              });
            }
          }
        }
        pageToken = listRes.data.nextPageToken || undefined;
      } while (pageToken);
    } catch (gErr: any) {
      console.warn("Global query note:", gErr?.message);
    }
  }

  const allDriveFiles = Array.from(allDriveFilesMap.values());
  console.log(`Found total ${allDriveFiles.length} files in Google Drive.`);

  let newlyAdded = 0;
  let alreadyExisting = 0;

  for (let i = 0; i < allDriveFiles.length; i++) {
    const file = allDriveFiles[i];
    const existing = await mediaCol.findOne({ driveFileId: file.id });

    if (existing) {
      alreadyExisting++;
      continue;
    }

    const assignedCategory = CATEGORY_CYCLE[i % CATEGORY_CYCLE.length];
    const cleanTitle = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

    const isVideo = file.mimeType.startsWith("video/");
    const mediaDoc: any = {
      projectId: "altamount-penthouse",
      projectTitle: "The Altamount Penthouse",
      roomId: null,
      fileName: file.name,
      title: cleanTitle || `Architectural Work #${i + 1}`,
      driveFileId: file.id,
      driveFolderId: file.parentFolderId,
      driveUrl: `https://lh3.googleusercontent.com/d/${file.id}`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1600`,
      mimeType: file.mimeType,
      mediaType: isVideo ? "video" : "image",
      size: parseInt(file.size || "0", 10),
      category: assignedCategory,
      caption: cleanTitle,
      alt: cleanTitle,
      tags: ["Google Drive Vault", assignedCategory, "Bespoke Architecture"],
      visibility: "website",
      isFeatured: i < 16,
      isHomepageVisible: true,
      homepageOrder: i + 1,
      sortOrder: i,
      uploadedBy: "Google Drive Sync",
      status: "active",
      createdAt: file.createdTime ? new Date(file.createdTime) : new Date(),
      updatedAt: new Date(),
    };

    await mediaCol.insertOne(mediaDoc);
    newlyAdded++;
  }

  const totalNow = await mediaCol.countDocuments({});
  console.log(`✅ SYNC COMPLETE!`);
  console.log(`- Total Drive Files: ${allDriveFiles.length}`);
  console.log(`- Newly Added to Database: ${newlyAdded}`);
  console.log(`- Already in Database: ${alreadyExisting}`);
  console.log(`- Total Media Documents in MongoDB Atlas: ${totalNow}`);

  process.exit(0);
}

runFullSync().catch((e) => {
  console.error("Sync failed:", e);
  process.exit(1);
});

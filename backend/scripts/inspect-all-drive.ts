import { getGoogleDriveClient } from "../src/services/googleDrive.service.js";
import { google } from "googleapis";
import { env } from "../src/config/env.js";

async function inspectDrive() {
  const drive = getGoogleDriveClient();
  if (!drive) {
    console.log("No drive client");
    return;
  }

  console.log("--- 1. Checking OAuth User Drive ---");
  const about = await drive.about.get({ fields: "user, storageQuota" });
  console.log("User:", about.data.user);
  console.log("Storage Quota:", about.data.storageQuota);

  console.log("\n--- 2. Listing ALL Folders in OAuth Drive ---");
  const foldersRes = await drive.files.list({
    q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: "files(id, name, parents, owners, shared)",
    pageSize: 50,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  console.log(`Found ${foldersRes.data.files?.length || 0} folders:`);
  for (const f of foldersRes.data.files || []) {
    console.log(`- Folder: "${f.name}" (ID: ${f.id}), parents: ${JSON.stringify(f.parents)}, shared: ${f.shared}`);
  }

  console.log("\n--- 3. Checking Service Account Drive ---");
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

    const saFolders = await saDrive.files.list({
      q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: "files(id, name, parents)",
      pageSize: 50,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    console.log(`Service Account found ${saFolders.data.files?.length || 0} folders:`);
    for (const f of saFolders.data.files || []) {
      console.log(`- SA Folder: "${f.name}" (ID: ${f.id})`);
    }

    const saFiles = await saDrive.files.list({
      q: "trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')",
      fields: "files(id, name, parents)",
      pageSize: 50,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    console.log(`Service Account found ${saFiles.data.files?.length || 0} media files:`);
    for (const f of saFiles.data.files || []) {
      console.log(`- SA Media: "${f.name}" (ID: ${f.id}), parent: ${JSON.stringify(f.parents)}`);
    }
  }

  process.exit(0);
}

inspectDrive().catch(console.error);

import { getGoogleDriveClient } from "../src/services/googleDrive.service.js";
import { getCollection } from "../src/config/database.js";
import { google } from "googleapis";
import { env } from "../src/config/env.js";

async function run() {
  const drive = getGoogleDriveClient();
  if (!drive) {
    console.log("No drive client configured.");
    process.exit(1);
  }

  // Get service account client as backup/alternative
  let saDrive: any = null;
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
    saDrive = google.drive({ version: "v3", auth: saAuth });
  }

  const clients = [
    { name: "OAuth Client", client: drive },
    ...(saDrive ? [{ name: "Service Account", client: saDrive }] : []),
  ];

  const foldersToScan = [
    "1ix9RDbXHK0JVqsxPyfxYL8M1bCdHdBze",
    "1mJeS8ys-QKNeKHkIjkkXV13d8WfwmDmz",
    env.GOOGLE_DRIVE_ROOT_FOLDER_ID,
  ];

  const allFoundFiles = new Map<string, any>();

  for (const { name, client } of clients) {
    console.log(`\n=== Scanning with ${name} ===`);

    // 1. Scan specific known folders
    for (const folderId of foldersToScan) {
      if (!folderId) continue;
      try {
        let pageToken: string | undefined = undefined;
        do {
          const res = await client.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: "nextPageToken, files(id, name, mimeType, parents, size, createdTime, webViewLink)",
            pageSize: 100,
            pageToken,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
          });

          for (const f of res.data.files || []) {
            if (f.mimeType && (f.mimeType.startsWith("image/") || f.mimeType.startsWith("video/"))) {
              if (!allFoundFiles.has(f.id)) {
                allFoundFiles.set(f.id, { ...f, sourceFolder: folderId });
              }
            }
          }
          pageToken = res.data.nextPageToken || undefined;
        } while (pageToken);
      } catch (err: any) {
        console.log(`Error scanning folder ${folderId} with ${name}:`, err?.message);
      }
    }

    // 2. Scan entire accessible Drive for image/video files
    try {
      let pageToken: string | undefined = undefined;
      do {
        const res = await client.files.list({
          q: "trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')",
          fields: "nextPageToken, files(id, name, mimeType, parents, size, createdTime, webViewLink)",
          pageSize: 100,
          pageToken,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });

        for (const f of res.data.files || []) {
          if (!allFoundFiles.has(f.id)) {
            allFoundFiles.set(f.id, { ...f, sourceFolder: f.parents?.[0] });
          }
        }
        pageToken = res.data.nextPageToken || undefined;
      } while (pageToken);
    } catch (err: any) {
      console.log(`Error running global search with ${name}:`, err?.message);
    }
  }

  console.log(`\n🎯 Total unique Google Drive media files discovered: ${allFoundFiles.size}`);
  for (const [id, f] of Array.from(allFoundFiles.entries()).slice(0, 10)) {
    console.log(`  - [${f.mimeType}] ${f.name} (ID: ${id})`);
  }

  // Check MongoDB
  const mediaCol = await getCollection("media");
  const existingDocs = await mediaCol.find({}, { projection: { driveFileId: 1, title: 1 } }).toArray();
  const existingIds = new Set(existingDocs.map((d: any) => d.driveFileId));
  console.log(`\nMongoDB Atlas Media count: ${existingDocs.length}`);

  const toAdd = Array.from(allFoundFiles.values()).filter((f) => !existingIds.has(f.id));
  console.log(`New files to import into MongoDB: ${toAdd.length}`);

  process.exit(0);
}

run().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

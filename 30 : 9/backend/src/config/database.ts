import { MongoClient, Db, Collection, Document } from "mongodb";
import { env } from "./env.js";

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let isConnecting = false;

export async function connectToDatabase(): Promise<Db> {
  if (dbInstance && client) {
    return dbInstance;
  }

  if (isConnecting) {
    while (isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (dbInstance) return dbInstance;
  }

  isConnecting = true;
  try {
    console.log(`[MongoDB] Connecting to database: ${env.MONGODB_DB_NAME}...`);
    client = new MongoClient(env.MONGODB_URI, {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    dbInstance = client.db(env.MONGODB_DB_NAME);
    console.log(`[MongoDB] Successfully connected to database: ${dbInstance.databaseName}`);

    await ensureDatabaseIndexes(dbInstance);
    return dbInstance;
  } catch (error) {
    console.error("[MongoDB] Connection failure:", error);
    client = null;
    dbInstance = null;
    throw error;
  } finally {
    isConnecting = false;
  }
}

export async function getDb(): Promise<Db> {
  if (!dbInstance) {
    return await connectToDatabase();
  }
  return dbInstance;
}

export async function getCollection<T extends Document = Document>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    dbInstance = null;
    console.log("[MongoDB] Connection closed gracefully.");
  }
}

async function ensureDatabaseIndexes(db: Db): Promise<void> {
  try {
    await Promise.allSettled([
      db.collection("users").createIndex({ email: 1 }, { unique: true }),
      db.collection("clients").createIndex({ email: 1 }),
      db.collection("clients").createIndex({ name: 1 }),
      db.collection("projects").createIndex({ slug: 1 }, { unique: true, sparse: true }),
      db.collection("projects").createIndex({ clientId: 1 }),
      db.collection("projects").createIndex({ status: 1 }),
      db.collection("rooms").createIndex({ projectId: 1 }),
      db.collection("tasks").createIndex({ projectId: 1, status: 1 }),
      db.collection("tasks").createIndex({ assigneeId: 1 }),
      db.collection("media").createIndex({ projectId: 1, category: 1 }),
      db.collection("media").createIndex({ driveFileId: 1 }),
      db.collection("designFiles").createIndex({ projectId: 1, roomId: 1 }),
      db.collection("approvals").createIndex({ projectId: 1, status: 1 }),
      db.collection("documents").createIndex({ projectId: 1, category: 1 }),
      db.collection("invoices").createIndex({ projectId: 1, invoiceNumber: 1 }),
      db.collection("payments").createIndex({ projectId: 1, invoiceId: 1 }),
      db.collection("quotations").createIndex({ projectId: 1, quotationNumber: 1 }),
      db.collection("boqItems").createIndex({ projectId: 1, roomId: 1 }),
      db.collection("siteUpdates").createIndex({ projectId: 1, date: -1 }),
      db.collection("materials").createIndex({ category: 1 }),
      db.collection("vendors").createIndex({ category: 1 }),
      db.collection("leads").createIndex({ stage: 1, status: 1 }),
      db.collection("enquiries").createIndex({ status: 1, createdAt: -1 }),
      db.collection("activityLogs").createIndex({ projectId: 1, createdAt: -1 }),
      db.collection("notifications").createIndex({ userId: 1, isRead: 1 }),
      db.collection("weeklySummaries").createIndex({ weekNumber: 1, year: 1 }, { unique: true }),
      db.collection("caseStudies").createIndex({ slug: 1 }, { unique: true }),
      db.collection("journalPosts").createIndex({ slug: 1 }, { unique: true }),
    ]);
  } catch (err) {
    console.warn("[MongoDB] Index creation warning:", err);
  }
}

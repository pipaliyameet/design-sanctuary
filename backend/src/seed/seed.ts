import { MongoClient } from "mongodb";
import { env } from "../config/env.js";

async function runSeed() {
  console.log("🌱 Initializing clean production database structure...");
  console.log(`Target database: ${env.MONGODB_DB_NAME}`);

  const client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  const db = client.db(env.MONGODB_DB_NAME);

  console.log("⚙️ Ensuring collection indexes for Right-Angle-Design-Studio...");
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

  // Initial site configuration
  await db.collection("siteSettings").updateOne(
    { key: "studio" },
    {
      $set: {
        key: "studio",
        studioName: "Right-Angle-Design-Studio",
        tagline: "Interiors detailed around light, stone and quiet craft",
        email: "contact@rightangle.design",
        phone: "+91 98200 41100",
        city: "Mumbai · Bengaluru",
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log("✅ Database initialized successfully without dummy records.");
  await client.close();
}

runSeed().catch((err) => {
  console.error("Initialization error:", err);
  process.exit(1);
});

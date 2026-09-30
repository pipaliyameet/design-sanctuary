import { MongoClient, ObjectId } from "mongodb";
import { hashPassword } from "../utils/password.js";
import { env } from "../config/env.js";
import { GOOGLE_DRIVE_PHOTOS } from "../config/drivePhotosRaw.js";


async function runSeed() {
  console.log("🌱 Starting MongoDB Atlas Seed Process...");
  console.log(`Target database: ${env.MONGODB_DB_NAME}`);

  const client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  const db = client.db(env.MONGODB_DB_NAME);

  const collections = [
    "users",
    "clients",
    "enquiries",
    "leads",
    "projects",
    "rooms",
    "tasks",
    "designFiles",
    "approvals",
    "documents",
    "invoices",
    "boqItems",
    "quotations",
    "payments",
    "expenses",
    "materials",
    "vendors",
    "siteUpdates",
    "media",
    "caseStudies",
    "journalPosts",
    "siteSettings",
    "notifications",
    "activityLogs",
    "weeklySummaries",
    "teamMembers",
  ];

  console.log("🧹 Clearing old data...");
  for (const c of collections) {
    try {
      await db.collection(c).deleteMany({});
    } catch {
      // Ignored
    }
  }

  const now = new Date();
  const defaultPasswordHash = await hashPassword("password123");

  console.log("👤 Seeding Users...");
  const adminId = new ObjectId("660000000000000000000001");
  const designerId = new ObjectId("660000000000000000000002");
  const clientUserId = new ObjectId("660000000000000000000003");
  const clientId = new ObjectId("660000000000000000000010");
  const projectId1 = new ObjectId("660000000000000000000100");
  const projectId2 = new ObjectId("660000000000000000000101");

  await db.collection("users").insertMany([
    {
      _id: adminId,
      email: "ira@ateliervermilion.com",
      passwordHash: defaultPasswordHash,
      fullName: "Ira Kapoor",
      title: "Studio Principal & Lead Architect",
      phone: "+91 98200 41100",
      roles: ["admin", "designer", "project_manager"],
      isStaff: true,
      clientIds: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: designerId,
      email: "tanya@ateliervermilion.com",
      passwordHash: defaultPasswordHash,
      fullName: "Tanya Sen",
      title: "Senior Interior Architect",
      phone: "+91 98200 41101",
      roles: ["designer"],
      isStaff: true,
      clientIds: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: clientUserId,
      email: "ketan.patel@patelchem.com",
      passwordHash: defaultPasswordHash,
      fullName: "Ketan Patel",
      title: "Managing Director, Patel Chemicals",
      phone: "+91 98201 12345",
      roles: ["client"],
      isStaff: false,
      clientIds: [String(clientId)],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log("🏢 Seeding Clients...");
  await db.collection("clients").insertOne({
    _id: clientId,
    name: "Ketan & Radhika Patel",
    primaryContactName: "Ketan Patel",
    email: "ketan.patel@patelchem.com",
    phone: "+91 98201 12345",
    companyName: "Patel Family Trust",
    billingAddress: "42 Altamount Road, Cumballa Hill, Mumbai 400026",
    status: "active",
    associatedProjectIds: [String(projectId1)],
    portalAccessEnabled: true,
    userId: String(clientUserId),
    createdAt: now,
    updatedAt: now,
  });

  console.log("🏛️ Seeding Projects...");
  await db.collection("projects").insertMany([
    {
      _id: projectId1,
      clientId: String(clientId),
      clientName: "Ketan & Radhika Patel",
      title: "The Altamount Penthouse",
      slug: "altamount-penthouse",
      code: "AV-MUM-041",
      status: "execution",
      stage: "Site Execution & Joinery",
      spaceType: "Luxury Duplex Penthouse",
      scope: "Full Architectural Interior & Styling",
      locationCity: "Mumbai",
      locationAddress: "Altamount Road, Cumballa Hill, Mumbai",
      areaSqft: 6800,
      contractValue: 48500000,
      collectedAmount: 29100000,
      startDate: "2025-11-15",
      targetHandoverDate: "2026-06-30",
      progressPercentage: 62,
      health: "on_track",
      leadDesignerName: "Ira Kapoor",
      projectManagerName: "Rohan Varma",
      siteSupervisorName: "Vikram Rathi",
      coverImage: GOOGLE_DRIVE_PHOTOS[0]?.url || "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
      description: "A serene dual-level luxury penthouse pairing fluted travertine, bespoke teak joinery, and patinated bronze details.",
      isActive: true,
      isFeaturedOnWebsite: true,
      isOnHomepage: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: projectId2,
      clientId: String(clientId),
      clientName: "Ketan & Radhika Patel",
      title: "Alibaug Coastal Villa",
      slug: "alibaug-coastal-villa",
      code: "AV-ALB-028",
      status: "completed",
      stage: "Handed Over",
      spaceType: "Coastal Holiday Home",
      scope: "Architecture, Interiors & Landscape Integration",
      locationCity: "Alibaug",
      areaSqft: 9200,
      contractValue: 62000000,
      collectedAmount: 62000000,
      startDate: "2024-04-10",
      targetHandoverDate: "2025-08-20",
      progressPercentage: 100,
      health: "on_track",
      leadDesignerName: "Ira Kapoor",
      coverImage: GOOGLE_DRIVE_PHOTOS[1]?.url || "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
      description: "Monolithic exposed laterite and reclaimed teak sea-facing estate enveloped by tropical flora.",
      isActive: true,
      isFeaturedOnWebsite: true,
      isOnHomepage: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log("🎨 Seeding Rooms, Tasks & Approvals...");
  await db.collection("rooms").insertMany([
    {
      projectId: String(projectId1),
      name: "Formal Living & Double-Height Atrium",
      roomType: "Living",
      areaSqft: 1450,
      status: "execution",
      itemsCount: 18,
      budget: 12000000,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      projectId: String(projectId1),
      name: "Master Sanctuary & Ensuite",
      roomType: "Master Suite",
      areaSqft: 1200,
      status: "design",
      itemsCount: 14,
      budget: 9500000,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await db.collection("tasks").insertMany([
    {
      projectId: String(projectId1),
      title: "Inspect Italian Silver Travertine dry-lay mockups",
      description: "Verify vein continuity and honed sealant finish at Lower Parel warehouse.",
      assigneeName: "Ira Kapoor",
      status: "in_progress",
      priority: "high",
      dueDate: "2026-09-30",
      createdAt: now,
      updatedAt: now,
    },
    {
      projectId: String(projectId1),
      title: "HVAC low-profile ducting pressure verification",
      description: "Coordinate with mechanical contractors prior to false ceiling framing.",
      assigneeName: "Rohan Varma",
      status: "todo",
      priority: "medium",
      dueDate: "2026-10-05",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await db.collection("approvals").insertMany([
    {
      projectId: String(projectId1),
      title: "Double-Height Atrium Fluted Travertine Paneling",
      notes: "High-resolution 3D renders and stone dry-lay configuration for client review.",
      status: "pending",
      requestedAt: now,
      comments: [],
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log("📚 Seeding Case Studies & Journal...");
  await db.collection("caseStudies").insertMany([
    {
      slug: "altamount-penthouse",
      title: "The Altamount Penthouse",
      subtitle: "A Masterclass in Fluted Travertine & Cast Bronze",
      location: "Altamount Road, Mumbai",
      year: 2026,
      heroImage: GOOGLE_DRIVE_PHOTOS[0]?.url,
      summary: "Curated dual-level residence balancing monumental architectural volumes with quiet tactile warmth.",
      spaceType: "Duplex Penthouse",
      style: "Warm Contemporary Minimalist",
      areaSqft: 6800,
      featured: true,
      publishedAt: "2026-01-15",
      clientBrief: "Create a serene sanctuary elevated above the city skyline with organic stones and seamless millwork.",
      concept: "A sequence of flowing spatial chambers defined by fluted travertine monolithic portals.",
      gallery: GOOGLE_DRIVE_PHOTOS.slice(0, 8).map((p) => ({
        url: p.url,
        caption: p.caption,
        space: p.category,
      })),
      createdAt: now,
      updatedAt: now,
    },
    {
      slug: "alibaug-coastal-villa",
      title: "Alibaug Coastal Villa",
      subtitle: "Monolithic Laterite & Reclaimed Teak Waterfront Retreat",
      location: "Awas Beach, Alibaug",
      year: 2025,
      heroImage: GOOGLE_DRIVE_PHOTOS[1]?.url,
      summary: "Exposed laterite stone estate immersed within coastal coconut groves and salt air.",
      spaceType: "Coastal Estate",
      style: "Tropical Brutalism",
      areaSqft: 9200,
      featured: true,
      publishedAt: "2025-08-20",
      gallery: GOOGLE_DRIVE_PHOTOS.slice(8, 16).map((p) => ({
        url: p.url,
        caption: p.caption,
        space: p.category,
      })),
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log("📸 Seeding Media Collection with Google Drive Photos...");
  const mediaDocs = GOOGLE_DRIVE_PHOTOS.map((p, idx) => ({
    projectId: String(idx % 2 === 0 ? projectId1 : projectId2),
    fileName: p.fileName,
    driveFileId: p.id,
    driveUrl: p.url,
    thumbnailUrl: p.thumbnailUrl,
    mimeType: "image/jpeg",
    size: p.size || 55465,
    category: "final_photos",
    caption: p.title,
    alt: p.caption,
    visibility: "website",
    isFeatured: idx < 12,
    isCover: idx === 0,
    sortOrder: idx,
    tags: p.tags,
    createdAt: now,
    updatedAt: now,
  }));
  await db.collection("media").insertMany(mediaDocs as any);

  await db.collection("journalPosts").insertMany([
    {
      slug: "travertine-quarry-chronicles",
      title: "The Poetry of Travertine: From Tuscan Quarries to Mumbai Penthouses",
      excerpt: "Why vein-cut Roman travertine remains the definitive material of timeless residential architecture.",
      content: "Deep within the historic quarries of Tivoli, mineral-rich subterranean springs have layered calcium carbonate over geological epochs...",
      coverImage: GOOGLE_DRIVE_PHOTOS[2]?.url,
      readingTimeMinutes: 5,
      publishedAt: "2026-02-10",
      category: "Material Craft",
      tags: ["Stone", "Provenance", "Architecture"],
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log("👥 Seeding Team & Materials...");
  await db.collection("teamMembers").insertMany([
    {
      name: "Ira Kapoor",
      role: "Studio Principal & Lead Architect",
      email: "ira@ateliervermilion.com",
      phone: "+91 98200 41100",
      status: "active",
      assignedProjects: ["Altamount Penthouse", "Alibaug Coastal Villa"],
      avatarUrl: GOOGLE_DRIVE_PHOTOS[3]?.url,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Rohan Varma",
      role: "Head of Project Delivery",
      email: "rohan@ateliervermilion.com",
      phone: "+91 98200 41102",
      status: "on_site",
      assignedProjects: ["Altamount Penthouse"],
      avatarUrl: GOOGLE_DRIVE_PHOTOS[4]?.url,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await db.collection("materials").insertMany([
    {
      name: "Silver Vein-Cut Navona Travertine",
      category: "Stone",
      image: GOOGLE_DRIVE_PHOTOS[5]?.url,
      description: "Linear vein-cut Italian travertine with subtle slate-grey and cream striations.",
      provenance: "Tivoli, Italy",
      vendorName: "Stonex Elite",
      costRange: "₹950 - ₹1,400 / sqft",
      projectSlug: "altamount-penthouse",
      projectTitle: "The Altamount Penthouse",
      createdAt: now,
      updatedAt: now,
    },
  ]);


  await client.close();
  console.log("✅ Seed completed successfully!");
}

runSeed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

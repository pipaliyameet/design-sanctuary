import { connectToDatabase } from '../dist/src/config/database.js';

async function run() {
  console.log("Connecting to MongoDB Atlas...");
  const db = await connectToDatabase();
  console.log("Connected to DB:", db.databaseName);

  // 1. UPDATE SERVICES
  const fourServices = [
    {
      number: "01",
      title: "Architecture & Interior Design",
      shortDesc: "Architectural planning, interior design, space planning, and functional, aesthetically pleasing spaces tailored to each client's requirements.",
      fullDesc: "Architectural planning, interior design, space planning, and functional, aesthetically pleasing spaces tailored to each client's requirements. We integrate daylight vectors, proportional flow, and material purity from measured site surveys through to comprehensive construction drawings.",
      deliverables: [
        "Architectural planning & space optimization",
        "Tailored residential & commercial interior design",
        "Comprehensive Good For Construction (GFC) drawings",
        "Circulation mapping & architectural lighting design"
      ],
      image: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
      link: "/services#architecture-interior-design",
      sortOrder: 1,
      published: true,
      updatedAt: new Date()
    },
    {
      number: "02",
      title: "Landscape Design",
      shortDesc: "Thoughtfully designed outdoor spaces, gardens, and landscapes that complement the architecture and surrounding environment.",
      fullDesc: "Thoughtfully designed outdoor spaces, gardens, and landscapes that complement the architecture and surrounding environment. We harmonize organic greenery, stone hardscaping, ambient exterior illumination, and serene water features with the built structure.",
      deliverables: [
        "Custom landscape master planning & outdoor zoning",
        "Courtyard gardens & verandah integration",
        "Natural stone pathways, planters & hardscaping",
        "Exterior atmospheric illumination & irrigation planning"
      ],
      image: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
      link: "/services#landscape-design",
      sortOrder: 2,
      published: true,
      updatedAt: new Date()
    },
    {
      number: "03",
      title: "Project Consultancy",
      shortDesc: "Professional guidance, planning, design coordination, material selection, and project management support throughout the project lifecycle.",
      fullDesc: "Professional guidance, planning, design coordination, material selection, and project management support throughout the project lifecycle. We act as your expert client advocate—reviewing technical specifications, verifying quality tolerances, and maintaining budget and timeline integrity.",
      deliverables: [
        "Independent design coordination & technical review",
        "Quarry & mill material selection and verification",
        "MEP, structural & contractor alignment audits",
        "Budget optimization & lifecycle schedule governance"
      ],
      image: "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
      link: "/services#project-consultancy",
      sortOrder: 3,
      published: true,
      updatedAt: new Date()
    },
    {
      number: "04",
      title: "Turnkey Projects",
      shortDesc: "End-to-end project execution, from initial planning and design to material selection, construction, finishing, and final handover.",
      fullDesc: "End-to-end project execution, from initial planning and design to material selection, construction, finishing, and final handover. Single-source studio accountability with frozen milestone budgets, vetted master craftsmen, rigorous daily site supervision, and white-glove delivery.",
      deliverables: [
        "End-to-end single-source execution & site custody",
        "Frozen Bill of Quantities (BOQ) with milestone guarantees",
        "Master carpentry, masonry, finishes & MEP execution",
        "White-glove styling, quality QA, and defect-free handover"
      ],
      image: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
      link: "/services#turnkey-projects",
      sortOrder: 4,
      published: true,
      updatedAt: new Date()
    }
  ];

  const existingServices = await db.collection("services").find({}).sort({ sortOrder: 1 }).toArray();
  console.log("Current services in DB count:", existingServices.length);

  for (let i = 0; i < fourServices.length; i++) {
    if (existingServices[i]) {
      await db.collection("services").updateOne(
        { _id: existingServices[i]._id },
        { $set: fourServices[i] }
      );
      console.log(`Updated service ${i + 1} (${existingServices[i]._id}): ${fourServices[i].title}`);
    } else {
      const res = await db.collection("services").insertOne({
        ...fourServices[i],
        createdAt: new Date()
      });
      console.log(`Inserted service ${i + 1}: ${fourServices[i].title}`);
    }
  }

  if (existingServices.length > 4) {
    const extraIds = existingServices.slice(4).map(s => s._id);
    const delRes = await db.collection("services").deleteMany({ _id: { $in: extraIds } });
    console.log(`Removed ${delRes.deletedCount} extra services beyond 4.`);
  }

  // 2. UPDATE USERS (Ravi Pipaliya as Owner/Principal)
  const userUpdate = await db.collection("users").updateMany(
    {
      $or: [
        { email: "owner@rightangle.design" },
        { email: "admin@rightangle.design" },
        { email: "admin@rightangledesign.com" },
        { email: "admin@rightangle.com" },
        { fullName: "Ira Kapoor" },
        { fullName: "Ar. Meet Pipaliya" }
      ]
    },
    {
      $set: {
        fullName: "Ravi Pipaliya",
        title: "Principal Architect & Founder",
        updatedAt: new Date()
      }
    }
  );
  console.log(`Updated ${userUpdate.modifiedCount} user records to Ravi Pipaliya.`);

  // 3. UPDATE SITE SETTINGS
  await db.collection("siteSettings").updateOne(
    { key: "studioDetails" },
    {
      $set: {
        value: {
          name: "RIGHT ANGLE DESIGN STUDIO",
          ownerName: "Ravi Pipaliya",
          founder: "Ravi Pipaliya",
          owner: "Ravi Pipaliya",
          tagline: "Architecture & Interior Sanctuary",
          phone: "+91 95375 86804",
          email: "contact@rightangle.design",
          address: "Studio 4B, The Mill District, Lower Parel, Mumbai 400013",
          bengaluruAddress: "84 Lavelle Road, Ashok Nagar, Bengaluru 560001",
          instagram: "https://www.instagram.com/right_angle_interior_design/",
          whatsapp: "+919537586804"
        },
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  await db.collection("siteSettings").updateOne(
    { key: "ownerName" },
    { $set: { value: "Ravi Pipaliya", updatedAt: new Date() } },
    { upsert: true }
  );

  await db.collection("siteSettings").updateOne(
    { key: "founderName" },
    { $set: { value: "Ravi Pipaliya", updatedAt: new Date() } },
    { upsert: true }
  );
  console.log("Updated siteSettings with Ravi Pipaliya and RIGHT ANGLE DESIGN STUDIO.");

  // 4. UPDATE PROJECTS & TASKS
  await db.collection("projects").updateMany(
    { leadDesignerName: { $in: ["Ira Kapoor", "Ar. Meet Pipaliya"] } },
    { $set: { leadDesignerName: "Ravi Pipaliya" } }
  );
  await db.collection("tasks").updateMany(
    { assigneeName: { $in: ["Ira Kapoor", "Ar. Meet Pipaliya"] } },
    { $set: { assigneeName: "Ravi Pipaliya" } }
  );
  await db.collection("designFiles").updateMany(
    { uploadedByName: { $in: ["Ira Kapoor", "Ar. Meet Pipaliya"] } },
    { $set: { uploadedByName: "Ravi Pipaliya" } }
  );
  await db.collection("leads").updateMany(
    { ownerName: { $in: ["Ira Kapoor", "Ar. Meet Pipaliya"] } },
    { $set: { ownerName: "Ravi Pipaliya" } }
  );
  console.log("Updated projects, tasks, designFiles, leads to reference Ravi Pipaliya.");

  // VERIFICATION
  const verifiedServices = await db.collection("services").find({}).sort({ sortOrder: 1 }).toArray();
  console.log("\n=== VERIFIED SERVICES IN ATLAS MONGODB ===");
  verifiedServices.forEach(s => {
    console.log(`[${s.number}] ${s.title}`);
    console.log(`    ${s.shortDesc}`);
  });

  const verifiedUsers = await db.collection("users").find({}).toArray();
  console.log("\n=== VERIFIED USERS IN ATLAS MONGODB ===");
  verifiedUsers.forEach(u => {
    console.log(`- ${u.email}: ${u.fullName} (${u.title || "No title"})`);
  });

  console.log("\nMigration completed successfully!");
  process.exit(0);
}

run().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});


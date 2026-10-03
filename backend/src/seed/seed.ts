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
    "services",
    "processSteps",
    "testimonials",
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
      _id: new ObjectId("660000000000000000000099"),
      email: "a@gmail.com",
      passwordHash: defaultPasswordHash,
      fullName: "Studio Principal",
      title: "Studio Owner & Principal",
      phone: "+91 98200 41199",
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
    {
      slug: "shah-villa",
      title: "Shah Courtyard Residence",
      subtitle: "Monolithic Brick & Roman Travertine Courtyard Sanctuary",
      location: "Sindhu Bhavan Road, Ahmedabad",
      year: 2026,
      heroImage: GOOGLE_DRIVE_PHOTOS[2]?.url,
      summary: "Monolithic brick and Roman travertine residence planned around an open water courtyard.",
      spaceType: "Residential Villa",
      style: "Courtyard & Warm Plaster",
      areaSqft: 6400,
      featured: true,
      publishedAt: "2026-03-10",
      gallery: GOOGLE_DRIVE_PHOTOS.slice(16, 24).map((p) => ({
        url: p.url,
        caption: p.caption,
        space: p.category,
      })),
      createdAt: now,
      updatedAt: now,
    },
    {
      slug: "mehta-executive-suite",
      title: "Mehta Executive Suite",
      subtitle: "Boutique Financial Headquarters & Private Salon",
      location: "Yagnik Road, Rajkot",
      year: 2026,
      heroImage: GOOGLE_DRIVE_PHOTOS[3]?.url,
      summary: "A refined workspace with acoustic slat panelling, Italian marble reception desk, and private boardroom.",
      spaceType: "Commercial Office",
      style: "Modern Classic & Walnut",
      areaSqft: 1950,
      featured: true,
      publishedAt: "2026-04-12",
      gallery: GOOGLE_DRIVE_PHOTOS.slice(24, 32).map((p) => ({
        url: p.url,
        caption: p.caption,
        space: p.category,
      })),
      createdAt: now,
      updatedAt: now,
    },
    {
      slug: "oberoi-sea-facing-duplex",
      title: "Oberoi Sea-Facing Duplex",
      subtitle: "High-Floor Minimalist Sanctuary Overlooking the Arabian Sea",
      location: "Worli Sea Face, Mumbai",
      year: 2026,
      heroImage: GOOGLE_DRIVE_PHOTOS[4]?.url || "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
      summary: "Monolithic Grigio Carnico quartzite, warm fluted walnut panelling, and panoramic floor-to-ceiling oceanic views.",
      spaceType: "Sea-Facing Duplex",
      style: "Refined Modernist",
      areaSqft: 5200,
      featured: true,
      publishedAt: "2026-05-01",
      gallery: GOOGLE_DRIVE_PHOTOS.slice(32, 40).map((p) => ({
        url: p.url,
        caption: p.caption,
        space: p.category,
      })),
      createdAt: now,
      updatedAt: now,
    },
    {
      slug: "kothari-pavilions",
      title: "Kothari Pavilions & Estate",
      subtitle: "Pavilion-Style Courtyard Sanctuary with Slaked Lime Plaster",
      location: "Juhu Tara Road, Mumbai",
      year: 2026,
      heroImage: GOOGLE_DRIVE_PHOTOS[5]?.url || "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
      summary: "A sequence of open pavilions celebrating natural daylight, breathable lime plaster, and seamless indoor-outdoor living.",
      spaceType: "Tropical Villa",
      style: "Warm Brutalism & Plaster",
      areaSqft: 7500,
      featured: true,
      publishedAt: "2026-06-15",
      gallery: GOOGLE_DRIVE_PHOTOS.slice(40, 48).map((p) => ({
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
    projectId: p.projectId || String(idx % 2 === 0 ? projectId1 : projectId2),
    projectTitle: p.projectTitle || "The Altamount Penthouse",
    fileName: p.fileName,
    driveFileId: p.id,
    driveUrl: p.url,
    thumbnailUrl: p.thumbnailUrl,
    mimeType: "image/jpeg",
    size: p.size || 55465,
    category: p.category || "Living & Salon",
    caption: p.title,
    alt: p.caption,
    visibility: "website",
    isFeatured: idx < 12,
    isCover: idx === 0,
    sortOrder: idx,
    tags: p.tags || ["Google Drive Vault"],
    createdAt: new Date(Date.now() - (50 - idx) * 3600 * 1000),
    updatedAt: now,
  }));
  await db.collection("media").insertMany(mediaDocs as any);

  console.log("🛠️ Seeding Services...");
  await db.collection("services").insertMany([
    {
      number: "01",
      title: "Residential Interiors",
      shortDesc: "Comprehensive spatial planning, circulation optimization, and room-by-room architectural detailing for private homes.",
      fullDesc: "We conceive homes from the inside out: analyzing daylight vectors, sightlines, and lifestyle rituals. Every junction, shadow reveal, and threshold is resolved before construction commences.",
      deliverables: [
        "Measured site survey & 3D daylight simulation",
        "Comprehensive spatial layouts & furniture flow",
        "Full room-by-room Good For Construction (GFC) drawings",
      ],
      image: GOOGLE_DRIVE_PHOTOS[0]?.url,
      link: "/services#residential",
      sortOrder: 1,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      number: "02",
      title: "Turnkey Design & Build",
      shortDesc: "Single-source accountability from procurement and MEP coordination to final white-glove delivery.",
      fullDesc: "We assume full site custody: vetted master carpenters, masonry teams, and MEP engineers under continuous senior supervision with frozen milestone budgets.",
      deliverables: [
        "Frozen Bill of Quantities (BOQ) with fixed pricing",
        "Weekly client progress audits & photographic portal logs",
        "Full on-site supervisor presence & schedule guarantee",
      ],
      image: GOOGLE_DRIVE_PHOTOS[1]?.url,
      link: "/services#turnkey",
      sortOrder: 2,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      number: "03",
      title: "Architecture & Space Planning",
      shortDesc: "Ground-up villa architecture, structural reconfiguration, and environmental daylight integration.",
      fullDesc: "For independent villas and bare-shell penthouses, we sculpt volumetric massing, indoor-outdoor verandahs, and fenestrations in direct harmony with the site.",
      deliverables: [
        "Volumetric massing & solar orientation studies",
        "Verandah colonnade & courtyard water feature design",
        "Structural modifications & MEP engineering alignment",
      ],
      image: GOOGLE_DRIVE_PHOTOS[2]?.url,
      link: "/services#architecture",
      sortOrder: 3,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      number: "04",
      title: "Custom Furniture & Millwork",
      shortDesc: "Bespoke furniture, wardrobe pavilions, and monolithic joinery crafted specifically for each setting.",
      fullDesc: "What cannot be found is crafted: monolithic natural stone dining tables, fumed oak wardrobe pavilions, and hand-rubbed brass hardware detailed with millimeter tolerances.",
      deliverables: [
        "1-of-1 bespoke dining and cocktail tables",
        "Fumed veneer wardrobe suites with sensor illumination",
        "Hand-knotted natural wool rugs and textile curation",
      ],
      image: GOOGLE_DRIVE_PHOTOS[3]?.url,
      link: "/services#furniture",
      sortOrder: 4,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      number: "05",
      title: "Commercial & Hospitality",
      shortDesc: "Evocative atmosphere, executive suites, and dining spaces designed for long-term acoustic and visual comfort.",
      fullDesc: "Spaces designed for evocative atmosphere, operational flow, acoustic comfort, and long-term durability under high footfall conditions.",
      deliverables: [
        "Atmospheric mood & low-glare pin-spot lighting",
        "Acoustic engineering to eliminate harsh noise",
        "High-durability stain-resistant natural stones & upholstery",
      ],
      image: GOOGLE_DRIVE_PHOTOS[4]?.url,
      link: "/services#hospitality",
      sortOrder: 5,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      number: "06",
      title: "Materials & Lighting",
      shortDesc: "Tactile curation of natural stones, lime plasters, solid timbers, and glare-free 2400K–2700K illumination schemes.",
      fullDesc: "No material is specified from a digital catalog alone. We visit quarries and timber flitch yards to inspect stone veining, wood grain alignment, and hand-feel.",
      deliverables: [
        "Physical sample workshop tray (actual stone, brass & veneer)",
        "Book-matched slab selection directly at the quarry",
        "Circadian dim-to-warm architectural lighting coordination",
      ],
      image: GOOGLE_DRIVE_PHOTOS[5]?.url,
      link: "/services#materials",
      sortOrder: 6,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log("📐 Seeding Process Steps...");
  await db.collection("processSteps").insertMany([
    {
      number: "01",
      title: "Discover",
      description: "Laser survey, solar daylight mapping, lifestyle ritual inquiry, and structural feasibility audit.",
      timeline: "Weeks 1–2",
      sortOrder: 1,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      number: "02",
      title: "Concept",
      description: "Developing the spatial language, circulation plans, volume articulation, and foundational material mood.",
      timeline: "Weeks 3–5",
      sortOrder: 2,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      number: "03",
      title: "Design",
      description: "3D lighting simulations, physical quarry stone selection, and 50+ detailed shop drawing sheets.",
      timeline: "Weeks 6–10",
      sortOrder: 3,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      number: "04",
      title: "Execute",
      description: "Turnkey site custody, full-time supervisor oversight, weekly client logs, and fixed BOQ accountability.",
      timeline: "Months 3–11",
      sortOrder: 4,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      number: "05",
      title: "Deliver",
      description: "White-glove styling, artwork placement, zero-snag handover dossier, and scheduled 90-day review.",
      timeline: "Final Month",
      sortOrder: 5,
      published: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log("💬 Seeding Testimonials...");
  await db.collection("testimonials").insertMany([
    {
      clientName: "Rajesh & Priya Shah",
      project: "The Shah Residence",
      location: "Sindhu Bhavan, Ahmedabad",
      text: "The team transformed our home into something that feels completely ours. Natural light now reaches corners we never knew existed, and every piece of stone feels deliberate.",
      quote: "Natural light now reaches corners we never knew existed.",
      role: "Private Homeowner",
      approved: true,
      featured: true,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      clientName: "Sameer Nambiar",
      project: "Koramangala Penthouse",
      location: "Bengaluru",
      text: "As an art collector, I needed museum-grade acoustic calm and precise lighting. The studio’s turnkey discipline meant zero friction during the entire build.",
      quote: "Museum-grade acoustic calm and precise lighting with zero build friction.",
      role: "Art Collector & Penthouse Owner",
      approved: true,
      featured: true,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log("📰 Seeding Journal Posts...");
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
    {
      slug: "acoustic-millwork-light",
      title: "Architectural Millwork & Concealed 2700K Luminaires",
      excerpt: "How low-glare warm light reveals the grain of fumed European white oak in contemporary spaces.",
      content: "Architectural lighting must never compete with volume; it should softly unveil texture, grain, and stone depth...",
      coverImage: GOOGLE_DRIVE_PHOTOS[4]?.url,
      readingTimeMinutes: 4,
      publishedAt: "2026-03-01",
      category: "Lighting & Craft",
      tags: ["Lighting", "Oak", "Millwork"],
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
      category: "Natural Stone",
      image: "/materials/silver-vein-navona-travertine.jpg",
      description: "Linear vein-cut Italian travertine with subtle slate-grey and cream striations, honed to a silky tactile finish.",
      provenance: "Tivoli, Italy",
      vendorName: "Stonex Elite",
      costRange: "₹950 - ₹1,400 / sqft",
      projectSlug: "altamount-penthouse",
      projectTitle: "The Altamount Penthouse",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Smoked Slavonian Oak Flitch",
      category: "Timber & Veneer",
      image: GOOGLE_DRIVE_PHOTOS[1]?.url || "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
      description: "Quarter-sawn fumed European oak treated with natural botanical oils to deepen the grain and tactile warm shadow.",
      provenance: "Slavonia, Croatia",
      vendorName: "EuroTimber Atelier",
      costRange: "₹420 - ₹680 / sqft",
      projectSlug: "alibaug-coastal-villa",
      projectTitle: "Alibaug Coastal Villa",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Hand-Patinated Architectural Bronze",
      category: "Metalwork & Accents",
      image: GOOGLE_DRIVE_PHOTOS[2]?.url || "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
      description: "Custom-formulated chemical patina on solid brass extrusions, creating velvety deep-amber reflections.",
      provenance: "Moradabad, India",
      vendorName: "Atelier Brassworks",
      costRange: "₹1,800 - ₹2,500 / rft",
      projectSlug: "shah-villa",
      projectTitle: "Shah Courtyard Residence",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Venetian Marmorino & Raw Lime Plaster",
      category: "Surface Finishes",
      image: GOOGLE_DRIVE_PHOTOS[3]?.url || "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
      description: "Multi-layered breathable slaked lime plaster infused with crushed Carrara marble for soft acoustic absorption.",
      provenance: "Treviso, Italy",
      vendorName: "Venice Plaster Co.",
      costRange: "₹280 - ₹450 / sqft",
      projectSlug: "mehta-executive-suite",
      projectTitle: "Mehta Executive Suite",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Grigio Carnico Fluted Quartzite",
      category: "Monolithic Stone",
      image: GOOGLE_DRIVE_PHOTOS[4]?.url || "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
      description: "Charcoal quartzite with dramatic white calcite veins, diamond-fluted for dimensional wall claddings.",
      provenance: "Carnic Alps, Italy",
      vendorName: "Alpine Quarry Works",
      costRange: "₹1,200 - ₹1,900 / sqft",
      projectSlug: "oberoi-penthouse",
      projectTitle: "The Oberoi Sea-Facing Duplex",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Hand-Woven Belgian Organic Linen",
      category: "Soft Textures & Draping",
      image: GOOGLE_DRIVE_PHOTOS[5]?.url || "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
      description: "High-density raw linen drapes filtering natural afternoon sunlight into ambient golden diffuse illumination.",
      provenance: "Flanders, Belgium",
      vendorName: "Maison Linen Textiles",
      costRange: "₹650 - ₹1,100 / mtr",
      projectSlug: "kothari-pavilions",
      projectTitle: "Kothari Pavilions",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log("⚙️ Seeding Site Settings...");
  await db.collection("siteSettings").insertMany([
    {
      key: "heroTitle",
      value: { text: "Spaces shaped by light, material and everyday life." },
      updatedAt: now,
    },
    {
      key: "heroSubtitle",
      value: { text: "Bespoke residential, commercial and turnkey interiors across India. Detailed around daylight, natural stone and quiet craft." },
      updatedAt: now,
    },
    {
      key: "studioDetails",
      value: {
        name: "Atelier Vermilion",
        tagline: "Architecture & Interior Sanctuary",
        phone: "+91 98200 41100",
        email: "atelier@ateliervermilion.com",
        address: "Studio 4B, The Mill District, Lower Parel, Mumbai 400013",
        bengaluruAddress: "84 Lavelle Road, Ashok Nagar, Bengaluru 560001",
        instagram: "https://instagram.com/ateliervermilion",
        whatsapp: "+919820041100",
      },
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

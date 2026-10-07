import { MongoClient, Db, Collection, Document, ObjectId } from "mongodb";
import { env } from "./env.js";
import { GOOGLE_DRIVE_PHOTOS } from "./drivePhotosRaw.js";

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let isConnecting = false;

// In-memory collections fallback for serverless or when MongoDB is unavailable
const memoryStores = new Map<string, any[]>();

function getInitialStore(name: string): any[] {
  if (memoryStores.has(name)) {
    return memoryStores.get(name)!;
  }

  let initialData: any[] = [];

  if (name === "siteSettings") {
    initialData = [
      {
        _id: "site_settings_singleton",
        companyName: "Right-Angle-Design-Studio",
        brandName: "Right-Angle-Design-Studio",
        tagline: "Architecture & Interior Design Atelier",
        email: "info@rightangledesignstudio.com",
        phone: "+91 98765 43210",
        address: "Studio 4B, Design Sanctuary Tower, Mumbai, India",
        primaryColor: "#0D2E24",
        accentColor: "#F49D37",
        metaTitle: "Right-Angle-Design-Studio | Architectural & Interior Design Atelier",
        metaDescription:
          "Bespoke residential, hospitality, and commercial interior architecture crafted with uncompromising precision and elegance.",
      },
    ];
  } else if (name === "media") {
    initialData = GOOGLE_DRIVE_PHOTOS.map((photo, index) => ({
      _id: `drive_media_${photo.id || index}`,
      title: photo.title,
      caption: photo.caption,
      category: photo.category,
      url: photo.url,
      thumbnailUrl: photo.thumbnailUrl || photo.url,
      driveFileId: photo.id,
      driveViewUrl: photo.driveViewUrl,
      fileName: photo.fileName,
      projectTitle: photo.projectTitle,
      location: photo.location,
      tags: photo.tags,
      isHomepageVisible: true,
      homepageOrder: index + 1,
      visibility: "website",
      isFeatured: index < 12,
      createdAt: photo.uploadedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  } else if (name === "caseStudies") {
    initialData = [
      {
        _id: "cs_1",
        slug: "altamount-penthouse",
        title: "The Altamount Penthouse",
        subtitle: "Honed silver travertine, smoked oak & panoramic coastal views",
        location: "Mumbai, Maharashtra",
        year: 2026,
        heroImage: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
        summary: "A 5,800 sq ft duplex penthouse framed with honed silver travertine, smoked European oak, and bespoke bronze detailing overlooking the Arabian Sea.",
        spaceType: "Penthouse & High-End Residential",
        style: "Quiet Luxury Minimalist",
        areaSqft: 5800,
        featured: true,
        published: true,
        publishedAt: "2026-01-15",
        tags: ["Penthouse", "Residential", "Mumbai", "Travertine", "Smoked Oak"],
        clientBrief: "Create a timeless, contemplative residential sanctuary high above South Mumbai that balances grandeur with intimate warmth.",
        concept: "Interiors structured around light orientation, continuous limestone portals, and monolithic joinery.",
        execution: "Completed over 14 months with white-glove site management, bespoke joinery fabrication, and precision lighting integration.",
        gallery: [
          { url: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE", caption: "Formal Living Salon with honed travertine hearth", space: "Living Room" },
          { url: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg", caption: "Master Suite with acoustic micro-cement niche", space: "Master Bedroom" },
          { url: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r", caption: "Show Kitchen with monolithic quartzite island", space: "Dining & Kitchen" },
          { url: "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL", caption: "Entry Foyer portal with patinated bronze pulls", space: "Foyer" },
        ],
        sortOrder: 1,
      },
      {
        _id: "cs_2",
        slug: "alibaug-coastal-villa",
        title: "Alibaug Coastal Villa",
        subtitle: "Courtyard living, rammed earth textures & bespoke teak millwork",
        location: "Alibaug, Maharashtra",
        year: 2026,
        heroImage: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
        summary: "A tranquil private sanctuary structured around courtyards, rammed earth textures, custom teak millwork, and seamless indoor-outdoor living.",
        spaceType: "Coastal Villa & Private Retreat",
        style: "Organic Modernist",
        areaSqft: 7200,
        featured: true,
        published: true,
        publishedAt: "2026-02-10",
        tags: ["Villa", "Coastal", "Alibaug", "Teak", "Courtyard"],
        clientBrief: "Design an expansive coastal estate designed for slow weekends, hosting gatherings, and connecting directly to coastal tropical landscape.",
        concept: "Pavilions connected by covered verandahs, textured limestone floors, and natural cross-ventilation breezes.",
        execution: "Turnkey architectural interior execution with customized artisanal millwork and locally sourced stone.",
        gallery: [
          { url: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg", caption: "Master Suite overlooking private garden court", space: "Master Suite" },
          { url: "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz", caption: "Verandah lounge with teak slatted ceiling", space: "Verandah" },
          { url: "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5", caption: "Dining pavilion under handwoven linen drapes", space: "Dining Area" },
        ],
        sortOrder: 2,
      },
      {
        _id: "cs_3",
        slug: "shah-courtyard-residence",
        title: "The Shah Courtyard Residence",
        subtitle: "Ancestral warmth reimagined with double-height volume & quartzite portals",
        location: "Ahmedabad, Gujarat",
        year: 2026,
        heroImage: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
        summary: "A 6,400 sq ft ancestral estate reinvented with double-height central atrium, monolithic quartzite portals, and fluted teak joinery.",
        spaceType: "Residential Architecture",
        style: "Warm Contemporary",
        areaSqft: 6400,
        featured: true,
        published: true,
        publishedAt: "2026-03-01",
        tags: ["Courtyard", "Heritage Modern", "Ahmedabad", "Quartzite"],
        clientBrief: "Reinvent an ancestral plot into a multi-generational modern sanctuary respecting Vastu principles and natural daylight rhythms.",
        concept: "Central water courtyard acting as thermal moderator and visual focal axis for all communal wings.",
        execution: "Custom joinery, bespoke bronze architectural hardware, and precision micro-cement wall treatments.",
        gallery: [
          { url: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r", caption: "Double height atrium gallery", space: "Atrium" },
          { url: "https://lh3.googleusercontent.com/d/1EMJLrcUNSG1DG65uQMG-jS77UcfIpV23", caption: "Formal reception lounge", space: "Living Room" },
        ],
        sortOrder: 3,
      },
      {
        _id: "cs_4",
        slug: "mehta-executive-suite",
        title: "Mehta Executive Suite",
        subtitle: "Private family office suite with acoustic micro-cement & custom bronze",
        location: "Bandra Kurla Complex, Mumbai",
        year: 2026,
        heroImage: "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
        summary: "Private family office suite balancing acoustic micro-cement, velvet leather paneling, and discreet architectural ambient lighting.",
        spaceType: "Commercial & Executive Office",
        style: "Executive Elegance",
        areaSqft: 3400,
        featured: true,
        published: true,
        publishedAt: "2026-03-15",
        tags: ["Commercial", "Executive", "BKC", "Office"],
        clientBrief: "A discreet, luxurious corporate office suite that feels like a private residential club.",
        concept: "Muted dark tones, acoustic wall paneling, and indirect 2700K ambient illumination.",
        execution: "Precision joinery, vein-matched Roman travertine portals, and custom patinated bronze handles.",
        gallery: [
          { url: "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL", caption: "Executive boardroom and conference suite", space: "Boardroom" },
          { url: "https://lh3.googleusercontent.com/d/1gk9lNAKNKFDVkDqmVP--Ax4-C3q7aQwu", caption: "Private executive cabin with oak paneling", space: "Executive Cabin" },
        ],
        sortOrder: 4,
      },
      {
        _id: "cs_5",
        slug: "oberoi-sea-facing-duplex",
        title: "Oberoi Sea-Facing Duplex",
        subtitle: "Monolithic charcoal quartzite & brushed brass accents",
        location: "Worli, Mumbai",
        year: 2026,
        heroImage: "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
        summary: "Monolithic charcoal quartzite and brushed brass accents framing panoramic sea views with bespoke furniture curation.",
        spaceType: "Luxury Duplex",
        style: "Sculptural Contemporary",
        areaSqft: 4600,
        featured: true,
        published: true,
        publishedAt: "2026-04-01",
        tags: ["Duplex", "Worli", "Sea-Facing", "Luxury"],
        clientBrief: "Maximize coastal sea views while creating a dramatic entertainment floor and serene upper sleeping sanctuary.",
        concept: "Open-plan fluidity with floating cantilever staircase and sculptural stone island.",
        execution: "Full turnkey MEP overhaul, acoustic double glazing, and custom fluted joinery.",
        gallery: [
          { url: "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz", caption: "Living space with sea-view framed windows", space: "Living Room" },
          { url: "https://lh3.googleusercontent.com/d/10nP_gXYEBs66BpfredfrBQdldkynOdJ9", caption: "Dining gallery with sculptural lighting", space: "Dining Room" },
        ],
        sortOrder: 5,
      },
      {
        _id: "cs_6",
        slug: "kothari-pavilions",
        title: "Kothari Pavilions",
        subtitle: "Integrated landscape living, organic linen & water features",
        location: "Koregaon Park, Pune",
        year: 2026,
        heroImage: "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
        summary: "Low-slung pavilion living integrated into lush landscaping, featuring Belgian linen, fluted stone walls, and tranquil water features.",
        spaceType: "Pavilion & Landscape Residence",
        style: "Biophilic Modernism",
        areaSqft: 8500,
        featured: true,
        published: true,
        publishedAt: "2026-04-20",
        tags: ["Pavilion", "Pune", "Biophilic", "Landscape"],
        clientBrief: "A resort-like primary home that seamlessly blends indoor living with curated landscape gardens.",
        concept: "Continuous stone ground plane extending out to reflection pools and shaded pergolas.",
        execution: "Handcrafted stone masonry, custom architectural lighting fixtures, and high-performance climate glazing.",
        gallery: [
          { url: "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5", caption: "Pavilion garden gallery", space: "Garden Pavilion" },
          { url: "https://lh3.googleusercontent.com/d/12uXjDNKMiHQbafv1nNlieoXbkuH4uUtG", caption: "Central courtyard corridor", space: "Corridor" },
        ],
        sortOrder: 6,
      },
    ];
  } else if (name === "materials") {
    initialData = [
      {
        _id: "mat_1",
        name: "Silver Vein-Cut Navona Travertine",
        category: "Natural Stone",
        provenance: "Tivoli, Italy",
        image: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
        description: "Linear vein-cut Italian travertine with subtle slate-grey and cream striations, honed to a silky tactile finish.",
        projectTitle: "The Altamount Penthouse",
      },
      {
        _id: "mat_2",
        name: "Smoked Slavonian Oak Flitch",
        category: "Timber & Veneer",
        provenance: "Slavonia, Croatia",
        image: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
        description: "Quarter-sawn fumed European oak treated with natural botanical oils to deepen the grain and tactile warm shadow.",
        projectTitle: "Alibaug Coastal Villa",
      },
      {
        _id: "mat_3",
        name: "Hand-Patinated Architectural Bronze",
        category: "Metalwork & Accents",
        provenance: "Moradabad, India",
        image: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r",
        description: "Custom-formulated chemical patina on solid brass extrusions, creating velvety deep-amber reflections.",
        projectTitle: "Shah Courtyard Residence",
      },
      {
        _id: "mat_4",
        name: "Venetian Marmorino & Raw Lime Plaster",
        category: "Surface Finishes",
        provenance: "Treviso, Italy",
        image: "https://lh3.googleusercontent.com/d/1na76oRTRYbsSISYVlFH29xd39AnKVgyL",
        description: "Multi-layered breathable slaked lime plaster infused with crushed Carrara marble for soft acoustic absorption.",
        projectTitle: "Mehta Executive Suite",
      },
      {
        _id: "mat_5",
        name: "Grigio Carnico Fluted Quartzite",
        category: "Monolithic Stone",
        provenance: "Carnic Alps, Italy",
        image: "https://lh3.googleusercontent.com/d/1wxERswiDcH9N1KMiw4sdQ6Z00HDCkPIz",
        description: "Charcoal quartzite with dramatic white calcite veins, diamond-fluted for dimensional wall claddings.",
        projectTitle: "Oberoi Sea-Facing Duplex",
      },
      {
        _id: "mat_6",
        name: "Hand-Woven Belgian Organic Linen",
        category: "Soft Textures & Draping",
        provenance: "Flanders, Belgium",
        image: "https://lh3.googleusercontent.com/d/1xU2lFKRsSmMckhy3W_hGC9h8jL0jcgz5",
        description: "High-density raw linen drapes filtering natural afternoon sunlight into ambient golden diffuse illumination.",
        projectTitle: "Kothari Pavilions",
      },
    ];
  } else if (name === "testimonials") {
    initialData = [
      {
        _id: "test_1",
        quote: "Right-Angle-Design-Studio transformed our Altamount Penthouse with flawless attention to light, joinery, and craftsmanship. The living spaces feel tranquil and timeless.",
        author: "Rajesh & Sunita Mehta",
        role: "Homeowners",
        projectTitle: "The Altamount Penthouse",
        rating: 5,
        approved: true,
        sortOrder: 1,
      },
      {
        _id: "test_2",
        quote: "Their turnkey execution and honesty in material selection made our Alibaug villa an effortless retreat. Every room frames daylight with exceptional poise.",
        author: "Vikram Singhania",
        role: "Estate Owner",
        projectTitle: "Alibaug Coastal Villa",
        rating: 5,
        approved: true,
        sortOrder: 2,
      },
      {
        _id: "test_3",
        quote: "The level of detailing in the Shah Courtyard Residence is truly world-class. The double-height atrium and fluted teak millwork are architectural masterworks.",
        author: "Anand Shah",
        role: "Client",
        projectTitle: "Shah Courtyard Residence",
        rating: 5,
        approved: true,
        sortOrder: 3,
      },
    ];
  } else if (name === "journalPosts") {
    initialData = [
      {
        _id: "jp_1",
        slug: "mastery-of-navona-travertine",
        title: "The Mastery of Navona Travertine: Honing Stone for Tactile Living",
        excerpt: "Why we choose vein-cut Italian travertine for coastal residential architecture and how proper honing elevates everyday tactile connection.",
        content: "Stone in architectural interiors is never merely a cladding; it is a permanent tactile anchor. In our recent Altamount Penthouse project, silver vein-cut Navona travertine was selected for its muted tonal softness and acoustic absorption...",
        coverImage: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE",
        readingTimeMinutes: 4,
        published: true,
        publishedAt: "2026-03-20",
        category: "Material Craft",
        tags: ["Travertine", "Materiality", "Interior Architecture"],
      },
      {
        _id: "jp_2",
        slug: "daylight-orientation-and-spatial-volume",
        title: "Daylight Orientation & Spatial Volume in Tropical Residential Design",
        excerpt: "Exploring architectural strategies to harness diffused tropical sunlight without thermal heat gain through deep verandahs and slatted joinery.",
        content: "Designing for light requires first understanding shadow. In our Alibaug and Ahmedabad courtyard residences, solar analysis determined the deep overhangs, clerestory openings, and raw linen draping...",
        coverImage: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg",
        readingTimeMinutes: 5,
        published: true,
        publishedAt: "2026-04-05",
        category: "Design Philosophy",
        tags: ["Daylight", "Biophilic", "Spatial Design"],
      },
    ];
  } else if (name === "siteSettings") {
    initialData = [
      { _id: "st_1", key: "heroTitle", value: "Architecture & Interior Sanctuary" },
      { _id: "st_2", key: "heroSubtitle", value: "Spaces shaped by light, material and everyday life. Bespoke residential, commercial and turnkey interiors across India." },
      { _id: "st_3", key: "heroImage", value: "https://lh3.googleusercontent.com/d/13MLCbdqy_mWAY2Rg1EYFWOh9iO38Wvwu" },
      { _id: "st_4", key: "atmospherePhoto", value: "https://lh3.googleusercontent.com/d/18ZSfvj53ZvlAwj7l6-7la5FHHXcbadWg" },
      { _id: "st_5", key: "beforePhoto", value: "https://lh3.googleusercontent.com/d/1YXSBTgbi5JUhDBtEQzQALMB_e3PAGd8r" },
      { _id: "st_6", key: "afterPhoto", value: "https://lh3.googleusercontent.com/d/1Du9bv87hjZ8ySVHnckG5lSL1xQjvxogE" },
      { _id: "st_7", key: "ctaText", value: "View Projects" },
      { _id: "st_8", key: "ctaLink", value: "/portfolio" },
      { _id: "st_9", key: "showServices", value: true },
      { _id: "st_11", key: "showTestimonials", value: true },
      { _id: "st_12", key: "showJournal", value: true },
    ];
  } else if (name === "users") {
    initialData = [
      {
        _id: "usr_owner_principal",
        email: "owner@rightangle.design",
        passwordHash: "$2b$10$ep5uGkSbgWk34hL1bO3Wqeu138mE5aJt1t2kQeYhS3F0jYvW6yVb6", // Hash for Admin@123456
        fullName: "Ar. Meet Pipaliya",
        title: "Principal Architect & Founder",
        phone: "+91 98200 41100",
        roles: ["admin", "designer", "project_manager"],
        isStaff: true,
        clientIds: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  memoryStores.set(name, initialData);
  return initialData;
}

function matchesFilter(item: any, filter: any): boolean {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const key of Object.keys(filter)) {
    if (key === "$or" && Array.isArray(filter.$or)) {
      const matchAny = filter.$or.some((sub: any) => matchesFilter(item, sub));
      if (!matchAny) return false;
      continue;
    }
    const val = filter[key];
    if (val === null || val === undefined) {
      if (item[key] !== null && item[key] !== undefined) return false;
      continue;
    }
    if (typeof val === "object" && !Array.isArray(val)) {
      if (val instanceof ObjectId || val.constructor?.name === "ObjectId" || ("_bsontype" in val)) {
        if (String(item[key]) !== String(val)) return false;
        continue;
      }
      if ("$in" in val && Array.isArray(val.$in)) {
        const inList = val.$in.map((v: any) => String(v));
        if (!inList.includes(String(item[key]))) return false;
        continue;
      }
      if ("$regex" in val) {
        const regex = new RegExp(val.$regex, val.$options || "");
        if (!regex.test(String(item[key] || ""))) return false;
        continue;
      }
    }
    // Direct or string equality check
    if (item[key] !== val && String(item[key]) !== String(val)) {
      return false;
    }
  }
  return true;
}

function createMemoryCollection<T extends Document = Document>(name: string): Collection<T> {
  const store = getInitialStore(name);

  const mockCol = {
    find: (filter: any = {}) => {
      let results = store.filter((item) => matchesFilter(item, filter));
      const cursor = {
        sort: (sortSpec: any) => {
          if (sortSpec) {
            const key = Object.keys(sortSpec)[0];
            const dir = sortSpec[key];
            results = [...results].sort((a, b) => {
              if (a[key] < b[key]) return dir === 1 ? -1 : 1;
              if (a[key] > b[key]) return dir === 1 ? 1 : -1;
              return 0;
            });
          }
          return cursor;
        },
        skip: (count: number) => {
          results = results.slice(count);
          return cursor;
        },
        limit: (count: number) => {
          results = results.slice(0, count);
          return cursor;
        },
        project: (fields: any) => {
          if (fields && typeof fields === "object") {
            const keys = Object.keys(fields);
            const isInclude = keys.some((k) => fields[k] === 1 || fields[k] === true);
            if (isInclude) {
              results = results.map((item) => {
                const projected: any = { _id: item._id };
                for (const k of keys) {
                  if (fields[k]) projected[k] = item[k];
                }
                return projected;
              });
            }
          }
          return cursor;
        },
        toArray: async () => [...results],
      };
      return cursor;
    },
    findOne: async (filter: any = {}) => {
      return store.find((item) => matchesFilter(item, filter)) || null;
    },
    insertOne: async (doc: any) => {
      const newDoc = { _id: doc._id || `mem_${Date.now()}_${Math.random().toString(36).slice(2)}`, ...doc };
      store.push(newDoc);
      return { insertedId: newDoc._id, acknowledged: true };
    },
    insertMany: async (docs: any[]) => {
      const ids: string[] = [];
      for (const d of docs) {
        const newDoc = { _id: d._id || `mem_${Date.now()}_${Math.random().toString(36).slice(2)}`, ...d };
        store.push(newDoc);
        ids.push(newDoc._id);
      }
      return { insertedIds: ids, acknowledged: true };
    },
    updateOne: async (filter: any, update: any, options: any = {}) => {
      const idx = store.findIndex((item) => matchesFilter(item, filter));
      if (idx !== -1) {
        if (update.$set) Object.assign(store[idx], update.$set);
        else Object.assign(store[idx], update);
        return { modifiedCount: 1, matchedCount: 1, acknowledged: true };
      }
      if (options.upsert) {
        const newDoc = { _id: `mem_${Date.now()}`, ...(update.$set || update), ...filter };
        store.push(newDoc);
        return { modifiedCount: 0, upsertedCount: 1, acknowledged: true };
      }
      return { modifiedCount: 0, matchedCount: 0, acknowledged: true };
    },
    updateMany: async (filter: any, update: any) => {
      let count = 0;
      for (const item of store) {
        if (matchesFilter(item, filter)) {
          if (update.$set) Object.assign(item, update.$set);
          else Object.assign(item, update);
          count++;
        }
      }
      return { modifiedCount: count, matchedCount: count, acknowledged: true };
    },
    deleteOne: async (filter: any) => {
      const idx = store.findIndex((item) => matchesFilter(item, filter));
      if (idx !== -1) {
        store.splice(idx, 1);
        return { deletedCount: 1, acknowledged: true };
      }
      return { deletedCount: 0, acknowledged: true };
    },
    deleteMany: async (filter: any) => {
      const initialLen = store.length;
      const remaining = store.filter((item) => !matchesFilter(item, filter));
      memoryStores.set(name, remaining);
      return { deletedCount: initialLen - remaining.length, acknowledged: true };
    },
    findOneAndUpdate: async (filter: any, update: any, options: any = {}) => {
      const idx = store.findIndex((item) => matchesFilter(item, filter));
      if (idx !== -1) {
        if (update.$set) Object.assign(store[idx], update.$set);
        else if (update.$inc) {
          for (const k of Object.keys(update.$inc)) {
            store[idx][k] = (store[idx][k] || 0) + update.$inc[k];
          }
        } else Object.assign(store[idx], update);
        return store[idx];
      }
      if (options.upsert) {
        const newDoc = { _id: `mem_${Date.now()}`, ...(update.$set || update), ...filter };
        store.push(newDoc);
        return newDoc;
      }
      return null;
    },
    bulkWrite: async (operations: any[]) => {
      let modifiedCount = 0;
      let insertedCount = 0;
      let deletedCount = 0;
      for (const op of operations) {
        if (op.updateOne) {
          const { filter, update, upsert } = op.updateOne;
          const idx = store.findIndex((item) => matchesFilter(item, filter));
          if (idx !== -1) {
            if (update.$set) Object.assign(store[idx], update.$set);
            else Object.assign(store[idx], update);
            modifiedCount++;
          } else if (upsert) {
            const newDoc = { _id: `mem_${Date.now()}`, ...(update.$set || update), ...filter };
            store.push(newDoc);
            insertedCount++;
          }
        } else if (op.deleteOne) {
          const idx = store.findIndex((item) => matchesFilter(item, op.deleteOne.filter));
          if (idx !== -1) {
            store.splice(idx, 1);
            deletedCount++;
          }
        }
      }
      return { modifiedCount, insertedCount, deletedCount, acknowledged: true };
    },
    countDocuments: async (filter: any = {}) => {
      return store.filter((item) => matchesFilter(item, filter)).length;
    },
    createIndex: async () => "index_created",
  };

  return mockCol as unknown as Collection<T>;
}

export async function seedDatabaseIfEmpty(db: Db): Promise<void> {
  try {
    const mediaCount = await db.collection("media").countDocuments();
    if (mediaCount === 0) {
      console.log("🌱 Seeding initial Google Drive media into MongoDB...");
      const initialMedia = getInitialStore("media");
      if (initialMedia.length > 0) {
        await db.collection("media").insertMany(initialMedia);
      }
    }

    const settingsCount = await db.collection("siteSettings").countDocuments();
    if (settingsCount === 0) {
      const initialSettings = getInitialStore("siteSettings");
      if (initialSettings.length > 0) {
        await db.collection("siteSettings").insertMany(initialSettings);
      }
    }

    const caseStudiesCount = await db.collection("caseStudies").countDocuments();
    if (caseStudiesCount === 0) {
      const initialCases = getInitialStore("caseStudies");
      if (initialCases.length > 0) {
        await db.collection("caseStudies").insertMany(initialCases);
      }
    }

    const materialsCount = await db.collection("materials").countDocuments();
    if (materialsCount === 0) {
      const initialMaterials = getInitialStore("materials");
      if (initialMaterials.length > 0) {
        await db.collection("materials").insertMany(initialMaterials);
      }
    }

    const testimonialsCount = await db.collection("testimonials").countDocuments();
    if (testimonialsCount === 0) {
      const initialTestimonials = getInitialStore("testimonials");
      if (initialTestimonials.length > 0) {
        await db.collection("testimonials").insertMany(initialTestimonials);
      }
    }

    const journalCount = await db.collection("journalPosts").countDocuments();
    if (journalCount === 0) {
      const initialJournal = getInitialStore("journalPosts");
      if (initialJournal.length > 0) {
        await db.collection("journalPosts").insertMany(initialJournal);
      }
    }
  } catch (err) {
    console.warn("[Database Seed] Note during seeding:", err);
  }
}

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
    if (env.MONGODB_URI) {
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
      await seedDatabaseIfEmpty(dbInstance);
      await ensureDatabaseIndexes(dbInstance);
      return dbInstance;
    } else {
      console.log("[Database] No MONGODB_URI configured. Utilizing resilient in-memory store.");
      return null as any;
    }
  } catch (error) {
    console.warn("[MongoDB] Database connection error, falling back gracefully to memory store:", error);
    client = null;
    dbInstance = null;
    return null as any;
  } finally {
    isConnecting = false;
  }
}

export async function getDb(): Promise<Db> {
  if (!dbInstance) {
    try {
      await connectToDatabase();
    } catch {
      // Ignored, graceful fallback
    }
  }
  return dbInstance as Db;
}

export async function getCollection<T extends Document = Document>(name: string): Promise<Collection<T>> {
  if (!dbInstance && !isConnecting && env.MONGODB_URI) {
    try {
      await connectToDatabase();
    } catch (err) {
      console.warn(`[getCollection] Database connection attempt failed for ${name}:`, err);
    }
  } else if (isConnecting) {
    while (isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  if (dbInstance) {
    return dbInstance.collection<T>(name);
  }
  return createMemoryCollection<T>(name);
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
      db.collection("projects").createIndex({ slug: 1 }, { unique: true, sparse: true }),
      db.collection("media").createIndex({ driveFileId: 1 }),
      db.collection("media").createIndex({ isHomepageVisible: 1, homepageOrder: 1 }),
    ]);
  } catch (err) {
    console.warn("[MongoDB] Index creation warning:", err);
  }
}

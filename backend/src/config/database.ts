import { MongoClient, Db, Collection, Document } from "mongodb";
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
  } else if (name === "services") {
    initialData = [
      {
        _id: "srv_1",
        title: "Architectural Interior Design",
        slug: "architectural-interior-design",
        shortDescription: "Complete architectural space planning, interior detailing, and bespoke craftsmanship.",
        description: "Full-service interior architecture including MEP, structural space realignment, and tailored luxury aesthetics.",
        icon: "Home",
        active: true,
        order: 1,
      },
      {
        _id: "srv_2",
        title: "Bespoke Furniture & Millwork",
        slug: "bespoke-furniture",
        shortDescription: "Custom handcrafted furniture, artisanal joinery, and curated material curation.",
        description: "From custom dining tables to integrated cabinetry, precision-crafted exclusively for each project.",
        icon: "Layers",
        active: true,
        order: 2,
      },
      {
        _id: "srv_3",
        title: "Turnkey Project Execution",
        slug: "turnkey-execution",
        shortDescription: "End-to-end execution, site supervision, vendor management, and handover.",
        description: "Comprehensive site management with rigorous quality control, weekly milestones, and client transparency.",
        icon: "Briefcase",
        active: true,
        order: 3,
      },
    ];
  } else if (name === "processSteps") {
    initialData = [
      { _id: "step_1", stepNumber: 1, title: "Discovery & Briefing", description: "In-depth consultation to map spatial needs, aesthetic aspirations, and lifestyle requirements.", order: 1 },
      { _id: "step_2", stepNumber: 2, title: "Concept & Spatial Planning", description: "3D architectural visualizations, mood boards, and functional layout schemes.", order: 2 },
      { _id: "step_3", stepNumber: 3, title: "Material & Detail Specifications", description: "Finishes curation, custom joinery drawings, lighting plans, and detailed BOQs.", order: 3 },
      { _id: "step_4", stepNumber: 4, title: "Site Execution & Handover", description: "On-site supervision, craftsmanship QA, finishing touches, and milestone handover.", order: 4 },
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
    if (val && typeof val === "object" && !Array.isArray(val)) {
      if ("$in" in val && Array.isArray(val.$in)) {
        if (!val.$in.includes(item[key])) return false;
      }
      if ("$regex" in val) {
        const regex = new RegExp(val.$regex, val.$options || "");
        if (!regex.test(String(item[key] || ""))) return false;
      }
    } else {
      if (item[key] !== val) return false;
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
    countDocuments: async (filter: any = {}) => {
      return store.filter((item) => matchesFilter(item, filter)).length;
    },
    createIndex: async () => "index_created",
  };

  return mockCol as unknown as Collection<T>;
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
    if (env.MONGODB_URI && !env.MONGODB_URI.includes("localhost") && !env.MONGODB_URI.includes("127.0.0.1")) {
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
    } else {
      console.log("[Database] Local/Serverless runtime: Utilizing resilient in-memory & PostgreSQL data store.");
      return null as any;
    }
  } catch (error) {
    console.warn("[MongoDB] Remote connection failed, falling back gracefully to memory store:", error);
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

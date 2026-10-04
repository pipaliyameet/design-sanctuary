import dotenv from "dotenv";
import path from "path";

// Load .env from backend root or workspace root
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017",
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || "interior_studio",
  JWT_SECRET: process.env.JWT_SECRET || "interior-studio-super-secure-jwt-secret-key-2026-xyz",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  COOKIE_NAME: "studio_auth_token",

  // Google Drive
  GOOGLE_DRIVE_ROOT_FOLDER_ID: (() => {
    const raw = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || "1ix9RDbXHK0JVqsxPyfxYL8M1bCdHdBze";
    const urlMatch = raw.match(/folders\/([a-zA-Z0-9_-]+)/);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }
    return raw.trim().replace(/^['"]|['"]$/g, "");
  })(),
  GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID || "",
  GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL || "",
  GOOGLE_PRIVATE_KEY: (() => {
    let key = process.env.GOOGLE_PRIVATE_KEY || "";
    if (key.startsWith('"') && key.endsWith('"')) {
      try {
        key = JSON.parse(key);
      } catch {
        key = key.slice(1, -1);
      }
    }
    return key.replace(/\\n/g, "\n");
  })(),
  GOOGLE_CLIENT_ID: (process.env.GOOGLE_CLIENT_ID || "").trim(),
  GOOGLE_CLIENT_SECRET: (process.env.GOOGLE_CLIENT_SECRET || "").trim(),
  GOOGLE_REFRESH_TOKEN: (process.env.GOOGLE_REFRESH_TOKEN || "").trim(),
  GOOGLE_REDIRECT_URI: (
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:5001/api/media/oauth-callback"
  ).trim(),
};

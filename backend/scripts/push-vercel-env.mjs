import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");
const content = fs.readFileSync(envPath, "utf-8");

const lines = content.split("\n");
const envMap = new Map();

let currentKey = null;
let currentValue = "";
let inQuotes = false;

for (let rawLine of lines) {
  const line = rawLine.trim();
  if (!inQuotes) {
    if (!line || line.startsWith("#")) continue;
    const eqIdx = rawLine.indexOf("=");
    if (eqIdx === -1) continue;
    currentKey = rawLine.slice(0, eqIdx).trim();
    let val = rawLine.slice(eqIdx + 1).trim();
    if (val.startsWith('"') && !val.endsWith('"')) {
      inQuotes = true;
      currentValue = val.slice(1);
    } else {
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      envMap.set(currentKey, val);
      currentKey = null;
    }
  } else {
    if (rawLine.endsWith('"')) {
      inQuotes = false;
      currentValue += "\n" + rawLine.slice(0, -1);
      envMap.set(currentKey, currentValue);
      currentKey = null;
      currentValue = "";
    } else {
      currentValue += "\n" + rawLine;
    }
  }
}

// Ensure FRONTEND_URL is set to production domain
envMap.set("FRONTEND_URL", "https://right-angle-design-studio.vercel.app");
envMap.set("NODE_ENV", "production");

console.log(`Found ${envMap.size} environment variables.`);

for (const [key, val] of envMap.entries()) {
  try {
    // Remove if exists
    try {
      execSync(`npx -y vercel env rm ${key} production -y --cwd backend`, { stdio: "ignore" });
    } catch {}

    // Add variable
    execSync(`npx -y vercel env add ${key} production --cwd backend`, {
      input: val,
      stdio: ["pipe", "pipe", "inherit"],
    });
    console.log(`✓ Added ${key} to Vercel production`);
  } catch (err) {
    console.error(`✗ Error setting ${key}:`, err.message);
  }
}

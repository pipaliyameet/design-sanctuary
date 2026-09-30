import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const frontendVercelOutput = path.join(rootDir, 'frontend', '.vercel', 'output');
const rootVercelOutput = path.join(rootDir, '.vercel', 'output');

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(source)) return;
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  for (const file of files) {
    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  }
}

console.log('Merging Nitro SSR output into Root Vercel output...');

// 1. Copy __server.func into .vercel/output/functions/__server.func
const serverFuncSrc = path.join(frontendVercelOutput, 'functions', '__server.func');
const serverFuncDest = path.join(rootVercelOutput, 'functions', '__server.func');
if (fs.existsSync(serverFuncSrc)) {
  console.log(`Copying ${serverFuncSrc} -> ${serverFuncDest}`);
  copyFolderRecursiveSync(serverFuncSrc, serverFuncDest);
  
  // Patch .vc-config.json to nodejs22.x
  const vcConfigFile = path.join(serverFuncDest, '.vc-config.json');
  if (fs.existsSync(vcConfigFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(vcConfigFile, 'utf-8'));
      parsed.runtime = 'nodejs22.x';
      fs.writeFileSync(vcConfigFile, JSON.stringify(parsed, null, 2), 'utf-8');
      console.log('Successfully patched __server.func runtime to nodejs22.x');
    } catch (e) {
      console.warn('Could not patch .vc-config.json:', e);
    }
  }
} else {
  console.warn(`Warning: ${serverFuncSrc} does not exist`);
}

// 2. Copy static files
const staticSrc = path.join(frontendVercelOutput, 'static');
const staticDest = path.join(rootVercelOutput, 'static');
if (fs.existsSync(staticSrc)) {
  console.log(`Copying ${staticSrc} -> ${staticDest}`);
  copyFolderRecursiveSync(staticSrc, staticDest);
}




// 3. Write merged config.json
const configPath = path.join(rootVercelOutput, 'config.json');
const mergedConfig = {
  version: 3,
  routes: [
    {
      headers: {
        "cache-control": "public, max-age=31536000, immutable"
      },
      src: "^/assets/(.*)$"
    },
    {
      src: "^/favicon\\.ico$",
      dest: "/favicon.ico"
    },
    {
      src: "^/robots\\.txt$",
      dest: "/robots.txt"
    },
    {
      src: "^/api/(.*)$",
      dest: "/api/index"
    },
    {
      src: "^/api$",
      dest: "/api/index"
    },
    {
      handle: "filesystem"
    },
    {
      src: "^/(.*)$",
      dest: "/__server"
    }
  ],
  framework: {
    name: "nitro",
    version: "3.0.0"
  },
  crons: []
};

fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2), 'utf-8');
console.log(`Updated ${configPath} successfully!`);

// 4. Synchronize complete static build to root dist/ directory
const rootDist = path.join(rootDir, 'dist');
if (!fs.existsSync(rootDist)) {
  fs.mkdirSync(rootDist, { recursive: true });
}
copyFolderRecursiveSync(staticDest, rootDist);
console.log('Synchronized complete static build to root dist/ successfully!');



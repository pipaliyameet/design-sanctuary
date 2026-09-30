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

// 3. Generate static index.html & 404.html fallbacks to guarantee no directory listing
const assetsDir = path.join(staticDest, 'assets');
let mainCss = '';
let mainJs = '';

if (fs.existsSync(assetsDir)) {
  const assetFiles = fs.readdirSync(assetsDir);
  const cssFile = assetFiles.find(f => f.startsWith('styles-') && f.endsWith('.css'));
  const jsFile = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.js'));
  if (cssFile) mainCss = `/assets/${cssFile}`;
  if (jsFile) mainJs = `/assets/${jsFile}`;
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Atelier Vermilion — Interior Design Studio</title>
    <meta name="description" content="Interior design studio detailing residences, villas and hospitality spaces around daylight, stone and quiet craft." />
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,600&family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..400&family=Archivo:wght@300;400;500;600&display=swap" />
    ${mainCss ? `<link rel="stylesheet" href="${mainCss}" />` : ''}
  </head>
  <body class="bg-[#0c0a09] text-[#f5f5f4] antialiased min-h-screen">
    <div id="root"></div>
    ${mainJs ? `<script type="module" src="${mainJs}"></script>` : ''}
  </body>
</html>`;

if (!fs.existsSync(staticDest)) {
  fs.mkdirSync(staticDest, { recursive: true });
}
fs.writeFileSync(path.join(staticDest, 'index.html'), htmlContent, 'utf-8');
fs.writeFileSync(path.join(staticDest, '404.html'), htmlContent, 'utf-8');
console.log('Created static index.html and 404.html in .vercel/output/static');

const frontendPublicDir = path.join(rootDir, 'frontend', 'public');
if (fs.existsSync(frontendPublicDir)) {
  fs.writeFileSync(path.join(frontendPublicDir, 'index.html'), htmlContent, 'utf-8');
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


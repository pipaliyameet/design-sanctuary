import http from "http";
import url from "url";
import fs from "fs";
import path from "path";
import readline from "readline";
import { google } from "googleapis";

const envPath = path.resolve(process.cwd(), ".env");

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    }),
  );
}

async function main() {
  console.log("\n=======================================================");
  console.log("🔑 Right Angle Design Studio — Google Drive OAuth Setup");
  console.log("=======================================================\n");

  console.log("This will connect your personal Google Drive storage to upload photos/videos.\n");

  const clientId = await askQuestion("Enter your Google Client ID: ");
  if (!clientId) {
    console.error("Client ID is required.");
    process.exit(1);
  }

  const clientSecret = await askQuestion("Enter your Google Client Secret: ");
  if (!clientSecret) {
    console.error("Client Secret is required.");
    process.exit(1);
  }

  const redirectUri = "http://localhost:5005/oauth2callback";
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive"],
  });

  console.log("\n-------------------------------------------------------");
  console.log("👉 STEP 1: Open this URL in your browser:");
  console.log(authUrl);
  console.log("-------------------------------------------------------\n");
  console.log("Waiting for authorization callback on http://localhost:5005/oauth2callback...\n");

  const server = http.createServer(async (req, res) => {
    try {
      if (req.url && req.url.startsWith("/oauth2callback")) {
        const parsedUrl = url.parse(req.url, true);
        const code = parsedUrl.query.code;

        if (!code) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<h1>Authorization code not found. Please try again.</h1>");
          return;
        }

        const { tokens } = await oauth2Client.getToken(code);
        const refreshToken = tokens.refresh_token;

        if (!refreshToken) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end("<h1>Connected! But refresh token was already issued. Set prompt=consent to re-issue.</h1>");
          return;
        }

        // Update .env file
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

        const updateOrAppend = (key, val) => {
          const regex = new RegExp(`^${key}=.*$`, "m");
          if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${key}=${val}`);
          } else {
            envContent += `\n${key}=${val}`;
          }
        };

        updateOrAppend("GOOGLE_CLIENT_ID", clientId);
        updateOrAppend("GOOGLE_CLIENT_SECRET", clientSecret);
        updateOrAppend("GOOGLE_REFRESH_TOKEN", refreshToken);

        fs.writeFileSync(envPath, envContent.trim() + "\n", "utf-8");

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #2e7d32;">🎉 Google Drive Connected Successfully!</h1>
            <p style="font-size: 18px;">Your personal Google Drive quota is now active for Right Angle Design Studio.</p>
            <p>You can close this tab and return to the terminal / Owner Panel.</p>
          </div>
        `);

        console.log("✅ SUCCESS: Refresh token saved to backend/.env!");
        console.log("GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN are now configured.");
        console.log("\nYou can now upload photos and videos directly in the Owner Media Vault!\n");

        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 1500);
      }
    } catch (err) {
      console.error("OAuth callback error:", err);
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end(`<h1>Error: ${err.message}</h1>`);
    }
  });

  server.listen(5005, () => {
    // Attempt automatic browser open
    import("child_process").then(({ exec }) => {
      exec(`open "${authUrl}" || xdg-open "${authUrl}" || start "${authUrl}"`);
    });
  });
}

main().catch(console.error);

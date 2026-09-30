import app from "./app.js";
import { env } from "./config/env.js";
import { connectToDatabase, closeDatabase } from "./config/database.js";

async function startServer() {
  try {
    console.log("--------------------------------------------------");
    console.log("🏛️ Atelier Vermilion / Interior Studio Backend");
    console.log("--------------------------------------------------");

    // Connect to MongoDB Atlas
    await connectToDatabase();

    let currentPort = env.PORT;
    const maxRetries = 5;
    let attempts = 0;

    const tryListen = (port: number) => {
      const server = app.listen(port, () => {
        console.log(`🚀 Server listening on http://localhost:${port}`);
        console.log(`📡 API available at http://localhost:${port}/api`);
        console.log(`🏥 Health check at http://localhost:${port}/api/health`);
      });

      server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE" && attempts < maxRetries) {
          attempts++;
          const nextPort = port + 1;
          console.warn(`⚠️ Port ${port} is occupied. Attempting next port http://localhost:${nextPort}...`);
          tryListen(nextPort);
        } else {
          console.error("Server listen error:", err);
        }
      });

      const shutdown = async (signal: string) => {
        console.log(`\n[${signal}] Initiating graceful shutdown...`);
        server.close(async () => {
          await closeDatabase();
          console.log("Server closed successfully.");
          process.exit(0);
        });

        setTimeout(() => {
          console.error("Forcefully terminating server process after timeout.");
          process.exit(1);
        }, 10000);
      };

      process.on("SIGTERM", () => shutdown("SIGTERM"));
      process.on("SIGINT", () => shutdown("SIGINT"));
    };

    tryListen(currentPort);
  } catch (error) {
    console.error("Fatal error during server initialization:", error);
    process.exit(1);
  }
}

startServer();

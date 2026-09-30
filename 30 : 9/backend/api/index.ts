import type { Request, Response } from "express";

let appInstance: any = null;
let dbConnected = false;

export default async function handler(req: Request, res: Response) {
  try {
    if (!appInstance) {
      const appModule = await import("../src/app.js");
      appInstance = appModule.default || appModule;
    }
    if (!dbConnected) {
      const dbModule = await import("../src/config/database.js");
      await dbModule.connectToDatabase();
      dbConnected = true;
    }
    return appInstance(req, res);
  } catch (error) {
    console.error("[Vercel Serverless Function Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Database connection or serverless error",
      error: error instanceof Error ? error.message : String(error),
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

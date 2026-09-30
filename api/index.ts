import type { Request, Response } from "express";
import app from "../backend/src/app.js";
import { connectToDatabase } from "../backend/src/config/database.js";

let dbConnected = false;

export default async function handler(req: Request, res: Response) {
  try {
    if (!dbConnected) {
      await connectToDatabase();
      dbConnected = true;
    }
    return app(req, res);
  } catch (error) {
    console.error("[Vercel Root Serverless Function Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Database connection or serverless error",
      error: error instanceof Error ? error.message : String(error),
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

